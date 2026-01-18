import { api } from '@/api/http'

export type LoginResponse = {
  token: string
  username: string
  userId: number
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>('/api/auth/login', { username, password })
  return res.data
}
