<template>
  <div class="editor-container" :class="{ 'is-dark': isDark }">
    <!-- 标签页 -->
    <EditorTabs
      v-if="showTabs"
      :tabs="tabs"
      :activeTabId="activeTabId"
      :isDark="isDark"
      :get-children="getChildren"
      @closeTab="handleCloseTab"
      @setActiveTab="handleSetActiveTab"
      @closeOtherTabs="handleCloseOtherTabs"
      @closeLeftTabs="handleCloseLeftTabs"
      @closeRightTabs="handleCloseRightTabs"
      @closeAllTabs="handleCloseAllTabs"
      @moveTab="handleMoveTab"
      @togglePinTab="handleTogglePinTab"
      @renameTab="handleRenameTab"
    />

    

    <!-- 主内容区 -->
    <div class="editor-main">
      <!-- 编辑器区域 -->
      <div class="editor-area">
        <!-- 顶部工具栏（保留原有的文件名和主题切换） -->
        <div class="top-bar">
          <div class="top-bar-left">
            <span v-if="currentFile" class="filename">
              {{ currentFile.name }}
            </span>
            <span v-if="currentFile" class="file-info">
              {{ currentFile.content?.length || 0 }} 字符
            </span>
          </div>
          <div class="top-bar-right">
            <!-- 大纲切换 -->
            <button
              @click="showOutline = !showOutline"
              class="icon-btn"
              :class="{ active: showOutline }"
              :title="showOutline ? '隐藏大纲' : '显示大纲'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </button>
            <!-- 全局搜索 -->
            <button
              @click="showGlobalSearch = true"
              class="icon-btn"
              title="全局搜索 (Ctrl+F)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
            </button>
            <!-- 导出 -->
            <div class="export-wrapper">
              <button
                @click="showExportMenu = !showExportMenu"
                class="icon-btn"
                title="导出"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                </svg>
              </button>
              <div v-if="showExportMenu" class="export-menu">
                <div class="export-item" @click="handleExport('md')">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                  </svg>
                  <span>导出 Markdown</span>
                </div>
                <div class="export-item" @click="handleExport('html')">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                  </svg>
                  <span>导出 HTML</span>
                </div>
                <div class="export-item" @click="handleExport('txt')">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                  </svg>
                  <span>导出纯文本</span>
                </div>
                <div class="export-divider"></div>
                <div class="export-item" @click="handleExport('richtext')">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                  <span>复制为富文本</span>
                </div>
              </div>
            </div>
            <!-- 主题切换 -->
            <button
              @click="$emit('toggleTheme')"
              class="icon-btn"
              :title="isDark ? '切换白天模式' : '切换夜间模式'"
            >
              <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
            <!-- 分屏切换 -->
            <button
              @click="toggleSplitMode"
              class="icon-btn"
              :class="{ active: !isFullscreenPreview && isPreviewMode }"
              :title="isFullscreenPreview ? '切换分屏' : '退出分屏'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
              </svg>
            </button>
            <!-- 预览切换 -->
            <button
              @click="togglePreviewMode"
              class="preview-btn"
            >
              <svg v-if="!isPreviewMode" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
              <span>{{ isPreviewMode ? '编辑' : '预览' }}</span>
            </button>
          </div>
        </div>

        <!-- 编辑器内容区 -->
        <div class="editor-content">
          <textarea
            v-show="!isPreviewMode"
            :value="content"
            ref="editorRef"
            class="editor-textarea"
            placeholder="开始输入 Markdown 内容..."
            @input="handleInput"
          ></textarea>

          <div v-show="isPreviewMode" class="preview-container">
            <div
              v-show="!isFullscreenPreview"
              class="split-editor-wrapper"
              :style="{ width: splitPosition + '%' }"
            >
              <textarea
                :value="content"
                ref="splitEditorRef"
                class="editor-textarea split"
                placeholder="开始输入 Markdown 内容..."
                @input="handleInput"
                @scroll="syncPreviewScroll"
              ></textarea>
            </div>

            <div
              v-show="!isFullscreenPreview"
              class="resize-handle"
              :class="{ resizing: isResizing }"
              @mousedown="startResize"
            >
              <div class="resize-indicator"></div>
            </div>

            <div
              class="preview-wrapper markdown-preview"
              :class="{ fullscreen: isFullscreenPreview }"
              :style="previewAreaStyle"
            >
              <div
                ref="previewRef"
                class="preview-content"
                v-html="previewContent"
                @scroll="syncEditorScroll"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 文档大纲 -->
      <DocumentOutline
        v-if="showOutline"
        :content="content"
        :isDark="isDark"
        @scrollToHeading="handleScrollToHeading"
      />
    </div>

    <!-- 全局搜索 -->
    <GlobalSearch
      :visible="showGlobalSearch"
      :isDark="isDark"
      :files="files"
      @close="showGlobalSearch = false"
      @open="handleGlobalSearchOpen"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import 'highlight.js/styles/github-dark.css'
