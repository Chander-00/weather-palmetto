import { useEffect } from 'react'

interface ShortcutHandlers {
  onFocusSearch: () => void
  onClear: () => void
}

export function useKeyboardShortcuts({
  onFocusSearch,
  onClear
}: ShortcutHandlers) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA'

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        onFocusSearch()
        return
      }

      if (e.key === '/' && !isInput) {
        e.preventDefault()
        onFocusSearch()
        return
      }

      if (e.key === 'Escape') {
        if (isInput) {
          ;(target as HTMLInputElement).blur()
        } else {
          onClear()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFocusSearch, onClear])
}
