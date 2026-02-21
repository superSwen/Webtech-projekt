<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilmDto, SerieDto } from '@/types/media'
import { useFavorites } from '@/utils/favorites'
import { api } from '@/api/http'

type FilterMode = 'all' | 'film' | 'serie'
type SortBy = 'title' | 'minutes' | 'favorite' | 'id' | 'season'
type SortDir = 'asc' | 'desc'

type TileItem =
  | { kind: 'film'; data: FilmDto }
  | { kind: 'serie'; data: SerieDto }

const props = defineProps<{
  films: FilmDto[]
  series: SerieDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'openFilm', item: FilmDto): void
  (e: 'openSerie', item: SerieDto): void
  (e: 'editFilm', item: FilmDto): void
  (e: 'editSerie', item: SerieDto): void
  (e: 'removeFilm', item: FilmDto): void
  (e: 'removeSerie', item: SerieDto): void
}>()

const { isFavorite, toggleFavorite } = useFavorites()

const filterMode = ref<FilterMode>('all')
const sortBy = ref<SortBy>('title')
const sortDir = ref<SortDir>('asc')

const allItems = computed<TileItem[]>(() => [
  ...(props.films ?? []).map((f) => ({ kind: 'film', data: f }) as const),
  ...(props.series ?? []).map((s) => ({ kind: 'serie', data: s }) as const),
])

const filteredItems = computed<TileItem[]>(() => {
  if (filterMode.value === 'film') return (props.films ?? []).map((f) => ({ kind: 'film', data: f }) as const)
  if (filterMode.value === 'serie') return (props.series ?? []).map((s) => ({ kind: 'serie', data: s }) as const)
  return allItems.value
})

function itemKey(it: TileItem) {
  return `${it.kind}:${it.data.id}`
}

function minutesOf(it: TileItem) {
  return (it.data as any)?.minutes ?? null
}

const sortedItems = computed<TileItem[]>(() => {
  const arr = [...filteredItems.value]
  const dir = sortDir.value === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    if (sortBy.value === 'favorite') {
      const af = isFavorite(a.kind, a.data.id) ? 1 : 0
      const bf = isFavorite(b.kind, b.data.id) ? 1 : 0
      if (af !== bf) return (bf - af) * dir
      return (a.data.title ?? '').localeCompare(b.data.title ?? '') * dir
    }

    if (sortBy.value === 'minutes') {
      const am = minutesOf(a) ?? -1
      const bm = minutesOf(b) ?? -1
      if (am !== bm) return (am - bm) * dir
      return (a.data.title ?? '').localeCompare(b.data.title ?? '') * dir
    }

    if (sortBy.value === 'season') {
      const as = (a.kind === 'serie' ? (a.data as SerieDto).season : -1) ?? -1
      const bs = (b.kind === 'serie' ? (b.data as SerieDto).season : -1) ?? -1
      if (as !== bs) return (as - bs) * dir
      const ae = (a.kind === 'serie' ? (a.data as SerieDto).episode : -1) ?? -1
      const be = (b.kind === 'serie' ? (b.data as SerieDto).episode : -1) ?? -1
      if (ae !== be) return (ae - be) * dir
      return (a.data.title ?? '').localeCompare(b.data.title ?? '') * dir
    }

    if (sortBy.value === 'id') {
      const an = Number(a.data.id)
      const bn = Number(b.data.id)
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return (an - bn) * dir
      return (a.data.title ?? '').localeCompare(b.data.title ?? '') * dir
    }

    return (a.data.title ?? '').localeCompare(b.data.title ?? '') * dir
  })

  return arr
})

function toggleDir() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}

function open(it: TileItem) {
  if (it.kind === 'film') emit('openFilm', it.data)
  else emit('openSerie', it.data)
}

function edit(it: TileItem) {
  if (it.kind === 'film') emit('editFilm', it.data)
  else emit('editSerie', it.data)
}

function remove(it: TileItem) {
  if (it.kind === 'film') emit('removeFilm', it.data)
  else emit('removeSerie', it.data)
}