import mermaid from 'mermaid'

import EditorTabs from './EditorTabs.vue'
import DocumentOutline from './DocumentOutline.vue'
import GlobalSearch from './GlobalSearch.vue'

import { useTabs } from '../composables/useTabs.js'
import { exportAsMarkdown, exportAsHTML, exportAsPlainText, copyAsRichText } from '../utils/exportUtils.js'

const props = defineProps({
  content: String,
  currentFile: Object,
  isPreviewMode: Boolean,
  isFullscreenPreview: Boolean,
  splitPosition: Number,
  isResizing: Boolean,
  isDark: Boolean,
  files: { type: Array, default: () => [] }
})

const emit = defineEmits([
  'update:content',
  'togglePreviewMode',
  'toggleFullscreenPreview',
  'exitPreviewMode',
  'startResize',
  'toggleTheme',
  'tabChange',
  'globalSearchOpen',
  'renameFile'
])

const editorRef = ref(null)
const splitEditorRef = ref(null)
const previewRef = ref(null)
const isSyncing = ref(false)


const showOutline = ref(false)
const showExportMenu = ref(false)
const showGlobalSearch = ref(false)
const showTabs = ref(true)

const { tabs, activeTabId, openTab, closeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, closeAllTabs, setActiveTab, setTabDirty, isTabDirty, updateTabName, moveTab, togglePinTab } = useTabs()

function handleGlobalSearchOpen(fileId) {
  emit('globalSearchOpen', fileId)
  showGlobalSearch.value = false
}

const instance = getCurrentInstance()
const getPreviewEl = () => instance?.refs?.previewRef
const getSplitEditorEl = () => instance?.refs?.splitEditorRef

const renderer = new marked.Renderer()

let mermaidIdCounter = 0

function initMermaid(isDark) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? 'dark' : 'default',
    securityLevel: 'loose',
    flowchart: {
      useMaxWidth: false,
      htmlLabels: true,
      curve: 'basis',
      nodeSpacing: 100,
      rankSpacing: 60
    },
    themeVariables: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
      fontSize: '14px'
    }
  })
}

renderer.code = function({ text, lang, escaped }) {
  const isMermaid = lang === 'mermaid'
  const codeHtml = hljs.getLanguage(lang)
    ? hljs.highlight(text, { language: lang }).value
    : hljs.highlightAuto(text).value

  const mermaidClass = isMermaid ? ' mermaid-source' : ''

  return `
    <div class="code-block-wrapper${mermaidClass}" data-lang="${lang || 'text'}" data-raw="${isMermaid ? encodeURIComponent(text) : ''}">
      <div class="code-block-header">
        <span>${lang || 'text'}</span>
        <button
          class="copy-btn"
          onclick="window.copyCode(this)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre><code class="hljs language-${lang || 'text'}">${codeHtml}</code></pre>
    </div>
  `
}

marked.use({
  renderer,
  breaks: true,
  gfm: true
})

const previewContent = computed(() => {
  return marked(props.content || '')
})

const previewAreaStyle = computed(() => {
  if (props.isFullscreenPreview) {
    return { height: '100%', width: '100%' }
  }
  return {
    height: '100%',
    width: `${100 - props.splitPosition}%`,
    flex: '1 1 auto'
  }
})

const handleInput = (e) => {
  emit('update:content', e.target.value)
  if (props.currentFile?.id) {
    setTabDirty(props.currentFile.id, true)
  }
}

const syncPreviewScroll = (e) => {
  if (isSyncing.value || props.isFullscreenPreview) return
  const editor = e.target
  const preview = getPreviewEl()
  if (!preview) return

  isSyncing.value = true
  const maxScrollTop = editor.scrollHeight - editor.clientHeight
  const scrollRatio = maxScrollTop > 0 ? editor.scrollTop / maxScrollTop : 0
  const previewMaxScrollTop = preview.scrollHeight - preview.clientHeight
  preview.scrollTop = scrollRatio * previewMaxScrollTop

  requestAnimationFrame(() => {
    isSyncing.value = false
  })
}

const syncEditorScroll = (e) => {
  if (isSyncing.value || props.isFullscreenPreview) return
  const preview = e.target
  const editor = getSplitEditorEl()
  if (!editor) return

  isSyncing.value = true
  const maxScrollTop = preview.scrollHeight - preview.clientHeight
  const scrollRatio = maxScrollTop > 0 ? preview.scrollTop / maxScrollTop : 0
  const editorMaxScrollTop = editor.scrollHeight - editor.clientHeight
  editor.scrollTop = scrollRatio * editorMaxScrollTop

  requestAnimationFrame(() => {
    isSyncing.value = false
  })
}

