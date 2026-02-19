<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { getOthersWatching, type OthersWatchingDto } from '@/api/discoverApi'

const props = defineProps<{ refreshKey: number }>()

const item = ref<OthersWatchingDto | null>(null)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    item.value = await getOthersWatching()
  } catch {
    item.value = null
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.refreshKey, load)

const subtitle = computed(() => {
  if (!item.value) return ''
  const k = item.value.kind === 'movie' ? 'Film' : 'Serie'
  const year = item.value.year ? ` · ${item.value.year}` : ''
  return `${k}${year}`
})

const progress = computed(() => {
  const it = item.value
  if (!it) return null

  if (it.kind === 'movie') {
    if (it.minutes != null) return `${it.minutes} min`
    if (it.runtime) return it.runtime
    return null
  }

  const sx = it.season != null ? `S${it.season}` : null
  const ex = it.episode != null ? `E${it.episode}` : null
  const se = sx && ex ? `${sx}${ex}` : sx || ex
  const mins = it.minutes != null ? `${it.minutes} min` : null
  return [se, mins].filter(Boolean).join(' — ') || null
})

const rating = computed(() => {
  const r = item.value?.imdbRating
  if (!r) return null
  return `IMDb ${r}`
})

const metaLine = computed(() => {
  const it = item.value
  if (!it) return null
  const parts = [progress.value, rating.value, it.genre].filter(Boolean)
  return parts.length ? parts.join(' · ') : null
})

const hasBg = computed(() => Boolean(item.value?.imageUrl))
const bgStyle = computed(() => ({
  backgroundImage: item.value?.imageUrl ? `url(${item.value.imageUrl})` : undefined,
}))
</script>

<template>
  <div>
    <div
      v-if="loading && !item"
      class="h-[clamp(180px,22vw,280px)] rounded-2xl border border-white/10 bg-white/5 animate-pulse"
    />

    <div
      v-else-if="!item"
      class="h-[clamp(180px,22vw,280px)] rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center"
    >
      <div class="text-center px-6">
        <div class="text-sm text-white/70 font-semibold">Was sich andere User anschauen:</div>
        <div class="mt-2 text-xs text-white/50">
          Keine Einträge von anderen Accounts gefunden.
        </div>
      </div>
    </div>

    <div v-else class="relative overflow-hidden rounded-2xl border border-white/10">
      <div
        class="absolute inset-0 bg-cover bg-center"
        :class="hasBg ? '' : 'bg-gradient-to-r from-black/50 via-white/5 to-black/20'"
        :style="bgStyle"
      />
      <div class="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />

      <div class="relative flex h-[clamp(180px,22vw,280px)] flex-col justify-center gap-2 p-5">
        <div class="text-xs text-white/70">
          Was sich andere User anschauen <span class="opacity-60">•</span>
          {{ item.kind === 'movie' ? 'Film' : 'Serie' }}
        </div>

        <div class="text-xl font-black tracking-tight text-shadow sm:text-2xl">
          {{ item.title }}
        </div>

        <div v-if="subtitle" class="text-xs text-white/60">
          {{ subtitle }}
        </div>

        <div v-if="metaLine" class="mt-1 text-xs text-white/70">
          {{ metaLine }}
        </div>

        <p
          v-if="item.plot"
          class="mt-2 max-w-[70ch] text-sm text-white/70"
          style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;"
        >
          {{ item.plot }}
        </p>
        <p v-else class="mt-2 text-sm text-white/50">
          Keine Beschreibung verfügbar.
        </p>
      </div>
    </div>
  </div>
</template>
