import { ref } from 'vue'

type MediaKind = 'film' | 'serie'

const STORAGE_KEY = 'mst_favorites_v1'

// Keys wie "film:12" oder "serie:7"
const favorites = ref<Set<string>>(new Set())

function key(kind: MediaKind, id: number | string) {
  return `${kind}:${id}`
}

function loadFromStorage() {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const arr = JSON.parse(raw) as string[]
    favorites.value = new Set(arr)
  } catch {
    favorites.value = new Set()
  }
}

function saveToStorage() {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...favorites.value]))
}

// einmal beim Import laden
loadFromStorage()

export function useFavorites() {
  function isFavorite(kind: MediaKind, id: number | string) {
    return favorites.value.has(key(kind, id))
  }

  function toggleFavorite(kind: MediaKind, id: number | string) {
    const k = key(kind, id)
    const next = new Set(favorites.value)

    if (next.has(k)) next.delete(k)
    else next.add(k)

    favorites.value = next // wichtig: neues Set zuweisen -> reaktiv
    saveToStorage()
  }

  return {
    favorites,
    isFavorite,
    toggleFavorite,
  }
}
