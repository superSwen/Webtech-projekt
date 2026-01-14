// src/api/tmdbApi.ts
import api from '@/api/http'

export type TmdbHeroDto = {
  name: string
  imageUrl: string
}

export type TmdbBannerDto = {
  title: string
  imageUrl: string
  type: 'movie' | 'tv'
}

export type TmdbTrailerDto = {
  url: string | null
}

export async function getHero(): Promise<TmdbHeroDto> {
  const { data } = await api.get('/api/tmdb/hero')
  return data
}

export async function getBanner(): Promise<TmdbBannerDto> {
  const { data } = await api.get('/api/tmdb/banner')
  return data
}

export async function getTrailer(title: string, type: 'movie' | 'tv'): Promise<TmdbTrailerDto> {
  const { data } = await api.get('/api/tmdb/trailer', { params: { title, type } })
  return data
}
