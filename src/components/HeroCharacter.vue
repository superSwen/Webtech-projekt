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
 * Fade into background (no frame):
 * - radial fade removes hard edges
 * - extra bottom fade gives "dissolve" feeling
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
    <!-- Mask wrapper so BOTH image + shine fade into background -->
    <div class="relative h-full w-full" :style="fadeMask">
      <!-- Hero image -->
      <img
        :src="hero!.imageUrl"
        :alt="hero!.title"
        :title="hero!.title"
        class="heroFloat h-full w-full object-contain drop-shadow-2xl"
      />

      <!-- Moving shine sweep -->
      <div class="pointer-events-none absolute inset-0">
        <div
          class="heroShine absolute -inset-y-10 -left-1/2 w-2/3
                 bg-gradient-to-r from-transparent via-white/20 to-transparent
                 blur-2xl opacity-60 mix-blend-screen"
        />
      </div>
    </div>

    <!-- subtle glow behind the character (no frame) -->
    <div
      class="pointer-events-none absolute inset-0 -z-10 blur-2xl opacity-40"
      :style="{
        background:
          'radial-gradient(closest-side, rgba(229,9,20,0.25), transparent 70%)',
      }"
    />
  </div>
</template>

<style scoped>
@keyframes shine-sweep {
  0% {
    transform: translateX(-170%) rotate(14deg);
    opacity: 0;
  }
  12% {
    opacity: 0.75;
  }
  55% {
    opacity: 0.35;
  }
  100% {
    transform: translateX(170%) rotate(14deg);
    opacity: 0;
  }
}

.heroShine {
  animation: shine-sweep 3.2s ease-in-out infinite;
}

/* Optional subtle "moving pic" effect */
@keyframes floaty {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-3px); }
  100% { transform: translateY(0px); }
}

.heroFloat {
  animation: floaty 6s ease-in-out infinite;
}

/* Respect OS reduce motion */
@media (prefers-reduced-motion: reduce) {
  .heroShine,
  .heroFloat {
    animation: none !important;
  }
}
</style>
