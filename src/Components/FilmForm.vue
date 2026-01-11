<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { FilmDto, FilmCreateUpdate } from '@/types/media'

const props = defineProps<{
  editing?: FilmDto | null
  busy?: boolean
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'submit', payload: FilmCreateUpdate): void
  (e: 'cancel'): void
}>()

const form = reactive<FilmCreateUpdate>({
  title: '',
  minutes: null,
  notes: null
})

watch(
  () => props.editing,
  (val) => {
    if (val) {
      form.title = val.title ?? ''
      form.minutes = val.minutes ?? null
      form.notes = val.notes ?? null
    } else {
      reset()
    }
  },
  { immediate: true }
)

const isEdit = computed(() => !!props.editing)

function reset() {
  form.title = ''
  form.minutes = null
  form.notes = null
}

function onSubmit() {
  const title = form.title.trim()
  if (!title) return
  emit('submit', {
    title,
    minutes: form.minutes ?? null,
    notes: form.notes?.trim() ? form.notes.trim() : null
  })
}
</script>

<template>
  <section class="card">
    <h2>{{ isEdit ? 'Film bearbeiten' : 'Neuen Film anlegen' }}</h2>

    <p v-if="error" class="err">{{ error }}</p>

    <form @submit.prevent="onSubmit" class="form">
      <label>
        Titel
        <input v-model="form.title" :disabled="busy" required />
      </label>

      <label>
        Minuten
        <input v-model.number="form.minutes" :disabled="busy" type="number" min="1" />
      </label>

      <label>
        Notiz
        <input v-model="form.notes" :disabled="busy" />
      </label>

      <div class="actions">
        <button class="btn primary" type="submit" :disabled="busy">
          {{ isEdit ? 'Änderungen speichern' : 'Film speichern' }}
        </button>

        <button v-if="isEdit" class="btn" type="button" :disabled="busy" @click="emit('cancel')">
          Abbrechen
        </button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.card { background:#111; border:1px solid #222; border-radius:16px; padding:16px; }
h2 { color:#fff; margin:0 0 12px; }
.form { display:flex; flex-direction:column; gap:10px; }
label { color:#ddd; font-size:14px; display:flex; flex-direction:column; gap:6px; }
input { background:#0b0b0b; border:1px solid #333; color:#fff; padding:10px; border-radius:10px; }
.actions { display:flex; gap:10px; margin-top:6px; }
.btn { background:#1a1a1a; border:1px solid #333; color:#fff; padding:10px 12px; border-radius:10px; cursor:pointer; }
.btn.primary { background:#b00020; border-color:#b00020; }
.err { color:#ff6b6b; margin:0 0 10px; }
</style>
