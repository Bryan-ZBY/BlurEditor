<template>
  <div class="editor-container" :class="{ 'is-dark': isDark, 'zen-mode': isZenMode && isPreviewMode }">
    <!-- 标签页 -->
    <EditorTabs
      v-if="showTabs && !isZenMode"
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

      <!-- 编辑区域 -->
    <div class="editor-main">
      <!-- 编辑区域容器 -->
      <div class="editor-area">
        <!-- 顶部工具栏 -->
        <div v-if="!isZenMode" class="top-bar">
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
              :title="showOutline ? '关闭大纲' : '显示大纲'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
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
                  <div class="export-item" @click="handleExport('txt')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <span>导出 TXT 文件</span>
                  </div>
                  <div class="export-item" @click="handleExport('richtext')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <span>导出富文本</span>
                  </div>

                  <div class="export-divider"></div>
                  <div class="export-item" @click="handleExport('html')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
                    </svg>
                    <span>导出 HTML（带目录）</span>
                  </div>
                  <div class="export-item" @click="handleExport('html-no-toc')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                    </svg>
                    <span>导出 HTML（无目录）</span>
                  </div>
                  <div class="export-item" @click="handleExport('html-offline')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M9 17h6a2 2 0 002-2V7a2 2 0 00-2-2h-1M9 17a2 2 0 01-2-2V9m0 10H7a2 2 0 01-2-2V7a2 2 0 012-2h1m5 2h5v5M9 7H7a2 2 0 00-2 2v8a2 2 0 002 2h1"/>
                    </svg>
                    <span>导出离线 HTML</span>
                  </div>
                  <div class="export-divider"></div>
                  <div class="export-item" @click="handleExport('pdf')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M4 7v14m0 0h16M4 7h16M7 7V3h10v4"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M8 14h8m-8 3h8m-8 3h4"/>
                    </svg>
                    <span>导出 PDF</span>
                  </div>
                  <div class="export-divider"></div>
                  <div class="export-settings">
                    <div class="export-settings-title">导出样式（应用到 HTML/PDF）</div>
                    <label class="export-setting-item">
                      <span>目录标题</span>
                      <input
                        v-model="exportTableOfContentsTitle"
                        class="export-inline-input"
                        placeholder="目录"
                      />
                    </label>
                    <label class="export-setting-item">
                      <input type="checkbox" v-model="exportIncludeTableOfContents" />
                      <span>包含目录</span>
                    </label>
                    <label class="export-setting-item">
                      <input type="checkbox" v-model="exportOfflineMode" />
                      <span>离线 HTML（不联网）</span>
                    </label>
                    <label class="export-setting-item">
                      <span>主题</span>
                      <div class="export-chip-group">
                        <button
                          v-for="item in exportThemeModeList"
                          :key="item.value"
                          @click.stop="setExportThemeMode(item.value)"
                          class="export-chip"
                          :class="{ active: exportThemeMode === item.value }"
                        >
                          {{ item.label }}
                        </button>
                      </div>
                    </label>
                  </div>
                  <div class="export-item" @click="handleExport('workspace')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M3.3 7L12 12l8.7-5M12 22V12"/>
                    </svg>
                    <span>导出工作区备份</span>
                  </div>
                </div>
              </Transition>
            </div>
            <!-- 主题切换 -->
            <button
              @click="$emit('toggleTheme')"
              class="icon-btn"
              :title="`切换主题 (${isDark ? '深色' : '浅色'} -> 下一个)`"
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
            <!-- 分栏切换 -->
            <button
              @click="toggleSplitMode"
              class="icon-btn"
              :class="{ active: !isFullscreenPreview && isPreviewMode }"
              :title="isFullscreenPreview ? '切换分栏' : '切换左右分栏'"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="18" rx="1"/>
                <rect x="14" y="3" width="7" height="18" rx="1"/>
                <line x1="12" y1="3" x2="12" y2="21"/>
              </svg>
            </button>
            <button
              @click="showPreviewSettings = !showPreviewSettings"
              class="icon-btn preview-settings-btn"
              title="预览设置"
            >
              <span class="zen-btn-icon">Aa</span>
            </button>
            <div v-if="showPreviewSettings" class="preview-settings">
              <div class="setting-group">
                <label>字体</label>
                <button @click="setFontFamily('system')" :class="{ active: previewFont === 'system' }">默认</button>
                <button @click="setFontFamily('serif')" :class="{ active: previewFont === 'serif' }">衬线</button>
                <button @click="setFontFamily('mono')" :class="{ active: previewFont === 'mono' }">等宽</button>
              </div>
              <div class="setting-group">
                <label>字号</label>
                <button @click="setFontSize('14')" :class="{ active: previewFontSize === '14' }">14</button>
                <button @click="setFontSize('15')" :class="{ active: previewFontSize === '15' }">15</button>
                <button @click="setFontSize('16')" :class="{ active: previewFontSize === '16' }">16</button>
                <button @click="setFontSize('17')" :class="{ active: previewFontSize === '17' }">17</button>
              </div>
              <div class="setting-group">
                <label>行高</label>
                <button @click="setLineHeight('1.55')" :class="{ active: previewLineHeight === '1.55' }">1.55</button>
                <button @click="setLineHeight('1.75')" :class="{ active: previewLineHeight === '1.75' }">1.75</button>
                <button @click="setLineHeight('1.95')" :class="{ active: previewLineHeight === '1.95' }">1.95</button>
              </div>
              <div class="setting-group">
                <label>页面宽度 {{ previewPageWidth }}%</label>
                <input
                  type="range"
                  min="40"
                  max="100"
                  step="1"
                  v-model="previewPageWidth"
                  @change="commitPreviewPageWidth"
                  class="setting-slider"
                />
                <span class="setting-range-value">{{ previewPageWidth }}%</span>
              </div>
              <div class="setting-group setting-group-toggle">
                <label>居中显示</label>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="previewPageCentered" />
                  <span class="toggle-track">
                    <span class="toggle-thumb"></span>
                  </span>
                </label>
              </div>
            </div>
            <button
              v-if="isPreviewMode"
              @click="toggleZenMode"
              class="icon-btn"
              :class="{ active: isZenMode }"
              title="Zen mode"
            >
              <span class="zen-btn-icon">Z</span>
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

        <!-- 编辑区域 -->
        <div class="editor-content">
          <Transition name="crossfade" mode="out-in">
            <div v-if="!isPreviewMode" class="editor-wrapper" key="editor">
              <textarea
                :value="content"
                ref="editorRef"
                class="editor-textarea custom-scrollbar"
                placeholder="请在此输入 Markdown 内容..."
                @input="handleInput"
                spellcheck="false"
                autocorrect="off"
                autocapitalize="off"
              ></textarea>
            </div>

            <div v-else class="preview-container" key="preview">
              <div
                v-show="!isFullscreenPreview"
                class="split-editor-wrapper"
                :style="{ width: splitPosition + '%' }"
              >
                <textarea
                  :value="content"
                  ref="splitEditorRef"
                  class="editor-textarea split no-scrollbar"
                  placeholder="请在此输入 Markdown 内容..."
                  @input="handleInput"
                  @scroll="syncPreviewScroll"
                  spellcheck="false"
                  autocorrect="off"
                  autocapitalize="off"
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
                  tabindex="0"
                  aria-label="Markdown 预览"
                  v-html="previewContent"
                  :style="previewTypographyStyle"
                  @scroll="handlePreviewScroll"
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
        :active-heading-id="activeHeadingId"
        @scrollToHeading="handleScrollToHeading"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick, getCurrentInstance } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import mermaid from 'mermaid'
