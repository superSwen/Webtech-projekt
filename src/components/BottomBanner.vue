<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getBanner, type TmdbBannerDto } from '@/api/tmdbApi'

const props = defineProps<{ refreshKey: number }>()

const banner = ref<TmdbBannerDto | null>(null)
const loading = ref(false)

async function loadBanner() {
  loading.value = true
  try {
    banner.value = await getBanner()
  } catch {
    banner.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadBanner)
watch(() => props.refreshKey, loadBanner)
</script>

<template>
  <!-- optional: wenn du beim Laden etwas zeigen willst -->
  <div class="wrap" v-if="loading && !banner">
    <div class="skeleton"></div>
  </div>

  <div class="wrap" v-else-if="banner">
    <div class="banner" :style="{ backgroundImage: `url(${banner.imageUrl})` }">
      <div class="overlay">
        <div class="kicker">
          Zufällig aus deinen Einträgen
          <span class="dot">•</span>
          {{ banner.kind === 'movie' ? 'Film' : 'Serie' }}
        </div>
        <div class="title">{{ banner.title }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap { margin-top: 18px; }

/* ✅ größer nach unten (responsive) */
.banner {
  height: clamp(180px, 22vw, 280px);
  border-radius: 18px;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0,0,0,0.72), rgba(0,0,0,0.15));
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  padding: 18px 18px;
}

.kicker {
  color: rgba(255,255,255,0.75);
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot { opacity: 0.7; }

.title {
  color: #fff;
  font-weight: 900;
  font-size: 20px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 75vw;
}

/* optional skeleton */
.skeleton {
  height: clamp(180px, 22vw, 280px);
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.08);
  background: rgba(255,255,255,0.06);
}
</style>
