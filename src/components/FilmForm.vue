<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { FilmCreateUpdate, FilmDto } from '@/types/media'
import { omdbSearch, type OmdbSearchItem } from '@/api/omdbApi'

const props = defineProps<{
  editing: FilmDto | null
  busy: boolean
  error: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: FilmCreateUpdate): void
  (e: 'cancel'): void
}>()

const title = ref('')
const minutes = ref<number | null>(null)
const notes = ref('')
const imdbId = ref<string | null>(null)

const results = ref<OmdbSearchItem[]>([])
const show = ref(false)
const searching = ref(false)
let t: number | undefined

watch(
  () => props.editing,
  (v) => {
    title.value = v?.title ?? ''
    minutes.value = v?.minutes ?? null
    notes.value = v?.notes ?? ''
    imdbId.value = v?.imdbId ?? null
    results.value = []
    show.value = false
  },
  { immediate: true }
)

const header = computed(() => (props.editing ? 'Film bearbeiten' : 'Neuen Film anlegen'))
const submitLabel = computed(() => (props.editing ? 'Änderungen speichern' : 'Film speichern'))

function clearSearch() {
  results.value = []
  show.value = false
}

async function runSearch() {
  const q = title.value.trim()
  if (q.length < 2) return clearSearch()

  searching.value = true
  try {
    const r = await omdbSearch(q, 'movie')
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
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="cardTitle">{{ header }}</h2>
        <p class="mt-1 text-xs text-white/50">Tipp: 2+ Zeichen tippen → OMDb Vorschläge</p>
      </div>
      <span v-if="editing" class="pill">Edit</span>
    </div>

    <div v-if="error" class="alert error mt-4">{{ error }}</div>

    <label class="label">Titel</label>
    <div class="relative">
      <input
        class="input pr-16"
        :value="title"
        @input="onTitleInput(($event.target as HTMLInputElement).value)"
        @focus="title.trim().length >= 2 && results.length ? (show = true) : null"
        @blur="closeDropdownSoon"
        placeholder="z.B. Harry Potter…"
        :disabled="busy"
      />
      <div v-if="searching" class="ddHint">Suche…</div>

      <div v-if="show" class="dropdown">
        <button
          v-for="r in results"
          :key="r.imdbID"
          type="button"
          class="ddRow"
          @mousedown.prevent="pick(r)"
        >
          <span class="ddTitle">{{ r.Title }}</span>
          <span class="ddMeta">{{ r.Year }} · {{ r.Type }}</span>
        </button>
      </div>
    </div>

    <p v-if="imdbId" class="mt-2 text-xs text-white/50">
      IMDB-ID: <span class="font-mono text-white/70">{{ imdbId }}</span>
    </p>

    <label class="label">Minuten</label>
    <input class="input" type="number" v-model.number="minutes" :disabled="busy" />

    <label class="label">Notiz</label>
    <input class="input" v-model="notes" :disabled="busy" />

    <div class="mt-5 flex flex-wrap gap-2">
      <button class="btn primary" @click="onSubmit" :disabled="busy || !title.trim()">
        {{ submitLabel }}
      </button>
      <button v-if="editing" class="btn ghost" @click="onCancel" :disabled="busy">
        Abbrechen
      </button>
    </div>
  </section>
</template>
