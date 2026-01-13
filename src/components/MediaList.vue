<script setup lang="ts">
defineProps<{
  title: string
  kind: 'movie' | 'series'
  items: Array<{
    id: number
    title: string
    minute?: number | null
    minutes?: number | null
    notes?: string | null
    note?: string | null
  }>
}>()
</script>

<template>
  <section class="card">
    <header class="head">
      <h2>{{ title }}</h2>
      <small>{{ items.length }} Einträge</small>
    </header>

    <p v-if="items.length === 0" class="muted">Noch keine Einträge gespeichert.</p>

    <ul v-else class="list">
      <li v-for="it in items" :key="it.id" class="row">
        <div class="left">
          <!-- KLICKBAR -->
          <RouterLink class="itemTitle" :to="`/details/${kind}/${it.id}`">
            {{ it.title }}
          </RouterLink>

          <span v-if="(it.minutes ?? it.minute) != null" class="mins">
            — {{ it.minutes ?? it.minute }} min
          </span>

          <div v-if="(it.notes ?? it.note)" class="note">
            {{ it.notes ?? it.note }}
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.card {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px;
  padding: 1rem;
}

.head { display:flex; justify-content: space-between; align-items: baseline; }

.list { list-style: none; padding: 0; margin: .75rem 0 0; }
.row { padding: .6rem 0; border-top: 1px solid rgba(255,255,255,0.06); }
.row:first-child { border-top: none; }

.itemTitle {
  font-weight: 800;
  color: white;
  text-decoration: none;
}
.itemTitle:hover { text-decoration: underline; }

.mins { color: rgba(255,255,255,0.7); margin-left: .25rem; }
.note { color: rgba(255,255,255,0.7); margin-top: .25rem; }
.muted { color: rgba(255,255,255,0.6); margin-top: .5rem; }
</style>
