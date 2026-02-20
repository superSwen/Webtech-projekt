<script setup lang="ts">
import { computed } from "vue";

type Side = "left" | "right";

const props = withDefaults(
  defineProps<{
    to: any;
    label: string;
    side?: Side;
  }>(),
  { side: "right" }
);

const labelPos = computed(() =>
  props.side === "left"
    ? "right-full mr-4 origin-right"
    : "left-full ml-4 origin-left"
);
</script>

<template>
  <RouterLink :to="to" custom v-slot="{ href, navigate, isActive }">
    <!-- Big invisible hitbox = "annähernd" hover, but no frame -->
    <a
      :href="href"
      @click="navigate"
      class="group relative flex items-center justify-center select-none px-6 py-4 outline-none"
      :aria-label="label"
    >
      <span class="relative grid place-items-center">
        <!-- DOT -->
        <span class="dot h-2.5 w-2.5 rounded-full bg-white" :class="isActive ? 'dotActive' : ''" />
        <span class="absolute -inset-3 rounded-full" :class="isActive ? 'ringActive' : 'ringIdle'" />

        <!-- LABEL (absolute -> never clipped / never pushes layout) -->
        <span
          class="absolute top-1/2 -translate-y-1/2 whitespace-nowrap
                 opacity-0 scale-95 pointer-events-none
                 transition-[opacity,transform] duration-250 ease-out"
          :class="[
            labelPos,
            'group-hover:opacity-100 group-hover:scale-110 group-hover:pointer-events-auto',
            'group-focus-visible:opacity-100 group-focus-visible:scale-110 group-focus-visible:pointer-events-auto',
            isActive ? 'opacity-100 scale-110 pointer-events-auto' : ''
          ]"
        >
          <!-- inner span gets the bobbing animation (so it matches the dots) -->
          <span class="labelBob labelText inline-block text-sm font-extrabold tracking-tight text-white/90">
            {{ label }}
          </span>
        </span>
      </span>

      <!-- subtle focus ring (no frame, just accessibility) -->
      <span
        class="pointer-events-none absolute inset-1 rounded-full opacity-0
               transition-opacity duration-200 group-focus-visible:opacity-100"
        style="box-shadow: 0 0 0 2px rgba(255,255,255,0.18);"
      />
    </a>
  </RouterLink>
</template>

<style scoped>
/* readable on gradients without any capsule */
.labelText{
  text-shadow: 0 2px 14px rgba(0,0,0,0.55), 0 0 18px rgba(255,255,255,0.10);
}

/* same “up/down” vibe as dots, but on inner element so it doesn't fight scale */
.labelBob{
  animation: bob 1.8s ease-in-out infinite;
}

.dot {
  box-shadow: 0 0 14px rgba(255, 255, 255, 0.65);
  animation: bob 1.8s ease-in-out infinite;
}
.dotActive {
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.95);
}

.ringIdle {
  background: radial-gradient(circle, rgba(255,255,255,0.16), rgba(255,255,255,0) 65%);
  opacity: 0.55;
  filter: blur(8px);
  animation: ringBreath 2.3s ease-in-out infinite;
}
.ringActive {
  background: radial-gradient(circle, rgba(255,255,255,0.26), rgba(255,255,255,0) 70%);
  opacity: 0.95;
  filter: blur(10px);
  animation: ringBreath 1.9s ease-in-out infinite;
}

@keyframes bob {
  0%, 100% { transform: translateY(0); opacity: 0.92; }
  50% { transform: translateY(-0.9px); opacity: 0.98; }
}
@keyframes ringBreath {
  0%, 100% { transform: scale(0.95); opacity: 0.45; }
  50% { transform: scale(1.08); opacity: 0.75; }
}

@media (prefers-reduced-motion: reduce) {
  .labelBob, .dot, .ringIdle, .ringActive { animation: none !important; }
}
</style>
