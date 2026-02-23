<script setup lang="ts">
import { api } from '@/api/http'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

type Item = {
  key: string
  kind: 'movie' | 'series'
  id: number
  title: string
  posterUrl?: string | null
}

const props = defineProps<{ items: Item[] }>()

const router = useRouter()
const containerRef = ref<HTMLElement | null>(null)

const posterOverrides = ref<Record<string, string | null>>({})
const refreshAttempted = new Set<string>()

function posterFor(it: Item) {
  return it.posterUrl ?? posterOverrides.value[it.key] ?? null
}

async function refreshPoster(it: Item) {
  if (refreshAttempted.has(it.key)) return
  refreshAttempted.add(it.key)

  try {
    const url = it.kind === 'movie' ? `/api/films/${it.id}/poster` : `/api/series/${it.id}/poster`
    const { data } = await api.post<any>(url)
    const poster = (data?.posterUrl ?? null) as string | null
    posterOverrides.value = { ...posterOverrides.value, [it.key]: poster }
  } catch {
    posterOverrides.value = { ...posterOverrides.value, [it.key]: null }
  }
}

function openDetails(it: Item) {
  router.push({
    name: 'details',
    params: { kind: it.kind, id: String(it.id) },
    query: { from: 'collection' } // <-- makes back go to Collection
  })
}

// ---- layout sizing (auto adjusts with count + viewport) ----
const w = ref(0)
const h = ref(0)
let ro: ResizeObserver | null = null

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

const cols = computed(() => {
  const n = Math.max(1, props.items.length)
  const width = w.value || 1200
  const height = h.value || 800

  const area = width * height
  const targetAreaPerItem = area / n

  const ratio = 1.35
  const base = Math.sqrt(targetAreaPerItem / ratio)

  const cell = clamp(base, 92, 170)
  const c = Math.floor(width / cell)
  return clamp(c, 3, 14)
})

const rowPx = computed(() => {
  const width = w.value || 1200
  const c = cols.value
  const colW = width / c
  return Math.round(colW * 0.58)
})

const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${cols.value}, minmax(0, 1fr))`,
  gridAutoRows: `${rowPx.value}px`
}))

function spanFor(i: number) {
  const c = cols.value
  if (c <= 4) return { cs: 1, rs: 1 }

  const mod = i % 14
  if (mod === 0) return { cs: Math.min(3, c), rs: 3 }
  if (mod === 1) return { cs: 2, rs: 2 }
  if (mod === 2) return { cs: 1, rs: 2 }
  if (mod === 4) return { cs: 2, rs: 1 }
  if (mod === 6) return { cs: 1, rs: 3 }
  if (mod === 8) return { cs: 2, rs: 2 }
  if (mod === 10) return { cs: 3 <= c ? 3 : 2, rs: 2 }
  if (mod === 12) return { cs: 2, rs: 1 }
  return { cs: 1, rs: 1 }
}

function tileStyle(i: number) {
  const { cs, rs } = spanFor(i)
  const csSafe = Math.max(1, Math.min(cs, cols.value))
  const rsSafe = Math.max(1, Math.min(rs, 4))
  return {
    gridColumn: `span ${csSafe}`,
    gridRow: `span ${rsSafe}`
  }
}

watch(
  () => props.items.map((x) => x.key).join('|'),
  () => {
    props.items
      .filter((x) => !posterFor(x))
      .slice(0, 60)
      .forEach(refreshPoster)
  },
  { immediate: true }
)

onMounted(() => {
  if (!containerRef.value) return
  ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect
    if (!r) return
    w.value = r.width
    h.value = r.height
  })
  ro.observe(containerRef.value)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
})
</script>

<template>
  <div ref="containerRef" class="relative h-full w-full overflow-hidden">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(1000px_circle_at_30%_0%,rgba(255,255,255,0.06),transparent_55%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_70%_120%,rgba(229,9,20,0.09),transparent_60%)]" />
      <div class="absolute inset-0 bg-black/25" />
    </div>

    <div class="relative h-full w-full overflow-auto px-4 py-4 md:px-6 md:py-6">
      <div class="grid gap-2 md:gap-3 [grid-auto-flow:dense]" :style="gridStyle">
        <button
          v-for="(it, i) in props.items"
          :key="it.key"
          type="button"
          class="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 text-left outline-none transition hover:border-white/25 focus-visible:ring-2 focus-visible:ring-white/30"
          :style="tileStyle(i)"
          :title="it.title"
          @click="openDetails(it)"
        >
          <img
            v-if="posterFor(it)"
            :src="posterFor(it) as string"
            :alt="it.title"
            class="h-full w-full object-cover"
            loading="lazy"
            draggable="false"
          />
          <div v-else class="grid h-full w-full place-items-center bg-zinc-950/50">
            <div class="h-10 w-10 rounded-xl border border-white/10 bg-white/5" />
          </div>

          <div class="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
            <div class="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <div class="absolute inset-0 ring-1 ring-white/35" />
          </div>
        </button>
      </div>
    </div>
  </div>
</template>
