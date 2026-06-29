<template>
  <div
    class="flex w-screen h-screen overflow-hidden app-root"
    :class="[themeClass, { 'zen-mode': isZenModeActive }]"
  >
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
        @duplicate-file="handleDuplicateFile"
        @export-file="handleExportFile"
        @move-file="handleMoveFile"
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
    <div class="flex-1 min-w-0 flex flex-col editor-wrapper">
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
        @update:content="handleUpdateContent"
        @togglePreviewMode="togglePreviewMode"
        @toggleFullscreenPreview="toggleFullscreenPreview"
        @toggleZenMode="handleToggleZenMode"
        @exitPreviewMode="exitPreviewMode"
        @startResize="startResize"
        @toggleTheme="toggleTheme"
        @tabChange="handleTabChange"
        @globalSearchOpen="handleGlobalSearchOpen"
        @renameFile="handleRenameFile"
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
              <kbd class="px-2 py-1 rounded text-xs font-mono border empty-kbd">Shift</kbd>
              <span class="text-xs opacity-40">+</span>
              <kbd class="px-2 py-1 rounded text-xs font-mono border empty-kbd">F</kbd>
              <span class="text-xs opacity-50 ml-1">全局搜索</span>
            </div>
          </div>
        </div>
      </Transition>
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

    <!-- 全局搜索 -->
    <Transition name="modal">
      <GlobalSearch
        v-if="showGlobalSearch"
        :visible="showGlobalSearch"
        :is-dark="isDark"
        :files="fileSystem.files.value"
        @close="showGlobalSearch = false"
        @open="handleGlobalSearchOpen"
      />
    </Transition>

    <!-- 命令面板 -->
    <CommandPalette
      v-if="showCommandPalette"
      :visible="showCommandPalette"
      :is-dark="isDark"
      :commands="commandPaletteCommands"
      @close="showCommandPalette = false"
      @execute="handleCommandExecute"
    />

    <!-- 新手引导 -->
    <OnboardingTour
      v-if="showOnboarding"
      :is-dark="isDark"
      @complete="handleOnboardingComplete"
      @close="showOnboarding = false"
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
import { ref, computed } from 'vue'
import Editor from './components/Editor.vue'
import FileManager from './components/FileManager.vue'
import ImportModal from './components/ImportModal.vue'
import GlobalSearch from './components/GlobalSearch.vue'
import CommandPalette from './components/CommandPalette.vue'
import OnboardingTour from './components/OnboardingTour.vue'
import { useFileSystem } from './composables/useFileSystem.js'
import { useTheme } from './composables/useTheme.js'
import { useTabs } from './composables/useTabs.js'
import { useKeyboardShortcuts } from './composables/useKeyboardShortcuts.js'

const { theme, isDark, toggleTheme, toggleThemePrevious, setTheme } = useTheme()
const fileSystem = useFileSystem()
const { closeTab, validateTabs } = useTabs()

const showImportModal = ref(false)
const showGlobalSearch = ref(false)
const showSaveNotification = ref(false)
const showCommandPalette = ref(false)
const showOnboarding = ref(false)

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
const ONBOARDING_KEY = 'blur_editor_onboarding_seen'
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

function startFileManagerResize(e) {
  isFileManagerResizing.value = true
  document.addEventListener('mousemove', onFileManagerResize)
  document.addEventListener('mouseup', stopFileManagerResize)
}

