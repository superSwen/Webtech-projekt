<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getFilm, getSerie } from '@/api/mediaApi'
import { api } from '@/api/http'

type OmdbMovie = {
  Title?: string
  Poster?: string
  Plot?: string
  imdbRating?: string
  Year?: string
  Genre?: string
  Director?: string
  Actors?: string
  Runtime?: string
  Released?: string
  Rated?: string
}

type TmdbTrailer = {
  mediaType: 'movie' | 'tv'
  sourceTitle: string
  name: string
  site: string
  key: string
  url: string
}

const route = useRoute()
const router = useRouter()

const kind = computed(() => String(route.params.kind)) // "films" | "series"
const id = computed(() => Number(route.params.id))

const loading = ref(true)
const error = ref<string | null>(null)

const entry = ref<any>(null)
const omdb = ref<OmdbMovie | null>(null)
const trailer = ref<TmdbTrailer | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    entry.value = kind.value === 'series'
      ? await getSerie(id.value)
      : await getFilm(id.value)

    const imdbId = entry.value?.imdbId
    const title = entry.value?.title

    // OMDb-Infos
    if (imdbId) {
      const { data } = await api.get('/api/omdb', { params: { i: imdbId } })
      omdb.value = data
    } else if (title) {
      const type = kind.value === 'series' ? 'series' : 'movie'
      const { data } = await api.get('/api/omdb', { params: { t: title, type } })
      omdb.value = data
    }

    // Trailer von TMDb
    if (title) {
      const type = kind.value === 'series' ? 'tv' : 'movie'
      const { data, status } = await api.get('/api/tmdb/trailer', { params: { title, type } })
      if (status === 200 && data) trailer.value = data
    }
  } catch (e: any) {
    error.value = e?.response?.data ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
function back() {
  router.push({ name: 'home' })
}
</script>

<template>
  <main class="page">
    <button class="back" @click="back">← Zurück</button>
    <p v-if="loading" class="info">Lade…</p>
    <p v-else-if="error" class="err">{{ error }}</p>

    <section v-else class="grid">
      <div class="left">
        <div v-if="omdb?.Poster && omdb.Poster !== 'N/A'" class="poster">
          <img :src="omdb.Poster" alt="Poster" />
        </div>
        <div class="facts">
          <div v-if="omdb?.Year" class="pill">{{ omdb.Year }}</div>
          <div v-if="omdb?.Runtime && omdb.Runtime !== 'N/A'" class="pill">{{ omdb.Runtime }}</div>
          <div v-if="omdb?.Rated && omdb.Rated !== 'N/A'" class="pill">{{ omdb.Rated }}</div>
          <div v-if="omdb?.imdbRating && omdb.imdbRating !== 'N/A'" class="pill">⭐ {{ omdb.imdbRating }}</div>
        </div>
      </div>

      <div class="content">
        <h1>{{ omdb?.Title ?? entry?.title }}</h1>
        <p class="meta">
          <span v-if="omdb?.Genre && omdb.Genre !== 'N/A'">{{ omdb.Genre }}</span>
          <span v-if="omdb?.Released && omdb.Released !== 'N/A'"> · {{ omdb.Released }}</span>
        </p>

        <p v-if="omdb?.Plot && omdb.Plot !== 'N/A'" class="plot">{{ omdb.Plot }}</p>
        <p v-if="omdb?.Director && omdb.Director !== 'N/A'" class="line"><b>Regie:</b> {{ omdb.Director }}</p>
        <p v-if="omdb?.Actors && omdb.Actors !== 'N/A'" class="line"><b>Cast:</b> {{ omdb.Actors }}</p>

        <div v-if="trailer?.url && trailer.site === 'YouTube'" class="trailer">
          <h2>Trailer</h2>
          <iframe
            :src="trailer.url"
            title="Trailer"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          />
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page { background:#000; min-height:100vh; padding:24px; color:#fff; }
.back { background:#111; border:1px solid #222; color:#fff; padding:10px 12px; border-radius:12px; cursor:pointer; }
.info { color:#aaa; }
.err { color:#ff6b6b; white-space: pre-wrap; }
.grid { margin-top:16px; display:grid; grid-template-columns: 280px 1fr; gap:22px; align-items:start; }
.poster img { width:280px; border-radius:18px; border:1px solid #1f1f1f; }
.facts { margin-top:12px; display:flex; flex-wrap:wrap; gap:8px; }
.pill { background:#111; border:1px solid #222; color:#ddd; padding:6px 10px; border-radius:999px; font-size:12px; }
.content h1 { margin:0; font-size:34px; }
.meta { color:#aaa; margin:8px 0 14px; }
.plot { color:#ddd; line-height:1.55; max-width:860px; }
.line { color:#ccc; margin:10px 0; }
.trailer { margin-top:22px; }
.trailer h2 { margin:0 0 10px; font-size:18px; color:#fff; }
.trailer iframe { width:100%; max-width:900px; aspect-ratio:16/9; border-radius:14px; border:1px solid #1f1f1f; background:#000; }
@media (max-width:900px){ .grid{grid-template-columns:1fr;} .poster img{width:100%;} }
</style>
