<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    <BackgroundEffects />

    <div 
      class="relative z-10 w-full h-full"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <Editor
        :content="content"
        :is-blurred="isBlurred"
        :is-preview-mode="isPreviewMode"
        :is-fullscreen-preview="isFullscreenPreview"
        :split-position="splitPosition"
        :is-resizing="isResizing"
        :editor-style-with-bg="editorStyleWithBg"
        :preview-area-style="previewAreaStyle"
        @update:content="content = $event"
        @keydown="handleKeydown"
        @input="handleInput"
        @click="handleClick"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup="updateStatus"
        @previewClick="handlePreviewClick"
        @toggleFullscreenPreview="toggleFullscreenPreview"
        @exitPreviewMode="exitPreviewMode"
        @startResize="startResize"
        ref="editorComponent"
      />
    </div>

    <StatusBar
      :show-statusbar="showStatusbar"
      :char-count="charCount"
      :word-count="wordCount"
      :line-count="lineCount"
      :current-line="currentLine"
      :current-column="currentColumn"
      :last-saved-time="lastSavedTime"
      :history="history"
      :favorites="favorites"
      :is-preview-mode="isPreviewMode"
      @openHistoryPanel="openHistoryPanel"
      @openFavoritesPanel="openFavoritesPanel"
      @togglePreviewMode="togglePreviewMode"
    />

    <Toasts
      :show-save-toast="showSaveToast"
      :show-favorite-toast="showFavoriteToast"
      :copy-success="copySuccess"
      :empty-toast="emptyToast"
    />

    <HistoryPanel
      :show-history-panel="showHistoryPanel"
      :active-tab="activeTab"
      :history="history"
      :favorites="favorites"
      @update:activeTab="activeTab = $event"
      @closeHistoryPanel="closeHistoryPanelFunc"
      @showHistoryModal="showHistoryModalFunc($event)"
      @showFavoriteModal="showFavoriteModalFunc($event)"
      @deleteHistory="deleteHistory($event)"
      @deleteFavorite="deleteFavorite($event)"
    />

    <div
      v-if="showHistoryModalFlag"
      class="modal fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4 modal-visible"
      @click.self="closeHistoryModal"
    >
      <div class="glass-tech rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-cyan-500/20 modal-content border border-cyan-500/30">
        <div class="flex justify-between items-center p-5 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold gradient-text">历史记录预览</h3>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-200 transition-all duration-300 hover:rotate-90" @click="closeHistoryModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 bg-black/40 font-mono text-sm text-cyan-100/90 whitespace-pre-wrap custom-scrollbar leading-relaxed markdown-preview-history" v-html="historyPreviewHtml"></div>
        <div class="flex justify-between items-center p-5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-t border-cyan-500/30">
          <div class="flex items-center gap-2 text-xs text-cyan-400/70">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ currentHistoryTime }}
          </div>
          <div class="flex gap-3">
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-200 transition-all duration-300 flex items-center gap-2" @click="copyCurrentContent">
              <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span v-if="!copySuccess">复制</span>
              <svg v-if="copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-if="copySuccess" class="text-emerald-400">已复制</span>
            </button>
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-400/50 text-red-300 transition-all duration-300 flex items-center gap-2" @click="deleteCurrentRecord">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center gap-2" @click="applyHistory">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              应用
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showFavoriteModalFlag"
      class="modal fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4 modal-visible"
      @click.self="closeFavoriteModal"
    >
      <div class="glass-tech rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-amber-500/20 modal-content border border-amber-500/30">
        <div class="flex justify-between items-center p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-400/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">收藏预览</h3>
          </div>
          <button class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 hover:text-amber-200 transition-all duration-300 hover:rotate-90" @click="closeFavoriteModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto p-5 bg-black/40 font-mono text-sm text-amber-100/90 whitespace-pre-wrap custom-scrollbar leading-relaxed markdown-preview-favorite" v-html="favoritePreviewHtml"></div>
        <div class="flex justify-between items-center p-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-t border-amber-500/30">
          <div class="flex items-center gap-2 text-xs text-amber-400/70">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ currentFavoriteTime }}
          </div>
          <div class="flex gap-3">
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-200 transition-all duration-300 flex items-center gap-2" @click="copyCurrentContent">
              <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span v-if="!copySuccess">复制</span>
              <svg v-if="copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-if="copySuccess" class="text-emerald-400">已复制</span>
            </button>
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-400/50 text-red-300 transition-all duration-300 flex items-center gap-2" @click="deleteCurrentRecord">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
            <button class="btn-tech px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 flex items-center gap-2" @click="applyFavorite">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              应用
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { marked } from 'marked'
import BackgroundEffects from './components/BackgroundEffects.vue'
import Editor from './components/Editor.vue'
import StatusBar from './components/StatusBar.vue'
import Toasts from './components/Toasts.vue'
import HistoryPanel from './components/HistoryPanel.vue'

const editorComponent = ref(null)
const editorRef = computed(() => editorComponent.value?.editorRef)
const splitEditorRef = computed(() => editorComponent.value?.splitEditorRef)

