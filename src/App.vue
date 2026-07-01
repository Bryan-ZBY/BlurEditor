<template>
  <div
    ref="appRootRef"
    class="flex w-screen h-screen overflow-hidden app-root"
    :class="[themeClass, { 'zen-mode': isZenModeActive }]"
    :style="appRootStyle"
  >
    <div ref="appViewportRef" class="app-viewport-shell" :style="appViewportStyle">
      <!-- 文件管理器 -->
      <div
        v-if="!isZenModeActive"
        class="relative file-manager-wrapper"
        :style="{ width: fileManagerWidth + 'px' }"
      >
        <FileManager
          ref="fileManagerRef"
          :root-files="rootFiles"
          :archived-files="archivedFiles"
          :recent-files="fileSystem.recentFiles.value"
          :files="fileSystem.files.value"
          :current-file-id="currentFileId"
          :get-children="getChildren"
          :is-dark="isDark"
          :sort-mode="fileSystem.sortMode.value"
          :get-sorted-files="fileSystem.getSortedFiles"
          @select-file="handleSelectFile"
          @create-file="handleCreateFile"
          @create-folder="handleCreateFolder"
          @delete-file="handleDeleteFile"
          @rename-file="handleRenameFile"
          @archive-file="handleArchiveFile"
          @unarchive-file="handleUnarchiveFile"
          @empty-trash="handleEmptyTrash"
          @duplicate-file="handleDuplicateFile"
          @export-file="handleExportFile"
          @move-file="handleMoveFile"
          @reorder-file="handleReorderFile"
          @set-sort-mode="handleSetSortMode"
          @toggleFavorite="handleToggleFavorite"
          @open-import="showImportModal = true"
        />
      </div>

      <div
        v-if="!isZenModeActive"
        class="resize-handle" 
        @mousedown="startFileManagerResize"
        :class="{ 'is-resizing': isFileManagerResizing }"
      >
        <div class="resize-line"></div>
      </div>

      <!-- 编辑器区域 -->
      <div ref="editorAreaRef" class="flex-1 min-w-0 flex flex-col editor-wrapper">
        <Editor
          v-if="currentFile"
          :content="currentFile?.content || ''"
          :current-file="currentFile"
          :is-preview-mode="isPreviewMode"
          :is-fullscreen-preview="isFullscreenPreview"
          :is-zen-mode="isZenModeActive"
          :split-position="splitPosition"
          :is-resizing="isResizing"
          :is-dark="isDark"
          :files="fileSystem.files.value"
          :preview-page-width="appPreviewPageWidth"
          :preview-page-centered="isPreviewPageCentered"
          @update:content="handleUpdateContent"
          @update:previewPageWidth="handleUpdatePreviewPageWidth"
          @update:previewPageCentered="handleUpdatePreviewPageCentered"
          @togglePreviewMode="togglePreviewMode"
          @toggleFullscreenPreview="toggleFullscreenPreview"
          @toggleZenMode="handleToggleZenMode"
          @exitPreviewMode="exitPreviewMode"
          @startResize="startResize"
          @toggleTheme="toggleTheme"
          @tabChange="handleTabChange"
          @renameFile="handleRenameFile"
          @exportWorkspace="handleExportWorkspace"
          ref="editorComponent"
        />

        <Transition name="fade-scale" mode="out-in">
          <div v-if="!currentFile" class="w-full h-full flex items-center justify-center empty-state">
            <div class="text-center empty-content">
              <div class="empty-icon-wrapper">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-20 h-20 mx-auto mb-6 empty-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div class="empty-icon-glow"></div>
              </div>
              <h2 class="text-xl font-semibold mb-3 empty-title">没有打开的文档</h2>
              <p class="text-sm opacity-60 empty-desc">请在左侧文件管理器中选择一个文档，或创建一个新文档</p>
              <div class="mt-6 flex items-center justify-center gap-2 empty-hint">
                <kbd class="px-2 py-1 rounded text-xs font-mono border empty-kbd">Ctrl</kbd>
                <span class="text-xs opacity-40">+</span>
                <kbd class="px-2 py-1 rounded text-xs font-mono border empty-kbd">K</kbd>
                <span class="text-xs opacity-50 ml-1">全局入口</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>

    <!-- 导入文件弹窗 -->
    <Transition name="modal">
      <ImportModal
        v-if="showImportModal"
        :visible="showImportModal"
        :is-dark="isDark"
        @close="showImportModal = false"
        @import="handleImport"
      />
    </Transition>

    <!-- 命令面板 -->
    <CommandPalette
      v-if="showCommandPalette"
      :visible="showCommandPalette"
      :is-dark="isDark"
      :commands="commandPaletteCommands"
      :files="fileSystem.files.value"
      @close="showCommandPalette = false"
      @execute="handleCommandExecute"
      @open-file="handleCommandPaletteOpenFile"
    />

    <!-- 保存提示 -->
    <Transition name="fade-slide">
      <div v-if="showSaveNotification" class="save-notification">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>已保存</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import Editor from './components/Editor.vue'
