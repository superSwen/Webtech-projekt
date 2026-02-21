+<script setup lang="ts">
import { api } from '@/api/http'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

type BubbleItem = {
  key: string
  kind: 'movie' | 'series'
  id: number
  title: string
  posterUrl?: string | null
}

type BubbleState = {
  key: string
  x: number
  y: number
  vx: number
  vy: number
  tx: number
  ty: number
}

const props = defineProps<{ items: BubbleItem[] }>()

const router = useRouter()
const fieldRef = ref<HTMLElement | null>(null)

const posterOverrides = ref<Record<string, string | null>>({})
const refreshAttempted = new Set<string>()

function posterFor(it: BubbleItem) {
  return it.posterUrl ?? posterOverrides.value[it.key] ?? null
}

async function refreshPoster(it: BubbleItem) {
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

// --- simulation (non-reactive for speed) ---
let width = 0
let height = 0
let radius = 56
let gap = 10

const states = new Map<string, BubbleState>()
const els = new Map<string, HTMLElement>()

let raf = 0
let lastT = 0
let ro: ResizeObserver | null = null

let hovering = false
let lastPointer = { x: 0, y: 0 }

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function computeRadius(n: number, w: number, h: number) {
  if (!n || w <= 0 || h <= 0) return 72

  const area = w * h
  const packing = 0.62

  // SIZE BOOST (bigger bubbles overall)
  const sizeBoost = 1.1
  const r = Math.sqrt((area * packing) / (n * Math.PI)) * sizeBoost

  // allow bigger maximums
  const maxR = Math.min(110, Math.min(w, h) / 5)
  const minR = 34

  return clamp(r, minR, maxR)
}

function sunflowerTargets(n: number, w: number, h: number, r: number) {
  const cx = w / 2
  const cy = h / 2
  const margin = 18
  const avail = Math.max(0, Math.min(w, h) / 2 - r - margin)
  const GA = Math.PI * (3 - Math.sqrt(5))
  const baseStep = (2 * r + gap) * 0.92

  const pts: { x: number; y: number }[] = []
  let maxDist = 0

  for (let i = 0; i < n; i++) {
    const rr = Math.sqrt(i + 0.45)
    const a = i * GA
    const x = Math.cos(a) * rr * baseStep
    const y = Math.sin(a) * rr * baseStep
    const d = Math.hypot(x, y)
    if (d > maxDist) maxDist = d
    pts.push({ x, y })
  }

  const scale = maxDist > 0 ? Math.min(1, avail / maxDist) : 1
  return pts.map((p) => ({ x: cx + p.x * scale, y: cy + p.y * scale }))
}

function ensureState(key: string) {
  let st = states.get(key)
  if (st) return st

  const cx = width / 2
  const cy = height / 2
  st = { key, x: cx, y: cy, vx: 0, vy: 0, tx: cx, ty: cy }
  states.set(key, st)
  return st
}

function layout() {
  if (!fieldRef.value) return
  const n = props.items.length
  if (!n) return

  radius = computeRadius(n, width, height)
  gap = clamp(radius * 0.18, 6, 14)

  const t = sunflowerTargets(n, width, height, radius)
  for (let i = 0; i < n; i++) {
    const it = props.items[i]
    const st = ensureState(it.key)
    st.tx = t[i].x
    st.ty = t[i].y
  }

  for (const it of props.items) {
    const el = els.get(it.key)
    if (!el) continue
    el.style.width = `${radius * 2}px`
    el.style.height = `${radius * 2}px`
  }
}

function step(dt: number) {
  const n = props.items.length
  if (!n || width <= 0 || height <= 0) return

  const spring = 10
  const repel = 28
  const minDist = radius * 2 + gap

  const damp60 = 0.86
  const damp = Math.pow(damp60, dt * 60)

  for (const it of props.items) {
    const st = ensureState(it.key)
    st.vx += (st.tx - st.x) * spring * dt
    st.vy += (st.ty - st.y) * spring * dt
  }

  for (let i = 0; i < n; i++) {
    const a = ensureState(props.items[i].key)
    for (let j = i + 1; j < n; j++) {
      const b = ensureState(props.items[j].key)
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.0001
      const overlap = minDist - dist
      if (overlap <= 0) continue
      const nx = dx / dist
      const ny = dy / dist
      const push = overlap * repel * dt
      a.vx -= nx * push
      a.vy -= ny * push
      b.vx += nx * push
      b.vy += ny * push
    }
  }

  const margin = radius + 14

  for (const it of props.items) {
    const st = ensureState(it.key)
    st.vx *= damp
    st.vy *= damp
    st.x += st.vx * dt
    st.y += st.vy * dt

    if (st.x < margin) {
      st.x = margin
      st.vx = Math.abs(st.vx) * 0.25
    } else if (st.x > width - margin) {
      st.x = width - margin
      st.vx = -Math.abs(st.vx) * 0.25
    }

    if (st.y < margin) {
      st.y = margin
      st.vy = Math.abs(st.vy) * 0.25
    } else if (st.y > height - margin) {
      st.y = height - margin
      st.vy = -Math.abs(st.vy) * 0.25
    }
  }
}

function render() {
  if (width <= 0 || height <= 0) return
  for (const it of props.items) {
    const el = els.get(it.key)
    if (!el) continue
    const st = ensureState(it.key)
    el.style.transform = `translate3d(${st.x - radius}px, ${st.y - radius}px, 0)`
  }
}

function loop(t: number) {
  if (!lastT) lastT = t
  const dt = Math.min(0.033, Math.max(0.008, (t - lastT) / 1000))
  lastT = t
  step(dt)
  render()
  raf = requestAnimationFrame(loop)
}

function setBubbleEl(key: string, el: Element | null) {
  if (!el) {
    els.delete(key)
    return
  }
  els.set(key, el as HTMLElement)
  ;(el as HTMLElement).style.width = `${radius * 2}px`
  ;(el as HTMLElement).style.height = `${radius * 2}px`
}

function pointerPos(ev: PointerEvent) {
  const rect = fieldRef.value?.getBoundingClientRect()
  if (!rect) return { x: 0, y: 0 }
  return { x: ev.clientX - rect.left, y: ev.clientY - rect.top }
}

/** Hover-physics: cursor motion pushes nearby bubbles */
function applyHoverImpulse(p: { x: number; y: number }, dx: number, dy: number) {
  // ignore tiny jitter
  const mag = Math.abs(dx) + Math.abs(dy)
  if (mag < 2.0) return

  // HARD clamp so fast mouse movement doesn't yeet bubbles
  const maxStep = 20 // px per event
  const cdx = clamp(dx, -maxStep, maxStep)
  const cdy = clamp(dy, -maxStep, maxStep)

  // Make it affect fewer bubbles + MUCH weaker force
  const sigma = clamp(radius * 3.0, 120, 200)
  const inv2s2 = 1 / (2 * sigma * sigma)

  const impulse = 6 // <- was 26, this is the main fix
  const scale = 0.30 // extra softness

  for (const it of props.items) {
    const st = ensureState(it.key)
    const dist2 = (st.x - p.x) ** 2 + (st.y - p.y) ** 2
    const influence = Math.exp(-dist2 * inv2s2)
    const k = impulse * influence * scale
    st.vx += cdx * k
    st.vy += cdy * k
  }
}

function onPointerEnter(ev: PointerEvent) {
  hovering = true
  lastPointer = pointerPos(ev)
}

function onPointerMove(ev: PointerEvent) {
  if (!hovering || !fieldRef.value) return
  const p = pointerPos(ev)
  const dx = p.x - lastPointer.x
  const dy = p.y - lastPointer.y
  lastPointer = p
  applyHoverImpulse(p, dx, dy)
}

function onPointerLeave() {
  hovering = false
}

function onBubbleClick(it: BubbleItem) {
  router.push({ name: 'details', params: { kind: it.kind, id: String(it.id) } })
}

watch(
  () => props.items.map((x) => x.key).join('|'),
  () => {
    const keys = new Set(props.items.map((x) => x.key))
    for (const k of [...states.keys()]) if (!keys.has(k)) states.delete(k)

    layout()

    const missing = props.items.filter((x) => !posterFor(x)).slice(0, 40)
    missing.forEach(refreshPoster)
  },
  { immediate: true }
)

onMounted(() => {
  if (!fieldRef.value) return

  ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect
    if (!r) return
    width = r.width
    height = r.height
    layout()
  })
  ro.observe(fieldRef.value)

  raf = requestAnimationFrame(loop)
})

