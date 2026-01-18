import axios from 'axios'
import type { AccessToken } from '@okta/okta-auth-js'
import { oktaAuth } from '@/utils/okta'

const baseURL =
  import.meta.env.VITE_API_BASE?.toString().trim() ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '')

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(async (config) => {
  const token = (await oktaAuth.tokenManager.get('accessToken')) as AccessToken | undefined

  if (token?.accessToken) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token.accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err)
)