import { useOutlineParser } from '../composables/useOutlineParser.js'

import EditorTabs from './EditorTabs.vue'
import DocumentOutline from './DocumentOutline.vue'

import { useTabs } from '../composables/useTabs.js'
import { exportAsMarkdown, exportAsHTML, exportAsPDF, exportAsPlainText, copyAsRichText } from '../utils/exportUtils.js'

const props = defineProps({
  content: String,
  currentFile: Object,
  isPreviewMode: Boolean,
  isFullscreenPreview: Boolean,
  isZenMode: Boolean,
  splitPosition: Number,
  isResizing: Boolean,
  isDark: Boolean,
  files: { type: Array, default: () => [] },
  previewPageWidth: { type: Number, default: 100 },
  previewPageCentered: { type: Boolean, default: false }
})

const emit = defineEmits([
  'update:content',
  'togglePreviewMode',
  'toggleFullscreenPreview',
  'exitPreviewMode',
  'toggleZenMode',
  'startResize',
  'toggleTheme',
  'tabChange',
  'renameFile',
  'exportWorkspace',
  'update:previewPageWidth',
  'update:previewPageCentered'
])

const editorRef = ref(null)
const splitEditorRef = ref(null)
const previewRef = ref(null)
const isSyncing = ref(false)

const showOutline = ref(false)
const showExportMenu = ref(false)
const showTabs = ref(true)
const showPreviewSettings = ref(false)
const previewFont = ref('system')
const previewFontSize = ref('16')
const previewLineHeight = ref('1.8')
const exportThemeMode = ref('current')
const exportIncludeTableOfContents = ref(true)
const exportOfflineMode = ref(false)
const exportTableOfContentsTitle = ref('目录')
const clampPreviewPageWidth = (value) => Math.max(40, Math.min(100, Number(value) || 100))
const previewPageWidth = ref(clampPreviewPageWidth(props.previewPageWidth))
const previewPageCentered = computed({
  get: () => !!props.previewPageCentered,
  set: (value) => emit('update:previewPageCentered', !!value)
})

