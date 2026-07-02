import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(handlers) {
  function isEditableTarget(target) {
    if (!target) return false
    const tagName = target.tagName?.toLowerCase()
    const isEditable = tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable
    if (!isEditable) return false

    const rect = target.getBoundingClientRect?.()
    const style = window.getComputedStyle?.(target)
    return Boolean(
      (!rect || rect.width > 0 || rect.height > 0) &&
      style?.display !== 'none' &&
      style?.visibility !== 'hidden'
    )
  }

  function handleKeydown(e) {
    const isCtrl = e.ctrlKey || e.metaKey
    const key = String(e.key || '').toLowerCase()
    const isEditable = isEditableTarget(e.target)
    const isEditorTextarea = e.target?.classList?.contains('editor-textarea')

    function handleUndoRedo(handler) {
      if (isEditable && !isEditorTextarea) return false
      if (!handler) return false
      e.preventDefault()
      handler()
      return true
    }

    if (!isCtrl && !e.altKey && !isEditable) {
      const handled = handlers.onPreviewVimKey?.({
        key: e.key,
        code: e.code,
        shiftKey: e.shiftKey,
        repeat: e.repeat
      })
      if (handled) {
        e.preventDefault()
        return
      }
    }

    if (
      !isCtrl &&
      !e.altKey &&
      key === 'n' &&
      !isEditable
    ) {
      const handled = handlers.onRepeatSearch?.(e.shiftKey || e.key === 'N' ? -1 : 1)
      if (handled) {
        e.preventDefault()
        return
      }
    }

    if (isCtrl && key === 's') {
      e.preventDefault()
      handlers.onSave?.()
      return
    }

    if (isCtrl && !e.shiftKey && key === 'z') {
      if (!handleUndoRedo(handlers.onUndo)) return
      return
    }

    if (isCtrl && e.shiftKey && key === 'z') {
      if (!handleUndoRedo(handlers.onRedo)) return
      return
    }

    if (isCtrl && key === 'y') {
      if (!handleUndoRedo(handlers.onRedo)) return
      return
    }

    if (isCtrl && key === 'n') {
      e.preventDefault()
      handlers.onNewFile?.()
      return
    }

    if (isCtrl && !e.shiftKey && key === 'k') {
      e.preventDefault()
      handlers.onOpenCommandPalette?.()
      return
    }

    if (isCtrl && key === 'p') {
      e.preventDefault()
      handlers.onTogglePreview?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'z') {
      e.preventDefault()
      handlers.onToggleZenMode?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'h') {
      e.preventDefault()
      handlers.onToggleOutline?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'v') {
      e.preventDefault()
      handlers.onTogglePreviewMode?.()
      return
    }

    if (!isCtrl && e.altKey && key === 's') {
      e.preventDefault()
      handlers.onToggleSplitMode?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'l') {
      e.preventDefault()
      handlers.onTogglePrevTheme?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'n') {
      e.preventDefault()
      handlers.onToggleTheme?.()
      return
    }

    if (!isCtrl && e.altKey && key === 'g') {
      e.preventDefault()
      handlers.onOpenCommandPalette?.()
      return
    }

    if (isCtrl && key === 'b') {
      e.preventDefault()
      handlers.onToggleSidebar?.()
      return
    }

    if (e.key === 'Escape') {
      handlers.onEscape?.()
      return
    }
  }

  function handleKeyup(e) {
    const isCtrl = e.ctrlKey || e.metaKey
    const isEditable = isEditableTarget(e.target)

    if (!isCtrl && !e.altKey && !isEditable) {
      const handled = handlers.onPreviewVimKeyUp?.({
        key: e.key,
        code: e.code,
        shiftKey: e.shiftKey,
        repeat: e.repeat
      })
      if (handled) {
        e.preventDefault()
      }
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeydown)
    window.addEventListener('keyup', handleKeyup)
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeydown)
    window.removeEventListener('keyup', handleKeyup)
  })
}
