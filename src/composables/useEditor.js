import { ref, computed } from 'vue'

export function useEditor(contentRef, editorRef, splitEditorRef) {
  const isBlurred = ref(true)
  const showStatusbar = ref(true)
  const isPreviewMode = ref(false)
  const isFullscreenPreview = ref(false)
  const splitPosition = ref(50)
  const isResizing = ref(false)

  const charCount = computed(() => contentRef.value.length)

  const wordCount = computed(() => {
    return contentRef.value.trim() ? contentRef.value.trim().split(/\s+/).length : 0
  })

  const lineCount = computed(() => {
    return contentRef.value ? contentRef.value.split('\n').length : 1
  })

  const currentLine = ref(1)
  const currentColumn = ref(1)

  const editorStyleWithBg = computed(() => {
    return {
      backgroundImage: 'url(/bg.png)',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    }
  })

  const previewAreaStyle = computed(() => {
    if (isFullscreenPreview.value) {
      return {
        height: '100%',
        width: '100%'
      }
    }
    return {
      height: '100%',
      width: `${100 - splitPosition.value}%`,
      flex: '1 1 auto'
    }
  })

  const togglePreviewMode = () => {
    isPreviewMode.value = !isPreviewMode.value
    showStatusbar.value = !isPreviewMode.value

    if (!isPreviewMode.value) {
      isBlurred.value = false
      showStatusbar.value = true
      isFullscreenPreview.value = false
      setTimeout(() => {
        const editor = editorRef.value || splitEditorRef.value
        if (editor) {
          editor.focus()
        }
      }, 100)
    }
  }

  const toggleFullscreenPreview = () => {
    isFullscreenPreview.value = !isFullscreenPreview.value
  }

  const exitPreviewMode = () => {
    isPreviewMode.value = false
    isFullscreenPreview.value = false
    showStatusbar.value = true
    isBlurred.value = false
    setTimeout(() => {
      const editor = editorRef.value || splitEditorRef.value
      if (editor) {
        editor.focus()
      }
    }, 100)
  }

  const handleClick = () => {
    isBlurred.value = false
    showStatusbar.value = true
  }

  const handleFocus = () => {
    isBlurred.value = false
    showStatusbar.value = true
  }

  const handleBlur = () => {
    setTimeout(() => {
      isBlurred.value = true
      showStatusbar.value = false
    }, 200)
  }

  const handlePreviewClick = () => {
    isBlurred.value = true
  }

  const focusEditor = () => {
    if (editorRef.value) {
      editorRef.value.focus()
      isBlurred.value = false
      showStatusbar.value = true
    }
  }

  const startResize = (e) => {
    e.preventDefault()
    isResizing.value = true
    document.addEventListener('mousemove', handleResize, { passive: true })
    document.addEventListener('mouseup', stopResize)
  }

  const handleResize = (e) => {
    if (!isResizing.value) return
    requestAnimationFrame(() => {
      const containerWidth = window.innerWidth
      const newPosition = (e.clientX / containerWidth) * 100
      if (newPosition >= 20 && newPosition <= 80) {
        splitPosition.value = newPosition
      }
    })
  }

  const stopResize = () => {
    isResizing.value = false
    document.removeEventListener('mousemove', handleResize)
    document.removeEventListener('mouseup', stopResize)
  }

  return {
    isBlurred,
    showStatusbar,
    isPreviewMode,
    isFullscreenPreview,
    splitPosition,
    isResizing,
    charCount,
    wordCount,
    lineCount,
    currentLine,
    currentColumn,
    editorStyleWithBg,
    previewAreaStyle,
    togglePreviewMode,
    toggleFullscreenPreview,
    exitPreviewMode,
    handleClick,
    handleFocus,
    handleBlur,
    handlePreviewClick,
    focusEditor,
    startResize,
    stopResize
  }
}
