import axios from 'axios'

const baseURL =
  import.meta.env.VITE_API_BASE?.toString().trim() ||
  (import.meta.env.DEV ? 'http://localhost:8080' : '')

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})
api.interceptors.request.use((config) => {
  console.debug('[API →]', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''), {
    params: config.params,
    data: config.data
  })
  return config
})

api.interceptors.response.use(
  (res) => {
    console.debug('[API ←]', res.status, res.config.url, res.data)
    return res
  },
  (err) => {
    console.error('[API ✖]', err?.response?.status, err?.config?.url, err?.response?.data || err.message)
    return Promise.reject(err)
  }
)
