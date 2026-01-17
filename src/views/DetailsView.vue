<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { FilmDto, SerieDto } from '@/types/media'
import type { OmdbMovie } from '@/types/omdb'

import { api } from '@/api/http'
import { getFilmById, getSerieById } from '@/api/mediaApi'
import { getTrailer, type TmdbTrailerDto } from '@/api/tmdbApi'

type Kind = 'movie' | 'series'

const route = useRoute()
const router = useRouter()

const kind = computed<Kind>(() => (route.params.kind === 'series' ? 'series' : 'movie'))
const id = computed(() => Number(route.params.id))

const loading = ref(true)
const fatalError = ref<string | null>(null)

const entry = ref<FilmDto | SerieDto | null>(null)

const omdb = ref<OmdbMovie | null>(null)
const omdbWarning = ref<string | null>(null)

const trailer = ref<TmdbTrailerDto | null>(null)
const trailerLoading = ref(false)
const trailerWarning = ref<string | null>(null)

function errText(e: any): string {
  // backend sometimes returns plain string, sometimes JSON
  return (
    e?.response?.data?.message ??
    e?.response?.data ??
    e?.message ??
    String(e)
  )
}

const title = computed(() => {
  const t = (omdb.value?.Title || entry.value?.title || '').trim()
  return t
})

const posterUrl = computed(() => {
  const p = omdb.value?.Poster
  return p && p !== 'N/A' ? p : null
})

const trailerSrc = computed(() => trailer.value?.url ?? null)

function back() {
  router.push({ name: 'home' })
}

async function load() {
  loading.value = true
  fatalError.value = null
  entry.value = null
  omdb.value = null
  omdbWarning.value = null
  trailer.value = null
  trailerWarning.value = null
  trailerLoading.value = false

  try {
    if (!id.value || Number.isNaN(id.value)) throw new Error('Ungültige ID.')

    // 1) Always load your stored entry first (this must work)
    entry.value =
      kind.value === 'movie' ? await getFilmById(id.value) : await getSerieById(id.value)

    // 2) OMDb is optional decoration, never mandatory
    const imdbId = (entry.value as any)?.imdbId as string | undefined
    const storedTitle = (entry.value?.title || '').trim()

    if (imdbId && imdbId.trim()) {
      try {
        const res = await api.get<OmdbMovie>('/api/omdb', { params: { i: imdbId.trim() } })
        const data = res.data
        if (data?.Response && data.Response.toLowerCase() === 'false') {
          omdb.value = null
          omdbWarning.value = data?.Error || 'Keine OMDb-Daten zur IMDB-ID gefunden.'
        } else {
          omdb.value = data
        }
      } catch (e: any) {
        if (e?.response?.status !== 404) omdbWarning.value = errText(e)
        omdb.value = null
      }
    } else if (storedTitle) {
      try {
        const res = await api.get<OmdbMovie>('/api/omdb', {
          params: { t: storedTitle, type: kind.value }
        })
        const data = res.data
        if (data?.Response && data.Response.toLowerCase() === 'false') {
          omdb.value = null
          omdbWarning.value = data?.Error || 'Keine OMDb-Daten zum Titel gefunden.'
        } else {
          omdb.value = data
        }
      } catch (e: any) {
        if (e?.response?.status !== 404) omdbWarning.value = errText(e)
        omdb.value = null
      }
    } else {
      omdbWarning.value = 'Kein Titel im Eintrag gefunden.'
    }

    // 3) Trailer is optional as well
    trailerLoading.value = true
    try {
      trailer.value = await getTrailer(title.value || storedTitle, kind.value)
      if (!trailer.value) trailerWarning.value = 'Kein Trailer gefunden.'
    } catch (e: any) {
      trailer.value = null
      trailerWarning.value = errText(e)
    } finally {
      trailerLoading.value = false
    }
  } catch (e: any) {
    fatalError.value = errText(e)
  } finally {
    loading.value = false
  }
}