import FileManager from './components/FileManager.vue'
import ImportModal from './components/ImportModal.vue'
import CommandPalette from './components/CommandPalette.vue'
import { useFileSystem, parseWorkspaceContent } from './composables/useFileSystem.js'
import { useTheme } from './composables/useTheme.js'
import { useTabs } from './composables/useTabs.js'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts.js'

const { theme, isDark, toggleTheme, toggleThemePrevious, setTheme } = useTheme()
const fileSystem = useFileSystem()
const { closeTab, validateTabs } = useTabs()

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))
const appRootRef = ref(null)
const appViewportRef = ref(null)
const editorAreaRef = ref(null)
const getViewportRect = () => appViewportRef.value?.getBoundingClientRect() || null

const showImportModal = ref(false)
const showSaveNotification = ref(false)
const showCommandPalette = ref(false)

const editorComponent = ref(null)
const fileManagerRef = ref(null)
const editorRef = computed(() => editorComponent.value?.editorRef)
const splitEditorRef = computed(() => editorComponent.value?.splitEditorRef)

const isPreviewMode = ref(false)
const isFullscreenPreview = ref(false)
const isZenMode = ref(false)
const isZenModeActive = computed(
  () => isZenMode.value && isPreviewMode.value && isFullscreenPreview.value
)
const splitPosition = ref(50)
const isResizing = ref(false)
const PREVIEW_PAGE_WIDTH_KEY = 'blur_editor_preview_page_width'
const PREVIEW_PAGE_CENTERED_KEY = 'blur_editor_preview_page_centered'
const LAST_SEARCH_QUERY_KEY = 'blur_editor_last_search_query'
const THEME_OPTIONS = [
  { id: 'lightgrey', title: '浅灰' },
  { id: 'midnight', title: '午夜' },
  { id: 'lightgoldenrodyellow', title: '浅秋黄' },
  { id: 'lavender', title: '薰衣草' },
  { id: 'beige', title: '米黄' },
  { id: 'antiquewhite', title: '古董白' },
  { id: 'cornsilk', title: '米绸色' },
  { id: 'ivory', title: '象牙白' }
]

const fileManagerWidth = ref(parseInt(localStorage.getItem('fileManagerWidth')) || 256)
const isFileManagerResizing = ref(false)
const appRootStyle = computed(() => ({
  '--app-root-outside-bg': 'color-mix(in srgb, var(--editor-bg) 90%, var(--text-muted) 10%)'
}))
const appPreviewPageWidth = ref(clamp(parseInt(localStorage.getItem(PREVIEW_PAGE_WIDTH_KEY) || 100, 10), 40, 100))
const isPreviewPageCentered = ref(localStorage.getItem(PREVIEW_PAGE_CENTERED_KEY) === '1')
const appViewportStyle = computed(() => {
  const widthPercent = clamp(appPreviewPageWidth.value, 40, 100)
  const width = `${widthPercent}%`
  return isPreviewPageCentered.value
    ? { width, marginLeft: 'auto', marginRight: 'auto' }
    : { width }
})
const handleUpdatePreviewPageWidth = (value) => {
  appPreviewPageWidth.value = clamp(parseInt(value || 100, 10), 40, 100)
  localStorage.setItem(PREVIEW_PAGE_WIDTH_KEY, String(appPreviewPageWidth.value))
}
const handleUpdatePreviewPageCentered = (value) => {
  isPreviewPageCentered.value = !!value
  localStorage.setItem(PREVIEW_PAGE_CENTERED_KEY, isPreviewPageCentered.value ? '1' : '0')
}

