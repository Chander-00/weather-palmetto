import { useState, useCallback } from 'react'

const STORAGE_KEY = 'weather-search-history'
const MAX_ENTRIES = 8

function loadHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>(loadHistory)

  const addEntry = useCallback((city: string) => {
    setHistory((prev) => {
      const filtered = prev.filter(
        (entry) => entry.toLowerCase() !== city.toLowerCase()
      )
      const updated = [city, ...filtered].slice(0, MAX_ENTRIES)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearHistory = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setHistory([])
  }, [])

  return { history, addEntry, clearHistory }
}
