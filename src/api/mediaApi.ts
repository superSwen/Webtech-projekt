import { api } from './http'
import type { FilmDto, SerieDto, FilmCreateUpdate, SerieCreateUpdate } from '@/types/media'

// --- FILMS ---
export async function getFilms(): Promise<FilmDto[]> {
  const res = await api.get<FilmDto[]>('/api/films')
  return res.data
}

export async function getFilmById(id: number): Promise<FilmDto> {
  const res = await api.get<FilmDto>(`/api/films/${id}`)
  return res.data
}

export async function createFilm(payload: FilmCreateUpdate): Promise<FilmDto> {
  const res = await api.post<FilmDto>('/api/films', payload)
  return res.data
}

export async function updateFilm(id: number, payload: FilmCreateUpdate): Promise<FilmDto> {
  // Backend hat PUT /api/films/{id}
  const res = await api.put<FilmDto>(`/api/films/${id}`, payload)
  return res.data
}

export async function deleteFilm(id: number): Promise<void> {
  await api.delete(`/api/films/${id}`)
}

// --- SERIES ---
export async function getSeries(): Promise<SerieDto[]> {
  const res = await api.get<SerieDto[]>('/api/series')
  return res.data
}

export async function getSerieById(id: number): Promise<SerieDto> {
  const res = await api.get<SerieDto>(`/api/series/${id}`)
  return res.data
}

export async function createSerie(payload: SerieCreateUpdate): Promise<SerieDto> {
  const res = await api.post<SerieDto>('/api/series', payload)
  return res.data
}

export async function updateSerie(id: number, payload: SerieCreateUpdate): Promise<SerieDto> {
  // Backend hat PUT /api/series/{id}
  const res = await api.put<SerieDto>(`/api/series/${id}`, payload)
  return res.data
}

export async function deleteSerie(id: number): Promise<void> {
  await api.delete(`/api/series/${id}`)
}
export const getSerie = getSerieById
export const getFilm = getFilmById
