import { api } from '@/api/http'

// =========================
// Types (Backend-DTO Shapes)
// =========================

/**
 * Backend: record TmdbBannerDto(mediaType, sourceTitle, imageType, imageUrl)
 */
type BackendTmdbBannerDto = {
  mediaType: 'movie' | 'tv' | string
  sourceTitle: string
  imageType: 'backdrop' | 'poster' | string
  imageUrl: string
}

/**
 * Backend: record TmdbTrailerDto(mediaType, sourceTitle, name, site, key, url)
 */
export type TmdbTrailerDto = {
  mediaType: 'movie' | 'tv' | string
  sourceTitle: string
  name: string
  site: string
  key: string
  url: string
}

// =========================
// UI Types
// =========================

export type TmdbBannerDto = {
  kind: 'movie' | 'series'
  title: string
  imageUrl: string
}

// =========================
// API Calls
// =========================

/**
 * GET /api/tmdb/banner
 * - ohne Params -> nimmt zufällig aus DB (Film+Serie)
 * - kann 204 No Content liefern -> dann return null
 */
export async function getBanner(): Promise<TmdbBannerDto | null> {
  const res = await api.get<BackendTmdbBannerDto | '' | null>('/api/tmdb/banner')
  const data = res.data

  // 204 No Content oder leer
  if (!data || typeof data !== 'object') return null

  return {
    kind: data.mediaType === 'movie' ? 'movie' : 'series', // tv -> series
    title: data.sourceTitle,
    imageUrl: data.imageUrl
  }
}

/**
 * GET /api/tmdb/trailer?title=...&type=movie|tv|series
 * - kann 204 No Content liefern -> dann return null
 */
export async function getTrailer(
  title: string,
  type: 'movie' | 'tv' | 'series'
): Promise<TmdbTrailerDto | null> {
  const res = await api.get<TmdbTrailerDto | '' | null>('/api/tmdb/trailer', {
    params: { title, type }
  })

  const data = res.data
  if (!data || typeof data !== 'object') return null

  return data
}
