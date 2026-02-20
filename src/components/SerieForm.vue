<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { SerieCreateUpdate, SerieDto } from '@/types/media'
import { omdbSearch, type OmdbSearchItem } from '@/api/omdbApi'
import type { FieldErrors } from '@/utils/fieldErrors'

const props = defineProps<{
  editing: SerieDto | null
  busy: boolean
  error: string | null
  fieldErrors: FieldErrors
  resetKey: number
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

// show inline errors only after user interacted
const touched = reactive({
  title: false,
  season: false,
  episode: false,
  minutes: false,
  notes: false,
})

// OMDb dropdown
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

    // reset touched when switching between items
    touched.title = false
    touched.season = false
    touched.episode = false
    touched.minutes = false
    touched.notes = false
  },
  { immediate: true }
)

watch(
  () => props.resetKey,
  () => {
    if (!props.editing) resetForm()
  }
)
const header = computed(() => (props.editing ? 'Serie bearbeiten' : 'Neue Serie anlegen'))
const submitLabel = computed(() => (props.editing ? 'Änderungen speichern' : 'Serie speichern'))

// client-side rules (mirror backend)
const titleOk = computed(() => title.value.trim().length > 0)
const seasonOk = computed(() => Number.isInteger(season.value) && (season.value ?? 0) >= 1)
const episodeOk = computed(() => Number.isInteger(episode.value) && (episode.value ?? 0) >= 1)
const minutesOk = computed(() => Number.isInteger(minutes.value) && (minutes.value ?? 0) >= 1)


function resetForm() {
  title.value = ''
  season.value = null
  episode.value = null
  notes.value = ''
  imdbId.value = null

  results.value = []
  show.value = false
  searching.value = false

  touched.title = false
  touched.season = false
  touched.episode = false
  touched.notes = false
}

function fieldMsg(name: keyof FieldErrors) {
  return props.fieldErrors?.[name] ?? null
}

// strict numeric parse: digits only, >= 1
function setPositiveIntFromInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

// OMDb
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

const canSubmit = computed(
  () =>
    !props.busy &&
    titleOk.value &&
    seasonOk.value &&
    episodeOk.value &&
    minutesOk.value
)

function onSubmit() {
  // mark required fields touched
  touched.title = true
  touched.season = true
  touched.episode = true
  touched.minutes = true

  if (!canSubmit.value) return

  emit('submit', {
    title: title.value.trim(),
    season: season.value!,
    episode: episode.value!,
    minutes: minutes.value!,
    notes: notes.value.trim() || null,
    imdbId: imdbId.value,
  })
}

function onCancel() {
  clearSearch()
  emit('cancel')
}
</script>

