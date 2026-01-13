<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { getBanner, type TmdbBannerDto } from '@/api/tmdbApi'

const props = defineProps<{ refreshKey: number }>()

const banner = ref<TmdbBannerDto | null>(null)

async function load() {
  try {
    banner.value = await getBanner()
  } catch {
    banner.value = null
  }
}

onMounted(load)
watch(() => props.refreshKey, load)
</script>

<template>
  <section v-if="banner?.imageUrl" class="wrap">
    <div class="imgWrap">
      <img class="img" :src="banner.imageUrl" :alt="banner.sourceTitle" />
      <div class="fade"></div>
    </div>

    <div class="caption">
      <span class="title">{{ banner.sourceTitle }}</span>
      <span class="tag">• powered by TMDB</span>
    </div>
  </section>
</template>

<style scoped>
.wrap {
  margin-top: 28px; /* mehr Abstand nach oben */
}

.imgWrap {
  position: relative;
  border-radius: 18px;
  overflow: hidden; /* clean, aber kein “rahmen” */
}

.img {
  width: 100%;
  max-height: 360px;
  object-fit: cover;
  display: block;
  filter: saturate(1.05) contrast(1.05);
}

.fade {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.70), rgba(0,0,0,0.05) 55%, rgba(0,0,0,0));
  pointer-events: none;
}

.caption {
  margin-top: 10px;
  color: #bdbdbd;
  font-size: 12px;
}

.title {
  color: #fff;
  font-weight: 700;
}

.tag {
  margin-left: 8px;
  color: #9a9a9a;
}
</style>
