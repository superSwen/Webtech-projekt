export type FilmDto = {
  id: number
  title: string
  minutes?: number | null
  notes?: string | null
  imdbId?: string | null
  posterUrl?: string | null
}

export type SerieDto = {
  id: number
  title: string
  season?: number | null
  episode?: number | null
  minutes?: number | null
  notes?: string | null
  imdbId?: string | null
  posterUrl?: string | null
}

export type FilmCreateUpdate = {
  title: string
  minutes?: number | null
  notes?: string | null
  imdbId?: string | null
}

export type SerieCreateUpdate = {
  title: string
  season?: number | null
  episode?: number | null
  minutes?: number | null
  notes?: string | null
  imdbId?: string | null
}
