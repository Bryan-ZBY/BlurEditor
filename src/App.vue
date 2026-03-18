<template>
  <div class="relative">
    <textarea
      v-model="content"
      ref="editorRef"
      class="fullscreen bg-editor-bg text-editor-text font-mono text-sm md:text-base p-6 md:p-10"
      :class="{ 'blur-effect': isBlurred, 'no-blur': !isBlurred }"
      placeholder="点击开始输入内容... (双击ESC键退出编辑)"
      @keydown="handleKeydown"
      @input="handleInput"
      @click="handleClick"
      @focus="handleFocus"
      @blur="handleBlur"
      @keyup="updateStatus"
    ></textarea>

    <div
      id="save-toast"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 z-50"
      :class="{ 'opacity-100 translate-y-0': showSaveToast, 'opacity-0 translate-y-[-20px]': !showSaveToast }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
      <span>保存成功！内容已更新到历史记录</span>
    </div>

    <div
      id="favorite-toast"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 transition-all duration-300 z-50"
      :class="{ 'opacity-100 translate-y-0': showFavoriteToast, 'opacity-0 translate-y-[-20px]': !showFavoriteToast }"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
      <span>已添加到收藏！</span>
    </div>

    <div
      class="statusbar fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-sm text-gray-400 px-6 py-2 flex flex-wrap gap-4 justify-between items-center z-40"
      :class="{ 'statusbar-visible': showStatusbar }"
    >
      <div class="flex flex-wrap gap-4">
        <span id="char-count">{{ charCount }} 字符</span>
        <span id="word-count">{{ wordCount }} 单词</span>
        <span id="line-count">{{ lineCount }} 行</span>
        <span id="cursor-position">行:{{ currentLine }}, 列:{{ currentColumn }}</span>
      </div>
      <div class="flex items-center gap-4">
        <span id="last-saved">保存于 {{ lastSavedTime }}</span>
        <button id="show-history" class="px-3 py-1 rounded bg-gray-800 hover:bg-gray-700 transition text-sm">历史</button>
        <button id="show-favorites" class="px-3 py-1 rounded bg-yellow-800 hover:bg-yellow-700 transition text-sm">收藏</button>
      </div>
    </div>

    <div
      class="history-panel fixed top-0 right-0 h-full bg-black/95 border-l border-gray-800 z-50"
      :class="{ 'history-panel-visible': showHistoryPanel }"
    >
      <div class="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 class="text-white font-medium">记录管理</h3>
        <button id="close-history" class="text-gray-400 hover:text-white text-xl">&times;</button>
      </div>
      <div class="flex border-b border-gray-800">
        <button
          id="history-tab"
          class="tab-btn flex-1"
          :class="{ active: activeTab === 'history' }"
          @click="activeTab = 'history'"
        >
          历史记录
        </button>
        <button
          id="favorites-tab"
          class="tab-btn flex-1"
          :class="{ active: activeTab === 'favorites' }"
          @click="activeTab = 'favorites'"
        >
          我的收藏
        </button>
      </div>
      <div id="history-tab-content" class="tab-content" :class="{ active: activeTab === 'history' }">
        <div id="history-list" class="p-2 space-y-2">
          <div v-if="history.length === 0" class="text-gray-500 text-center py-4">暂无历史记录</div>
          <div
            v-else
            v-for="record in history"
            :key="record.id"
            class="history-item p-3 rounded cursor-pointer bg-history-bg"
            @click="showHistoryModal(record)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-400">{{ record.date }}</span>
                  <div class="flex space-x-2">
                    <span class="history-badge text-xs px-2 py-1 rounded">{{ record.charCount }}字</span>
                    <span class="history-badge text-xs px-2 py-1 rounded">{{ record.wordCount }}词</span>
                  </div>
                </div>
                <div class="history-content text-sm text-gray-200 mt-1">{{ truncateText(record.content) }}</div>
              </div>
              <button
                class="delete-btn ml-2 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition"
                @click.stop="deleteHistory(record.id)"
                title="删除记录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div id="favorites-tab-content" class="tab-content" :class="{ active: activeTab === 'favorites' }">
        <div id="favorite-list" class="p-2 space-y-2">
          <div v-if="favorites.length === 0" class="text-gray-500 text-center py-4">暂无收藏内容</div>
          <div
            v-else
            v-for="record in favorites"
            :key="record.id"
            class="favorite-item p-3 rounded cursor-pointer bg-favorite-bg"
            @click="showFavoriteModal(record)"
          >
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-xs text-gray-400">{{ record.date }}</span>
                  <div class="flex space-x-2">
                    <span class="favorite-badge text-xs px-2 py-1 rounded">{{ record.charCount }}字</span>
                    <span class="favorite-badge text-xs px-2 py-1 rounded">{{ record.wordCount }}词</span>
                  </div>
                </div>
                <div class="favorite-content text-sm text-gray-200 mt-1">{{ truncateText(record.content) }}</div>
              </div>
              <button
                class="delete-btn ml-2 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition"
                @click.stop="deleteFavorite(record.id)"
                title="删除记录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      id="history-modal"
      class="modal fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
      :class="{ 'modal-visible': showHistoryModalFlag }"
      @click.self="closeHistoryModal"
    >
      <div class="bg-black border border-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col modal-content">
        <div class="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 id="modal-title" class="text-white font-medium">历史记录预览</h3>
          <button id="close-modal" class="text-gray-400 hover:text-white text-xl" @click="closeHistoryModal">&times;</button>
        </div>
        <div id="history-preview" class="flex-1 overflow-y-auto p-4 bg-gray-900 font-mono text-sm text-gray-200 whitespace-pre-wrap">{{ currentHistoryPreview }}</div>
        <div class="flex justify-between items-center p-4 bg-gray-900 border-t border-gray-800">
          <div class="text-xs text-gray-400" id="history-time">{{ currentHistoryTime }}</div>
          <div class="flex space-x-3">
            <button id="copy-content" class="copy-btn border border-gray-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition flex items-center space-x-1" @click="copyCurrentContent">
              <span>复制</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
            <button id="delete-history" class="delete-btn px-4 py-2 rounded text-sm font-medium" @click="deleteCurrentRecord">删除</button>
            <button id="apply-history" class="bg-editor-accent px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition" @click="applyHistory">应用到编辑器</button>
          </div>
        </div>
      </div>
    </div>

    <div
      id="favorite-modal"
      class="modal fixed inset-0 bg-black/80 flex items-center justify-center z-[1000] p-4"
      :class="{ 'modal-visible': showFavoriteModalFlag }"
      @click.self="closeFavoriteModal"
    >
      <div class="bg-black border border-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] flex flex-col modal-content">
        <div class="flex justify-between items-center p-4 border-b border-gray-800">
          <h3 id="favorite-modal-title" class="text-white font-medium">收藏预览</h3>
          <button id="close-favorite-modal" class="text-gray-400 hover:text-white text-xl" @click="closeFavoriteModal">&times;</button>
        </div>
        <div id="favorite-preview" class="flex-1 overflow-y-auto p-4 bg-modal-content-bg font-mono text-sm text-gray-200 whitespace-pre-wrap">{{ currentFavoritePreview }}</div>
        <div class="flex justify-between items-center p-4 bg-modal-content-bg border-t border-gray-700">
          <div class="text-xs text-gray-400" id="favorite-time">{{ currentFavoriteTime }}</div>
          <div class="flex space-x-3">
            <button id="copy-favorite" class="copy-btn border border-gray-600 px-4 py-2 rounded text-sm font-medium hover:bg-gray-700 transition flex items-center space-x-1" @click="copyCurrentContent">
              <span>复制</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            </button>
            <button id="delete-favorite" class="delete-btn px-4 py-2 rounded text-sm font-medium" @click="deleteCurrentRecord">删除收藏</button>
            <button id="apply-favorite" class="bg-editor-accent px-4 py-2 rounded text-sm font-medium hover:bg-blue-600 transition" @click="applyFavorite">应用到编辑器</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