const commitPreviewPageWidth = () => {
  emit('update:previewPageWidth', clampPreviewPageWidth(previewPageWidth.value))
}

watch(
  () => props.previewPageWidth,
  (value) => {
    previewPageWidth.value = clampPreviewPageWidth(value)
  }
)

const { tabs, activeTabId, openTab, closeTab, closeOtherTabs, closeLeftTabs, closeRightTabs, closeAllTabs, setActiveTab, setTabDirty, isTabDirty, updateTabName, moveTab, togglePinTab } = useTabs()
const parserSource = computed(() => props.content || '')
const { getHeadings } = useOutlineParser(parserSource)
const outlineHeadings = computed(() => getHeadings())

const activeHeadingId = ref('')

const FONT_FAMILY_OPTIONS = {
  system: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
  serif: "fangsong, 'FangSong', STFangSong, 'STFangsong', serif",
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
}

const instance = getCurrentInstance()
const getPreviewEl = () => instance?.refs?.previewRef
const getSplitEditorEl = () => instance?.refs?.splitEditorRef

// 加载 highlight.js 高亮主题并应用代码样式
let hljsStyleEl = null
let previewHighlightTimer = null
let previewSearchActiveIndex = -1
let previewSearchActiveQuery = ''
let previewGSequenceTimer = null
let isPreviewGSequenceArmed = false
let previewScrollAnimationFrame = null
let previewScrollAnimationTarget = null
function loadHljsTheme(isDark) {
  document.querySelectorAll('[data-hljs-theme]').forEach(el => el.remove())
  
  const theme = 'github-dark'
  hljsStyleEl = document.createElement('link')
  hljsStyleEl.rel = 'stylesheet'
  hljsStyleEl.setAttribute('data-hljs-theme', theme)
  
  const localPath = `../../node_modules/highlight.js/styles/${theme}.css`
  import(localPath).then(() => {
    hljsStyleEl.href = localPath
    document.head.appendChild(hljsStyleEl)
  }).catch(() => {
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

const previewTypographyStyle = computed(() => ({
  fontFamily: FONT_FAMILY_OPTIONS[previewFont.value] || FONT_FAMILY_OPTIONS.system,
  fontSize: `${previewFontSize.value}px`,
  lineHeight: String(previewLineHeight.value)
}))

function slugifyForDom(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (m) => m)
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~[\](){}#+.!]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '') || 'heading'
}

function syncHeadingAnchors() {
  const container = previewRef.value
  if (!container) return

  const domHeadings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const parsed = outlineHeadings.value
  const used = new Set()

  domHeadings.forEach((node, index) => {
    const parsedItem = parsed[index]
    let id = parsedItem?.id || slugifyForDom(node.textContent || '')
    let uniqueId = id
    let cursor = 1
    while (used.has(uniqueId)) {
      uniqueId = `${id}-${cursor}`
      cursor += 1
    }
    used.add(uniqueId)
    node.setAttribute('id', uniqueId)
    node.dataset.outlineId = uniqueId
  })
}

function updateActiveHeadingFromScroll() {
  const container = previewRef.value
  if (!container) return
  const nodes = container.querySelectorAll('[data-outline-id]')
  if (!nodes.length) return

  const target = container.scrollTop + container.clientHeight * 0.25
  let current = ''
  nodes.forEach((node) => {
    if (node.offsetTop <= target) {
      current = node.dataset.outlineId || ''
    }
  })
  if (current) {
    activeHeadingId.value = current
  }
}

function setPreviewSettings(panelState) {
  showPreviewSettings.value = panelState
}

function setFontFamily(font) {
  previewFont.value = font
}

function setFontSize(size) {
  previewFontSize.value = size
}

function setLineHeight(height) {
  previewLineHeight.value = height
}

const exportThemeModeList = [
  { value: 'current', label: '跟随当前' },
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' }
]

const exportStyleOptions = computed(() => {
  const isDarkForExport = exportThemeMode.value === 'current'
    ? !!props.isDark
    : exportThemeMode.value === 'dark'

  return {
    isDark: isDarkForExport,
    themeMode: exportThemeMode.value,
    previewFont: previewFont.value,
    previewFontSize: previewFontSize.value,
    previewLineHeight: previewLineHeight.value,
    previewPageWidth: previewPageWidth.value,
    includeTableOfContents: exportIncludeTableOfContents.value,
    tableOfContentsTitle: exportTableOfContentsTitle.value,
    offline: exportOfflineMode.value,
    includeExternalLinks: !exportOfflineMode.value,
    title: props.currentFile?.name || 'document.md'
  }
})

function buildExportOptions(overrides = {}) {
  return {
    ...exportStyleOptions.value,
    ...overrides
  }
}

function setExportThemeMode(mode) {
  exportThemeMode.value = mode
}

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
    updateActiveHeadingFromScroll()
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
    updateActiveHeadingFromScroll()
    isSyncing.value = false
  })
}

