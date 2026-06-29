import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(handlers) {
  function handleKeydown(e) {
    const isCtrl = e.ctrlKey || e.metaKey

    if (isCtrl && e.key === 's') {
      e.preventDefault()
      handlers.onSave?.()
      return
    }

    if (isCtrl && !e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handlers.onUndo?.()
      return
    }

    if (isCtrl && e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handlers.onRedo?.()
      return
    }

    if (isCtrl && e.key === 'y') {
      e.preventDefault()
      handlers.onRedo?.()
      return
    }

    if (isCtrl && e.key === 'n') {
      e.preventDefault()
      handlers.onNewFile?.()
      return
    }

    if (isCtrl && e.key === 'p') {
      e.preventDefault()
      handlers.onTogglePreview?.()
      return
    }

    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      handlers.onToggleZenMode?.()
      return
    }

    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      handlers.onToggleOutline?.()
      return
    }

    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      handlers.onToggleTheme?.()
      return
    }

    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'k') {
      e.preventDefault()
      handlers.onOpenCommandPalette?.()
      return
    }

    if (isCtrl && e.key === 'b') {
      e.preventDefault()
      handlers.onToggleSidebar?.()
      return
    }

    if (e.key === 'Escape') {
      handlers.onEscape?.()
      return
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
  })
}
