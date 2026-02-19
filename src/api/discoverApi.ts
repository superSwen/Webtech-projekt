import { api } from '@/api/http'

export type OthersWatchingDto = {
  kind: 'movie' | 'series' | string
  title: string

  imdbId?: string | null
  season?: number | null
  episode?: number | null
  minutes?: number | null

  imageType?: string | null
  imageUrl?: string | null

  year?: string | null
  genre?: string | null
  runtime?: string | null
  imdbRating?: string | null
  plot?: string | null
}

/**
 * GET /api/discover/others-watching
 * - 200 JSON -> OthersWatchingDto
 * - 204 No Content -> null
 */
export async function getOthersWatching(): Promise<OthersWatchingDto | null> {
  const res = await api.get<OthersWatchingDto | '' | null>('/api/discover/others-watching')
  const data = res.data
  if (!data || typeof data !== 'object') return null
  return data as OthersWatchingDto
}