const content = ref('')
const editorRef = ref(null)
const isBlurred = ref(true)
const showStatusbar = ref(false)
const showHistoryPanel = ref(false)
const showHistoryModalFlag = ref(false)
const showFavoriteModalFlag = ref(false)
const showSaveToast = ref(false)
const showFavoriteToast = ref(false)
const activeTab = ref('history')

const HISTORY_KEY = 'editor_history'
const FAVORITES_KEY = 'editor_favorites'
const STORAGE_KEY = 'editor_content'
const MAX_HISTORY_ITEMS = 50
const AUTO_SAVE_INTERVAL = 10000

const history = ref(JSON.parse(localStorage.getItem(HISTORY_KEY)) || [])
const favorites = ref(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [])

let lastEscPressTime = 0
const escDoublePressThreshold = 300
let autoSaveTimer = null

let currentHistoryId = null
let currentFavoriteId = null
let currentModalType = null

const charCount = computed(() => content.value.length)

const wordCount = computed(() => {
  return content.value.trim() ? content.value.trim().split(/\s+/).length : 0
})

const lineCount = computed(() => {
  return content.value ? content.value.split('\n').length : 1
})

const currentLine = ref(1)
const currentColumn = ref(1)

const lastSavedTime = ref('')

const currentHistoryPreview = ref('')
const currentHistoryTime = ref('')
const currentFavoritePreview = ref('')
const currentFavoriteTime = ref('')

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
    alert('内容为空，无法添加到收藏！')
    return
  }

  const isAlreadyFavorite = favorites.value.some(fav => fav.content === currentContent)
  if (isAlreadyFavorite) {
    alert('该内容已经存在于收藏列表中！')
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

const showHistoryModal = (record) => {
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

const showFavoriteModal = (record) => {
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

  navigator.clipboard.writeText(contentToCopy)
}

const deleteCurrentRecord = () => {
  if (currentModalType === 'history' && currentHistoryId) {
    deleteHistory(currentHistoryId)
  } else if (currentModalType === 'favorite' && currentFavoriteId) {
    deleteFavorite(currentFavoriteId)
  }
}

const handleKeydown = (e) => {
  if (e.altKey && e.key === 'h') {
    e.preventDefault()
    showHistoryPanel.value = true
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
    }

    const now = Date.now()
    if (now - lastEscPressTime < escDoublePressThreshold) {
      if (editorRef.value) {
        editorRef.value.blur()
      }
      showHistoryPanel.value = false
      closeHistoryModal()
      closeFavoriteModal()
    }
    lastEscPressTime = now
  }

  updateStatus()
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

const handleClick = () => {
  updateStatus()
  if (showHistoryPanel.value) {
    showHistoryPanel.value = false
  }
}

const handleFocus = () => {
  isBlurred.value = false
  showStatusbar.value = true
}

const handleBlur = () => {
  isBlurred.value = true
  showStatusbar.value = false
  addHistoryRecord()
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

const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value
}

const truncateText = (text) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

onMounted(() => {
  const savedContent = localStorage.getItem(STORAGE_KEY)
  if (savedContent) {
    content.value = savedContent
    updateStatus()
    updateSavedTime()
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