function handlePreviewScroll(e) {
  const preview = e.target
  if (props.isFullscreenPreview === false) {
    syncEditorScroll(e)
  }
  updateActiveHeadingFromScroll()
  if (preview) {
    const headings = preview.querySelectorAll('[data-outline-id]')
    const target = preview.scrollTop + preview.clientHeight * 0.25
    let found = ''
    headings.forEach((node) => {
      if (node.offsetTop <= target) {
        found = node.dataset.outlineId || ''
      }
    })
    if (found) {
      activeHeadingId.value = found
    }
  }
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
const toggleZenMode = () => emit('toggleZenMode')
const toggleOutline = () => {
  showOutline.value = !showOutline.value
}
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
    if (h.dataset.outlineId === heading.id || h.textContent.trim() === heading.text) {
      isSyncing.value = true
      h.scrollIntoView({ behavior: 'smooth', block: 'start' })
      activeHeadingId.value = heading.id
      requestAnimationFrame(() => {
        isSyncing.value = false
      })
      break
    }
  }
}

function getVisibleEditorEl() {
  if (props.isPreviewMode && !props.isFullscreenPreview) {
    return splitEditorRef.value
  }

  return editorRef.value || splitEditorRef.value
}

function scrollToLine(lineIndex = 0) {
  nextTick(() => {
    const editor = getVisibleEditorEl()
    if (!editor) return

    const lines = String(props.content || '').split('\n')
    const lastLineIndex = Math.max(0, lines.length - 1)
    const targetLine = Math.max(0, Math.min(Number(lineIndex) || 0, lastLineIndex))
    const style = window.getComputedStyle(editor)
    const fontSize = parseFloat(style.fontSize) || 16
    const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.6
    const targetTop = Math.max(0, targetLine * lineHeight - editor.clientHeight * 0.35)
    const cursor = lines
      .slice(0, targetLine)
      .reduce((sum, line) => sum + line.length + 1, 0)

    editor.focus()
    editor.scrollTop = targetTop
    editor.setSelectionRange(cursor, cursor)
  })
}

function markdownTableLineToText(line) {
  const source = String(line || '').trim()
  if (!source.includes('|')) return source

  const cells = source
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)

  if (cells.length < 2) return source
  if (cells.every((cell) => /^:?-{3,}:?$/.test(cell.replace(/\s+/g, '')))) {
    return ''
  }

  return cells.join(' ')
}

