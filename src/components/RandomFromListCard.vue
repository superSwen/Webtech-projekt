<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilmDto, SerieDto } from '@/types/media'

type Mode = 'any' | 'movie' | 'series'
type PickItem =
  | { kind: 'movie'; data: FilmDto }
  | { kind: 'series'; data: SerieDto }

type OmdbDetail = {
  imdbID: string
  Title?: string
  Poster?: string
  Plot?: string
  Year?: string
  Response?: string
  Error?: string
}

const props = defineProps<{
  films: FilmDto[]
  series: SerieDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'openFilm', item: FilmDto): void
  (e: 'openSerie', item: SerieDto): void
}>()

/** UI state */
const open = ref(false)
const mode = ref<Mode>('any')

/** Data state */
const loading = ref(false)
const error = ref<string | null>(null)
const pick = ref<PickItem | null>(null)
const details = ref<OmdbDetail | null>(null)

const allAny = computed<PickItem[]>(() => [
  ...props.films.map((f) => ({ kind: 'movie', data: f }) as const),
  ...props.series.map((s) => ({ kind: 'series', data: s }) as const),
])

const allFiltered = computed<PickItem[]>(() => {
  if (mode.value === 'movie') return props.films.map((f) => ({ kind: 'movie', data: f }) as const)
  if (mode.value === 'series') return props.series.map((s) => ({ kind: 'series', data: s }) as const)
  return allAny.value
})

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive)
}

