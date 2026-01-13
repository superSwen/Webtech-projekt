import { api } from './http'

export type TmdbHeroDto = {
  mediaType: 'movie' | 'tv'
  sourceTitle: string
  personName: string
  characterName?: string | null
  imageUrl: string
}

export type TmdbBannerDto = {
  mediaType: 'movie' | 'tv'
  sourceTitle: string
  imageType: 'backdrop' | 'poster'
  imageUrl: string
}

export async function getHero(): Promise<TmdbHeroDto | null> {
  const res = await api.get('/api/tmdb/hero', {
    validateStatus: (s) => s === 200 || s === 204
  })
  return res.status === 204 ? null : (res.data as TmdbHeroDto)
}

export async function getBanner(): Promise<TmdbBannerDto | null> {
  const res = await api.get('/api/tmdb/banner', {
    validateStatus: (s) => s === 200 || s === 204
  })
  return res.status === 204 ? null : (res.data as TmdbBannerDto)
}