function stripMarkdownLine(line) {
  return markdownTableLineToText(line)
    .replace(/^#{1,6}\s+/, '')
    .replace(/^>\s*/, '')
    .replace(/^[-*+]\s+\[[ xX]\]\s+/, '')
    .replace(/^[-*+]\s+/, '')
    .replace(/^\d+\.\s+/, '')
    .replace(/^`{3,}\w*\s*/, '')
    .replace(/[*_`~[\]()#>]/g, '')
    .trim()
}

function normalizePreviewText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim().toLowerCase()
}

function getPreviewNodeText(node) {
  if (!node) return ''
  if (node.matches?.('table, thead, tbody, tr')) {
    return Array.from(node.querySelectorAll('th, td'))
      .map((cell) => cell.textContent || '')
      .join(' ')
  }

  return node.textContent || ''
}

function escapeRegExp(value) {
  return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getPreviewTargetScrollTop(preview, targetNode) {
  const previewRect = preview.getBoundingClientRect()
  const targetRect = targetNode.getBoundingClientRect()
  return preview.scrollTop + targetRect.top - previewRect.top - preview.clientHeight * 0.18
}

function getClampedPreviewScrollTop(preview, targetTop) {
  const maxScrollTop = Math.max(0, preview.scrollHeight - preview.clientHeight)
  return Math.max(0, Math.min(targetTop, maxScrollTop))
}

function cancelPreviewScrollAnimation() {
  if (previewScrollAnimationFrame) {
    window.cancelAnimationFrame(previewScrollAnimationFrame)
    previewScrollAnimationFrame = null
  }
  previewScrollAnimationTarget = null
}

function easeOutCubic(progress) {
  return 1 - Math.pow(1 - progress, 3)
}

function animatePreviewScrollTop(preview, targetTop, duration = 180) {
  const nextTop = getClampedPreviewScrollTop(preview, targetTop)
  const startTop = preview.scrollTop
  const distance = nextTop - startTop

  cancelPreviewScrollAnimation()
  previewScrollAnimationTarget = nextTop

  if (Math.abs(distance) < 1) {
    preview.scrollTop = nextTop
    cancelPreviewScrollAnimation()
    refreshPreviewScrollState()
    return
  }

  const startedAt = performance.now()
  const animationDuration = Math.max(80, duration)

  function tick(now) {
    const progress = Math.min(1, (now - startedAt) / animationDuration)
    preview.scrollTop = startTop + distance * easeOutCubic(progress)

    if (progress < 1) {
      previewScrollAnimationFrame = window.requestAnimationFrame(tick)
      return
    }

    preview.scrollTop = nextTop
    cancelPreviewScrollAnimation()
    refreshPreviewScrollState()
  }

  previewScrollAnimationFrame = window.requestAnimationFrame(tick)
}

function setPreviewScrollTop(preview, targetTop, behavior = 'smooth', options = {}) {
  const nextTop = getClampedPreviewScrollTop(preview, targetTop)

  if (behavior === 'auto') {
    cancelPreviewScrollAnimation()
    preview.scrollTop = nextTop
    refreshPreviewScrollState()
    return
  }

  animatePreviewScrollTop(preview, nextTop, options.duration)
}

function refreshPreviewScrollState() {
  requestAnimationFrame(() => {
    updateActiveHeadingFromScroll()
  })
}

function getPreviewLineStep(preview) {
  const style = window.getComputedStyle(preview)
  const fontSize = parseFloat(style.fontSize) || 16
  const lineHeight = parseFloat(style.lineHeight) || fontSize * 1.6
  return Math.max(18, lineHeight)
}

function getPreviewScrollBase(preview) {
  return Number.isFinite(previewScrollAnimationTarget)
    ? previewScrollAnimationTarget
    : preview.scrollTop
}

function scrollPreviewBy(delta, duration = 120) {
  const preview = getPreviewEl()
  if (!preview) return false

  setPreviewScrollTop(preview, getPreviewScrollBase(preview) + delta, 'smooth', { duration })
  return true
}

function scrollPreviewToEdge(edge, duration = 260) {
  const preview = getPreviewEl()
  if (!preview) return false

  const targetTop = edge === 'bottom'
    ? preview.scrollHeight - preview.clientHeight
    : 0
  setPreviewScrollTop(preview, targetTop, 'smooth', { duration })
  return true
}

function getPreviewHeadingNodes(preview) {
  const anchoredHeadings = Array.from(preview.querySelectorAll('[data-outline-id]'))
  if (anchoredHeadings.length > 0) return anchoredHeadings

  return Array.from(preview.querySelectorAll('h1, h2, h3, h4, h5, h6'))
}

function scrollPreviewToSiblingHeading(direction = 1) {
  const preview = getPreviewEl()
  if (!preview) return false

  const headings = getPreviewHeadingNodes(preview)
  if (headings.length === 0) return false

  const anchorTop = preview.scrollTop + preview.clientHeight * 0.18
  const target = direction > 0
    ? headings.find((node) => node.offsetTop > anchorTop + 4)
    : [...headings].reverse().find((node) => node.offsetTop < anchorTop - 4)

  if (!target) {
    return scrollPreviewToEdge(direction > 0 ? 'bottom' : 'top', 240)
  }

  setPreviewScrollTop(preview, getPreviewTargetScrollTop(preview, target), 'smooth', { duration: 220 })
  activeHeadingId.value = target.dataset.outlineId || activeHeadingId.value
  return true
}

function resetPreviewGSequence() {
  if (previewGSequenceTimer) {
    window.clearTimeout(previewGSequenceTimer)
    previewGSequenceTimer = null
  }
  isPreviewGSequenceArmed = false
}

function isSpaceKey(key, code) {
  return key === ' ' || key === 'Spacebar' || code === 'Space'
}

function handlePreviewVimKey(event = {}) {
  const preview = getPreviewEl()
  if (!props.isPreviewMode || !preview) return false

  const rawKey = String(event.key || '')
  const key = rawKey.toLowerCase()
  const isShift = !!event.shiftKey
  const isUpperG = rawKey === 'G' || (key === 'g' && isShift)
  const isLowerG = key === 'g' && !isUpperG

  if (!isLowerG) {
    resetPreviewGSequence()
  }

  if (isSpaceKey(rawKey, event.code)) {
    return scrollPreviewBy((isShift ? -1 : 1) * preview.clientHeight * 0.88, 190)
  }

  if (key === 'j' && !isShift) {
    return scrollPreviewBy(getPreviewLineStep(preview), 100)
  }

  if (key === 'k' && !isShift) {
    return scrollPreviewBy(-getPreviewLineStep(preview), 100)
  }

  if (key === 'd' && !isShift) {
    return scrollPreviewBy(preview.clientHeight * 0.5, 170)
  }

  if (key === 'u' && !isShift) {
    return scrollPreviewBy(-preview.clientHeight * 0.5, 170)
  }

  if (isUpperG) {
    return scrollPreviewToEdge('bottom', 280)
  }

  if (key === 'g') {
    if (isPreviewGSequenceArmed) {
      resetPreviewGSequence()
      return scrollPreviewToEdge('top', 280)
    }

    isPreviewGSequenceArmed = true
    previewGSequenceTimer = window.setTimeout(resetPreviewGSequence, 600)
    return true
  }

  if (rawKey === '}') {
    return scrollPreviewToSiblingHeading(1)
  }

  if (rawKey === '{') {
    return scrollPreviewToSiblingHeading(-1)
  }

  return false
}

function clearPreviewSearchHighlight(preview = getPreviewEl()) {
  if (previewHighlightTimer) {
    clearTimeout(previewHighlightTimer)
    previewHighlightTimer = null
  }
  if (!preview) return

  preview.querySelectorAll('mark.preview-search-mark').forEach((mark) => {
    const textNode = document.createTextNode(mark.textContent || '')
    mark.replaceWith(textNode)
    textNode.parentNode?.normalize?.()
  })
  preview.querySelectorAll('.preview-search-target').forEach((node) => {
    node.classList.remove('preview-search-target')
  })
  previewSearchActiveIndex = -1
  previewSearchActiveQuery = ''
}

function markPreviewText(root, query) {
  const needle = String(query || '').trim()
  if (!needle) return false

  const regex = new RegExp(escapeRegExp(needle), 'gi')
  const nodes = []
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent || parent.closest('mark, script, style, .copy-btn')) {
        return NodeFilter.FILTER_REJECT
      }
      regex.lastIndex = 0
      return regex.test(node.nodeValue || '')
        ? NodeFilter.FILTER_ACCEPT
        : NodeFilter.FILTER_REJECT
    }
  })

  let node = walker.nextNode()
  while (node) {
    nodes.push(node)
    node = walker.nextNode()
  }

  nodes.forEach((textNode) => {
    const text = textNode.nodeValue || ''
    const fragment = document.createDocumentFragment()
    let cursor = 0
    regex.lastIndex = 0

    text.replace(regex, (match, offset) => {
      if (offset > cursor) {
        fragment.appendChild(document.createTextNode(text.slice(cursor, offset)))
      }
      const mark = document.createElement('mark')
      mark.className = 'preview-search-mark'
      mark.textContent = match
      fragment.appendChild(mark)
      cursor = offset + match.length
      return match
    })

    if (cursor < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(cursor)))
    }
    textNode.replaceWith(fragment)
  })

  return nodes.length > 0
}

