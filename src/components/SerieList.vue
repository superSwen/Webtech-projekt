<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SerieDto } from '@/types/media'
import { useFavorites } from '@/utils/favorites'

const props = defineProps<{
  items: SerieDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: SerieDto): void
  (e: 'remove', item: SerieDto): void
  (e: 'open', item: SerieDto): void
}>()

const { isFavorite, toggleFavorite } = useFavorites()

type SortBySerie = 'title' | 'season' | 'episode' | 'minutes' | 'favorite' | 'id'
const sortBy = ref<SortBySerie>('title')
const sortDir = ref<'asc' | 'desc'>('asc')

const sortedItems = computed(() => {
  const arr = [...(props.items ?? [])]
  const dir = sortDir.value === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    if (sortBy.value === 'favorite') {
      const af = isFavorite('serie', a.id) ? 1 : 0
      const bf = isFavorite('serie', b.id) ? 1 : 0
      if (af !== bf) return (bf - af) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'minutes') {
      const am = a.minutes ?? -1
      const bm = b.minutes ?? -1
      if (am !== bm) return (am - bm) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'season') {
      const as = a.season ?? -1
      const bs = b.season ?? -1
      if (as !== bs) return (as - bs) * dir
      const ae = a.episode ?? -1
      const be = b.episode ?? -1
      if (ae !== be) return (ae - be) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'episode') {
      const ae = a.episode ?? -1
      const be = b.episode ?? -1
      if (ae !== be) return (ae - be) * dir
      // tie-breaker season
      const as = a.season ?? -1
      const bs = b.season ?? -1
      if (as !== bs) return (as - bs) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'id') {
      const an = Number(a.id)
      const bn = Number(b.id)
      if (Number.isFinite(an) && Number.isFinite(bn) && an !== bn) return (an - bn) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    // default title
    return (a.title ?? '').localeCompare(b.title ?? '') * dir
  })

  return arr
})

function toggleDir() {
  sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
}
</script>

<template>
  <section class="card">
    <header class="cardHead">
      <h2 class="cardTitle">Serien</h2>

      <div class="flex items-center gap-2">
        <select class="input !w-auto !px-2 !py-1 !text-sm" v-model="sortBy" :disabled="busy">
          <option value="title">A–Z (Titel)</option>
          <option value="season">Staffel</option>
          <option value="episode">Episode</option>
          <option value="minutes">Minuten</option>
          <option value="favorite">Favoriten zuerst</option>
          <option value="id">Neu/Alt (ID)</option>
        </select>

        <button
          type="button"
          class="btn ghost"
          @click="toggleDir"
          :disabled="busy"
          :title="sortDir === 'asc' ? 'Aufsteigend' : 'Absteigend'"
        >
          {{ sortDir === 'asc' ? '↑' : '↓' }}
        </button>

        <span class="pill">{{ props.items.length }} Einträge</span>
      </div>
    </header>

    <TransitionGroup name="list" tag="ul" class="list" v-if="props.items.length">
      <li v-for="it in sortedItems" :key="it.id" class="row">
        <div class="min-w-0">
          <a class="titleLink" href="#" @click.prevent="emit('open', it)">
            {{ it.title }}
          </a>

          <span class="meta" v-if="it.season != null || it.episode != null">
            — S{{ it.season ?? '?' }}E{{ it.episode ?? '?' }}
          </span>

          <span v-if="it.minutes != null" class="meta"> — {{ it.minutes }} min</span>
          <em v-if="it.notes" class="note">{{ it.notes }}</em>
        </div>

        <div class="flex gap-2 sm:shrink-0">
          <button
            type="button"
            class="btn ghost"
            :class="isFavorite('serie', it.id) ? 'border-red-500/30 text-red-200' : ''"
            :aria-pressed="isFavorite('serie', it.id)"
            :title="isFavorite('serie', it.id) ? 'Favorit entfernen' : 'Als Favorit markieren'"
            :disabled="busy"
            @click="toggleFavorite('serie', it.id)"
          >
            <span class="text-lg leading-none">
              {{ isFavorite('serie', it.id) ? '★' : '☆' }}
            </span>
          </button>

          <button class="btn" :disabled="busy" @click="emit('edit', it)">Bearbeiten</button>
          <button class="btn danger" :disabled="busy" @click="emit('remove', it)">Löschen</button>
        </div>
      </li>
    </TransitionGroup>

    <p v-else class="muted mt-3">Noch keine Serien gespeichert.</p>
  </section>
</template>