<template>
  <section class="card h-full flex flex-col">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="cardTitle">{{ header }}</h2>
        <p class="mt-1 text-xs text-white/50">Gib mindestens 3 Zeichen ein, um eine Serie zu suchen.</p>
      </div>
      <span v-if="editing" class="pill">Edit</span>
    </div>

    <!-- general backend error (not field validation) -->
    <div v-if="error" class="alert error mt-4">{{ error }}</div>

    <!-- TITLE -->
    <label class="label">Titel</label>
    <div class="relative">
      <input
        class="input pr-16"
        :class="{
          'border-red-500/40 ring-2 ring-red-500/20':
            (touched.title && !titleOk) || !!fieldMsg('title'),
        }"
        :value="title"
        @input="onTitleInput(($event.target as HTMLInputElement).value)"
        @focus="title.trim().length >= 2 && results.length ? (show = true) : null"
        @blur="touched.title = true; closeDropdownSoon()"
        placeholder="z.B. Naruto…"
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

    <p v-if="touched.title && !titleOk" class="mt-1 text-xs text-red-300">
      Titel ist Pflicht.
    </p>
    <p v-else-if="fieldMsg('title')" class="mt-1 text-xs text-red-300">
      {{ fieldMsg('title') }}
    </p>

    <p v-if="imdbId" class="mt-2 text-xs text-white/50">
      IMDB-ID: <span class="font-mono text-white/70">{{ imdbId }}</span>
    </p>

    <!-- SEASON + EPISODE -->
    <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div>
        <label class="label !mt-0">Staffel</label>
        <input
          class="input"
          :class="{
            'border-red-500/40 ring-2 ring-red-500/20':
              (touched.season && !seasonOk) || !!fieldMsg('season'),
          }"
          inputmode="numeric"
          placeholder="z.B. 2"
          :value="season ?? ''"
          @input="season = setPositiveIntFromInput(($event.target as HTMLInputElement).value)"
          @blur="touched.season = true"
          :disabled="busy"
        />
        <p v-if="touched.season && !seasonOk" class="mt-1 text-xs text-red-300">
          Bitte eine Zahl ≥ 1 eingeben.
        </p>
        <p v-else-if="fieldMsg('season')" class="mt-1 text-xs text-red-300">
          {{ fieldMsg('season') }}
        </p>
      </div>

      <div>
        <label class="label !mt-0">Episode</label>
        <input
          class="input"
          :class="{
            'border-red-500/40 ring-2 ring-red-500/20':
              (touched.episode && !episodeOk) || !!fieldMsg('episode'),
          }"
          inputmode="numeric"
          placeholder="z.B. 7"
          :value="episode ?? ''"
          @input="episode = setPositiveIntFromInput(($event.target as HTMLInputElement).value)"
          @blur="touched.episode = true"
          :disabled="busy"
        />
        <p v-if="touched.episode && !episodeOk" class="mt-1 text-xs text-red-300">
          Bitte eine Zahl ≥ 1 eingeben.
        </p>
        <p v-else-if="fieldMsg('episode')" class="mt-1 text-xs text-red-300">
          {{ fieldMsg('episode') }}
        </p>
      </div>
    </div>

    <!-- MINUTES -->
    <label class="label">Minuten</label>
    <input
      class="input"
      :class="{
        'border-red-500/40 ring-2 ring-red-500/20':
          (touched.minutes && !minutesOk) || !!fieldMsg('minutes'),
      }"
      inputmode="numeric"
      placeholder="z.B. 24"
      :value="minutes ?? ''"
      @input="minutes = setPositiveIntFromInput(($event.target as HTMLInputElement).value)"
      @blur="touched.minutes = true"
      :disabled="busy"
    />
    <p v-if="touched.minutes && !minutesOk" class="mt-1 text-xs text-red-300">
      Bitte eine Zahl ≥ 1 eingeben.
    </p>
    <p v-else-if="fieldMsg('minutes')" class="mt-1 text-xs text-red-300">
      {{ fieldMsg('minutes') }}
    </p>

    <!-- NOTES -->
    <label class="label">Notiz</label>
    <input class="input" v-model="notes" @blur="touched.notes = true" :disabled="busy" />
    <p v-if="fieldMsg('notes')" class="mt-1 text-xs text-red-300">
      {{ fieldMsg('notes') }}
    </p>

    <div class="mt-auto pt-5 flex flex-wrap gap-2">
      <button class="btn primary" @click="onSubmit" :disabled="!canSubmit">
        {{ submitLabel }}
      </button>
      <button v-if="editing" class="btn ghost" @click="onCancel" :disabled="busy">
        Abbrechen
      </button>
    </div>
  </section>
</template>

<style scoped>
/* ✅ Fix: Dropdown soll nicht “nach unten wachsen”, sondern max 4 Zeilen + Scroll */
.dropdown {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  z-index: 50;

  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;

  /* ~4 Treffer sichtbar (je nach ddRow Höhe) */
  max-height: 220px;
  overflow-y: auto;
}

.ddRow {
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background: transparent;
  border: 0;
  cursor: pointer;
}
.ddRow:hover {
  background: rgba(255, 27, 27, 0.12);
}
.ddTitle {
  display: block;
  font-weight: 700;
}
.ddMeta {
  display: block;
  font-size: 12px;
  opacity: 0.65;
}

.ddHint {
  position: absolute;
  right: 10px;
  top: 10px;
  font-size: 12px;
  opacity: 0.7;
}

/* optional: nicer scrollbars */
.dropdown::-webkit-scrollbar {
  width: 10px;
}
.dropdown::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 999px;
}
.dropdown::-webkit-scrollbar-track {
  background: transparent;
}
</style>
