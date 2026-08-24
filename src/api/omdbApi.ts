import { api } from './http'

export type OmdbSearchItem = {
  Title: string
  Year: string
  imdbID: string
  Type: 'movie' | 'series' | string
  Poster: string
}

export type OmdbSearchResponse = {
  Search?: OmdbSearchItem[]
  search?: OmdbSearchItem[]
  totalResults?: string
  response?: string
  error?: string
}

export async function omdbSearch(q: string, type: 'movie' | 'series') {
  if (!q || q.trim().length < 2) return []
  const { data } = await api.get<OmdbSearchResponse>('/api/omdb/search', { params: { q, type } })

  const list = (data as any)?.Search ?? (data as any)?.search ?? []
  return Array.isArray(list) ? (list as OmdbSearchItem[]) : []
}