function startFileManagerResize(e) {
  isFileManagerResizing.value = true
  document.addEventListener('mousemove', onFileManagerResize)
  document.addEventListener('mouseup', stopFileManagerResize)
}

function onFileManagerResize(e) {
  if (!isFileManagerResizing.value) return
  const rect = getViewportRect()
  const appLeft = rect?.left ?? 0
  const appWidth = rect?.width || window.innerWidth
  const newWidth = e.clientX - appLeft
  const maxFileManagerWidth = appWidth - 220
  if (newWidth > 120 && newWidth < maxFileManagerWidth) {
    fileManagerWidth.value = newWidth
    localStorage.setItem('fileManagerWidth', newWidth.toString())
  }
}

function stopFileManagerResize() {
  isFileManagerResizing.value = false
  document.removeEventListener('mousemove', onFileManagerResize)
  document.removeEventListener('mouseup', stopFileManagerResize)
}

const currentFileId = fileSystem.currentFileId
const currentFile = fileSystem.currentFile
const rootFiles = fileSystem.rootFiles
const archivedFiles = fileSystem.archivedFiles
const lastSearchQuery = ref(localStorage.getItem(LAST_SEARCH_QUERY_KEY) || '')
const lastSearchLineIndex = ref(-1)
const lastSearchFileId = ref(null)

const themeClass = computed(() => `theme-${theme.value}`)

function getChildren(parentId) {
  return fileSystem.getChildren(parentId)
}

function syncDisplayModeForFile(fileId) {
  const file = fileSystem.files.value.find((item) => item.id === fileId)
  const hasContent = Boolean(String(file?.content || '').trim())

  isPreviewMode.value = hasContent
  isFullscreenPreview.value = hasContent
  if (!hasContent) {
    isZenMode.value = false
  }
}

function handleSelectFile(fileId) {
  fileSystem.setCurrentFile(fileId)
  syncDisplayModeForFile(fileId)
}

function handleCreateFile(parentId) {
  const newFile = fileSystem.createFile(parentId)
  if (newFile) {
    fileSystem.setCurrentFile(newFile.id)
    syncDisplayModeForFile(newFile.id)
  }
}

function handleCreateFolder(parentId) {
  fileSystem.createFolder(parentId)
}

function getDescendantFileIds(fileId) {
  const ids = [fileId]
  const file = fileSystem.files.value.find(f => f.id === fileId)
  if (file && file.type === 'folder') {
    const children = fileSystem.files.value.filter(f => f.parentId === fileId)
    children.forEach(child => {
      ids.push(...getDescendantFileIds(child.id))
    })
  }
  return ids
}

function handleDeleteFile(fileId) {
  const idsToClose = getDescendantFileIds(fileId)
  fileSystem.deleteFile(fileId)
  idsToClose.forEach(id => closeTab(id))
  syncDisplayModeForFile(currentFileId.value)
}

function handleRenameFile({ fileId, newName }) {
  const renamed = fileSystem.renameFile(fileId, newName)
  if (!renamed) {
    window.alert('同一文件夹下已存在同名项目，请换一个名称。')
  }
}

function handleArchiveFile(fileId) {
  const idsToClose = getDescendantFileIds(fileId)
  const archived = fileSystem.archiveFile(fileId)
  if (archived) {
    idsToClose.forEach((id) => closeTab(id))
    syncDisplayModeForFile(currentFileId.value)
  }
}

function handleUnarchiveFile(fileId) {
  const file = fileSystem.files.value.find((f) => f.id === fileId)
  const name = file?.name || '该项目'
  if (window.confirm(`恢复「${name}」？`)) {
    fileSystem.unarchiveFile(fileId)
  }
}

function handleEmptyTrash() {
  const archivedCount = fileSystem.archivedFiles.value.length
  if (archivedCount === 0) return
  if (!window.confirm(`确定清空回收站中的 ${archivedCount} 个项目吗？此操作无法撤销。`)) return

  const idsToClose = new Set()
  fileSystem.archivedFiles.value.forEach((file) => {
    getDescendantFileIds(file.id).forEach((id) => idsToClose.add(id))
  })
  fileSystem.emptyTrash()
  idsToClose.forEach((id) => closeTab(id))
  syncDisplayModeForFile(currentFileId.value)
}