const togglePreviewMode = () => {
  if (!props.isPreviewMode) {
    emit('togglePreviewMode')
    emit('toggleFullscreenPreview')
  } else {
    emit('exitPreviewMode')
  }
}
const toggleFullscreenPreview = () => emit('toggleFullscreenPreview')
const exitPreviewMode = () => emit('exitPreviewMode')
const startResize = (e) => emit('startResize', e)

const toggleSplitMode = () => {
  if (!props.isPreviewMode) {
    emit('togglePreviewMode')
  } else {
    emit('toggleFullscreenPreview')
  }
}

let mermaidRenderCount = 0

async function renderMermaid() {
  const previewEl = previewRef.value
  if (!previewEl) return

  const mermaidBlocks = previewEl.querySelectorAll('.mermaid-source:not([data-processed])')
  if (mermaidBlocks.length === 0) return

  for (const block of mermaidBlocks) {
    try {
      const codeEl = block.querySelector('code')
      const text = codeEl ? codeEl.textContent : ''
      const id = 'mermaid-render-' + (++mermaidRenderCount)
      const { svg } = await mermaid.render(id, text)

      const wrapper = document.createElement('div')
      wrapper.className = 'mermaid-wrapper'
      wrapper.innerHTML = '<div class="mermaid-chart">' + svg + '</div>'
      wrapper.setAttribute('data-processed', 'true')

      block.parentNode.insertBefore(wrapper, block)
      block.style.display = 'none'
      block.setAttribute('data-processed', 'true')
    } catch (e) {
      const errorDiv = document.createElement('div')
      errorDiv.className = 'mermaid-error'
      errorDiv.textContent = e.message || 'Mermaid 渲染错误'
      block.parentNode.insertBefore(errorDiv, block)
      block.setAttribute('data-processed', 'true')
    }
  }
}

watch(
  () => [props.content, props.isPreviewMode, props.isFullscreenPreview, props.isDark],
  () => {
    if (props.isPreviewMode) {
      nextTick(() => {
        initMermaid(props.isDark)
        renderMermaid()
      })
    }
  },
  { immediate: false }
)

function handleCloseTab(fileId) {
  closeTab(fileId)
}

function handleRenameTab({ fileId, newName }) {
  emit('renameFile', { fileId, newName })
}

function handleSetActiveTab(fileId) {
  setActiveTab(fileId)
  emit('tabChange', fileId)
}

function handleCloseOtherTabs(fileId) {
  closeOtherTabs(fileId)
}

function handleCloseLeftTabs(fileId) {
  closeLeftTabs(fileId)
}

function handleCloseRightTabs(fileId) {
  closeRightTabs(fileId)
}

function handleCloseAllTabs() {
  closeAllTabs()
}

function handleMoveTab(fromIndex, toIndex) {
  moveTab(fromIndex, toIndex)
}

function handleTogglePinTab(fileId) {
  togglePinTab(fileId)
}

function handleScrollToHeading({ heading }) {
  const preview = getPreviewEl()
  if (!preview) return

  const headings = preview.querySelectorAll('h1, h2, h3, h4, h5, h6')
  for (const h of headings) {
    if (h.textContent.trim() === heading.text) {
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
      break
    }
  }
}

function handleExport(format) {
  showExportMenu.value = false
  const fileName = props.currentFile?.name || 'document.md'

  switch (format) {
    case 'md':
      exportAsMarkdown(props.content, fileName)
      break
    case 'html':
      exportAsHTML(props.content, fileName, { isDark: props.isDark })
      break
    case 'txt':
      exportAsPlainText(props.content, fileName)
      break
    case 'richtext':
      copyAsRichText(props.content).then(() => {
        alert('已复制为富文本到剪贴板')
      })
      break
  }
}

watch(() => props.currentFile, (newFile) => {
  if (newFile) {
    openTab(newFile.id, newFile.name)
  }
}, { immediate: true })

watch(() => props.currentFile?.name, (newName) => {
  if (props.currentFile?.id && newName) {
    updateTabName(props.currentFile.id, newName)
  }
})

onMounted(() => {
  initMermaid(props.isDark)

  window.copyCode = function(btn) {
    const codeBlock = btn.closest('.code-block-wrapper')
    const code = codeBlock.querySelector('code')
    const text = code.innerText
    navigator.clipboard.writeText(text).then(() => {
      const span = btn.querySelector('span')
      const originalText = span.textContent
      span.textContent = '已复制'
      btn.classList.add('text-emerald-400')
      setTimeout(() => {
        span.textContent = originalText
        btn.classList.remove('text-emerald-400')
      }, 2000)
    })
  }

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
      e.preventDefault()
      showGlobalSearch.value = true
    }
  })

  document.addEventListener('click', (e) => {
    if (showExportMenu.value && !e.target.closest('.export-wrapper')) {
      showExportMenu.value = false
    }
  })
})