/** ---------------- poster backfill (cached in DB) ----------------
 *
 * Backend persists `posterUrl` on create/update.
 * For older entries (created before that existed), we backfill once via:
 *   POST /api/films/{id}/poster
 *   POST /api/series/{id}/poster
 *
 * This avoids calling /api/omdb from the UI and reduces API calls long-term.
 */

const posters = ref<Record<string, string | null>>({}) // key -> url|null (only for backfilled results)

const queuedKeys = new Set<string>()
const inFlight = new Set<string>()
const queue: TileItem[] = []
let active = 0
const MAX_CONCURRENCY = 4
const PREFETCH_COUNT = 14

function posterFor(it: TileItem) {
  const cached = (it.data as any)?.posterUrl as string | null | undefined
  return cached ?? posters.value[itemKey(it)] ?? null
}

function enqueue(it: TileItem) {
  const k = itemKey(it)
  // already cached in DB
  if ((it.data as any)?.posterUrl) return
  if (posters.value[k] !== undefined) return
  if (queuedKeys.has(k) || inFlight.has(k)) return
  queuedKeys.add(k)
  queue.push(it)
  pump()
}

function pump() {
  while (active < MAX_CONCURRENCY && queue.length) {
    const it = queue.shift()!
    const k = itemKey(it)
    queuedKeys.delete(k)
    inFlight.add(k)
    active++

    fetchPoster(it)
      .then((url) => {
        posters.value = { ...posters.value, [k]: url }
      })
      .catch(() => {
        posters.value = { ...posters.value, [k]: null }
      })
      .finally(() => {
        inFlight.delete(k)
        active--
        pump()
      })
  }
}

async function fetchPoster(it: TileItem): Promise<string | null> {
  try {
    const url = it.kind === 'film' ? `/api/films/${it.data.id}/poster` : `/api/series/${it.data.id}/poster`
    const { data } = await api.post<any>(url)
    const poster = (data as any)?.posterUrl as string | undefined
    if (!poster || poster === 'N/A') return null
    return poster
  } catch {
    return null
  }
}

watch(
  () => sortedItems.value.slice(0, PREFETCH_COUNT).map(itemKey).join('|'),
  () => {
    sortedItems.value.slice(0, PREFETCH_COUNT).forEach(enqueue)
  },
  { immediate: true }
)

function kindLabel(it: TileItem) {
  return it.kind === 'film' ? 'Film' : 'Serie'
}

function subtitle(it: TileItem) {
  if (it.kind !== 'serie') return null
  const s = it.data as SerieDto
  if (s.season == null && s.episode == null) return null
  return `S${s.season ?? '?'}E${s.episode ?? '?'}`
}
</script>

