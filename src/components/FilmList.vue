<script setup lang="ts">
import type { FilmDto } from '@/types/media'
import { useFavorites } from '@/utils/favorites'

defineProps<{
  items: FilmDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: FilmDto): void
  (e: 'remove', item: FilmDto): void
  (e: 'open', item: FilmDto): void
}>()

const { isFavorite, toggleFavorite } = useFavorites()
</script>

<template>
  <section class="card">
    <header class="cardHead">
      <h2 class="cardTitle">Filme</h2>
      <span class="pill">{{ items.length }} Einträge</span>
    </header>

    <TransitionGroup name="list" tag="ul" class="list" v-if="items.length">
      <li v-for="it in items" :key="it.id" class="row">
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