const content = ref('')
const history = ref([])
const favorites = ref([])

const isBlurred = ref(true)
const showStatusbar = ref(true)
const isPreviewMode = ref(false)
const isFullscreenPreview = ref(false)
const splitPosition = ref(50)
const isResizing = ref(false)

const currentLine = ref(1)
const currentColumn = ref(1)
const lastSavedTime = ref('')

const showHistoryPanel = ref(false)
const showHistoryModalFlag = ref(false)
const showFavoriteModalFlag = ref(false)
const showSaveToast = ref(false)
const showFavoriteToast = ref(false)
const copySuccess = ref(false)
const activeTab = ref('history')
const emptyToast = ref({ show: false, message: '', color: 'yellow' })
const emptyToastTimer = ref(null)

let lastEscPressTime = 0
const escDoublePressThreshold = 300
let autoSaveTimer = null
const AUTO_SAVE_INTERVAL = 10000

let currentHistoryId = null
let currentFavoriteId = null
let currentModalType = null
const currentHistoryPreview = ref('')
const currentHistoryTime = ref('')
const currentFavoritePreview = ref('')
const currentFavoriteTime = ref('')

const STORAGE_KEY = 'editor_content'
const HISTORY_KEY = 'editor_history'
const FAVORITES_KEY = 'editor_favorites'
const MAX_HISTORY_ITEMS = 50

const charCount = computed(() => content.value.length)

const wordCount = computed(() => {
  return content.value.trim() ? content.value.trim().split(/\s+/).length : 0
})

const lineCount = computed(() => {
  return content.value ? content.value.split('\n').length : 1
})

const historyPreviewHtml = computed(() => {
  return marked(currentHistoryPreview.value || '')
})

const favoritePreviewHtml = computed(() => {
  return marked(currentFavoritePreview.value || '')
})

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

const { handleMouseMove, handleMouseLeave } = useMouseEffectsInline()

function useMouseEffectsInline() {
  const handleMouseMove = (e) => {}
  const handleMouseLeave = () => {}
  return { handleMouseMove, handleMouseLeave }
}

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
  updateStatus()
  isBlurred.value = false
  showStatusbar.value = true
  if (showHistoryPanel.value) {
    showHistoryPanel.value = false
  }
}

const handleFocus = () => {
  isBlurred.value = false
  showStatusbar.value = true
}

const handleBlur = () => {
  setTimeout(() => {
    if (showHistoryPanel.value) {
      showStatusbar.value = false
    } else {
      isBlurred.value = true
      showStatusbar.value = false
      addHistoryRecord()
    }
  }, 200)
}

const handlePreviewClick = () => {
  isBlurred.value = true
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

const updateStatus = () => {
  if (!editorRef.value) return
  const cursorPos = editorRef.value.selectionStart
  const textToCursor = content.value.substring(0, cursorPos)
  currentLine.value = textToCursor.split('\n').length
  currentColumn.value = textToCursor.split('\n').pop().length + 1
}

const updateSavedTime = () => {
  const now = new Date()
  lastSavedTime.value = now.toLocaleTimeString()
}

const addHistoryRecord = () => {
  const now = new Date()
  const currentContent = content.value

  if (!currentContent.trim()) return

  if (history.value.length > 0 && history.value[0].content === currentContent) return

  const record = {
    id: Date.now(),
    content: currentContent,
    timestamp: now.getTime(),
    date: now.toLocaleString(),
    charCount: currentContent.length,
    wordCount: currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0
  }

  history.value.unshift(record)

  if (history.value.length > MAX_HISTORY_ITEMS) {
    history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

const addFavorite = () => {
  const now = new Date()
  const currentContent = content.value

  if (!currentContent.trim()) {
    showEmptyToast('内容为空，无法收藏', 'yellow')
    return
  }

  const isAlreadyFavorite = favorites.value.some(fav => fav.content === currentContent)
  if (isAlreadyFavorite) {
    showEmptyToast('该内容已在收藏列表中', 'yellow')
    return
  }

  const record = {
    id: Date.now(),
    content: currentContent,
    timestamp: now.getTime(),
    date: now.toLocaleString(),
    charCount: currentContent.length,
    wordCount: currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0
  }

  favorites.value.unshift(record)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))

  showFavoriteToast.value = true
  setTimeout(() => {
    showFavoriteToast.value = false
  }, 3000)
}

const deleteHistory = (id) => {
  history.value = history.value.filter(record => record.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))

  if (currentHistoryId === id && currentModalType === 'history') {
    closeHistoryModal()
  }
}

const deleteFavorite = (id) => {
  favorites.value = favorites.value.filter(record => record.id !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))

  if (currentFavoriteId === id && currentModalType === 'favorite') {
    closeFavoriteModal()
  }
}

