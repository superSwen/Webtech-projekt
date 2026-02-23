<script setup lang="ts">
import logoUrl from '@/assets/logoHome.png'
import HeroCharacter from '@/components/HeroCharacter.vue'
import FoldNavLink from "@/components/FoldNavLink.vue";

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearSession, session } from '@/auth/session'

const router = useRouter()
const route = useRoute()

const isAuthed = computed(() => !!session.value?.token)
const username = computed(() => session.value?.username ?? '')

const isCollection = computed(() => route.name === 'collection')

function goLogin() {
  router.push({ name: 'login' })
}

function logout() {
  clearSession()
  router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen">
    <header
      class="sticky top-0 z-20 h-[96px] border-b border-white/10 backdrop-blur"
      :class="isCollection ? 'bg-zinc-950/35' : 'bg-zinc-950/60'"
    >
      <div class="container-app grid h-full grid-cols-3 items-center">
        <RouterLink to="/" class="flex items-center justify-self-start">
          <img
            class="h-[72px] w-auto block sm:h-[96px]"
            :src="logoUrl"
            alt="Movie / Series Tracker"
          />
        </RouterLink>

        <div class="justify-self-center flex items-center gap-4">
          <FoldNavLink side="left" to="/collection" label="Collection" />
          <HeroCharacter class="hidden sm:block" size="header" />
          <FoldNavLink side="right" to="/" label="Hauptseite" />
        </div>

        <div class="flex items-center gap-2 justify-self-end">
          <span v-if="isAuthed" class="pill">{{ username }}</span>
          <button v-if="isAuthed" class="btn ghost" @click="logout">Logout</button>
          <button v-else class="btn primary" @click="goLogin">Login</button>
        </div>
      </div>
    </header>

    <!-- IMPORTANT: Collection needs full-bleed without extra padding -->
    <main :class="isCollection ? 'p-0' : 'container-app py-6'">
      <RouterView v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
