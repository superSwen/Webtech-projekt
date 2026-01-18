import axios from 'axios'
import { clearSession, getToken } from '@/auth/session'

const baseURL =
  import.meta.env.VITE_API_BASE?.toString().trim() ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '')

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      clearSession()
      // avoid router import cycles; hard redirect is fine
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)
