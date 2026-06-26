<template>
  <Teleport to="body">
    <div v-if="visible" class="global-search-overlay" @click.self="handleClose">
      <div class="global-search-modal" :class="{ 'is-dark': isDark }">
        <div class="search-header">
          <div class="search-input-wrapper">
            <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              class="search-input"
              placeholder="搜索所有文档内容..."
              @input="performSearch"
              @keydown.enter="handleEnter"
              @keydown.escape="handleClose"
              @keydown.ArrowDown.prevent="nextResult"
              @keydown.ArrowUp.prevent="prevResult"
            />
            <div v-if="query" class="search-shortcuts">
              <kbd>↑↓</kbd> 导航
              <kbd>Enter</kbd> 打开
              <kbd>Esc</kbd> 关闭
            </div>
          </div>
          <button class="close-btn" @click="handleClose">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="search-options">
          <label class="option-item" :class="{ active: caseSensitive }">
            <input type="checkbox" v-model="caseSensitive" @change="performSearch" />
            <span>区分大小写</span>
          </label>
          <label class="option-item" :class="{ active: fileNameOnly }">
            <input type="checkbox" v-model="fileNameOnly" @change="performSearch" />
            <span>仅文件名</span>
          </label>
          <span class="result-count">
            {{ results.length }} 个结果
          </span>
        </div>

        <div class="search-results" ref="resultsRef">
          <div v-if="!query" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <p>输入关键词搜索所有文档</p>
            <span>支持模糊匹配</span>
          </div>

          <div v-else-if="query && results.length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <p>未找到匹配结果</p>
            <span>尝试其他关键词</span>
          </div>

          <template v-else>
            <div
              v-for="(result, index) in results"
              :key="result.fileId"
              class="result-item"
              :class="{ active: selectedIndex === index }"
              @click="handleOpenFile(result.fileId)"
              @mouseenter="selectedIndex = index"
            >
              <div class="result-header">
                <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span class="file-name" v-html="highlightText(result.fileName)"></span>
                <span class="match-count">{{ result.matchCount }} 处匹配</span>
                <button class="open-btn" @click.stop="handleOpenFile(result.fileId)">打开</button>
              </div>

              <div class="result-matches">
                <div
                  v-for="(match, mIndex) in result.matches.slice(0, 3)"
                  :key="mIndex"
                  class="match-line"
                >
                  <span v-if="!match.isFileName" class="line-number">行 {{ match.line + 1 }}</span>
                  <span class="match-preview" v-html="highlightText(match.preview)"></span>
                </div>
                <div v-if="result.matches.length > 3" class="more-matches">
                  还有 {{ result.matches.length - 3 }} 处匹配...
                </div>
              </div>
            </div>
          </template>
        </div>

        <div class="search-footer">
          <span><kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>F</kbd> 全局搜索</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  files: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'open'])

const inputRef = ref(null)
const resultsRef = ref(null)
const query = ref('')
const results = ref([])
const selectedIndex = ref(0)
const caseSensitive = ref(false)
const fileNameOnly = ref(false)

function performSearch() {
  const q = query.value.trim()
  if (!q) {
    results.value = []
    selectedIndex.value = 0
    return
  }

  const allFiles = props.files || []
  const searchResults = []
  const lowerQuery = q.toLowerCase()

  for (const file of allFiles) {
    if (file.type !== 'file') continue

    const matches = []
    let matchCount = 0

    if (fileNameOnly.value) {
      const name = caseSensitive.value ? file.name : file.name.toLowerCase()
      const targetQuery = caseSensitive.value ? q : lowerQuery

      if (name.includes(targetQuery)) {
        matches.push({
          line: 0,
          content: file.name,
          preview: file.name,
          isFileName: true
        })
        matchCount = 1
      }
    } else {
      const content = file.content || ''
      const lines = content.split('\n')

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]
        const lowerLine = line.toLowerCase()
        const targetLine = caseSensitive.value ? line : lowerLine
        const targetQuery = caseSensitive.value ? q : lowerQuery

        if (targetLine.includes(targetQuery)) {
          const idx = targetLine.indexOf(targetQuery)
          const start = Math.max(0, idx - 20)
          const end = Math.min(line.length, idx + q.length + 20)
          let preview = line.substring(start, end)
          if (start > 0) preview = '...' + preview
          if (end < line.length) preview = preview + '...'

          matches.push({
            line: i,
            content: line,
            preview: preview
          })
          matchCount++
        }
      }

      const name = caseSensitive.value ? file.name : file.name.toLowerCase()
      if (name.includes(lowerQuery)) {
        matches.unshift({
          line: 0,
          content: file.name,
          preview: file.name,
          isFileName: true
        })
        matchCount++
      }
    }

    if (matches.length > 0) {
      searchResults.push({
        fileId: file.id,
        fileName: file.name,
        matches,
        matchCount
      })
    }
  }

  searchResults.sort((a, b) => {
    const aInName = caseSensitive.value
      ? a.fileName.includes(q)
      : a.fileName.toLowerCase().includes(lowerQuery)
    const bInName = caseSensitive.value
      ? b.fileName.includes(q)
      : b.fileName.toLowerCase().includes(lowerQuery)

    if (aInName && !bInName) return -1
    if (!aInName && bInName) return 1
    return b.matchCount - a.matchCount
  })

  results.value = searchResults
  selectedIndex.value = 0
}

