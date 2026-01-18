<script setup lang="ts">
import logoUrl from '@/assets/logoHome.png'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { clearSession, session } from '@/auth/session'

const router = useRouter()

const isAuthed = computed(() => !!session.value?.token)
const username = computed(() => session.value?.username ?? '')

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
     class="sticky top-0 z-20 h-[96px] border-b border-white/10 bg-zinc-950/60 backdrop-blur"
   >
     <div class="container-app flex h-full items-center justify-between">
       <RouterLink to="/" class="flex items-center">
         <img class="h-[120px] w-auto block" :src="logoUrl" alt="Movie / Series Tracker" />

       </RouterLink>

       <div class="flex items-center gap-2">
         <span v-if="isAuthed" class="pill">{{ username }}</span>

         <button v-if="isAuthed" class="btn ghost" @click="logout">
           Logout
         </button>

         <button v-else class="btn primary" @click="goLogin">
           Login
         </button>
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
