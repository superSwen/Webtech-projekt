<script setup lang="ts">
import type { SerieDto } from '@/types/media'
import { useFavorites } from '@/utils/favorites'

defineProps<{
  items: SerieDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: SerieDto): void
  (e: 'remove', item: SerieDto): void
  (e: 'open', item: SerieDto): void
}>()

const { isFavorite, toggleFavorite } = useFavorites()
</script>

<template>
  <section class="card">
    <header class="cardHead">
      <h2 class="cardTitle">Serien</h2>
      <span class="pill">{{ items.length }} Einträge</span>
    </header>

    <TransitionGroup name="list" tag="ul" class="list" v-if="items.length">
      <li v-for="it in items" :key="it.id" class="row">
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
