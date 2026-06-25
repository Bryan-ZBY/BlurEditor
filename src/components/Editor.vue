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
        <!-- 顶部工具栏 -->
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
              <Transition name="menu">
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
              </Transition>
            </div>
            <!-- 主题切换 -->
            <button
              @click="$emit('toggleTheme')"
              class="icon-btn"
              :title="isDark ? '切换白天模式' : '切换夜间模式'"
            >
              <Transition name="spin" mode="out-in">
                <svg v-if="isDark" key="dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg v-else key="light" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
              </Transition>
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
              <Transition name="spin" mode="out-in">
                <svg v-if="!isPreviewMode" key="edit" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                </svg>
                <svg v-else key="preview" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </Transition>
              <span>{{ isPreviewMode ? '编辑' : '预览' }}</span>
            </button>
          </div>
        </div>

        <!-- 编辑器内容区 -->
        <div class="editor-content">
          <Transition name="crossfade" mode="out-in">
            <textarea
              v-if="!isPreviewMode"
              :value="content"
              ref="editorRef"
              class="editor-textarea"
              placeholder="开始输入 Markdown 内容..."
              @input="handleInput"
              key="editor"
            ></textarea>

            <div v-else class="preview-container" key="preview">
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
                <div class="resize-glow"></div>
              </div>

              <div
                class="preview-wrapper markdown-preview"
                :class="{ fullscreen: isFullscreenPreview }"
                :style="previewAreaStyle"
              >
                <div
                  ref="previewRef"
                  class="preview-content custom-scrollbar"
                  v-html="previewContent"
                  @scroll="syncEditorScroll"
                ></div>
              </div>
            </div>
          </Transition>
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