function handleDuplicateFile(fileId) {
  const newFile = fileSystem.duplicateFile(fileId)
  if (newFile) {
    fileSystem.setCurrentFile(newFile.id)
    syncDisplayModeForFile(newFile.id)
  }
}

function handleExportFile(fileId) {
  fileSystem.exportFile(fileId)
}

function handleExportWorkspace() {
  fileSystem.exportWorkspace({ includeArchived: true })
}

function handleMoveFile({ fileId, newParentId }) {
  const moved = fileSystem.moveFile(fileId, newParentId)
  if (!moved) {
    window.alert('目标文件夹下已存在同名项目，或不能移动到该位置。')
  }
}

function handleReorderFile(payload) {
  const reordered = fileSystem.reorderFile(payload.fileId, payload.targetParentId, payload.targetIndex)
  if (reordered) {
    fileSystem.setSortMode('manual')
    return
  }
  window.alert('无法排序到该位置：可能存在同名项目，或目标位置不可用。')
}

function handleToggleFavorite({ fileId }) {
  fileSystem.toggleFavorite(fileId)
}

function handleCreateFolderAtRoot() {
  fileSystem.createFolder(null)
}

function handleSetSortMode(mode) {
  fileSystem.setSortMode(mode)
}

function handleUpdateContent(content) {
  if (currentFile.value) {
    fileSystem.updateFileContent(currentFile.value.id, content)
  }
}

function handleTabChange(fileId) {
  fileSystem.setCurrentFile(fileId)
  syncDisplayModeForFile(fileId)
  const parentIds = fileSystem.getParentFolderIds(fileId)
  if (parentIds.length > 0 && fileManagerRef.value) {
    fileManagerRef.value.expandToFile(fileId, parentIds)
  }
}

function rememberSearchQuery(searchQuery, fileId, lineIndex = -1) {
  const query = String(searchQuery || '').trim()
  if (!query) return

  lastSearchQuery.value = query
  lastSearchFileId.value = fileId || null
  lastSearchLineIndex.value = Number.isFinite(lineIndex) ? lineIndex : -1
  localStorage.setItem(LAST_SEARCH_QUERY_KEY, query)
}

function normalizeSearchText(value) {
  return String(value || '').toLowerCase()
}

function getSearchLineMatches(content, searchQuery) {
  const query = normalizeSearchText(searchQuery).trim()
  if (!query) return []

  const lines = String(content || '').split('\n')
  let matches = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => normalizeSearchText(line).includes(query))
    .map(({ index }) => index)

  if (matches.length > 0) return matches

  const queryWithoutExtension = query.replace(/\.(md|markdown|txt)$/i, '')
  if (!queryWithoutExtension || queryWithoutExtension === query) return []

  matches = lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => normalizeSearchText(line).includes(queryWithoutExtension))
    .map(({ index }) => index)

  return matches
}

function handleRepeatSearch(direction = 1) {
  if (
    !isPreviewMode.value ||
    showCommandPalette.value ||
    showImportModal.value
  ) {
    return false
  }

  const file = currentFile.value
  const query = lastSearchQuery.value.trim()
  if (!file || !query) return false

  const handledInPreview = editorComponent.value?.repeatPreviewSearch?.(direction, query)
  if (handledInPreview) return true

  const matches = getSearchLineMatches(file.content, query)
  if (matches.length === 0) return false

  const sameFile = lastSearchFileId.value === file.id
  const currentLine = sameFile
    ? lastSearchLineIndex.value
    : (direction > 0 ? -1 : Number.POSITIVE_INFINITY)
  const targetLine = direction > 0
    ? (matches.find((index) => index > currentLine) ?? matches[0])
    : ([...matches].reverse().find((index) => index < currentLine) ?? matches[matches.length - 1])

  lastSearchFileId.value = file.id
  lastSearchLineIndex.value = targetLine
  openFileAt(file.id, targetLine, query, { rememberQuery: false })
  return true
}

function findPreviewSearchLineIndex(fileId, searchQuery) {
  const file = fileSystem.files.value.find((item) => item.id === fileId)
  const lines = String(file?.content || '').split('\n')
  const query = String(searchQuery || '').trim().toLowerCase()
  if (!query) return 0

  const directIndex = lines.findIndex((line) => line.toLowerCase().includes(query))
  if (directIndex >= 0) return directIndex

  const queryWithoutExtension = query.replace(/\.(md|markdown|txt)$/i, '')
  if (queryWithoutExtension && queryWithoutExtension !== query) {
    const nameIndex = lines.findIndex((line) => line.toLowerCase().includes(queryWithoutExtension))
    if (nameIndex >= 0) return nameIndex
  }

  return 0
}

