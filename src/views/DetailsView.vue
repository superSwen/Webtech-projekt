<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'

type FilmDto = {
  id: number
  title: string
  minutes?: number | null
  notes?: string | null
}

type SerieDto = {
  id: number
  title: string
  minutes?: number | null
  notes?: string | null
  season?: number | null
  episode?: number | null
}

type OmdbMovie = {
  Title?: string
  Year?: string
  Genre?: string
  Runtime?: string
  Plot?: string
  Poster?: string
  imdbRating?: string
  imdbID?: string
  Director?: string
  Writer?: string
  Actors?: string
  Response?: string
  Error?: string
}

const route = useRoute()
const router = useRouter()

const API = (import.meta.env.VITE_API_BASE as string | undefined) ?? 'http://localhost:8080'
const api = axios.create({ baseURL: API, timeout: 20000 })

const kind = computed(() => String(route.params.kind)) // "movie" | "series"
const id = computed(() => Number(route.params.id))

const entry = ref<FilmDto | SerieDto | null>(null)
const details = ref<OmdbMovie | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)

const titleForSearch = computed(() => entry.value?.title ?? '')
const omdbType = computed(() => (kind.value === 'series' ? 'series' : 'movie'))

const posterUrl = computed(() => {
  const p = details.value?.Poster
  return p && p !== 'N/A' ? p : ''
})

const trailerUrl = computed(() => {
  const t = details.value?.Title || entry.value?.title || ''
  const q = encodeURIComponent(`${t} trailer`)
  return `https://www.youtube.com/results?search_query=${q}`
})

async function load() {
  loading.value = true
  error.value = null
  entry.value = null
  details.value = null

  try {
    // 1) Eintrag aus eigener DB holen
    if (kind.value === 'series') {
      const res = await api.get<SerieDto>(`/api/series/${id.value}`)
      entry.value = res.data
    } else {
      const res = await api.get<FilmDto>(`/api/films/${id.value}`)
      entry.value = res.data
    }

    // 2) OMDb Details holen (über euer Backend-Proxy)
    const t = titleForSearch.value.trim()
    if (!t) throw new Error('Kein Titel im Eintrag gefunden.')

    const omdbRes = await api.get<OmdbMovie>('/api/omdb', {
      params: { t, type: omdbType.value }
    })

    details.value = omdbRes.data

    if (details.value?.Response && details.value.Response !== 'True') {
      throw new Error(details.value.Error || 'OMDb: Keine Daten gefunden.')
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch([kind, id], load)
</script>

<template>
  <div class="page">
    <div class="topbar">
      <button class="btn ghost" @click="router.push('/')">← Zurück</button>
      <div class="spacer" />
      <a class="btn ghost" :href="trailerUrl" target="_blank" rel="noreferrer">Trailer suchen</a>
    </div>

    <p v-if="loading" class="muted">Lade Details…</p>
    <p v-else-if="error" class="err">Fehler: {{ error }}</p>

    <div v-else class="grid">
      <!-- LINKS: Bild -->
      <section class="card poster">
        <img v-if="posterUrl" :src="posterUrl" :alt="details?.Title || entry?.title" />
        <div v-else class="posterFallback">Kein Poster verfügbar</div>
      </section>

      <!-- MITTE: Beschreibung -->
      <section class="card info">
        <h1 class="title">{{ details?.Title || entry?.title }}</h1>

        <div class="meta">
          <span v-if="details?.Year">{{ details.Year }}</span>
          <span v-if="details?.Genre">• {{ details.Genre }}</span>
          <span v-if="details?.Runtime">• {{ details.Runtime }}</span>
          <span v-if="details?.imdbRating">• ⭐ {{ details.imdbRating }}</span>
        </div>

        <p class="plot">{{ details?.Plot }}</p>

        <div class="facts">
          <div v-if="details?.Director"><b>Regie:</b> {{ details.Director }}</div>
          <div v-if="details?.Writer"><b>Autor:</b> {{ details.Writer }}</div>
          <div v-if="details?.Actors"><b>Cast:</b> {{ details.Actors }}</div>
          <div v-if="details?.imdbID"><b>IMDb ID:</b> {{ details.imdbID }}</div>
        </div>
      </section>

      <!-- RECHTS: Trailer Bereich -->
      <section class="card trailer">
        <h2>Trailer</h2>
        <p class="muted">
          Für ein echtes eingebettetes Video bräuchten wir zusätzlich YouTube/TMDb (API).
          Erstmal ist das hier der sichere, einfache Weg.
        </p>
        <a class="btn" :href="trailerUrl" target="_blank" rel="noreferrer">Auf YouTube suchen</a>
      </section>
    </div>
  </div>
</template>

<style scoped>
.page { padding: 1rem; }
.topbar { display:flex; gap: .75rem; align-items:center; margin-bottom: 1rem; }
.spacer { flex: 1; }

.grid {
  display: grid;
  grid-template-columns: 320px 1fr 320px;
  gap: 1rem;
}

.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1rem;
}

.poster img { width:100%; border-radius: 12px; display:block; }
.posterFallback {
  height: 420px;
  display:flex;
  align-items:center;
  justify-content:center;
  border-radius: 12px;
  border: 1px dashed rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.6);
}

.title { margin: 0 0 .25rem; font-size: 2rem; }
.meta { color: rgba(255,255,255,0.7); margin-bottom: 1rem; }
.plot { line-height: 1.5; margin-bottom: 1rem; color: rgba(255,255,255,0.85); }
.facts { display:flex; flex-direction: column; gap: .4rem; color: rgba(255,255,255,0.85); }

.btn {
  padding: .6rem .9rem;
  border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(229,9,20,0.85);
  color: white;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
}

.btn.ghost {
  background: rgba(255,255,255,0.06);
}

.err { color: #ff4d4d; }
.muted { color: rgba(255,255,255,0.6); }

@media (max-width: 1100px) {
  .grid { grid-template-columns: 1fr; }
}
</style>
