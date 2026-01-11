<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { FilmDto, SerieDto } from '@/types/media'
import { getFilmById, getSerieById } from '@/api/mediaApi'

const route = useRoute()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)
const data = ref<FilmDto | SerieDto | null>(null)

onMounted(async () => {
  loading.value = true
  error.value = null
  data.value = null
  try {
    const kind = String(route.params.kind) // "films" | "series"
    const id = Number(route.params.id)

    if (!id) throw new Error('Ungültige ID.')

    if (kind === 'films') data.value = await getFilmById(id)
    else if (kind === 'series') data.value = await getSerieById(id)
    else throw new Error('Ungültiger Typ.')
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <main class="page">
    <button class="btn" @click="router.push('/')">← Zurück</button>

    <p v-if="loading" class="info">Lade Details…</p>
    <p v-else-if="error" class="err">{{ error }}</p>

    <section v-else class="card">
      <h1>{{ (data as any)?.title }}</h1>
      <p class="meta" v-if="(data as any)?.minutes != null">Minuten: {{ (data as any)?.minutes }}</p>
      <p class="meta" v-if="(data as any)?.season != null || (data as any)?.episode != null">
        Staffel/Episode: S{{ (data as any)?.season ?? '?' }}E{{ (data as any)?.episode ?? '?' }}
      </p>
      <p class="note" v-if="(data as any)?.notes">Notiz: {{ (data as any)?.notes }}</p>

      <p class="hint">
        IMDB/Poster/Trailer kommt als nächstes – dafür brauchen wir dann entweder ein eigenes Backend-Endpoint,
        das OMDb/IMDb abfragt, oder wir machen es direkt im Frontend (mit API-Key).
      </p>
    </section>
  </main>
</template>

<style scoped>
.page { background:#000; min-height:100vh; padding:24px; }
.btn { background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:10px; cursor:pointer; margin-bottom:16px; }
.info { color:#aaa; }
.err { color:#ff6b6b; }
.card { background:#111; border:1px solid #222; border-radius:16px; padding:16px; color:#fff; }
.meta { color:#bbb; }
.note { color:#ddd; }
.hint { color:#999; margin-top:14px; }
</style>
