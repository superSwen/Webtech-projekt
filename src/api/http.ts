import axios from 'axios'

const baseURL =
  (import.meta.env.VITE_API_BASE as string | undefined) ??
  'https://webtech-projekt-d919.onrender.com'

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
