import { useState, useCallback } from 'react'

const STORAGE_KEY = 'weather-favorites'
const MAX_FAVORITES = 12

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites)

  const toggleFavorite = useCallback((city: string) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) => f.toLowerCase() === city.toLowerCase()
      )
      const updated = exists
        ? prev.filter((f) => f.toLowerCase() !== city.toLowerCase())
        : [city, ...prev].slice(0, MAX_FAVORITES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isFavorite = useCallback(
    (city: string) =>
      favorites.some((f) => f.toLowerCase() === city.toLowerCase()),
    [favorites]
  )

  return { favorites, toggleFavorite, isFavorite }
}