async function fetchOmdbById(imdbId: string): Promise<OmdbDetail> {
  const key = import.meta.env.VITE_OMDB_API_KEY
  if (!key) throw new Error('VITE_OMDB_API_KEY fehlt (env).')

  const url = `https://www.omdbapi.com/?i=${encodeURIComponent(imdbId)}&plot=short&r=json&apikey=${encodeURIComponent(key)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('OMDb Request fehlgeschlagen')
  const data = (await res.json()) as OmdbDetail

  if ((data as any)?.Response === 'False') throw new Error((data as any)?.Error ?? 'OMDb: unbekannter Fehler')
  return data
}

async function generate() {
  error.value = null
  details.value = null

  const pool = allFiltered.value
  if (!pool.length) {
    pick.value = null
    return
  }

  const next = pool[randInt(pool.length)]
  pick.value = next

  const imdbId = (next.data as any).imdbId as string | null | undefined
  if (!imdbId) return

  loading.value = true
  try {
    details.value = await fetchOmdbById(imdbId)
  } catch (e: any) {
    error.value = e?.message ?? String(e)
    details.value = null
  } finally {
    loading.value = false
  }
}

function openDetails() {
  if (!pick.value) return
  if (pick.value.kind === 'movie') emit('openFilm', pick.value.data)
  else emit('openSerie', pick.value.data)
}

function toggleOpen() {
  open.value = !open.value
  // Beim Öffnen nicht direkt generieren -> erst wenn user wirklich will
}

function closeCard() {
  open.value = false
}

const title = computed(() => pick.value?.data.title ?? '')
const subtitle = computed(() => {
  if (!pick.value) return ''
  const t = pick.value.kind === 'movie' ? 'Film' : 'Serie'
  const year = details.value?.Year && details.value?.Year !== 'N/A' ? ` · ${details.value?.Year}` : ''
  return `${t}${year}`
})

const posterUrl = computed(() => {
  const p = details.value?.Poster
  if (!p || p === 'N/A') return null
  return p
})

const plot = computed(() => {
  const p = details.value?.Plot
  if (!p || p === 'N/A') return null
  return p
})

const hasEntries = computed(() => allAny.value.length > 0)
const hasFilteredEntries = computed(() => allFiltered.value.length > 0)

/**
 * Wenn der User Film/Serie umstellt: alten Pick löschen (damit klar ist, dass neu generiert werden muss)
 */
watch(mode, () => {
  pick.value = null
  details.value = null
  error.value = null
})

/**
 * Wenn Listen geladen werden und die Card offen ist:
 * nicht auto-generieren, nur Verfügbarkeit updaten.
 */
watch(
  () => [props.films.length, props.series.length],
  () => {
    // no-op bewusst
  }
)
</script>

<template>
  <!-- ✅ Compact trigger row (nimmt fast keinen Platz weg) -->
  <div class="flex justify-end">
    <button class="btn ghost" @click="toggleOpen" :disabled="busy || !hasEntries" :title="open ? 'Random schließen' : 'Random anzeigen'">
      <span class="text-lg leading-none">🎲</span>
      <span class="ml-2 hidden sm:inline">{{ open ? 'Random schließen' : 'Random' }}</span>
    </button>
  </div>

  <!-- ✅ Card erscheint nur wenn open -->
  <section v-if="open" class="card">
    <header class="cardHead">
      <h2 class="cardTitle">Zufällig aus deinen Einträgen</h2>

      <div class="flex items-center gap-2">
        <button class="btn ghost" @click="closeCard" :disabled="busy || loading">Schließen</button>
      </div>
    </header>

    <p v-if="!hasEntries" class="muted mt-3">
      Noch keine Filme/Serien vorhanden — leg erst etwas an 🙂
    </p>

    <!-- Auswahl Film/Serie/Egal -->
    <div v-if="hasEntries" class="mt-3 flex flex-wrap items-center gap-2">
      <label class="text-xs text-white/60 mr-1">Modus:</label>

      <button
        type="button"
        class="btn ghost"
        :class="mode === 'any' ? 'border-red-500/30 text-red-200' : ''"
        @click="mode = 'any'"
        :disabled="busy || loading"
      >
        Egal
      </button>

      <button
        type="button"
        class="btn ghost"
        :class="mode === 'movie' ? 'border-red-500/30 text-red-200' : ''"
        @click="mode = 'movie'"
        :disabled="busy || loading"
      >
        Film
      </button>

      <button
        type="button"
        class="btn ghost"
        :class="mode === 'series' ? 'border-red-500/30 text-red-200' : ''"
        @click="mode = 'series'"
        :disabled="busy || loading"
      >
        Serie
      </button>

      <div class="ml-auto flex items-center gap-2">
        <button class="btn" @click="generate" :disabled="busy || loading || !hasFilteredEntries">
          {{ pick ? 'Neu generieren' : 'Generieren' }}
        </button>

        <button class="btn ghost" @click="openDetails" :disabled="busy || !pick">
          Details öffnen
        </button>
      </div>
    </div>

    <p v-if="hasEntries && !hasFilteredEntries" class="muted mt-3">
      In diesem Modus gibt es keine Einträge (z.B. keine Serien gespeichert).
    </p>

    <div v-if="error" class="alert error mt-3">{{ error }}</div>
    <div v-if="loading" class="alert info mt-3">Lade OMDb Infos…</div>

    <div v-if="pick" class="mt-4 flex flex-col gap-4 sm:flex-row">
      <div class="shrink-0">
        <div class="overflow-hidden rounded-xl border border-white/10 bg-black/30" style="width: 120px; height: 180px">
          <img v-if="posterUrl" :src="posterUrl" :alt="title" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center text-xs text-white/40 px-2 text-center">
            Kein Poster
          </div>
        </div>
      </div>

      <div class="min-w-0">
        <div class="text-lg font-extrabold leading-snug">{{ title }}</div>
        <div class="text-xs text-white/60 mt-1">{{ subtitle }}</div>

        <p
          v-if="plot"
          class="mt-3 text-sm text-white/70"
          style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;"
        >
          {{ plot }}
        </p>
        <p v-else class="mt-3 text-sm text-white/50">
          Keine OMDb Beschreibung vorhanden (evtl. fehlt imdbId im Eintrag).
        </p>

        <p class="mt-3 text-xs text-white/40">
          Tipp: Wenn du immer Poster/Plot willst, stelle sicher, dass beim Anlegen ein imdbId gesetzt ist.
        </p>
      </div>
    </div>
  </section>
</template>
