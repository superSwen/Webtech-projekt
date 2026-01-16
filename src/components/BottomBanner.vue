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
  <div class="mt-8">
    <div
      v-if="loading && !banner"
      class="h-[clamp(180px,22vw,280px)] rounded-2xl border border-white/10 bg-white/5 animate-pulse"
    />

    <div v-else-if="banner" class="relative overflow-hidden rounded-2xl border border-white/10">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :style="{ backgroundImage: `url(${banner.imageUrl})` }"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />

      <div class="relative flex h-[clamp(180px,22vw,280px)] flex-col justify-center gap-2 p-5">
        <div class="text-xs text-white/70">
          Zufällig aus deinen Einträgen <span class="opacity-60">•</span>
          {{ banner.kind === 'movie' ? 'Film' : 'Serie' }}
        </div>

        <div class="text-xl font-black tracking-tight text-shadow sm:text-2xl">
          {{ banner.title }}
        </div>
      </div>
    </div>
  </div>
</template>