function getPreviewSearchMarks(preview) {
  return Array.from(preview.querySelectorAll('mark.preview-search-mark'))
}

function getPreviewSearchTargetNode(mark) {
  return mark?.closest?.('td, th, tr, h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, table') || mark
}

function setActivePreviewSearchMark(preview, index) {
  const marks = getPreviewSearchMarks(preview)
  if (marks.length === 0) return false

  const activeIndex = (index + marks.length) % marks.length
  marks.forEach((mark) => mark.classList.remove('preview-search-current'))
  preview.querySelectorAll('.preview-search-target').forEach((node) => {
    node.classList.remove('preview-search-target')
  })

  const activeMark = marks[activeIndex]
  const targetNode = getPreviewSearchTargetNode(activeMark)
  activeMark.classList.add('preview-search-current')
  targetNode?.classList?.add('preview-search-target')
  setPreviewScrollTop(preview, getPreviewTargetScrollTop(preview, targetNode || activeMark))
  previewSearchActiveIndex = activeIndex
  return true
}

function armPreviewHighlightCleanup(preview) {
  if (previewHighlightTimer) {
    clearTimeout(previewHighlightTimer)
  }
  previewHighlightTimer = setTimeout(() => {
    clearPreviewSearchHighlight(preview)
  }, 6000)
}

function highlightPreviewSearchTarget(preview, targetNode, searchQuery, targetText) {
  clearPreviewSearchHighlight(preview)
  if (!targetNode) return

  const cleanedQuery = stripMarkdownLine(searchQuery)
  const needle = cleanedQuery || searchQuery
  const highlighted = markPreviewText(preview, needle)
  if (!highlighted && targetText) {
    markPreviewText(targetNode, targetText)
  }

  const marks = getPreviewSearchMarks(preview)
  const activeIndex = Math.max(0, marks.findIndex((mark) => targetNode.contains(mark)))
  if (!setActivePreviewSearchMark(preview, activeIndex)) {
    targetNode.classList.add('preview-search-target')
  }
  previewSearchActiveQuery = normalizePreviewText(needle || targetText)
  armPreviewHighlightCleanup(preview)
}

function repeatPreviewSearch(direction = 1, searchQuery = '') {
  const preview = getPreviewEl()
  const needle = stripMarkdownLine(searchQuery) || searchQuery
  const normalizedNeedle = normalizePreviewText(needle)
  if (!preview || !normalizedNeedle) return false

  const directionStep = direction >= 0 ? 1 : -1
  const previousActiveIndex = previewSearchActiveIndex
  const queryChanged = normalizePreviewText(previewSearchActiveQuery) !== normalizedNeedle
  clearPreviewSearchHighlight(preview)
  if (!markPreviewText(preview, needle)) return false

  const marks = getPreviewSearchMarks(preview)
  const baseIndex = queryChanged
    ? (directionStep > 0 ? -1 : 0)
    : previousActiveIndex
  const nextIndex = baseIndex + directionStep

  previewSearchActiveQuery = normalizedNeedle
  const handled = setActivePreviewSearchMark(preview, nextIndex)
  if (handled) {
    armPreviewHighlightCleanup(preview)
  }
  return handled
}

