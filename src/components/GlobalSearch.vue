<template>
  <Teleport to="body">
    <Transition name="overlay">
      <div v-if="visible" class="global-search-overlay" @click.self="handleClose">
        <Transition name="modal-scale">
          <div v-if="visible" class="global-search-modal" :class="{ 'is-dark': isDark }">
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
              <button class="close-btn" @click="handleClose" title="关闭">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <div class="search-options">
              <label class="option-pill" :class="{ active: caseSensitive }">
                <input type="checkbox" v-model="caseSensitive" @change="performSearch" />
                <span>Aa</span>
              </label>
              <label class="option-pill" :class="{ active: fileNameOnly }">
                <input type="checkbox" v-model="fileNameOnly" @change="performSearch" />
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
                <span>仅文件名</span>
              </label>
              <span class="result-count" :class="{ 'has-results': results.length > 0 }">
                {{ results.length }} 个结果
              </span>
            </div>

            <div class="search-results custom-scrollbar" ref="resultsRef">
              <Transition name="fade" mode="out-in">
                <div v-if="!query" key="empty-init" class="empty-state">
                  <div class="empty-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                    <div class="empty-icon-glow"></div>
                  </div>
                  <p>输入关键词搜索所有文档</p>
                  <span>支持模糊匹配与大小写选项</span>
                </div>

                <div v-else-if="query && results.length === 0" key="empty-result" class="empty-state">
                  <div class="empty-icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <div class="empty-icon-glow"></div>
                  </div>
                  <p>未找到匹配结果</p>
                  <span>尝试其他关键词或调整搜索选项</span>
                </div>

                <div v-else key="results" class="results-list">
                  <div
                    v-for="(result, index) in results"
                    :key="result.fileId"
                    class="result-item"
                    :class="{ active: selectedIndex === index }"
                    :style="{ animationDelay: index * 40 + 'ms' }"
                    @click="handleOpenFile(result.fileId)"
                    @mouseenter="selectedIndex = index"
                  >
                    <div class="result-indicator"></div>
                    <div class="result-content">
                      <div class="result-header">
                        <div class="file-info">
                          <svg class="file-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                          </svg>
                          <span class="file-name" v-html="highlightText(result.fileName)"></span>
                        </div>
                        <div class="result-meta">
                          <span class="match-count">{{ result.matchCount }} 处匹配</span>
                          <button class="open-btn" @click.stop="handleOpenFile(result.fileId)">
                            <span>打开</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div class="result-matches">
                        <div
                          v-for="(match, mIndex) in result.matches.slice(0, 3)"
                          :key="mIndex"
                          class="match-line"
                        >
                          <span v-if="!match.isFileName" class="line-number">{{ match.line + 1 }}</span>
                          <span v-else class="line-badge">文件名</span>
                          <span class="match-preview" v-html="highlightText(match.preview)"></span>
                        </div>
                        <div v-if="result.matches.length > 3" class="more-matches">
                          <span class="more-dot"></span>
                          还有 {{ result.matches.length - 3 }} 处匹配...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Transition>
            </div>

            <div class="search-footer">
              <span class="footer-hint">
                <kbd>Ctrl</kbd> + <kbd>F</kbd> 全局搜索
              </span>
              <div class="footer-decoration"></div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
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
/* 遮罩层 */
.global-search-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 8vh;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* 模态框 */
.global-search-modal {
  width: 680px;
  max-width: calc(100vw - 2rem);
  max-height: 80vh;
  background: var(--search-bg, #fff);
  border-radius: 1rem;
  box-shadow: var(--dialog-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--search-border, #e2e8f0);
}

.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.92) translateY(-10px);
}

.global-search-modal.is-dark {
  --search-bg: #151528;
  --search-border: rgba(99, 102, 241, 0.15);
  --search-input-bg: rgba(30, 41, 59, 0.6);
  --search-input-border: rgba(99, 102, 241, 0.2);
  --search-text: #f1f5f9;
  --search-muted: #64748b;
  --search-item-hover: rgba(99, 102, 241, 0.1);
  --search-item-active: rgba(99, 102, 241, 0.15);
  --search-mark-bg: rgba(251, 191, 36, 0.25);
  --search-mark-text: #fbbf24;
  --search-accent: #6366f1;
}

/* 搜索头部 */
.search-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1rem 0.75rem;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--search-muted, #94a3b8);
  pointer-events: none;
  transition: color 0.2s ease;
}