function highlightText(text) {
  if (!query.value || !text) return text

  const q = query.value
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const flags = caseSensitive.value ? 'g' : 'gi'
  const pattern = new RegExp(`(${escaped})`, flags)
  return text.replace(pattern, '<mark>$1</mark>')
}

function handleEnter() {
  if (results.value.length > 0) {
    const result = results.value[selectedIndex.value]
    if (result) {
      handleOpenFile(result.fileId)
    }
  }
}

function nextResult() {
  if (results.value.length === 0) return
  selectedIndex.value = (selectedIndex.value + 1) % results.value.length
  scrollToSelected()
}

function prevResult() {
  if (results.value.length === 0) return
  selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
  scrollToSelected()
}

function scrollToSelected() {
  nextTick(() => {
    const container = resultsRef.value
    if (!container) return

    const activeItem = container.querySelector('.result-item.active')
    if (activeItem) {
      activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  })
}

function handleOpenFile(fileId) {
  emit('open', fileId)
  handleClose()
}

function handleClose() {
  query.value = ''
  results.value = []
  selectedIndex.value = 0
  emit('close')
}

watch(() => props.visible, (val) => {
  if (val) {
    query.value = ''
    results.value = []
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
})

watch(() => props.files, () => {
  if (query.value) {
    performSearch()
  }
}, { deep: true })
</script>

<style scoped>
.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 10vh;
  animation: fadeIn 0.15s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.global-search-modal {
  width: 640px;
  max-width: calc(100vw - 2rem);
  max-height: 75vh;
  background: var(--search-bg, #fff);
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideDown 0.2s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.global-search-modal.is-dark {
  --search-bg: #1e293b;
  --search-border: #334155;
  --search-input-bg: #0f172a;
  --search-input-border: #334155;
  --search-text: #f1f5f9;
  --search-muted: #64748b;
  --search-item-hover: #334155;
  --search-item-active: rgba(59, 130, 246, 0.2);
  --search-mark-bg: rgba(251, 191, 36, 0.3);
  --search-mark-text: #fbbf24;
}

.search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid var(--search-border, #e2e8f0);
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--search-muted, #94a3b8);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid var(--search-input-border, #e2e8f0);
  border-radius: 0.5rem;
  background: var(--search-input-bg, #f8fafc);
  color: var(--search-text, #1e293b);
  font-size: 1rem;
  outline: none;
  transition: border-color 0.15s ease;
}

.search-input:focus {
  border-color: #3b82f6;
}

.search-shortcuts {
  position: absolute;
  right: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: var(--search-muted, #94a3b8);
}

.search-shortcuts kbd {
  padding: 0.125rem 0.375rem;
  background: var(--search-item-hover, #f1f5f9);
  border-radius: 0.25rem;
  font-family: inherit;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--search-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--search-item-hover, #f1f5f9);
  color: var(--search-text, #1e293b);
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.search-options {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--search-border, #e2e8f0);
  background: var(--search-input-bg, #f8fafc);
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  color: var(--search-muted, #64748b);
  cursor: pointer;
  user-select: none;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.option-item:hover {
  background: var(--search-item-hover, #f1f5f9);
}

.option-item.active {
  color: #3b82f6;
}

.option-item input {
  display: none;
}

.result-count {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--search-muted, #64748b);
}

.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 3rem 1rem;
  color: var(--search-muted, #94a3b8);
  text-align: center;
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  opacity: 0.5;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--search-text, #334155);
}

.empty-state span {
  font-size: 0.8125rem;
}

.result-item {
  padding: 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.15s ease;
  margin-bottom: 0.25rem;
}

.result-item:hover,
.result-item.active {
  background: var(--search-item-active, #f1f5f9);
}

.result-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.file-icon {
  width: 1rem;
  height: 1rem;
  color: var(--search-muted, #64748b);
  flex-shrink: 0;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--search-text, #1e293b);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.match-count {
  font-size: 0.7rem;
  color: var(--search-muted, #64748b);
  background: var(--search-item-hover, #f1f5f9);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
}

.open-btn {
  padding: 0.25rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: #3b82f6;
  color: #fff;
  font-size: 0.75rem;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
}

.result-item:hover .open-btn,
.result-item.active .open-btn {
  opacity: 1;
}

.open-btn:hover {
  background: #2563eb;
}

.result-matches {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-left: 1.5rem;
}

.match-line {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.8125rem;
  color: var(--search-muted, #64748b);
  line-height: 1.5;
}

.line-number {
  flex-shrink: 0;
  min-width: 3rem;
  font-size: 0.7rem;
  opacity: 0.7;
}

.match-preview {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.more-matches {
  font-size: 0.75rem;
  color: var(--search-muted, #64748b);
  font-style: italic;
}

:deep(mark) {
  background: var(--search-mark-bg, rgba(251, 191, 36, 0.3));
  color: var(--search-mark-text, #92400e);
  padding: 0 0.125rem;
  border-radius: 2px;
}

.search-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--search-border, #e2e8f0);
  background: var(--search-input-bg, #f8fafc);
  font-size: 0.7rem;
  color: var(--search-muted, #64748b);
}

.search-footer kbd {
  padding: 0.125rem 0.375rem;
  background: var(--search-bg, #fff);
  border: 1px solid var(--search-border, #e2e8f0);
  border-radius: 0.25rem;
  font-family: inherit;
}
</style>