function scrollPreviewToLine(lineIndex = 0, searchQuery = '') {
  nextTick(() => {
    requestAnimationFrame(() => {
      const preview = getPreviewEl()
      if (!preview) return

      const lines = String(props.content || '').split('\n')
      const lastLineIndex = Math.max(0, lines.length - 1)
      const targetLine = Math.max(0, Math.min(Number(lineIndex) || 0, lastLineIndex))
      const targetText = normalizePreviewText(stripMarkdownLine(lines[targetLine]))
      const previousSameLineCount = targetText
        ? lines
          .slice(0, targetLine)
          .filter((line) => normalizePreviewText(stripMarkdownLine(line)) === targetText)
          .length
        : 0

      const blocks = Array.from(preview.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, li, blockquote, pre, tr, th, td, table, hr'
      ))
      const matches = targetText
        ? blocks.filter((node) => normalizePreviewText(getPreviewNodeText(node)).includes(targetText))
        : []
      const targetNode = matches[Math.min(previousSameLineCount, Math.max(0, matches.length - 1))]

      isSyncing.value = true
      if (targetNode) {
        setPreviewScrollTop(preview, getPreviewTargetScrollTop(preview, targetNode))
        highlightPreviewSearchTarget(preview, targetNode, searchQuery, targetText)
      } else {
        const ratio = lastLineIndex > 0 ? targetLine / lastLineIndex : 0
        setPreviewScrollTop(preview, ratio * Math.max(0, preview.scrollHeight - preview.clientHeight))
        clearPreviewSearchHighlight(preview)
      }

      requestAnimationFrame(() => {
        updateActiveHeadingFromScroll()
        isSyncing.value = false
      })
    })
  })
}