function openFileAt(fileId, lineIndex = null, searchQuery = '', options = {}) {
  if (!fileId) return

  fileSystem.setCurrentFile(fileId)
  syncDisplayModeForFile(fileId)
  const parentIds = fileSystem.getParentFolderIds(fileId)
  if (parentIds.length > 0 && fileManagerRef.value) {
    fileManagerRef.value.expandToFile(fileId, parentIds)
  }

  const hasLineIndex = Number.isFinite(lineIndex)
  const shouldHighlightPreview = isPreviewMode.value && String(searchQuery || '').trim()

  if (!hasLineIndex && !shouldHighlightPreview && options.rememberQuery !== false) {
    rememberSearchQuery(searchQuery, fileId, -1)
  }

  if (hasLineIndex || shouldHighlightPreview) {
    const scrollInPreview = isPreviewMode.value
    const targetLineIndex = hasLineIndex
      ? lineIndex
      : findPreviewSearchLineIndex(fileId, searchQuery)

    if (options.rememberQuery !== false) {
      rememberSearchQuery(searchQuery, fileId, targetLineIndex)
    }

    if (!scrollInPreview) {
      isPreviewMode.value = false
      isFullscreenPreview.value = false
      isZenMode.value = false
    }
    nextTick(() => {
      setTimeout(() => {
        if (scrollInPreview) {
          editorComponent.value?.scrollPreviewToLine?.(targetLineIndex, searchQuery)
        } else {
          editorComponent.value?.scrollToLine?.(targetLineIndex)
        }
      }, 0)
    })
  }
}

function finishWorkspaceImport(result) {
  if (!result?.ok) {
    const message = result?.error === 'backup_failed'
      ? '导入前备份创建失败，已取消导入。请先导出工作区备份后再试。'
      : '工作区文件格式无效，未导入。'
    window.alert(message)
    return
  }

  showImportModal.value = false
  const validFileIds = result.files.filter((file) => file.type === 'file').map((file) => file.id)
  validateTabs(validFileIds)
  syncDisplayModeForFile(result.currentFileId)
}

function handleImport(payload) {
  if (payload?.type === 'workspace') {
    finishWorkspaceImport(fileSystem.importWorkspace(payload.workspace, { mode: payload.mode }))
    return
  }

  const files = Array.isArray(payload) ? payload : []
  const workspaceMatch = files
    .map((file) => ({ file, workspace: parseWorkspaceContent(file.content) }))
    .find((item) => item.workspace)

  if (workspaceMatch) {
    finishWorkspaceImport(fileSystem.importWorkspace(workspaceMatch.workspace, { mode: 'replace' }))
    return
  }

  let firstNewFile = null
  files.forEach((file, index) => {
    const newFile = fileSystem.createFile(null, file.name, file.content)
    if (index === 0) {
      firstNewFile = newFile
    }
  })
  showImportModal.value = false
  if (firstNewFile) {
    fileSystem.setCurrentFile(firstNewFile.id)
    syncDisplayModeForFile(firstNewFile.id)
  }
}

function handleRestoreImportBackup() {
  const backup = fileSystem.importBackupInfo.value
  if (!backup) {
    window.alert('没有可恢复的导入前备份。')
    return
  }

  const date = backup.createdAt ? new Date(backup.createdAt).toLocaleString() : '未知时间'
  const count = backup.summary?.totalCount || 0
  const shouldRestore = window.confirm(`恢复 ${date} 的导入前备份（${count} 个项目）？当前工作区会被替换。`)
  if (!shouldRestore) return

  finishWorkspaceImport(fileSystem.restoreImportBackup())
}

