<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FilmDto, SerieDto } from '@/types/media'
import { getFilms, getSeries } from '@/api/mediaApi'
import CollectionBubbles from '@/components/CollectionBubbles.vue'

type BubbleItem = {
  key: string
  kind: 'movie' | 'series'
  id: number
  title: string
  posterUrl?: string | null
}

const loading = ref(true)
const error = ref<string | null>(null)

const films = ref<FilmDto[]>([])
const series = ref<SerieDto[]>([])

const items = computed<BubbleItem[]>(() => {
  const f = (films.value ?? []).map((x) => ({
    key: `movie:${x.id}`,
    kind: 'movie' as const,
    id: x.id,
    title: x.title,
    posterUrl: x.posterUrl ?? null
  }))
  const s = (series.value ?? []).map((x) => ({
    key: `series:${x.id}`,
    kind: 'series' as const,
    id: x.id,
    title: x.title,
    posterUrl: x.posterUrl ?? null
  }))
  return [...f, ...s].sort((a, b) => a.id - b.id)
})

async function load() {
  loading.value = true
  error.value = null
  try {
    const [f, s] = await Promise.all([getFilms(), getSeries()])
    films.value = f
    series.value = s
  } catch (e: any) {
    error.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="relative">
    <div v-if="loading" class="alert info">Lade Collection…</div>
    <div v-else-if="error" class="alert error">Fehler: {{ error }}</div>
    <div v-else-if="items.length === 0" class="alert info">Noch keine Einträge gespeichert.</div>

    <div v-else class="relative left-1/2 right-1/2 w-screen -ml-[50vw] -mr-[50vw] px-4">
      <CollectionBubbles :items="items" />
    </div>
  </div>
</template>