const showHistoryModalFunc = (record) => {
  currentModalType = 'history'
  currentHistoryId = record.id
  currentHistoryPreview.value = record.content
  currentHistoryTime.value = `保存时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
  showHistoryModalFlag.value = true
}

const closeHistoryModal = () => {
  showHistoryModalFlag.value = false
  currentHistoryId = null
  currentModalType = null
}

const showFavoriteModalFunc = (record) => {
  currentModalType = 'favorite'
  currentFavoriteId = record.id
  currentFavoritePreview.value = record.content
  currentFavoriteTime.value = `收藏时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
  showFavoriteModalFlag.value = true
}

const closeFavoriteModal = () => {
  showFavoriteModalFlag.value = false
  currentFavoriteId = null
  currentModalType = null
}

const applyHistory = () => {
  if (currentModalType === 'history' && currentHistoryId) {
    const record = history.value.find(r => r.id === currentHistoryId)
    if (record) {
      content.value = record.content
      closeHistoryModal()
      focusEditor()
    }
  }
}

const applyFavorite = () => {
  if (currentModalType === 'favorite' && currentFavoriteId) {
    const record = favorites.value.find(r => r.id === currentFavoriteId)
    if (record) {
      content.value = record.content
      closeFavoriteModal()
      focusEditor()
    }
  }
}

const focusEditor = () => {
  if (editorRef.value) {
    editorRef.value.focus()
    isBlurred.value = false
    showStatusbar.value = true
  }
}

const copyCurrentContent = () => {
  let contentToCopy = ''
  if (currentModalType === 'history' && currentHistoryId) {
    const record = history.value.find(r => r.id === currentHistoryId)
    if (record) contentToCopy = record.content
  } else if (currentModalType === 'favorite' && currentFavoriteId) {
    const record = favorites.value.find(r => r.id === currentFavoriteId)
    if (record) contentToCopy = record.content
  }

  if (!contentToCopy) return

  navigator.clipboard.writeText(contentToCopy).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
}

const deleteCurrentRecord = () => {
  if (currentModalType === 'history' && currentHistoryId) {
    deleteHistory(currentHistoryId)
  } else if (currentModalType === 'favorite' && currentFavoriteId) {
    deleteFavorite(currentFavoriteId)
  }
}

const showEmptyToast = (message, color = 'yellow') => {
  if (emptyToastTimer.value) {
    clearTimeout(emptyToastTimer.value)
  }
  emptyToast.value = { show: true, message, color }
  emptyToastTimer.value = setTimeout(() => {
    emptyToast.value.show = false
  }, 2500)
}

const openHistoryPanel = () => {
  showHistoryPanel.value = true
  activeTab.value = 'history'
  showStatusbar.value = false
}

const openFavoritesPanel = () => {
  showHistoryPanel.value = true
  activeTab.value = 'favorites'
  showStatusbar.value = false
}

const closeHistoryPanelFunc = () => {
  showHistoryPanel.value = false
  showStatusbar.value = true
}

const handleKeydown = (e) => {
  if (e.altKey && e.key === 'h') {
    e.preventDefault()
    openHistoryPanel()
  }

  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    addFavorite()
  }

  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    addHistoryRecord()
    showSaveToast.value = true
    setTimeout(() => {
      showSaveToast.value = false
    }, 3000)
  }

  if (e.key === 'Escape') {
    if (showHistoryPanel.value) {
      showHistoryPanel.value = false
      showStatusbar.value = true
    }

    const now = Date.now()
    if (now - lastEscPressTime < escDoublePressThreshold) {
      if (editorRef.value) {
        editorRef.value.blur()
      }
      showHistoryPanel.value = false
      showStatusbar.value = true
      closeHistoryModal()
      closeFavoriteModal()
    }
    lastEscPressTime = now
  }
}

const handleInput = () => {
  updateStatus()
  localStorage.setItem(STORAGE_KEY, content.value)
  updateSavedTime()

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(() => {
    addHistoryRecord()
  }, AUTO_SAVE_INTERVAL)
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    isBlurred.value = true
    showStatusbar.value = false
    addHistoryRecord()
  } else {
    if (document.activeElement === editorRef.value) {
      isBlurred.value = false
      showStatusbar.value = true
    }
  }
}

const adjustPadding = () => {
  if (!editorRef.value) return
  const width = window.innerWidth
  editorRef.value.classList.remove('p-4', 'p-6', 'p-10')
  if (width < 640) {
    editorRef.value.classList.add('p-4')
  } else if (width < 768) {
    editorRef.value.classList.add('p-6')
  } else {
    editorRef.value.classList.add('p-10')
  }
}

onMounted(() => {
  const savedContent = localStorage.getItem(STORAGE_KEY)
  if (savedContent) {
    content.value = savedContent
    updateStatus()
    updateSavedTime()
  }

  const savedHistory = localStorage.getItem(HISTORY_KEY)
  if (savedHistory) {
    history.value = JSON.parse(savedHistory)
  }

  const savedFavorites = localStorage.getItem(FAVORITES_KEY)
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites)
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'i' && isBlurred.value) {
      e.preventDefault()
      focusEditor()
    }
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', adjustPadding)
  adjustPadding()
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('resize', adjustPadding)
})
</script>