defineExpose({ editorRef, splitEditorRef })
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--editor-bg, #fff);
  position: relative;
}

.editor-container.is-dark {
  --editor-bg: #0f172a;
  --top-bar-bg: #0f172a;
  --top-bar-border: #334155;
  --text-primary: #f1f5f9;
  --text-muted: #94a3b8;
  --icon-btn-bg: #1e293b;
  --icon-btn-hover: #334155;
  --icon-btn-active: #3b82f6;
  --divider: #334155;
  --menu-bg: #1e293b;
  --menu-border: #334155;
  --menu-hover: #334155;
}

.editor-main {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.editor-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--top-bar-border, #e5e7eb);
  background: var(--top-bar-bg, #fafafa);
  flex-shrink: 0;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filename {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary, #111827);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-info {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-muted, #6b7280);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: var(--icon-btn-hover, #f3f4f6);
  color: var(--text-primary, #111827);
}

.icon-btn.active {
  background: var(--icon-btn-active, #dbeafe);
  color: #2563eb;
}

.icon-btn svg {
  width: 1rem;
  height: 1rem;
}

.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: var(--icon-btn-bg, #f3f4f6);
  color: var(--text-primary, #111827);
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.preview-btn:hover {
  background: var(--icon-btn-hover, #e5e7eb);
}

.preview-btn svg {
  width: 1rem;
  height: 1rem;
}

.export-wrapper {
  position: relative;
}

.export-menu {
  position: absolute;
  top: calc(100% + 4px);
  right: 0;
  min-width: 180px;
  padding: 0.375rem;
  background: var(--menu-bg, #fff);
  border: 1px solid var(--menu-border, #e5e7eb);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 50;
}

.export-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--text-primary, #111827);
  transition: background 0.15s ease;
}

.export-item:hover {
  background: var(--menu-hover, #f3f4f6);
}

.export-item svg {
  width: 1rem;
  height: 1rem;
  color: var(--text-muted, #6b7280);
}

.export-divider {
  height: 1px;
  margin: 0.375rem 0;
  background: var(--menu-border, #e5e7eb);
}

.editor-content {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}

.editor-textarea {
  width: 100%;
  height: 100%;
  padding: 1.5rem;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--text-primary, #111827);
}

.editor-textarea.split {
  padding: 1rem;
  font-size: 0.875rem;
}

.preview-container {
  display: flex;
  width: 100%;
  height: 100%;
}

.split-editor-wrapper {
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  background: var(--divider, #e5e7eb);
  transition: background 0.15s ease;
}

.resize-handle:hover,
.resize-handle.resizing {
  background: #3b82f6;
}

.resize-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 32px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.3;
}

.preview-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-wrapper.fullscreen {
  width: 100% !important;
  flex: none !important;
}

.preview-toolbar {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.preview-wrapper:hover .preview-toolbar {
  opacity: 1;
  pointer-events: auto;
}

.toolbar-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  border: 1px solid var(--menu-border, #e5e7eb);
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  color: var(--text-muted, #6b7280);
  cursor: pointer;
  transition: all 0.15s ease;
}

.toolbar-icon-btn:hover {
  background: var(--menu-hover, #f3f4f6);
  color: var(--text-primary, #111827);
  border-color: #3b82f6;
}

.toolbar-icon-btn svg {
  width: 1rem;
  height: 1rem;
}

.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

:deep(.code-block-header) {
  opacity: 0;
  transition: opacity 0.2s;
}

:deep(.code-block-wrapper:hover .code-block-header) {
  opacity: 1;
}

:deep(.copy-btn) {
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  transition: all 0.15s ease;
}

:deep(.hljs) {
  border-radius: 8px;
}

:deep(.mermaid-wrapper) {
  margin: 1.5em 0;
  padding: 1.5em;
  background: var(--preview-bg, #fafafa);
  border: 1px solid var(--border-color, #e5e7eb);
  border-radius: 12px;
  overflow-x: auto;
  overflow-y: auto;
  min-height: 120px;
}

:deep(.mermaid-chart) {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80px;
}

:deep(.mermaid-chart svg) {
  max-width: none !important;
  width: auto !important;
  height: auto !important;
  min-width: 100%;
}

:deep(.mermaid-error) {
  color: #ef4444;
  font-size: 0.875rem;
  padding: 1em;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
}
</style>
