<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import batmanUrl from '@/assets/batman.png'
import gravityfallsUrl from '@/assets/gravityfalls.png'
import jokerUrl from '@/assets/joker.png'
import luffyUrl from '@/assets/luffy.png'
import thanosUrl from '@/assets/thanos.png'
import godfatherUrl from '@/assets/the-godfather.png'
import vaderUrl from '@/assets/vader.png'

const props = withDefaults(
  defineProps<{ enabled?: boolean }>(),
  { enabled: true } // ✅ default: anzeigen
)

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
  hero.value = candidates[Math.floor(Math.random() * candidates.length)]
}

onMounted(pickRandom)

// Wenn enabled von false -> true wechselt (z.B. erster Eintrag erstellt), neu würfeln:
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
/* Größe hier steuern (einfach Werte ändern) */
.wrap {
  width: 220px;
  height: 160px;
  display: grid;
  place-items: center;
  background: transparent; /* kein Rahmen */
}

/* Bild größer + “pop” */
.heroImg {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;

  /* optional: macht’s “cinematic”, ohne einen Rahmen zu zeigen */
  filter: drop-shadow(0 14px 26px rgba(0, 0, 0, 0.65));
}

/* Auf großen Screens ruhig noch größer */
@media (min-width: 1100px) {
  .wrap {
    width: 260px;
    height: 190px;
  }
}
</style>