const commandPaletteCommands = computed(() => [
  { id: 'command:newFile', title: '新建文件', hint: '创建 Markdown 文件', group: '文件', tags: ['new', 'file'] },
  { id: 'command:newFolder', title: '新建文件夹', hint: '创建一个新文件夹', group: '文件', tags: ['new', 'folder'] },
  { id: 'command:import', title: '导入文件', hint: '从本地导入 Markdown 文件', group: '文件', tags: ['import', 'file'] },
  { id: 'command:exportWorkspace', title: '导出工作区备份', hint: '导出完整 BlurEditor 工作区 JSON', group: '文件', tags: ['export', 'backup', 'workspace'] },
  ...(fileSystem.importBackupInfo.value ? [{
    id: 'command:restoreImportBackup',
    title: '恢复导入前备份',
    hint: '回滚到最近一次导入前的工作区',
    group: '文件',
    tags: ['restore', 'backup', 'import']
  }] : []),
  { id: 'command:duplicate', title: '复制当前文件', hint: '复制当前文件到当前目录', group: '文件', tags: ['copy', 'file'] },
  { id: 'command:togglePreview', title: '切换编辑/预览', hint: '切换编辑与预览模式（Alt+V）', group: '阅读', tags: ['preview'] },
  { id: 'command:toggleSplit', title: '切换分栏', hint: '切换左右分栏模式（Alt+S）', group: '阅读', tags: ['split'] },
  { id: 'command:toggleZen', title: '切换禅模式', hint: '进入/退出禅模式（Alt+Z）', group: '阅读', tags: ['zen'] },
  { id: 'command:toggleOutline', title: '切换文档大纲', hint: '显示或隐藏文档大纲', group: '阅读', tags: ['outline'] },
  { id: 'command:openCommandPalette', title: '打开全局入口', hint: '搜索命令、文件、正文和标签（Ctrl/Cmd+K 或 Alt+F）', group: '系统', tags: ['command', 'search'] },
  ...THEME_OPTIONS.map((item) => ({
    id: `theme:${item.id}`,
    title: `切换主题：${item.title}`,
    hint: `切换主题：${item.title}`,
    group: '主题',
    tags: ['theme', item.id],
    theme: item.id
  }))
])

const handleOpenCommandPalette = () => {
  showCommandPalette.value = true
}

const handleCloseCommandPalette = () => {
  showCommandPalette.value = false
}

function handleCommandExecute(command) {
  const id = command?.id || ''
  if (!id) return

  if (id === 'command:newFile') {
    handleCreateFile(null)
  } else if (id === 'command:newFolder') {
    handleCreateFolderAtRoot()
  } else if (id === 'command:import') {
    showImportModal.value = true
  } else if (id === 'command:exportWorkspace') {
    handleExportWorkspace()
  } else if (id === 'command:restoreImportBackup') {
    handleRestoreImportBackup()
  } else if (id === 'command:duplicate' && currentFile.value) {
    handleDuplicateFile(currentFile.value.id)
  } else if (id === 'command:togglePreview') {
    handleTogglePreviewMode()
  } else if (id === 'command:toggleSplit') {
    handleToggleSplitMode()
  } else if (id === 'command:toggleZen') {
    handleToggleZenMode()
  } else if (id === 'command:toggleOutline') {
    handleToggleOutline()
  } else if (id === 'command:openCommandPalette') {
    showCommandPalette.value = true
  } else if (id.startsWith('theme:')) {
    const nextTheme = id.replace('theme:', '')
    setTheme(nextTheme)
  }

  handleCloseCommandPalette()
}

function handleCommandPaletteOpenFile({ fileId, lineIndex, query }) {
  openFileAt(fileId, lineIndex, query)
  showCommandPalette.value = false
}

const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
  if (!isPreviewMode.value) {
    isFullscreenPreview.value = false
    isZenMode.value = false
    setTimeout(() => {
      const editor = editorRef.value || splitEditorRef.value
      if (editor) editor.focus()
    }, 100)
  }
}

const toggleFullscreenPreview = () => {
  isFullscreenPreview.value = !isFullscreenPreview.value
  if (!isFullscreenPreview.value) {
    isZenMode.value = false
  }
}

function handleTogglePreviewMode() {
  if (!isPreviewMode.value) {
    togglePreviewMode()
    toggleFullscreenPreview()
  } else {
    exitPreviewMode()
  }
}

function handleToggleSplitMode() {
  if (!isPreviewMode.value) {
    isPreviewMode.value = true
    isFullscreenPreview.value = false
    isZenMode.value = false
    return
  }
  toggleFullscreenPreview()
}

const exitPreviewMode = () => {
  isPreviewMode.value = false
  isFullscreenPreview.value = false
  isZenMode.value = false
  setTimeout(() => {
    const editor = editorRef.value || splitEditorRef.value
    if (editor) editor.focus()
  }, 100)
}

