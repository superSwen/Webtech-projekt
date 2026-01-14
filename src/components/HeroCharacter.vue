<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import batmanUrl from '@/assets/batman.png'
import gravityfallsUrl from '@/assets/gravityfalls.png'
import jokerUrl from '@/assets/joker.png'
import luffyUrl from '@/assets/luffy.png'
import thanosUrl from '@/assets/thanos.png'
import godfatherUrl from '@/assets/the-godfather.png'
import vaderUrl from '@/assets/vader.png'

const props = withDefaults(defineProps<{ enabled?: boolean }>(), {
  enabled: true,
})

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
  if (!props.enabled) {
    hero.value = null
    return
  }
  const next = candidates[Math.floor(Math.random() * candidates.length)] ?? null
  hero.value = next
}

onMounted(pickRandom)

watch(
  () => props.enabled,
  () => pickRandom()
)

const hasHero = computed(() => !!hero.value && !!props.enabled)
</script>

<template>
  <div v-if="hasHero" class="wrap" :title="hero?.title">
    <img class="heroImg" :src="hero!.imageUrl" :alt="hero!.title" />
  </div>
</template>

<style scoped>
.wrap {
  width: 220px;
  height: 160px;
  display: grid;
  place-items: center;
  background: transparent;
}
.heroImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.65));
}
@media (min-width: 1100px) {
  .wrap {
    width: 260px;
    height: 190px;
  }
}
</style>
