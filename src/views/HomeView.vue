<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

import FilmForm from '@/components/FilmForm.vue'
import FilmList from '@/components/FilmList.vue'
import SerieForm from '@/components/SerieForm.vue'
import SerieList from '@/components/SerieList.vue'
import RandomFromListCard from '@/components/RandomFromListCard.vue'

import ConfirmDialog from '@/components/ConfirmDialog.vue'



import type { FieldErrors } from '@/utils/fieldErrors'
import { extractFieldErrors } from '@/utils/fieldErrors'

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

const filmFieldErrors = ref<FieldErrors>({})
const serieFieldErrors = ref<FieldErrors>({})

const refreshKey = ref(0)

//delete FUnktion

type PendingDelete =
  | { kind: 'film'; item: FilmDto }
  | { kind: 'serie'; item: SerieDto }

const pendingDelete = ref<PendingDelete | null>(null)

function askDeleteFilm(item: FilmDto) {
  pendingDelete.value = { kind: 'film', item }
}
function askDeleteSerie(item: SerieDto) {
  pendingDelete.value = { kind: 'serie', item }
}
function cancelDelete() {
  pendingDelete.value = null
}

async function confirmDelete() {
  const p = pendingDelete.value
  if (!p) return

  pendingDelete.value = null
  busy.value = true

  try {
    if (p.kind === 'film') {
      await deleteFilm(p.item.id)
      films.value = films.value.filter((x) => x.id !== p.item.id)
      if (editingFilm.value?.id === p.item.id) editingFilm.value = null
      filmFieldErrors.value = {}
      filmFormError.value = null
    } else {
      await deleteSerie(p.item.id)
      series.value = series.value.filter((x) => x.id !== p.item.id)
      if (editingSerie.value?.id === p.item.id) editingSerie.value = null
      serieFieldErrors.value = {}
      serieFormError.value = null
    }

    refreshKey.value++
  } catch (e: any) {
    // falls löschen fehlschlägt, wenigstens sichtbar machen
    const msg = e?.response?.data?.message ?? e?.message ?? String(e)
    if (p.kind === 'film') filmFormError.value = msg
    else serieFormError.value = msg
  } finally {
    busy.value = false
  }
}


async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const [f, s] = await Promise.all([getFilms(), getSeries()])
    films.value = f
    series.value = s
    refreshKey.value++
  } catch (e: any) {
    error.value = e?.message ?? String(e)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)

/** ✅ Clear errors when entering edit mode */
function startEditFilm(item: FilmDto) {
  editingFilm.value = item
  filmFieldErrors.value = {}
  filmFormError.value = null
}

function startEditSerie(item: SerieDto) {
  editingSerie.value = item
  serieFieldErrors.value = {}
  serieFormError.value = null
}

async function onSubmitFilm(payload: FilmCreateUpdate) {
  filmFormError.value = null
  filmFieldErrors.value = {}
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

    /** ✅ Clear errors after successful submit */
    filmFieldErrors.value = {}
    filmFormError.value = null

    refreshKey.value++
  } catch (e: any) {
    const fe = extractFieldErrors(e)
    if (fe) {
      filmFieldErrors.value = fe
    } else {
      filmFormError.value = e?.response?.data?.message ?? e?.message ?? String(e)
    }
  } finally {
    busy.value = false
  }
}


async function onSubmitSerie(payload: SerieCreateUpdate) {
  serieFormError.value = null
  serieFieldErrors.value = {}
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

    /** ✅ Clear errors after successful submit */
    serieFieldErrors.value = {}
    serieFormError.value = null

    refreshKey.value++
  } catch (e: any) {
    const fe = extractFieldErrors(e)
    if (fe) {
      serieFieldErrors.value = fe
    } else {
      serieFormError.value = e?.response?.data?.message ?? e?.message ?? String(e)
    }
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

    // optional: also clear serie errors when deleting something
    serieFieldErrors.value = {}
    serieFormError.value = null

    refreshKey.value++
  } finally {
    busy.value = false
  }
}

function openFilm(item: FilmDto) {
  router.push({ name: 'details', params: { kind: 'movie', id: String(item.id) } })
}
function openSerie(item: SerieDto) {
  router.push({ name: 'details', params: { kind: 'series', id: String(item.id) } })
}
</script>

<template>
  <div class="space-y-6">
    <!-- header card -->
    <section class="card">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 class="text-3xl font-extrabold tracking-tight">Movie / Series Tracker</h1>
          <p class="mt-1 text-sm text-white/60">
            Speichere Filme & Serien, zieh dir Details von OMDb und Trailer von TMDB.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <HeroCharacter class="hidden sm:block" />
          <button class="btn" @click="loadAll" :disabled="loading || busy">
            Refresh
          </button>
        </div>
      </div>

      <div class="mt-4" v-if="loading">
        <div class="alert info">Lade Daten…</div>
      </div>
      <div class="mt-4" v-else-if="error">
        <div class="alert error">Backend/API Fehler: {{ error }}</div>
      </div>
    </section>

        <!-- forms + lists -->
        <section class="grid gap-6 lg:grid-cols-2" v-if="!loading">
          <div class="space-y-6">
            <FilmForm
              :editing="editingFilm"
              :busy="busy"
              :error="filmFormError"
              :fieldErrors="filmFieldErrors"
              @submit="onSubmitFilm"
              @cancel="editingFilm = null"
            />
            <FilmList
              :items="films"
              :busy="busy"
              @edit="startEditFilm"
              @remove="askDeleteFilm"
              @open="openFilm"
            />
          </div>

          <div class="space-y-6">
            <SerieForm
              :editing="editingSerie"
              :busy="busy"
              :error="serieFormError"
              :fieldErrors="serieFieldErrors"
              @submit="onSubmitSerie"
              @cancel="editingSerie = null"
            />
            <SerieList
              :items="series"
              :busy="busy"
              @edit="startEditSerie"
              @remove="askDeleteSerie"
              @open="openSerie"
            />
          </div>
        </section>

        <!-- Delete CArd -->
        <ConfirmDialog
          :open="pendingDelete !== null"
          :title="pendingDelete?.kind === 'film' ? 'Film löschen?' : 'Serie löschen?'"
          :message="pendingDelete ? `Willst du „${pendingDelete.item.title}“ wirklich löschen?` : ''"
          confirm-text="Löschen"
          cancel-text="Abbrechen"
          :danger="true"
          @close="cancelDelete"
          @confirm="confirmDelete"
        />

        <!-- Random Card -->
        <RandomFromListCard
          v-if="!loading"
          :films="films"
          :series="series"
          :busy="busy"
          @openFilm="openFilm"
          @openSerie="openSerie"
        />

        <BottomBanner :refreshKey="refreshKey" />

  </div>
</template>