watch([() => kind.value, () => id.value], load, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <button class="btn ghost" @click="back">← Zurück</button>
      <span class="pill">
        {{ kind === 'movie' ? 'Film' : 'Serie' }} #{{ id }}
      </span>
    </div>

    <div v-if="loading" class="card">
      <div class="alert info">Lade Details…</div>
      <div
        class="mt-4 h-[clamp(220px,30vw,360px)] rounded-2xl border border-white/10 bg-white/5 animate-pulse"
      />
    </div>

    <div v-else-if="fatalError" class="card">
      <div class="alert error">Fehler: {{ fatalError }}</div>
    </div>

    <div v-else class="card">
      <div class="grid gap-6 lg:grid-cols-[240px_1fr]">
        <!-- Poster -->
        <div class="overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/40">
          <img
            v-if="posterUrl"
            class="h-full w-full object-cover"
            :src="posterUrl"
            :alt="title"
            loading="lazy"
          />
          <div v-else class="grid h-[340px] place-items-center text-sm text-white/50">
            Kein Poster
          </div>
        </div>

        <!-- Content -->
        <div class="min-w-0">
          <h1 class="text-3xl font-extrabold tracking-tight">
            {{ title || entry?.title || 'Details' }}
          </h1>

          <div class="mt-2 flex flex-wrap gap-2">
            <!-- OMDb badges -->
            <span v-if="omdb?.Year" class="pill">{{ omdb.Year }}</span>
            <span v-if="omdb?.Runtime" class="pill">{{ omdb.Runtime }}</span>
            <span v-if="omdb?.Rated" class="pill">{{ omdb.Rated }}</span>
            <span
              v-if="omdb?.imdbRating && omdb.imdbRating !== 'N/A'"
              class="pill"
            >⭐ {{ omdb.imdbRating }}</span>

            <!-- Stored entry badges (always available) -->
            <span v-if="(entry as any)?.minutes != null" class="pill">
              {{ (entry as any).minutes }} min
            </span>

            <span
              v-if="kind === 'series' && (((entry as any)?.season != null) || ((entry as any)?.episode != null))"
              class="pill"
            >
              S{{ (entry as any)?.season ?? '?' }}E{{ (entry as any)?.episode ?? '?' }}
            </span>

            <span v-if="(entry as any)?.imdbId" class="pill font-mono">
              {{ (entry as any).imdbId }}
            </span>
          </div>

          <p v-if="omdb?.Genre || omdb?.Released" class="mt-2 text-sm text-white/60">
            {{ omdb?.Genre }}
            <span v-if="omdb?.Genre && omdb?.Released"> • </span>
            {{ omdb?.Released }}
          </p>

          <div v-if="omdbWarning" class="mt-4 alert info">{{ omdbWarning }}</div>

          <p v-if="omdb?.Plot && omdb.Plot !== 'N/A'" class="mt-4 max-w-3xl text-white/80">
            {{ omdb.Plot }}
          </p>

          <div class="mt-4 space-y-2 text-sm text-white/70">
            <p v-if="omdb?.Director && omdb.Director !== 'N/A'">
              <span class="font-semibold text-white/80">Regie:</span> {{ omdb.Director }}
            </p>
            <p v-if="omdb?.Actors && omdb.Actors !== 'N/A'">
              <span class="font-semibold text-white/80">Cast:</span> {{ omdb.Actors }}
            </p>
            <p v-if="(entry as any)?.notes" class="italic">
              „{{ (entry as any).notes }}“
            </p>
          </div>

          <!-- Trailer -->
          <div class="mt-6">
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-extrabold">Trailer</h2>
              <span v-if="trailerLoading" class="text-xs text-white/50">lädt…</span>
            </div>

            <div
              v-if="trailerSrc"
              class="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-white/5"
            >
              <div class="aspect-video">
                <iframe
                  class="h-full w-full"
                  :src="trailerSrc"
                  title="Trailer"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                  referrerpolicy="strict-origin-when-cross-origin"
                ></iframe>
              </div>
            </div>

            <div v-else class="mt-3 alert info">
              {{ trailerWarning || 'Kein Trailer verfügbar.' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