const handleToggleZenMode = () => {
  if (!isPreviewMode.value) {
    isPreviewMode.value = true
  }
  if (!isFullscreenPreview.value) {
    isFullscreenPreview.value = true
  }
  isZenMode.value = !isZenMode.value
}

const handleToggleOutline = () => {
  editorComponent.value?.toggleOutline?.()
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
    const rect = editorAreaRef.value?.getBoundingClientRect()
    const containerWidth = rect?.width || (window.innerWidth - fileManagerWidth.value)
    if (!containerWidth || containerWidth <= 0) return
    const newPosition = ((e.clientX - (rect?.left ?? 0)) / containerWidth) * 100
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

const handleSave = () => {
  if (currentFile.value) {
    showSaveNotification.value = true
    setTimeout(() => {
      showSaveNotification.value = false
    }, 2000)
  }
}

useKeyboardShortcuts({
  onSave: handleSave,
  onTogglePreviewMode: handleTogglePreviewMode,
  onToggleSplitMode: handleToggleSplitMode,
  onToggleZenMode: handleToggleZenMode,
  onToggleOutline: handleToggleOutline,
  onToggleTheme: toggleTheme,
  onTogglePrevTheme: toggleThemePrevious,
  onOpenCommandPalette: handleOpenCommandPalette,
  onRepeatSearch: handleRepeatSearch,
  onEscape: () => {
    if (showCommandPalette.value) {
      showCommandPalette.value = false
      return
    }
    if (isZenMode.value) {
      isZenMode.value = false
    }
  }
})

onMounted(() => {
  const validFileIds = fileSystem.files.value.filter(f => f.type === 'file').map(f => f.id)
  validateTabs(validFileIds)
  syncDisplayModeForFile(currentFileId.value)
})
</script>

<style scoped>
.app-root {
  background: var(--app-root-outside-bg, color-mix(in srgb, var(--editor-bg) 90%, var(--text-muted) 10%));
  transition: background var(--transition-normal) ease;
  position: relative;
}

.app-viewport-shell {
  background: var(--editor-bg);
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
}

.file-manager-wrapper {
  flex-shrink: 0;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background var(--transition-fast);
}

.resize-handle:hover {
  background: rgba(139, 92, 246, 0.15);
}

.resize-handle.is-resizing {
  background: rgba(139, 92, 246, 0.3);
}

.resize-line {
  width: 1px;
  height: 32px;
  background: var(--border-color);
  transition: background var(--transition-fast);
}

.resize-handle:hover .resize-line {
  background: var(--accent-color);
}

.resize-handle.is-resizing .resize-line {
  background: var(--accent-color);
  height: 48px;
}

.editor-wrapper {
  position: relative;
  background: var(--editor-bg);
}

/* 空状态 */
.empty-state {
  background: var(--editor-bg);
}

.empty-content {
  animation: fadeInScale 0.6s ease-out;
}

.empty-icon-wrapper {
  position: relative;
  display: inline-block;
}

.empty-icon {
  color: var(--text-muted);
  opacity: 0.4;
  animation: float 4s ease-in-out infinite;
}

.empty-icon-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
  opacity: 0.3;
  animation: pulseGlow 3s ease-in-out infinite;
  pointer-events: none;
}

.empty-title {
  color: var(--text-secondary);
  animation: fadeInUp 0.6s ease-out 0.1s both;
}

.empty-desc {
  color: var(--text-muted);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.empty-hint {
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.empty-kbd {
  background: var(--hover-bg);
  border-color: var(--border-color);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.empty-kbd:hover {
  border-color: var(--accent-indigo);
  color: var(--accent-indigo);
  box-shadow: 0 0 8px var(--accent-glow);
}

/* 页面切换动画 */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from :deep(.import-modal),
.modal-enter-from :deep(.global-search-modal),
.modal-leave-to :deep(.import-modal),
.modal-leave-to :deep(.global-search-modal) {
  transform: scale(0.96) translateY(8px);
  opacity: 0;
}

/* 保存提示 */
.save-notification {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(16, 185, 129, 0.9);
  color: white;
  border-radius: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  backdrop-filter: blur(8px);
}

/* 保存提示动画 */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-12px);
}
</style>

