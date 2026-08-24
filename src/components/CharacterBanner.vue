<script setup lang="ts">
import type { OmdbMovie } from '@/types/omdb'

const props = defineProps<{
  item: OmdbMovie | null
  variant?: 'top' | 'bottom'
}>()

const variant = props.variant ?? 'top'

function hasPoster() {
  const p = props.item?.Poster
  return !!p && p !== 'N/A'
}
</script>

<template>
  <div class="wrap" :class="variant">
    <div v-if="item && hasPoster()" class="art" :title="item?.Title ?? ''">
      <img :src="item!.Poster!" :alt="item?.Title ?? 'Artwork'" />
      <div class="fade"></div>
    </div>

    <div v-else class="placeholder" :class="variant">
      <span>Kein Artwork</span>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.art {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  border: 1px solid #1f1f1f;
  background: #0b0b0b;
  box-shadow: 0 10px 40px rgba(0,0,0,0.55);
}

.art img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;

  /* Fake-Cutout: Schatten + leichte Kontrastwirkung */
  filter: drop-shadow(0 14px 28px rgba(0,0,0,0.75));
}

.fade {
  pointer-events: none;
  position: absolute;
  inset: 0;
  background:
    radial-gradient(closest-side, rgba(0,0,0,0) 55%, rgba(0,0,0,0.95) 100%),
    linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.85));
}

/* Größen */
.top .art {
  width: 220px;
  height: 120px;
}

.bottom .art {
  width: min(920px, 100%);
  height: 180px;
}

/* Placeholder */
.placeholder {
  display: grid;
  place-items: center;
  color: #777;
  border: 1px dashed #2b2b2b;
  background: #0b0b0b;
  border-radius: 16px;
}

.placeholder.top { width: 220px; height: 120px; }
.placeholder.bottom { width: min(920px, 100%); height: 180px; }
</style>
