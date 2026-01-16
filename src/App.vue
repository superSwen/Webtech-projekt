<script setup lang="ts">
import logoUrl from '@/assets/logo.svg'
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
      <div class="container-app flex items-center justify-between py-3">
        <RouterLink to="/" class="flex items-center gap-3">
          <img class="h-11 w-auto" :src="logoUrl" alt="Movie / Series Tracker" />
          <div class="leading-tight">
            <div class="text-lg font-black tracking-tight text-red-500">MOVIE/SERIES</div>
            <div class="text-xs font-semibold text-white/60">TRACKER</div>
          </div>
        </RouterLink>

        <div class="flex items-center gap-2">
          <!-- room for later: login, theme toggle, etc. -->
        </div>
      </div>
    </header>

    <main class="container-app py-6">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