function onFileManagerResize(e) {
  if (!isFileManagerResizing.value) return
  const newWidth = e.clientX
  if (newWidth > 120 && newWidth < window.innerWidth - 200) {
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

const themeClass = computed(() => `theme-${theme.value}`)

function getChildren(parentId) {
  return fileSystem.getChildren(parentId)
}

function handleSelectFile(fileId) {
  fileSystem.setCurrentFile(fileId)
  isPreviewMode.value = true
  isFullscreenPreview.value = true
}

function handleCreateFile(parentId) {
  const newFile = fileSystem.createFile(parentId)
  if (newFile) {
    fileSystem.setCurrentFile(newFile.id)
    isPreviewMode.value = true
    isFullscreenPreview.value = true
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
}

function handleRenameFile({ fileId, newName }) {
  fileSystem.renameFile(fileId, newName)
}

function handleArchiveFile(fileId) {
  fileSystem.archiveFile(fileId)
}

function handleUnarchiveFile(fileId) {
  fileSystem.unarchiveFile(fileId)
}

function handleDuplicateFile(fileId) {
  const newFile = fileSystem.duplicateFile(fileId)
  if (newFile) {
    fileSystem.setCurrentFile(newFile.id)
  }
}

function handleExportFile(fileId) {
  fileSystem.exportFile(fileId)
}

function handleMoveFile({ fileId, newParentId }) {
  fileSystem.moveFile(fileId, newParentId)
}

function handleToggleFavorite({ fileId }) {
  fileSystem.toggleFavorite(fileId)
}

function handleCreateFolderAtRoot() {
  fileSystem.createFolder(null)
}

function handleOpenOnboarding() {
  showOnboarding.value = true
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
  const parentIds = fileSystem.getParentFolderIds(fileId)
  if (parentIds.length > 0 && fileManagerRef.value) {
    fileManagerRef.value.expandToFile(fileId, parentIds)
  }
}

function handleGlobalSearchOpen(fileId) {
  fileSystem.setCurrentFile(fileId)
}

function handleImport(files) {
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
  }
}
const commandPaletteCommands = computed(() => [
  { id: 'command:newFile', title: '新建文件', hint: '创建 Markdown 文件', group: '文件', tags: ['new', 'file'] },
  { id: 'command:newFolder', title: '新建文件夹', hint: '创建一个新文件夹', group: '文件', tags: ['new', 'folder'] },
  { id: 'command:import', title: '导入文件', hint: '从本地导入 Markdown 文件', group: '文件', tags: ['import', 'file'] },
  { id: 'command:duplicate', title: '复制当前文件', hint: '复制当前文件到当前目录', group: '文件', tags: ['copy', 'file'] },
  { id: 'command:globalSearch', title: '全局搜索', hint: '快速搜索文档正文', group: '内容', tags: ['search'] },
  { id: 'command:togglePreview', title: '切换编辑/预览', hint: '切换编辑与预览模式', group: '阅读', tags: ['preview'] },
  { id: 'command:toggleSplit', title: '切换分栏', hint: '切换编辑器分栏', group: '阅读', tags: ['split'] },
  { id: 'command:toggleZen', title: '切换禅模式', hint: '进入/退出禅模式（Alt+Z）', group: '阅读', tags: ['zen'] },
  { id: 'command:toggleOutline', title: '切换文档大纲', hint: '显示或隐藏文档大纲', group: '阅读', tags: ['outline'] },
  { id: 'command:openCommandPalette', title: '打开命令面板', hint: '打开全局命令面板（Alt+K）', group: '系统', tags: ['command'] },
  { id: 'command:showOnboarding', title: '查看新手引导', hint: '重新打开新手引导', group: '帮助', tags: ['help', 'onboarding'] },
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
  } else if (id === 'command:duplicate' && currentFile.value) {
    handleDuplicateFile(currentFile.value.id)
  } else if (id === 'command:globalSearch') {
    showGlobalSearch.value = true
  } else if (id === 'command:togglePreview') {
    togglePreviewMode()
  } else if (id === 'command:toggleSplit') {
    toggleFullscreenPreview()
  } else if (id === 'command:toggleZen') {
    handleToggleZenMode()
  } else if (id === 'command:toggleOutline') {
    handleToggleOutline()
  } else if (id === 'command:openCommandPalette') {
    showCommandPalette.value = true
  } else if (id === 'command:showOnboarding') {
    handleOpenOnboarding()
  } else if (id.startsWith('theme:')) {
    const nextTheme = id.replace('theme:', '')
    setTheme(nextTheme)
  }

  handleCloseCommandPalette()
}

function handleOnboardingComplete() {
  showOnboarding.value = false
  localStorage.setItem(ONBOARDING_KEY, '1')
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
    const containerWidth = window.innerWidth - 256
    const newPosition = ((e.clientX - 256) / containerWidth) * 100
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
  onToggleZenMode: handleToggleZenMode,
  onToggleOutline: handleToggleOutline,
  onToggleTheme: toggleTheme,
  onTogglePrevTheme: toggleThemePrevious,
  onOpenCommandPalette: handleOpenCommandPalette,
  onEscape: () => {
    if (showCommandPalette.value) {
      showCommandPalette.value = false
      return
    }
    if (showOnboarding.value) {
      showOnboarding.value = false
      return
    }
    if (isZenMode.value) {
      isZenMode.value = false
    }
  }
})

import { onMounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault()
      showGlobalSearch.value = true
    }
  })

  window.addEventListener('file-delete', (e) => {
    handleDeleteFile(e.detail.fileId)
  })

  const validFileIds = fileSystem.files.value.filter(f => f.type === 'file').map(f => f.id)
  validateTabs(validFileIds)

  if (!localStorage.getItem(ONBOARDING_KEY)) {
    showOnboarding.value = true
  }
})
</script>

<style scoped>
.app-root {
  background: var(--editor-bg);
  transition: background var(--transition-normal) ease;
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

