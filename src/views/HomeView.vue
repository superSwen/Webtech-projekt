<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import FilmForm from '@/components/FilmForm.vue'
import FilmList from '@/components/FilmList.vue'
import SerieForm from '@/components/SerieForm.vue'
import SerieList from '@/components/SerieList.vue'

import HeroCharacter from '@/components/HeroCharacter.vue'
import BottomBanner from '@/components/BottomBanner.vue'

import type { FilmDto, SerieDto, FilmCreateUpdate, SerieCreateUpdate } from '@/types/media'
import {
  getFilms, createFilm, updateFilm, deleteFilm,
  getSeries, createSerie, updateSerie, deleteSerie
} from '@/api/mediaApi'

const router = useRouter()

const loading = ref(true)
const busy = ref(false)
const error = ref<string | null>(null)

const films = ref<FilmDto[]>([])
const series = ref<SerieDto[]>([])

const editingFilm = ref<FilmDto | null>(null)
const editingSerie = ref<SerieDto | null>(null)

const filmFormError = ref<string | null>(null)
const serieFormError = ref<string | null>(null)

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const [f, s] = await Promise.all([getFilms(), getSeries()])
    films.value = f
    series.value = s
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

// ---- CRUD FILM
async function onSubmitFilm(payload: FilmCreateUpdate) {
  filmFormError.value = null
  busy.value = true
  try {
    if (editingFilm.value) {
      const updated = await updateFilm(editingFilm.value.id, payload)
      films.value = films.value.map((x) => (x.id === updated.id ? updated : x))
      editingFilm.value = null
    } else {
      const created = await createFilm(payload)
      films.value = [...films.value, created]
    }
  } catch (e: any) {
    filmFormError.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    busy.value = false
  }
}

async function onDeleteFilm(item: FilmDto) {
  if (!confirm(`Film wirklich löschen?\n\n"${item.title}"`)) return
  busy.value = true
  try {
    await deleteFilm(item.id)
    films.value = films.value.filter((x) => x.id !== item.id)
    if (editingFilm.value?.id === item.id) editingFilm.value = null
  } finally {
    busy.value = false
  }
}

// ---- CRUD SERIE
async function onSubmitSerie(payload: SerieCreateUpdate) {
  serieFormError.value = null
  busy.value = true
  try {
    if (editingSerie.value) {
      const updated = await updateSerie(editingSerie.value.id, payload)
      series.value = series.value.map((x) => (x.id === updated.id ? updated : x))
      editingSerie.value = null
    } else {
      const created = await createSerie(payload)
      series.value = [...series.value, created]
    }
  } catch (e: any) {
    serieFormError.value = e?.response?.data?.message ?? e?.message ?? String(e)
  } finally {
    busy.value = false
  }
}

async function onDeleteSerie(item: SerieDto) {
  if (!confirm(`Serie wirklich löschen?\n\n"${item.title}"`)) return
  busy.value = true
  try {
    await deleteSerie(item.id)
    series.value = series.value.filter((x) => x.id !== item.id)
    if (editingSerie.value?.id === item.id) editingSerie.value = null
  } finally {
    busy.value = false
  }
}

// ✅ Navigation
function openFilm(item: FilmDto) {
  router.push({ name: 'details', params: { kind: 'movie', id: String(item.id) } })
}
function openSerie(item: SerieDto) {
  router.push({ name: 'details', params: { kind: 'series', id: String(item.id) } })
}
</script>

<template>
  <main class="page">
    <header class="top">
      <div class="left">
        <h1>Movie / Series Tracker</h1>
      </div>

      <div class="right">
        <HeroCharacter />
        <button class="btn" @click="loadAll" :disabled="loading || busy">Refresh</button>
      </div>
    </header>

    <p v-if="loading" class="info">Lade Daten…</p>
    <p v-else-if="error" class="err">Backend/API Fehler: {{ error }}</p>

    <section class="grid" v-if="!loading">
      <div class="col">
        <FilmForm
          :editing="editingFilm"
          :busy="busy"
          :error="filmFormError"
          @submit="onSubmitFilm"
          @cancel="editingFilm = null"
        />
        <FilmList
          :items="films"
          :busy="busy"
          @edit="editingFilm = $event"
          @remove="onDeleteFilm"
          @open="openFilm"
        />
      </div>

      <div class="col">
        <SerieForm
          :editing="editingSerie"
          :busy="busy"
          :error="serieFormError"
          @submit="onSubmitSerie"
          @cancel="editingSerie = null"
        />
        <SerieList
          :items="series"
          :busy="busy"
          @edit="editingSerie = $event"
          @remove="onDeleteSerie"
          @open="openSerie"
        />
      </div>
    </section>

    <BottomBanner />
  </main>
</template>

<style scoped>
.page { background:#000; min-height:100vh; padding:24px; }
.top { display:flex; justify-content:space-between; align-items:center; gap:12px; margin-bottom:16px; }
h1 { color:#fff; margin:0; font-size:28px; letter-spacing:0.2px; }
.right { display:flex; align-items:center; gap:12px; }
.grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; align-items:start; }
.col { display:flex; flex-direction:column; gap:16px; }
.btn { background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:10px; cursor:pointer; }
.info { color:#aaa; }
.err { color:#ff6b6b; }
@media (max-width: 980px) { .grid { grid-template-columns:1fr; } }
</style>