<template>
  <section class="space-y-3">
    <header class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-baseline gap-3">
        <h2 class="text-xl font-extrabold tracking-tight">Deine Einträge</h2>
        <span class="pill">{{ filteredItems.length }} / {{ allItems.length }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <button type="button" class="btn ghost" :class="filterMode === 'all' ? 'border-red-500/30 text-red-200' : ''" :disabled="busy" @click="filterMode = 'all'">
          Alle
        </button>
        <button type="button" class="btn ghost" :class="filterMode === 'film' ? 'border-red-500/30 text-red-200' : ''" :disabled="busy" @click="filterMode = 'film'">
          Filme
        </button>
        <button type="button" class="btn ghost" :class="filterMode === 'serie' ? 'border-red-500/30 text-red-200' : ''" :disabled="busy" @click="filterMode = 'serie'">
          Serien
        </button>

        <div class="flex items-center gap-2 sm:ml-3">
          <select class="input !mt-0 !w-auto !px-2 !py-1 !text-sm" v-model="sortBy" :disabled="busy">
            <option value="title">A–Z (Titel)</option>
            <option value="minutes">Minuten</option>
            <option value="favorite">Favoriten zuerst</option>
            <option value="id">Neu/Alt (ID)</option>
            <option v-if="filterMode === 'serie'" value="season">Staffel/Episode</option>
          </select>

          <button type="button" class="btn ghost" @click="toggleDir" :disabled="busy" :title="sortDir === 'asc' ? 'Aufsteigend' : 'Absteigend'">
            {{ sortDir === 'asc' ? '↑' : '↓' }}
          </button>
        </div>
      </div>
    </header>

    <p v-if="allItems.length === 0" class="muted">Noch keine Filme/Serien gespeichert.</p>

    <div v-else class="shelf grid grid-flow-col auto-cols-[148px] gap-4 overflow-x-auto pb-2 pr-2" style="scrollbar-width: thin">
      <div v-for="it in sortedItems" :key="itemKey(it)" class="tile group relative select-none" @mouseenter="enqueue(it)">
        <button
          type="button"
          class="posterBtn relative h-[222px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40"
          :disabled="busy"
          :title="it.data.title"
          @click="open(it)"
        >
          <img v-if="posterFor(it)" :src="posterFor(it) as string" :alt="it.data.title" class="posterImg h-full w-full object-cover" loading="lazy" />

          <div v-else class="flex h-full w-full flex-col items-center justify-center px-3 text-center">
            <div class="text-xs text-white/40">Kein Poster</div>
            <div class="mt-2 text-sm font-extrabold leading-snug text-white/80" style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">
              {{ it.data.title }}
            </div>
          </div>

          <div class="absolute left-2 top-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <span class="pill !bg-zinc-950/60 !backdrop-blur !border-white/10">{{ kindLabel(it) }}</span>
          </div>

          <div v-if="subtitle(it)" class="absolute right-2 top-2 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <span class="pill !bg-zinc-950/60 !backdrop-blur !border-white/10">{{ subtitle(it) }}</span>
          </div>
        </button>

        <div class="mt-2 h-[42px]">
          <div class="actionBar mx-auto flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-zinc-950/40 px-2 backdrop-blur">
            <button
              type="button"
              class="iconBtn"
              :class="isFavorite(it.kind, it.data.id) ? 'isFav' : ''"
              :disabled="busy"
              :aria-pressed="isFavorite(it.kind, it.data.id)"
              :title="isFavorite(it.kind, it.data.id) ? 'Favorit entfernen' : 'Als Favorit markieren'"
              @click.stop="toggleFavorite(it.kind, it.data.id)"
            >
              {{ isFavorite(it.kind, it.data.id) ? '★' : '☆' }}
            </button>

            <button type="button" class="iconBtn" :disabled="busy" title="Bearbeiten" @click.stop="edit(it)">✎</button>

            <button type="button" class="iconBtn danger" :disabled="busy" title="Löschen" @click.stop="remove(it)">🗑</button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.tile { overflow: visible; }
.tile::after {
  content: '';
  position: absolute;
  inset: -10px;
  border-radius: 22px;
  background: radial-gradient(120px 160px at 50% 20%, rgba(255,255,255,0.35), transparent 70%);
  filter: blur(10px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 180ms ease;
}
.tile:hover::after,
.tile:focus-within::after { opacity: 1; }

.posterBtn { transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease; }
.tile:hover .posterBtn,
.tile:focus-within .posterBtn {
  transform: translateY(-2px);
  border-color: rgba(255,255,255,0.55);
  box-shadow: 0 0 0 1px rgba(255,255,255,0.25), 0 18px 50px rgba(0,0,0,0.65);
}
.posterImg { transition: transform 220ms ease; }
.tile:hover .posterImg,
.tile:focus-within .posterImg { transform: scale(1.04); }

.actionBar {
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
  transition: opacity 160ms ease, transform 160ms ease;
}
.tile:hover .actionBar,
.tile:focus-within .actionBar {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.iconBtn {
  height: 30px;
  min-width: 30px;
  padding: 0 8px;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.05);
  color: rgba(255,255,255,0.85);
  font-weight: 700;
  transition: background 140ms ease, transform 140ms ease, border-color 140ms ease;
}
.iconBtn:hover { background: rgba(255,255,255,0.10); transform: translateY(-1px); }
.iconBtn:disabled { opacity: 0.55; cursor: not-allowed; }

.iconBtn.isFav { border-color: rgba(229,9,20,0.35); color: rgba(255,210,210,0.95); }
.iconBtn.danger { border-color: rgba(229,9,20,0.35); background: transparent; }
.iconBtn.danger:hover { background: rgba(229,9,20,0.10); }

.shelf { scroll-snap-type: x mandatory; }
.tile { scroll-snap-align: start; }
</style>
