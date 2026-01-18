import { ref } from 'vue'

type JwtPayload = { exp?: number; [k: string]: any }

export type Session = {
  token: string
  username: string
  userId: number
  exp?: number
}

const KEY = 'session'

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null

    const base64url = parts[1]
    if (!base64url) return null

    // base64url -> base64 + padding
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')

    const json = atob(padded)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

function load(): Session | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const s = JSON.parse(raw) as Session
    if (!s?.token) return null

    const payload = parseJwt(s.token)
    const exp = payload?.exp
    if (exp && Date.now() >= exp * 1000) {
      localStorage.removeItem(KEY)
      return null
    }
    return { ...s, exp }
  } catch {
    return null
  }
}

export const session = ref<Session | null>(load())

export function isLoggedIn(): boolean {
  return !!session.value?.token
}

export function getToken(): string | null {
  return session.value?.token ?? null
}

export function setSession(token: string, username: string, userId: number) {
  const exp = parseJwt(token)?.exp
  session.value = { token, username, userId, exp }
  localStorage.setItem(KEY, JSON.stringify(session.value))
}

export function clearSession() {
  session.value = null
  localStorage.removeItem(KEY)
}
