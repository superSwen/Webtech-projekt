<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '@/api/http'
import { getTrailer, type TmdbTrailerDto } from '@/api/tmdbApi'

type Kind = 'movie' | 'series'

const route = useRoute()
const router = useRouter()

const kind = computed<Kind>(() => (route.params.kind === 'series' ? 'series' : 'movie'))
const id = computed(() => String(route.params.id || ''))

const loading = ref(true)
const error = ref<string | null>(null)

const entry = ref<any>(null) // dein gespeichertes Objekt (Film/Serie)
const omdb = ref<any>(null)  // OMDb-Details

const trailer = ref<TmdbTrailerDto | null>(null)
const trailerLoading = ref(false)

const trailerSrc = computed(() => {
  const t = trailer.value
  return t?.url ?? null
})

async function load() {
  loading.value = true
  error.value = null
  entry.value = null
  omdb.value = null
  trailer.value = null

  try {
    // ✅ 1) Eintrag aus eurem Backend (RICHTIGE Routes!)
    if (kind.value === 'movie') {
      entry.value = (await api.get(`/api/films/${id.value}`)).data
    } else {
      entry.value = (await api.get(`/api/series/${id.value}`)).data
    }

    const title = entry.value?.title
    if (!title) throw new Error('Kein Titel im Eintrag gefunden.')

    // ✅ 2) OMDb Details (auch hier sehr wahrscheinlich /api/omdb/...)
    // OMDb Details via Backend: GET /api/omdb?t=TITLE&type=movie|series
    omdb.value = (await api.get(`/api/omdb`, {
      params: {
        t: title,
        type: kind.value // 'movie' | 'series' passt perfekt
      }
    })).data


    // ✅ 3) Trailer via TMDB
    trailerLoading.value = true
    try {
      trailer.value = await getTrailer(omdb.value?.Title ?? title, kind.value)
    } catch {
      trailer.value = null
    } finally {
      trailerLoading.value = false
    }
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

function back() {
  router.push({ name: 'home' })
}

watch([() => kind.value, () => id.value], load, { immediate: true })
</script>

<template>
  <main class="page">
    <button class="back" @click="back">← Zurück</button>

    <p v-if="loading" class="info">Lade Details…</p>
    <p v-else-if="error" class="err">Fehler: {{ error }}</p>

    <section v-else class="card">
      <div class="left">
        <img
          v-if="omdb?.Poster && omdb.Poster !== 'N/A'"
          class="poster"
          :src="omdb.Poster"
          :alt="omdb.Title || entry?.title"
        />
      </div>

      <div class="right">
        <h1 class="title">{{ omdb?.Title || entry?.title }}</h1>

        <p class="sub" v-if="omdb?.Genre || omdb?.Released">
          {{ omdb?.Genre }}
          <span v-if="omdb?.Genre && omdb?.Released"> • </span>
          {{ omdb?.Released }}
        </p>

        <p class="plot" v-if="omdb?.Plot && omdb.Plot !== 'N/A'">
          {{ omdb.Plot }}
        </p>

        <p class="meta" v-if="omdb?.Director && omdb.Director !== 'N/A'">
          <b>Regie:</b> {{ omdb.Director }}
        </p>
        <p class="meta" v-if="omdb?.Actors && omdb.Actors !== 'N/A'">
          <b>Cast:</b> {{ omdb.Actors }}
        </p>

        <div class="badges">
          <span class="badge" v-if="omdb?.Year">{{ omdb.Year }}</span>
          <span class="badge" v-if="omdb?.Runtime">{{ omdb.Runtime }}</span>
          <span class="badge" v-if="omdb?.Rated">{{ omdb.Rated }}</span>
          <span class="badge" v-if="omdb?.imdbRating && omdb.imdbRating !== 'N/A'">⭐ {{ omdb.imdbRating }}</span>
        </div>

        <!-- ✅ Trailerblock -->
        <div class="trailerBlock" v-if="trailerLoading || trailerSrc">
          <h2 class="h2">Trailer</h2>

          <p v-if="trailerLoading" class="info">Lade Trailer…</p>

          <div v-else class="frame">
            <iframe
              :src="trailerSrc!"
              title="Trailer"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
            ></iframe>
          </div>
        </div>

        <!-- optional: wenn kein Trailer gefunden -->
        <p v-else class="info" style="margin-top:18px;">
          Kein Trailer gefunden.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page { background:#000; min-height:100vh; padding:24px; color:#fff; }
.back { background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:10px; cursor:pointer; }
.info { color:#aaa; }
.err { color:#ff6b6b; }

.card { margin-top:16px; display:flex; gap:18px; align-items:flex-start; }
.left { width:280px; }
.poster { width:100%; border-radius:18px; border:1px solid rgba(255,255,255,0.08); }

.right { flex:1; min-width:0; }
.title { margin:0; font-size:34px; font-weight:800; }
.sub { margin:6px 0 14px; color:rgba(255,255,255,0.7); }
.plot { margin: 0 0 14px; max-width: 850px; color: rgba(255,255,255,0.9); }
.meta { margin: 6px 0; color: rgba(255,255,255,0.85); }

.badges { display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
.badge { background: rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.10); padding:6px 10px; border-radius:999px; font-size:12px; color: rgba(255,255,255,0.85); }

.trailerBlock { margin-top: 22px; }
.h2 { margin: 0 0 10px; font-size: 18px; font-weight: 800; }

.frame {
  width: 100%;
  max-width: 820px;
  aspect-ratio: 16 / 9;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(255,255,255,0.04);
}
.frame iframe { width: 100%; height: 100%; display: block; }

@media (max-width: 980px) {
  .card { flex-direction: column; }
  .left { width: 100%; max-width: 360px; }
}
</style>
