import { onMounted, onUnmounted } from 'vue'

export function useKeyboardShortcuts(handlers) {
  function handleKeydown(e) {
    const isCtrl = e.ctrlKey || e.metaKey

    // Ctrl/Cmd + S: 保存
    if (isCtrl && e.key === 's') {
      e.preventDefault()
      handlers.onSave?.()
      return
    }

    // Ctrl/Cmd + Z: 撤销
    if (isCtrl && !e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handlers.onUndo?.()
      return
    }

    // Ctrl/Cmd + Shift + Z: 重做
    if (isCtrl && e.shiftKey && e.key === 'z') {
      e.preventDefault()
      handlers.onRedo?.()
      return
    }

    // Ctrl/Cmd + Y: 重做 (Windows)
    if (isCtrl && e.key === 'y') {
      e.preventDefault()
      handlers.onRedo?.()
      return
    }

    // Ctrl/Cmd + N: 新建文件
    if (isCtrl && e.key === 'n') {
      e.preventDefault()
      handlers.onNewFile?.()
      return
    }

    // Ctrl/Cmd + P: 切换预览
    if (isCtrl && e.key === 'p') {
      e.preventDefault()
      handlers.onTogglePreview?.()
      return
    }

    // Alt + Z: Toggle Zen mode
    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      handlers.onToggleZenMode?.()
      return
    }

    // Alt + H: Toggle document outline
    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      handlers.onToggleOutline?.()
      return
    }

    // Alt + L: Toggle theme
    if (!isCtrl && e.altKey && e.key.toLowerCase() === 'l') {
      e.preventDefault()
      handlers.onToggleTheme?.()
      return
    }

    // Ctrl/Cmd + B: 切换编辑器/预览分割
    if (isCtrl && e.key === 'b') {
      e.preventDefault()
      handlers.onToggleSidebar?.()
      return
    }

    // Escape: 退出预览模式
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
