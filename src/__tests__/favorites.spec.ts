import { describe, it, expect, vi } from 'vitest'

/** Minimaler localStorage Mock (damit clear/set/get/remove existieren). */
const store: Record<string, string> = {}
const localStorageMock = {
  getItem: (k: string) => (k in store ? store[k] : null),
  setItem: (k: string, v: string) => {
    store[k] = String(v)
  },
  removeItem: (k: string) => {
    delete store[k]
  },
  clear: () => {
    for (const k of Object.keys(store)) delete store[k]
  },
}
vi.stubGlobal('localStorage', localStorageMock)

describe('useFavorites', () => {
  /** Test 4: toggleFavorite setzt/entfernt Favorit und persistiert in localStorage. */
  it('toggleFavorite_persists_to_localStorage_test4', async () => {
    localStorage.clear()
    vi.resetModules() // wichtig: favorites lädt beim Import einmal aus Storage

    const mod = await import('@/utils/favorites')
    const { useFavorites } = mod

    const { isFavorite, toggleFavorite } = useFavorites()

    expect(isFavorite('film', 1)).toBe(false)

    toggleFavorite('film', 1)
    expect(isFavorite('film', 1)).toBe(true)

    const raw = localStorage.getItem('mst_favorites_v1')
    expect(raw).toBeTruthy()
    expect(raw!).toContain('film:1')

    toggleFavorite('film', 1)
    expect(isFavorite('film', 1)).toBe(false)
  })
})
