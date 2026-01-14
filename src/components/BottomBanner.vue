<script setup lang="ts">
import { ref, watch } from 'vue'
import { getBanner, type TmdbBannerDto } from '@/api/tmdbApi'

const props = withDefaults(
  defineProps<{
    refreshKey?: number
  }>(),
  { refreshKey: 0 }
)

const loading = ref(false)
const banner = ref<TmdbBannerDto | null>(null)

async function load() {
  loading.value = true
  try {
    banner.value = await getBanner()
  } catch {
    // Banner ist optional → kein Hard-Fail
    banner.value = null
  } finally {
    loading.value = false
  }
}

watch(
  () => props.refreshKey,
  () => load(),
  { immediate: true }
)
</script>

<template>
  <div class="wrap" v-if="banner">
    <div
      class="banner"
      :style="banner.imageUrl ? { backgroundImage: `url(${banner.imageUrl})` } : undefined"
    >
      <div class="overlay">
        <div class="left">
          <div class="kicker">
            Zufällig aus deinen Einträgen
            <span class="dot">•</span>
            {{ banner.type === 'movie' ? 'Film' : 'Serie' }}
          </div>
          <div class="title">{{ banner.title }}</div>
        </div>

        <div class="hint" v-if="loading">lädt…</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrap {
  margin-top: 18px;
}

.banner {
  height: 180px;
  border-radius: 18px;
  background-size: cover;
  background-position: center 25%;
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* Overlay nicht zu stark, damit das Bild nicht „komisch“ wirkt */
.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.62), rgba(0, 0, 0, 0.10));
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 14px;
  padding: 14px 16px;
}

.left {
  min-width: 0;
}

.kicker {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dot {
  opacity: 0.7;
}

.title {
  color: #fff;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: 0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80vw;
}

.hint {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
  padding-bottom: 4px;
}

@media (max-width: 980px) {
  .banner {
    height: 160px;
  }
  .title {
    max-width: 70vw;
  }
}
</style>