onBeforeUnmount(() => {
  if (ro) ro.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<template>
  <div
    ref="fieldRef"
    class="relative w-full overflow-hidden rounded-3xl bg-zinc-950/25 shadow-[0_20px_80px_rgba(0,0,0,0.55)]"
    style="height: clamp(560px, 72vh, 820px)"
    @pointerenter="onPointerEnter"
    @pointermove="onPointerMove"
    @pointerleave="onPointerLeave"
  >
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_0%,rgba(255,255,255,0.08),transparent_55%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_120%,rgba(229,9,20,0.09),transparent_60%)]" />
      <div class="absolute inset-0 [mask-image:radial-gradient(circle_at_center,black,transparent_70%)] bg-black/35" />
    </div>

    <div
      v-for="it in props.items"
      :key="it.key"
      class="bubble absolute left-0 top-0"
      :ref="(el) => setBubbleEl(it.key, el)"
    >
      <button
        type="button"
        class="bubbleInner group relative h-full w-full overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur outline-none transition"
        :title="it.title"
        @click="onBubbleClick(it)"
      >
        <img
          v-if="posterFor(it)"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          :src="posterFor(it) as string"
          :alt="it.title"
          loading="lazy"
          draggable="false"
        />

        <div v-else class="grid h-full w-full place-items-center bg-zinc-950/60">
          <div class="h-10 w-10 rounded-full border border-white/10 bg-white/5" />
        </div>

        <div class="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/10 transition group-hover:ring-white/40" />
        <div class="pointer-events-none absolute -inset-6 rounded-full opacity-0 blur-2xl transition group-hover:opacity-100 bubbleGlow" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.bubble { will-change: transform; }
.bubbleInner {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.04),
    0 18px 60px rgba(0, 0, 0, 0.55);
}
.bubbleGlow {
  background: radial-gradient(
    circle at 50% 40%,
    rgba(255, 255, 255, 0.16),
    rgba(229, 9, 20, 0.10),
    transparent 70%
  );
}
</style>
