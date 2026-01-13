<script setup lang="ts">
import type { FilmDto } from '@/types/media'

const props = defineProps<{
  items: FilmDto[]
  busy?: boolean
}>()

const emit = defineEmits<{
  (e: 'edit', item: FilmDto): void
  (e: 'remove', item: FilmDto): void
  (e: 'open', item: FilmDto): void
}>()
</script>

<template>
  <section class="card">
    <header class="head">
      <h2>Filme</h2>
      <small>{{ items.length }} Einträge</small>
    </header>

    <ul class="list" v-if="items.length">
      <li v-for="it in items" :key="it.id" class="row">
        <div class="main">
          <a class="title" href="#" @click.prevent="emit('open', it)">{{ it.title }}</a>
          <span v-if="it.minutes != null" class="meta">— {{ it.minutes }} min</span>
          <em v-if="it.notes" class="note">{{ it.notes }}</em>
        </div>

        <div class="actions">
          <button class="btn" :disabled="busy" @click="emit('edit', it)">Bearbeiten</button>
          <button class="btn danger" :disabled="busy" @click="emit('remove', it)">Löschen</button>
        </div>
      </li>
    </ul>

    <p v-else class="empty">Noch keine Filme gespeichert.</p>
  </section>
</template>

<style scoped>
.card { background:#111; border:1px solid #222; border-radius:16px; padding:16px; }
.head { display:flex; justify-content:space-between; align-items:baseline; gap:10px; }
h2 { color:#fff; margin:0; }
small { color:#888; }
.list { list-style:none; padding:0; margin:12px 0 0; display:flex; flex-direction:column; gap:10px; }
.row { display:flex; justify-content:space-between; gap:14px; border:1px solid #222; border-radius:12px; padding:12px; background:#0d0d0d; }
.main { color:#ddd; }
.title { color:#fff; text-decoration:none; font-weight:700; }
.title:hover { text-decoration:underline; }
.meta { color:#aaa; margin-left:6px; }
.note { display:block; color:#bbb; margin-top:6px; }
.actions { display:flex; gap:8px; align-items:flex-start; }
.btn { background:#1a1a1a; border:1px solid #333; color:#fff; padding:8px 10px; border-radius:10px; cursor:pointer; }
.btn.danger { border-color:#b00020; color:#ffd6d6; }
.empty { color:#888; margin:12px 0 0; }
</style>
