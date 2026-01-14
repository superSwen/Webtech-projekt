// src/api/http.ts
import axios from 'axios'

function resolveBaseUrl() {
  const fromEnv = String(
    import.meta.env.VITE_API_BASE_URL ??
      import.meta.env.VITE_API_BASE ??
      ''
  ).trim()

  // Falls Env gesetzt & nicht leer → nehmen
  if (fromEnv) return fromEnv

  // Local Dev fallback
  if (import.meta.env.DEV) return 'http://localhost:8080'

  // Production fallback (optional) – setz auf Render besser eine Env!
  return 'https://webtech-projekt-d919.onrender.com'
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 20000,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// Hilfreicher Fehler, falls du wieder HTML statt JSON bekommst
api.interceptors.response.use(
  (res) => {
    if (
      typeof res.data === 'string' &&
      res.data.includes('<!DOCTYPE html')
    ) {
      return Promise.reject(
        new Error(
          'API liefert HTML (index.html). BaseURL falsch → prüfe VITE_API_BASE_URL oder Backend-URL.'
        )
      )
    }
    return res
  },
  (err) => Promise.reject(err)
)

export default api
