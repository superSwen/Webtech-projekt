<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { login } from '@/api/authApi'
import { setSession } from '@/auth/session'
import logoUrl from '@/assets/logoLogin.png'

const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const busy = ref(false)
const error = ref<string | null>(null)
const capsOn = ref(false)

const canSubmit = computed(() => username.value.trim().length > 0 && password.value.length > 0 && !busy.value)

function onPwKey(e: KeyboardEvent) {
  capsOn.value = e.getModifierState?.('CapsLock') ?? false
}

async function submit() {
  error.value = null
  const u = username.value.trim()
  const p = password.value

  if (!u || !p) {
    error.value = 'Bitte Username und Passwort eingeben.'
    return
  }

  busy.value = true
  try {
    const res = await login(u, p)
    setSession(res.token, res.username, res.userId)

    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } catch (e: any) {
    if (e?.response?.status === 401) error.value = 'Passwort ist falsch.'
    else error.value = e?.response?.data?.message ?? e?.message ?? 'Login fehlgeschlagen.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="relative min-h-[calc(100vh-88px)]">
    <!-- subtle background glow -->
    <div class="pointer-events-none absolute inset-0 -z-10">
      <div class="absolute left-1/2 top-24 h-[420px] w-[680px] -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl"></div>
      <div class="absolute left-1/2 top-48 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-white/5 blur-3xl"></div>
    </div>

    <div class="grid place-items-center px-4 py-12">
      <section class="card w-full max-w-md">
        <!-- header -->
        <div class="flex items-center gap-4">
          <!-- KEIN viereck/box mehr ums logo -->
          <img class="h-48 w-auto shrink-0" :src="logoUrl" alt="Logo" />

          <div class="flex-1">
            <h1 class="text-2xl font-extrabold tracking-tight">Login</h1>
            <p class="mt-1 text-sm text-white/60">
              Melde dich an, um deine Filme & Serien zu sehen.
            </p>
          </div>
        </div>

        <!-- error -->
        <div v-if="error" class="alert error mt-5">
          {{ error }}
        </div>

        <!-- form -->
        <div class="mt-5 space-y-4">
          <div>
            <label class="label">Username</label>
            <input
              class="input"
              v-model="username"
              :disabled="busy"
              autocomplete="username"
              placeholder="z.B. leon"
              @keyup.enter="submit"
            />
          </div>

          <div>
            <label class="label flex items-center justify-between">
              <span>Passwort</span>
              <span v-if="capsOn" class="text-xs text-yellow-200/80">Caps Lock aktiv</span>
            </label>

            <input
              class="input"
              v-model="password"
              :disabled="busy"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              @keydown="onPwKey"
              @keyup.enter="submit"
            />
          </div>

          <button class="btn primary w-full" :disabled="!canSubmit" @click="submit">
            <span v-if="busy">…</span>
            <span v-else>Login</span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