// 动态加载 highlight.js 主题
let hljsStyleEl = null
function loadHljsTheme(isDark) {
  if (hljsStyleEl) {
    hljsStyleEl.remove()
  }
  const theme = isDark ? 'github-dark' : 'github'
  import(`../../node_modules/highlight.js/styles/${theme}.css`).then(() => {
    // CSS 已加载
  }).catch(() => {
    // 回退：创建 link 标签
    hljsStyleEl = document.createElement('link')
    hljsStyleEl.rel = 'stylesheet'
    hljsStyleEl.href = `https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${theme}.min.css`
    document.head.appendChild(hljsStyleEl)
  })
}

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
  loadHljsTheme(props.isDark)

  window.copyCode = function(btn) {
    const codeBlock = btn.closest('.code-block-wrapper')
    const code = codeBlock.querySelector('code')
    const text = code.innerText
    navigator.clipboard.writeText(text).then(() => {
      const span = btn.querySelector('span')
      const originalText = span.textContent
      span.textContent = '已复制'
      btn.classList.add('copied')
      setTimeout(() => {
        span.textContent = originalText
        btn.classList.remove('copied')
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

// 监听主题变化，切换 highlight.js 样式
watch(() => props.isDark, (newVal) => {
  loadHljsTheme(newVal)
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
  overflow: hidden;
}

.editor-container.is-dark {
  --editor-bg: #0f0f1a;
  --top-bar-bg: rgba(15, 15, 26, 0.85);
  --top-bar-border: rgba(99, 102, 241, 0.15);
  --text-primary: #f1f5f9;
  --text-muted: #64748b;
  --icon-btn-bg: rgba(30, 41, 59, 0.6);
  --icon-btn-hover: rgba(51, 65, 85, 0.8);
  --icon-btn-active: rgba(99, 102, 241, 0.25);
  --divider: rgba(99, 102, 241, 0.2);
  --menu-bg: rgba(21, 21, 40, 0.95);
  --menu-border: rgba(99, 102, 241, 0.2);
  --menu-hover: rgba(99, 102, 241, 0.12);
  --preview-bg: #12121f;
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

/* 顶部工具栏 - 玻璃态 */
.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--top-bar-border, #e5e7eb);
  background: var(--top-bar-bg, rgba(250, 251, 252, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  flex-shrink: 0;
  position: relative;
  z-index: 10;
}

.top-bar-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filename {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary, #111827);
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  letter-spacing: -0.01em;
}

.file-info {
  font-size: 0.75rem;
  color: var(--text-muted, #6b7280);
  padding: 0.15rem 0.5rem;
  background: var(--hover-bg, rgba(0,0,0,0.03));
  border-radius: 9999px;
  font-variant-numeric: tabular-nums;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

/* 图标按钮 - 精致动画 */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  background: transparent;
  color: var(--text-muted, #6b7280);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.icon-btn::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, var(--accent-glow, rgba(99,102,241,0.15)) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.icon-btn:hover {
  background: var(--icon-btn-hover, rgba(0,0,0,0.05));
  color: var(--text-primary, #111827);
  border-color: var(--border-color, rgba(0,0,0,0.08));
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.icon-btn:hover::after {
  opacity: 1;
}

.icon-btn:active {
  transform: translateY(0);
}

.icon-btn.active {
  background: var(--icon-btn-active, rgba(99, 102, 241, 0.15));
  color: var(--accent-indigo, #6366f1);
  border-color: var(--accent-indigo, #6366f1);
  box-shadow: 0 0 12px var(--accent-glow, rgba(99,102,241,0.2));
}

.icon-btn svg {
  width: 1.1rem;
  height: 1.1rem;
  position: relative;
  z-index: 1;
}

/* 预览按钮 - 渐变背景 */
.preview-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.45rem 0.875rem;
  border: 1px solid transparent;
  border-radius: 0.625rem;
  background: var(--icon-btn-bg, rgba(0,0,0,0.04));
  color: var(--text-primary, #111827);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.preview-btn::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.1) 100%);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.preview-btn:hover {
  background: var(--icon-btn-hover, rgba(0,0,0,0.06));
  border-color: var(--border-color, rgba(0,0,0,0.1));
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.preview-btn:hover::before {
  opacity: 1;
}

.preview-btn:active {
  transform: translateY(0);
}

.preview-btn svg {
  width: 1.1rem;
  height: 1.1rem;
  position: relative;
  z-index: 1;
}

.preview-btn span {
  position: relative;
  z-index: 1;
}

/* 导出菜单 */
.export-wrapper {
  position: relative;
}

.export-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  padding: 0.5rem;
  background: var(--menu-bg, #fff);
  border: 1px solid var(--menu-border, #e5e7eb);
  border-radius: 0.75rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.05);
  z-index: 50;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.export-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.875rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary, #111827);
  transition: all 0.15s ease;
}

.export-item:hover {
  background: var(--menu-hover, rgba(0,0,0,0.04));
  transform: translateX(2px);
}

.export-item svg {
  width: 1.1rem;
  height: 1.1rem;
  color: var(--text-muted, #6b7280);
  transition: color 0.15s ease;
}

.export-item:hover svg {
  color: var(--accent-indigo, #6366f1);
}

.export-divider {
  height: 1px;
  margin: 0.375rem 0.5rem;
  background: var(--menu-border, #e5e7eb);
}

/* 菜单动画 */
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: top right;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}

/* 图标旋转动画 */
.spin-enter-active,
.spin-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.spin-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.8);
}

.spin-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.8);
}

/* 编辑器内容区 */
.editor-content {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
  overflow: hidden;
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
  tab-size: 2;
}

.editor-textarea.split {
  padding: 1rem;
  font-size: 0.875rem;
}

/* 交叉淡入淡出 */
.crossfade-enter-active,
.crossfade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.crossfade-enter-from {
  opacity: 0;
  transform: translateX(8px);
}

.crossfade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
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

/* 拖拽手柄 - 发光效果 */
.resize-handle {
  width: 5px;
  cursor: col-resize;
  flex-shrink: 0;
  position: relative;
  background: var(--divider, #e5e7eb);
  transition: background 0.2s ease, box-shadow 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resize-handle:hover,
.resize-handle.resizing {
  background: var(--accent-indigo, #6366f1);
  box-shadow: 0 0 16px var(--accent-glow, rgba(99,102,241,0.4));
}

.resize-indicator {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 3px;
  height: 32px;
  border-radius: 2px;
  background: currentColor;
  opacity: 0.2;
  transition: all 0.2s ease;
}

.resize-handle:hover .resize-indicator,
.resize-handle.resizing .resize-indicator {
  opacity: 0.6;
  height: 48px;
}

.resize-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 20px;
  height: 60px;
  background: radial-gradient(ellipse, var(--accent-glow, rgba(99,102,241,0.2)) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.2s ease;
  pointer-events: none;
}

.resize-handle:hover .resize-glow,
.resize-handle.resizing .resize-glow {
  opacity: 1;
}

.preview-wrapper {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--preview-bg, #fff);
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
  border-color: var(--accent-indigo, #6366f1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

/* 代码块头部动画 - 始终显示 */
:deep(.code-block-header) {
  opacity: 1;
}

:deep(.copy-btn) {
  cursor: pointer;
  padding: 0.35rem 0.65rem;
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.copy-btn:hover) {
  box-shadow: 0 4px 12px var(--accent-glow);
  transform: translateY(-1px);
}

:deep(.copy-btn:active) {
  transform: translateY(0);
}

:deep(.copy-btn.copied) {
  color: #10b981 !important;
}

:deep(.hljs) {
  border-radius: 0;
  background: transparent !important;
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
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.03);
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
  background: rgba(239, 68, 68, 0.08);
  border-radius: 8px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
</style>
