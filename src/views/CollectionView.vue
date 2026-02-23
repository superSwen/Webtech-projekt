<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { FilmDto, SerieDto } from '@/types/media'
import { getFilms, getSeries } from '@/api/mediaApi'
import CollectionMosaic from '@/components/CollectionMosaic.vue'

type CollectionItem = {
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

const items = computed<CollectionItem[]>(() => {
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
  <div class="w-full">
    <div v-if="loading" class="px-6 py-6">
      <div class="alert info">Lade Collection…</div>
    </div>

    <div v-else-if="error" class="px-6 py-6">
      <div class="alert error">Fehler: {{ error }}</div>
    </div>

    <div v-else-if="items.length === 0" class="px-6 py-6">
      <div class="alert info">Noch keine Einträge gespeichert.</div>
    </div>

    <CollectionMosaic v-else :items="items" />
  </div>
</template>
