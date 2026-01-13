<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { SerieCreateUpdate, SerieDto } from '@/types/media'
import { omdbSearch, type OmdbSearchItem } from '@/api/omdbApi'

const props = defineProps<{
  editing: SerieDto | null
  busy: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: SerieCreateUpdate): void
  (e: 'cancel'): void
}>()

const title = ref('')
const season = ref<number | null>(null)
const episode = ref<number | null>(null)
const minutes = ref<number | null>(null)
const notes = ref('')

const imdbId = ref<string | null>(null)

// search state
const results = ref<OmdbSearchItem[]>([])
const show = ref(false)
const searching = ref(false)
let t: number | undefined

watch(
  () => props.editing,
  (v) => {
    title.value = v?.title ?? ''
    season.value = v?.season ?? null
    episode.value = v?.episode ?? null
    minutes.value = v?.minutes ?? null
    notes.value = v?.notes ?? ''
    imdbId.value = v?.imdbId ?? null
    results.value = []
    show.value = false
  },
  { immediate: true }
)

const header = computed(() => (props.editing ? 'Serie bearbeiten' : 'Neue Serie anlegen'))
const submitLabel = computed(() => (props.editing ? 'Änderungen speichern' : 'Serie speichern'))

function clearSearch() {
  results.value = []
  show.value = false
}

async function runSearch() {
  const q = title.value.trim()
  if (q.length < 2) return clearSearch()

  searching.value = true
  try {
    const r = await omdbSearch(q, 'series')
    results.value = Array.isArray(r) ? r.slice(0, 8) : []
    show.value = results.value.length > 0
  } finally {
    searching.value = false
  }
}

function closeDropdownSoon() {
  window.setTimeout(() => {
    show.value = false
  }, 120)
}

function onTitleInput(v: string) {
  title.value = v
  imdbId.value = null

  window.clearTimeout(t)
  t = window.setTimeout(() => runSearch(), 250)
}

function pick(item: OmdbSearchItem) {
  title.value = item.Title
  imdbId.value = item.imdbID
  clearSearch()
}

function onSubmit() {
  if (!title.value.trim()) return

  emit('submit', {
    title: title.value.trim(),
    season: season.value,
    episode: episode.value,
    minutes: minutes.value,
    notes: notes.value.trim() || null,
    imdbId: imdbId.value
  })
}

function onCancel() {
  clearSearch()
  emit('cancel')
}
</script>

<template>
  <section class="card">
    <h2>{{ header }}</h2>

    <p v-if="error" class="err">{{ error }}</p>

    <label class="label">Titel</label>
    <div class="searchWrap">
      <input
        class="input"
        :value="title"
        @input="onTitleInput(($event.target as HTMLInputElement).value)"
        @focus="title.trim().length >= 2 && results.length ? (show = true) : null"
        @blur="closeDropdownSoon"
        placeholder="z.B. Naruto…"
        :disabled="busy"
      />
      <div v-if="searching" class="hint">Suche…</div>

      <div v-if="show" class="dropdown">
        <button
          v-for="r in results"
          :key="r.imdbID"
          type="button"
          class="row"
          @mousedown.prevent="pick(r)"
        >
          <span class="t">{{ r.Title }}</span>
          <span class="m">{{ r.Year }} · {{ r.Type }}</span>
        </button>
      </div>
    </div>

    <p v-if="imdbId" class="imdb">IMDB-ID: {{ imdbId }}</p>

    <div class="two">
      <div>
        <label class="label">Staffel</label>
        <input class="input" type="number" v-model.number="season" :disabled="busy" />
      </div>
      <div>
        <label class="label">Episode</label>
        <input class="input" type="number" v-model.number="episode" :disabled="busy" />
      </div>
    </div>

    <label class="label">Minuten</label>
    <input class="input" type="number" v-model.number="minutes" :disabled="busy" />

    <label class="label">Notiz</label>
    <input class="input" v-model="notes" :disabled="busy" />

    <div class="actions">
      <button class="btn primary" @click="onSubmit" :disabled="busy || !title.trim()">
        {{ submitLabel }}
      </button>
      <button v-if="editing" class="btn" @click="onCancel" :disabled="busy">Abbrechen</button>
    </div>
  </section>
</template>

<style scoped>
.card {
  background: #111;
  border: 1px solid #222;
  border-radius: 18px;
  padding: 18px;
}
h2 { margin: 0 0 8px 0; color: #fff; }
.label { display:block; margin:10px 0 6px; color:#bdbdbd; font-size:13px; }
.input {
  width:100%;
  padding:10px 12px;
  border-radius:12px;
  border:1px solid #2a2a2a;
  background:#0b0b0b;
  color:#fff;
  outline:none;
}
.err { color:#ff6b6b; margin:8px 0; }

.two { display:grid; grid-template-columns:1fr 1fr; gap:10px; }

.searchWrap { position: relative; }
.dropdown {
  position:absolute;
  top: calc(100% + 8px);
  left:0; right:0;
  background:#0c0c0c;
  border:1px solid #2a2a2a;
  border-radius:14px;
  overflow:hidden;
  z-index:10;
}
.row {
  width:100%;
  text-align:left;
  padding:10px 12px;
  background:transparent;
  border:0;
  cursor:pointer;
  color:#fff;
}
.row:hover { background:#141414; }
.t { display:block; font-weight:600; }
.m { display:block; font-size:12px; color:#9a9a9a; margin-top:2px; }
.hint { position:absolute; right:10px; top:10px; font-size:12px; color:#9a9a9a; }
.imdb { margin:8px 0 0; font-size:12px; color:#9a9a9a; }

.actions { margin-top:14px; display:flex; gap:10px; }
.btn {
  padding:10px 12px;
  border-radius:12px;
  border:1px solid #2a2a2a;
  background:#141414;
  color:#fff;
  cursor:pointer;
}
.primary { border-color:#b3001b; background:#b3001b; }
</style>