function handleExport(format) {
  showExportMenu.value = false
  const fileName = props.currentFile?.name || 'document.md'
  const htmlTitle = fileName

  switch (format) {
    case 'md':
      exportAsMarkdown(props.content, fileName)
      break
    case 'html':
      exportAsHTML(props.content, fileName, buildExportOptions({ title: htmlTitle, includeTableOfContents: true }))
      break
    case 'html-no-toc':
      exportAsHTML(props.content, fileName, buildExportOptions({ includeTableOfContents: false }))
      break
    case 'html-offline':
      exportAsHTML(props.content, fileName, buildExportOptions({ offline: true, includeExternalLinks: false }))
      break
    case 'pdf':
      exportAsPDF(props.content, fileName, buildExportOptions({ title: htmlTitle }))
      break
    case 'txt':
      exportAsPlainText(props.content, fileName)
      break
    case 'richtext':
      copyAsRichText(props.content).then(() => {
        alert('已复制富文本到剪贴板')
      })
      break
    case 'workspace':
      emit('exportWorkspace')
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

watch(
  () => [props.content, props.isPreviewMode],
  () => {
    nextTick(() => {
      if (props.isPreviewMode) {
        syncHeadingAnchors()
        updateActiveHeadingFromScroll()
      }
    })
  },
  { deep: true, immediate: true }
)

watch(() => props.isPreviewMode, (isPreviewMode) => {
  if (!isPreviewMode) {
    resetPreviewGSequence()
    cancelPreviewScrollAnimation()
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

  document.addEventListener('click', (e) => {
    if (showExportMenu.value && !e.target.closest('.export-wrapper')) {
      showExportMenu.value = false
    }
  })

  document.addEventListener('click', (e) => {
    if (
      showPreviewSettings.value &&
      !e.target.closest('.preview-settings') &&
      !e.target.closest('.preview-settings-btn')
    ) {
      showPreviewSettings.value = false
    }
  })

  nextTick(() => {
    syncHeadingAnchors()
    updateActiveHeadingFromScroll()
  })
})

onUnmounted(() => {
  resetPreviewGSequence()
  cancelPreviewScrollAnimation()
})

// 监听主题变化并更新 highlight.js 样式
watch(() => props.isDark, (newVal) => {
  loadHljsTheme(newVal)
})

defineExpose({ editorRef, splitEditorRef, toggleOutline, scrollToLine, scrollPreviewToLine, repeatPreviewSearch, handlePreviewVimKey })
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

/* 顶部工具栏 - 毛玻璃效果 */
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

/* 图标按钮 - 悬停动画 */
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

.preview-settings-btn {
  position: relative;
}

.zen-btn-icon {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-weight: 700;
  font-size: 0.9rem;
  line-height: 1;
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

.export-settings {
  padding: 0.35rem 0.75rem 0.35rem;
}

.export-settings-title {
  font-size: 0.72rem;
  color: var(--text-muted, #6b7280);
  margin: 0 0 0.45rem;
}

.export-setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-secondary, #64748b);
  padding: 0.35rem 0;
}

.export-setting-item input[type="checkbox"] {
  width: 0.95rem;
  height: 0.95rem;
}

.export-inline-input {
  min-width: 0;
  flex: 1;
  max-width: 8.5rem;
  border: 1px solid var(--menu-border, #e5e7eb);
  border-radius: 0.45rem;
  background: transparent;
  color: var(--text-primary, #111827);
  font-size: 0.74rem;
  padding: 0.2rem 0.4rem;
}

.export-chip-group {
  display: flex;
  gap: 0.3rem;
}

.export-chip {
  appearance: none;
  border: 1px solid var(--menu-border, #e5e7eb);
  background: transparent;
  color: var(--text-secondary, #64748b);
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  font-size: 0.7rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.2s ease;
}

.export-chip:hover {
  background: var(--menu-hover, rgba(0, 0, 0, 0.04));
}

.export-chip.active {
  border-color: var(--accent-indigo, #6366f1);
  background: var(--icon-btn-active, rgba(99, 102, 241, 0.14));
  color: var(--accent-indigo, #6366f1);
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

/* 编辑区域 */
.editor-content {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
  overflow: hidden;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
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

/* 分割线 - 拖拽效果 */
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
  min-width: 0;
  min-height: 0;
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
  min-height: 0;
  overflow-y: auto;
  padding: 1.5rem 2rem;
}

.preview-content:focus {
  outline: none;
}

.preview-content:focus-visible {
  outline: none;
}

:deep(.preview-search-target) {
  border-radius: 0.55rem;
  outline: 2px solid rgba(245, 158, 11, 0.55);
  outline-offset: 0.25rem;
  background: rgba(245, 158, 11, 0.12);
  transition: background 0.2s ease, outline-color 0.2s ease;
}

:deep(tr.preview-search-target > th),
:deep(tr.preview-search-target > td),
:deep(th.preview-search-target),
:deep(td.preview-search-target) {
  background: rgba(245, 158, 11, 0.18);
  box-shadow: inset 0 0 0 1px rgba(245, 158, 11, 0.35);
}

:deep(mark.preview-search-mark) {
  padding: 0.05rem 0.16rem;
  border-radius: 0.22rem;
  background: rgba(250, 204, 21, 0.55);
  color: inherit;
  box-shadow: 0 0 0 1px rgba(245, 158, 11, 0.35);
}

:deep(mark.preview-search-mark.preview-search-current) {
  background: rgba(249, 115, 22, 0.72);
  box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.45);
}

.preview-settings {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  min-width: 15rem;
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: var(--menu-bg, #fff);
  border: 1px solid var(--menu-border, #e5e7eb);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.preview-settings .setting-group {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
}

.preview-settings .setting-group label {
  width: 100%;
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
}

.preview-settings .setting-group button {
  border: 1px solid var(--menu-border, #e5e7eb);
  border-radius: 0.45rem;
  background: transparent;
  color: var(--text-primary, #111827);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preview-settings .setting-group button:hover {
  background: var(--menu-hover, rgba(0, 0, 0, 0.04));
}

.preview-settings .setting-group button.active {
  background: var(--icon-btn-active, rgba(99, 102, 241, 0.14));
  color: var(--accent-indigo, #6366f1);
  border-color: var(--accent-indigo, #6366f1);
}

.preview-settings .setting-slider {
  width: 100%;
  margin-top: 0.25rem;
  accent-color: var(--accent-indigo, #6366f1);
}

.preview-settings .setting-range-value {
  display: inline-block;
  margin-top: 0.15rem;
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
}

.preview-settings .setting-group.setting-group-toggle {
  align-items: center;
  justify-content: space-between;
}

.preview-settings .toggle-switch {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}

.preview-settings .toggle-switch input {
  display: none;
}

.preview-settings .toggle-track {
  width: 2rem;
  height: 1rem;
  border-radius: 999px;
  background: var(--menu-border, #e5e7eb);
  position: relative;
  transition: background-color 0.2s ease;
}

.preview-settings .toggle-thumb {
  position: absolute;
  top: 1px;
  left: 1px;
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s ease;
}

.preview-settings .toggle-switch input:checked + .toggle-track {
  background: var(--accent-indigo, #6366f1);
}

.preview-settings .toggle-switch input:checked + .toggle-track .toggle-thumb {
  transform: translateX(1rem);
}

.editor-container.zen-mode .preview-content {
  max-width: 100%;
  width: 100%;
  margin: 0 auto;
  padding: 1.5rem 1rem;
}

/* 代码块头部显示与交互 */
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
