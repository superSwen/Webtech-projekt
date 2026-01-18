<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import type { FilmDto, SerieDto } from '@/types/media'
import { getToken } from '@/auth/session'


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

/** Config */
const REQUEST_TIMEOUT_MS = 7000

/** in-memory cache (reduces OMDb calls -> fewer 503 spikes) */
const omdbCache = new Map<string, OmdbDetail>()

/** abort handling */
let abortCtrl: AbortController | null = null
function abortPending() {
  if (abortCtrl) {
    abortCtrl.abort()
    abortCtrl = null
  }
}

const allAny = computed<PickItem[]>(() => [
  ...props.films.map((f) => ({ kind: 'movie', data: f }) as const),
  ...props.series.map((s) => ({ kind: 'series', data: s }) as const),
])

const allFiltered = computed<PickItem[]>(() => {
  if (mode.value === 'movie') return props.films.map((f) => ({ kind: 'movie', data: f }) as const)
  if (mode.value === 'series') return props.series.map((s) => ({ kind: 'series', data: s }) as const)
  return allAny.value
})

const hasEntries = computed(() => allAny.value.length > 0)
const hasFilteredEntries = computed(() => allFiltered.value.length > 0)

function randInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive)
}

function getImdbId(it: PickItem): string | null {
  const id = (it.data as { imdbId?: string | null }).imdbId
  return id ?? null
}

function getTitle(it: PickItem): string {
  return (it.data.title ?? '').trim()
}

function normalizeBase(base: string) {
  return base.replace(/\/$/, '')
}

/**
 * Calls your backend proxy:
 * - /api/omdb?i=tt123...   (preferred)
 * - /api/omdb?t=Title...  (fallback)
 */
async function fetchOmdbProxy(params: { i?: string; t?: string }): Promise<OmdbDetail> {
  const base = import.meta.env.VITE_API_BASE as string | undefined
  if (!base) throw new Error('VITE_API_BASE fehlt (env).')

  const cacheKey = params.i ? `i:${params.i}` : `t:${params.t ?? ''}`
  const cached = omdbCache.get(cacheKey)
  if (cached) return cached

  abortPending()
  abortCtrl = new AbortController()

  const timeoutId = window.setTimeout(() => abortCtrl?.abort(), REQUEST_TIMEOUT_MS)

  try {
    const qs = new URLSearchParams()
    if (params.i) qs.set('i', params.i)
    else if (params.t) qs.set('t', params.t)
    else throw new Error('OMDb: weder i noch t gesetzt.')

    const url = `${normalizeBase(base)}/api/omdb?${qs.toString()}`

    const token = getToken()

    const res = await fetch(url, {
      signal: abortCtrl.signal,
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    })

    if (!res.ok) {
      if (res.status === 400) {
        throw new Error('OMDb Proxy (400): Parameter falsch. Nutze ?i= oder ?t= (Backend).')
      }
      if (res.status === 503) {
        throw new Error('OMDb gerade überlastet (503). Bitte erneut versuchen.')
      }
      throw new Error(`OMDb Proxy Request fehlgeschlagen (${res.status}).`)
    }

    const data = (await res.json()) as OmdbDetail
    if ((data as any)?.Response === 'False') {
      throw new Error((data as any)?.Error ?? 'OMDb: unbekannter Fehler')
    }

    omdbCache.set(cacheKey, data)
    return data
  } catch (e: any) {
    if (e?.name === 'AbortError') {
      throw new Error('OMDb Timeout. Bitte erneut versuchen.')
    }
    throw e
  } finally {
    window.clearTimeout(timeoutId)
    abortCtrl = null
  }
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
  if (!next) {
    pick.value = null
    return
  }

  pick.value = next

  // Prefer imdbId, fallback to title
  const imdbId = getImdbId(next)
  const title = getTitle(next)

  // If neither exists -> just show title
  if (!imdbId && !title) return

  loading.value = true
  try {
    details.value = imdbId
      ? await fetchOmdbProxy({ i: imdbId })
      : await fetchOmdbProxy({ t: title })
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
  if (!open.value) closeCard()
}

function closeCard() {
  open.value = false
  abortPending()
  loading.value = false
  error.value = null
  details.value = null
  pick.value = null
}

const titleText = computed(() => pick.value?.data.title ?? '')
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

watch(mode, () => {
  abortPending()
  loading.value = false
  pick.value = null
  details.value = null
  error.value = null
})

onBeforeUnmount(() => abortPending())
</script>

<template>
  <div class="flex justify-end">
    <button
      class="btn ghost"
      @click="toggleOpen"
      :disabled="busy || !hasEntries"
      :title="open ? 'Random schließen' : 'Random anzeigen'"
    >
      <span class="text-lg leading-none">🎲</span>
      <span class="ml-2 hidden sm:inline">{{ open ? 'Random schließen' : 'Random' }}</span>
    </button>
  </div>

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
    <div v-else-if="loading" class="alert info mt-3">Lade OMDb Infos…</div>

    <div v-if="pick" class="mt-4 flex flex-col gap-4 sm:flex-row">
      <div class="shrink-0">
        <div class="overflow-hidden rounded-xl border border-white/10 bg-black/30" style="width: 120px; height: 180px">
          <img v-if="posterUrl" :src="posterUrl" :alt="titleText" class="h-full w-full object-cover" />
          <div v-else class="flex h-full w-full items-center justify-center text-xs text-white/40 px-2 text-center">
            Kein Poster
          </div>
        </div>
      </div>

      <div class="min-w-0">
        <div class="text-lg font-extrabold leading-snug">{{ titleText }}</div>
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
