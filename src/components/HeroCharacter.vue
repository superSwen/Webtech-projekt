<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import batmanUrl from '@/assets/batman.png'
import gravityfallsUrl from '@/assets/gravityfalls.png'
import jokerUrl from '@/assets/joker.png'
import luffyUrl from '@/assets/luffy.png'
import thanosUrl from '@/assets/thanos.png'
import godfatherUrl from '@/assets/the-godfather.png'
import vaderUrl from '@/assets/vader.png'

const props = withDefaults(defineProps<{ enabled?: boolean }>(), { enabled: true })

type HeroItem = { title: string; imageUrl: string }

const candidates: HeroItem[] = [
  { title: 'Batman', imageUrl: batmanUrl },
  { title: 'Gravity Falls', imageUrl: gravityfallsUrl },
  { title: 'Joker', imageUrl: jokerUrl },
  { title: 'Luffy', imageUrl: luffyUrl },
  { title: 'Thanos', imageUrl: thanosUrl },
  { title: 'The Godfather', imageUrl: godfatherUrl },
  { title: 'Vader', imageUrl: vaderUrl },
]

const hero = ref<HeroItem | null>(null)

function pickRandom() {
  if (!props.enabled) return (hero.value = null)
  hero.value = candidates[Math.floor(Math.random() * candidates.length)] ?? null
}

onMounted(pickRandom)
watch(() => props.enabled, pickRandom)

const hasHero = computed(() => !!hero.value && !!props.enabled)

/**
 * Fade into background:
 * - Radial fade removes hard edges on all sides
 * - Extra bottom fade gives that "poster dissolving" feel
 * Safari needs WebkitMaskImage.
 */
const fadeMask = {
  WebkitMaskImage:
    'radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
  WebkitMaskComposite: 'source-in',
  maskImage:
    'radial-gradient(closest-side, rgba(0,0,0,1) 70%, rgba(0,0,0,0) 100%), linear-gradient(to bottom, rgba(0,0,0,1) 75%, rgba(0,0,0,0) 100%)',
  maskComposite: 'intersect',
} as const
</script>

<template>
  <div v-if="hasHero" class="relative h-44 w-72">
    <img
      :src="hero!.imageUrl"
      :alt="hero!.title"
      :title="hero!.title"
      class="h-full w-full object-contain drop-shadow-2xl"
      :style="fadeMask"
    />

    <!-- Optional: subtle glow behind the character to make it pop (no frame) -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-40"
      :style="{
        background:
          'radial-gradient(closest-side, rgba(229,9,20,0.25), transparent 70%)',
      }"
    />
  </div>
</template>
