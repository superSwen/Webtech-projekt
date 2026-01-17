<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue'

const props = defineProps<{
  open: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  danger?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const cancelBtn = ref<HTMLButtonElement | null>(null)
const confirmLabel = computed(() => props.confirmText ?? 'OK')
const cancelLabel = computed(() => props.cancelText ?? 'Abbrechen')

function onKeydown(e: KeyboardEvent) {
  if (!props.open) return
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

function onAfterEnter() {
  cancelBtn.value?.focus()
}
</script>

<template>
  <teleport to="body">
    <transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
      @after-enter="onAfterEnter"
    >
      <div v-if="open" class="fixed inset-0 z-[100]">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="emit('close')" />

        <div class="relative grid min-h-full place-items-center p-4">
          <div class="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/80 shadow-2xl">
            <div class="p-6">
              <h3 class="text-lg font-extrabold text-white">
                {{ title ?? 'Bestätigen' }}
              </h3>

              <p v-if="message" class="mt-3 text-sm text-white/70">
                {{ message }}
              </p>

              <div class="mt-6 flex justify-end gap-2">
                <button ref="cancelBtn" class="btn ghost" type="button" @click="emit('close')">
                  {{ cancelLabel }}
                </button>

                <button
                  class="btn"
                  :class="danger ? 'bg-red-600/80 hover:bg-red-600 text-white' : ''"
                  type="button"
                  @click="emit('confirm')"
                >
                  {{ confirmLabel }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>
