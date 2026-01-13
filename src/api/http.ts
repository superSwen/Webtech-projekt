import axios from 'axios'

// ✅ Eine Quelle für alle API-Calls
// Local Dev: http://localhost:8080
// Render:    https://webtech-projekt-d919.onrender.com
//
// Tipp (Vite): Lege im Frontend-Root eine .env.local an:
//   VITE_API_BASE=http://localhost:8080
//
// Wenn VITE_API_BASE nicht gesetzt ist:
// - DEV -> localhost
// - PROD -> Render
const baseURL =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  (import.meta.env.DEV
    ? 'http://localhost:8080'
    : 'https://webtech-projekt-d919.onrender.com')

export const api = axios.create({
  baseURL,
  timeout: 20000
})

// Optional: kleine Debug-Ausgabe
api.interceptors.response.use(
  (res) => res,
  (err) => {
    console.error('API error:', err?.response?.status, err?.response?.data || err?.message)
    return Promise.reject(err)
  }
)
