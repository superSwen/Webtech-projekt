<script setup lang="ts">
import { computed, ref } from 'vue'
import type { FilmDto } from '@/types/media'
import { useFavorites } from '@/utils/favorites'

const props = defineProps<{
  items: FilmDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: FilmDto): void
  (e: 'remove', item: FilmDto): void
  (e: 'open', item: FilmDto): void
}>()

const { isFavorite, toggleFavorite } = useFavorites()

type SortByFilm = 'title' | 'minutes' | 'favorite' | 'id'
const sortBy = ref<SortByFilm>('title')
const sortDir = ref<'asc' | 'desc'>('asc')

const sortedItems = computed(() => {
  const arr = [...(props.items ?? [])]
  const dir = sortDir.value === 'asc' ? 1 : -1

  arr.sort((a, b) => {
    if (sortBy.value === 'favorite') {
      const af = isFavorite('film', a.id) ? 1 : 0
      const bf = isFavorite('film', b.id) ? 1 : 0
      if (af !== bf) return (bf - af) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'minutes') {
      const am = a.minutes ?? -1
      const bm = b.minutes ?? -1
      if (am !== bm) return (am - bm) * dir
      return (a.title ?? '').localeCompare(b.title ?? '') * dir
    }

    if (sortBy.value === 'id') {
      // fallback: wenn id nicht numerisch ist, wird NaN rauskommen -> dann title
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
      <h2 class="cardTitle">Filme</h2>

      <div class="flex items-center gap-2">
        <select class="input !w-auto !px-2 !py-1 !text-sm" v-model="sortBy" :disabled="busy">
          <option value="title">A–Z (Titel)</option>
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
          <span v-if="it.minutes != null" class="meta"> — {{ it.minutes }} min</span>
          <em v-if="it.notes" class="note">{{ it.notes }}</em>
        </div>

        <div class="flex gap-2 sm:shrink-0">
          <button
            type="button"
            class="btn ghost"
            :class="isFavorite('film', it.id) ? 'border-red-500/30 text-red-200' : ''"
            :aria-pressed="isFavorite('film', it.id)"
            :title="isFavorite('film', it.id) ? 'Favorit entfernen' : 'Als Favorit markieren'"
            :disabled="busy"
            @click="toggleFavorite('film', it.id)"
          >
            <span class="text-lg leading-none">
              {{ isFavorite('film', it.id) ? '★' : '☆' }}
            </span>
          </button>

          <button class="btn" :disabled="busy" @click="emit('edit', it)">Bearbeiten</button>
          <button class="btn danger" :disabled="busy" @click="emit('remove', it)">Löschen</button>
        </div>
      </li>
    </TransitionGroup>

    <p v-else class="muted mt-3">Noch keine Filme gespeichert.</p>
  </section>
</template>
