<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type { FilmCreateUpdate, FilmDto } from '@/types/media'
import { omdbSearch, type OmdbSearchItem } from '@/api/omdbApi'
import type { FieldErrors } from '@/utils/fieldErrors'

const props = defineProps<{
  editing: FilmDto | null
  busy: boolean
  error: string | null
  fieldErrors: FieldErrors
}>()

const emit = defineEmits<{
  (e: 'submit', payload: FilmCreateUpdate): void
  (e: 'cancel'): void
}>()

const title = ref('')
const minutes = ref<number | null>(null)
const notes = ref('')
const imdbId = ref<string | null>(null)

// for “show error only after user touched field”
const touched = reactive({
  title: false,
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
    minutes.value = v?.minutes ?? null
    notes.value = v?.notes ?? ''
    imdbId.value = v?.imdbId ?? null
    results.value = []
    show.value = false

    // reset client-side touched state when switching item
    touched.title = false
    touched.minutes = false
    touched.notes = false
  },
  { immediate: true }
)

const header = computed(() => (props.editing ? 'Film bearbeiten' : 'Neuen Film anlegen'))
const submitLabel = computed(() => (props.editing ? 'Änderungen speichern' : 'Film speichern'))

// simple client-side rules (mirror your backend)
const titleOk = computed(() => title.value.trim().length > 0)
const minutesOk = computed(() => Number.isInteger(minutes.value) && (minutes.value ?? 0) >= 1)

function fieldMsg(name: keyof FieldErrors) {
  return props.fieldErrors?.[name] ?? null
}

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

// strict numeric parse: digits only, >= 1
function setPositiveIntFromInput(raw: string): number | null {
  const cleaned = raw.replace(/[^\d]/g, '')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n < 1) return null
  return n
}

const canSubmit = computed(() => !props.busy && titleOk.value && minutesOk.value)

function onSubmit() {
  // mark as touched so inline errors show
  touched.title = true
  touched.minutes = true

  if (!canSubmit.value) return

  emit('submit', {
    title: title.value.trim(),
    minutes: minutes.value!, // safe due to minutesOk
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
  <section class="card">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h2 class="cardTitle">{{ header }}</h2>
        <p class="mt-1 text-xs text-white/50">Tipp: 2+ Zeichen tippen → OMDb Vorschläge</p>
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

    <p v-if="touched.title && !titleOk" class="mt-1 text-xs text-red-300">
      Titel ist Pflicht.
    </p>
    <p v-else-if="fieldMsg('title')" class="mt-1 text-xs text-red-300">
      {{ fieldMsg('title') }}
    </p>

    <p v-if="imdbId" class="mt-2 text-xs text-white/50">
      IMDB-ID: <span class="font-mono text-white/70">{{ imdbId }}</span>
    </p>

    <!-- MINUTES -->
    <label class="label">Minuten</label>
    <input
      class="input"
      :class="{
        'border-red-500/40 ring-2 ring-red-500/20':
          (touched.minutes && !minutesOk) || !!fieldMsg('minutes'),
      }"
      inputmode="numeric"
      placeholder="z.B. 90"
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

    <div class="mt-5 flex flex-wrap gap-2">
      <button class="btn primary" @click="onSubmit" :disabled="!canSubmit">
        {{ submitLabel }}
      </button>
      <button v-if="editing" class="btn ghost" @click="onCancel" :disabled="busy">
        Abbrechen
      </button>
    </div>
  </section>
</template>