.search-input-wrapper:focus-within .search-icon {
  color: var(--search-accent, #6366f1);
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid var(--search-input-border, #e2e8f0);
  border-radius: 0.75rem;
  background: var(--search-input-bg, #f8fafc);
  color: var(--search-text, #1e293b);
  font-size: 1rem;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.search-input:focus {
  border-color: var(--search-accent, #6366f1);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(99, 102, 241, 0.2));
}

.search-shortcuts {
  position: absolute;
  right: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: var(--search-muted, #94a3b8);
  pointer-events: none;
}

.search-shortcuts kbd {
  padding: 0.125rem 0.375rem;
  background: var(--search-item-hover, #f1f5f9);
  border-radius: 0.25rem;
  font-family: inherit;
  border: 1px solid var(--search-border, #e2e8f0);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--search-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.close-btn:hover {
  background: var(--search-item-hover, #f1f5f9);
  color: var(--search-text, #1e293b);
  transform: rotate(90deg);
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 搜索选项 */
.search-options {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 1rem 0.75rem;
}

.option-pill {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--search-muted, #64748b);
  cursor: pointer;
  user-select: none;
  padding: 0.375rem 0.75rem;
  border-radius: 9999px;
  background: var(--search-input-bg, #f1f5f9);
  border: 1px solid transparent;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.option-pill:hover {
  background: var(--search-item-hover, #e2e8f0);
  transform: translateY(-1px);
}

.option-pill.active {
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px var(--accent-glow, rgba(99, 102, 241, 0.3));
}

.option-pill input {
  display: none;
}

.option-pill svg {
  width: 0.875rem;
  height: 0.875rem;
}

.result-count {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--search-muted, #64748b);
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: var(--search-input-bg, #f1f5f9);
  transition: all 0.2s ease;
}

.result-count.has-results {
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  box-shadow: 0 2px 8px var(--accent-glow, rgba(99, 102, 241, 0.25));
}

/* 搜索结果 */
.search-results {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
  min-height: 200px;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

/* 空状态 */
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

.empty-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state svg {
  width: 3rem;
  height: 3rem;
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

.empty-icon-glow {
  position: absolute;
  inset: -8px;
  background: radial-gradient(circle, var(--accent-glow, rgba(99, 102, 241, 0.15)) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseGlow 3s ease-in-out infinite;
  pointer-events: none;
}

.empty-state p {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--search-text, #334155);
}

.empty-state span {
  font-size: 0.8125rem;
  opacity: 0.8;
}

/* 结果项 */
.result-item {
  display: flex;
  align-items: stretch;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 0.125rem;
  opacity: 0;
  animation: fadeInUp 0.35s ease forwards;
  position: relative;
  overflow: hidden;
}

.result-item:last-child {
  margin-bottom: 0;
}

.result-indicator {
  width: 3px;
  border-radius: 3px 0 0 3px;
  background: transparent;
  transition: background 0.2s ease;
  flex-shrink: 0;
}

.result-content {
  flex: 1;
  padding: 0.75rem;
}

.result-item:hover {
  background: var(--search-item-hover, #f1f5f9);
}

.result-item:hover .result-indicator {
  background: linear-gradient(180deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
}

.result-item.active {
  background: var(--search-item-active, #f1f5f9);
}

.result-item.active .result-indicator {
  background: linear-gradient(180deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  box-shadow: 0 0 8px var(--accent-glow, rgba(99, 102, 241, 0.3));
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  min-width: 0;
}

.file-icon {
  width: 1rem;
  height: 1rem;
  color: var(--search-accent, #6366f1);
  flex-shrink: 0;
  opacity: 0.7;
}

.file-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--search-text, #1e293b);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.match-count {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--search-muted, #64748b);
  background: var(--search-input-bg, #f1f5f9);
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
}

.open-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.35rem 0.625rem;
  border: none;
  border-radius: 0.375rem;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.open-btn svg {
  width: 0.75rem;
  height: 0.75rem;
  transition: transform 0.2s ease;
}

.result-item:hover .open-btn,
.result-item.active .open-btn {
  opacity: 1;
  transform: translateX(0);
}

.open-btn:hover svg {
  transform: translateX(2px);
}

.open-btn:hover {
  box-shadow: 0 4px 12px var(--accent-glow, rgba(99, 102, 241, 0.3));
}

/* 匹配行 */
.result-matches {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
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
  min-width: 2.5rem;
  font-size: 0.7rem;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--search-muted, #94a3b8);
  opacity: 0.6;
  text-align: right;
}

.line-badge {
  flex-shrink: 0;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--search-accent, #6366f1);
  background: var(--search-item-hover, rgba(99, 102, 241, 0.1));
  padding: 0.1rem 0.375rem;
  border-radius: 0.25rem;
}

.match-preview {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-family: 'SF Mono', 'Fira Code', monospace;
  font-size: 0.78rem;
}

.more-matches {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--search-muted, #64748b);
  font-style: italic;
  padding-left: 3rem;
}

.more-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--search-muted, #94a3b8);
  opacity: 0.5;
}

/* 高亮 */
:deep(mark) {
  background: var(--search-mark-bg, rgba(251, 191, 36, 0.3));
  color: var(--search-mark-text, #92400e);
  padding: 0 0.125rem;
  border-radius: 3px;
  font-weight: 600;
}

/* 底部 */
.search-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.625rem 1rem;
  border-top: 1px solid var(--search-border, #e2e8f0);
  background: var(--search-input-bg, #f8fafc);
  position: relative;
  overflow: hidden;
}

.footer-hint {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.7rem;
  color: var(--search-muted, #64748b);
  z-index: 1;
}

.footer-hint kbd {
  padding: 0.125rem 0.375rem;
  background: var(--search-bg, #fff);
  border: 1px solid var(--search-border, #e2e8f0);
  border-radius: 0.25rem;
  font-family: inherit;
  font-size: 0.7rem;
}

.footer-decoration {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6), transparent);
  opacity: 0.3;
}

/* fade 过渡 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.5;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.1);
  }
}
</style>
