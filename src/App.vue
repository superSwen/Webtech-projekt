<script setup lang="ts">
import logoUrl from '@/assets/logo.svg'
import { computed, inject, type ShallowRef } from 'vue'
import type { AuthState } from '@okta/okta-auth-js'
import { useAuth } from '@okta/okta-vue'

const auth = useAuth()
const authState = inject<ShallowRef<AuthState>>('okta.authState')

const isAuthed = computed(() => !!authState?.value?.isAuthenticated)

async function login() {
  await auth.signInWithRedirect()
}

async function logout() {
  await auth.signOut()
}
</script>

<template>
  <div class="min-h-screen">
    <header class="sticky top-0 z-20 border-b border-white/10 bg-zinc-950/60 backdrop-blur">
      <div class="container-app flex items-center justify-between py-3">
        <RouterLink to="/" class="flex items-center gap-3">
          <img class="h-11 w-auto" :src="logoUrl" alt="Movie / Series Tracker" />

        </RouterLink>

        <div class="flex items-center gap-2">
          <button v-if="isAuthed" class="btn ghost" @click="logout">Logout</button>
          <button v-else class="btn" @click="login">Login</button>
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

