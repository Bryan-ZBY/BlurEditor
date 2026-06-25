<template>
  <div class="flex w-screen h-screen overflow-hidden" :class="isDark ? 'bg-slate-900' : 'bg-gray-50'">
    <!-- 文件管理器 -->
    <div class="relative">
      <FileManager
        :root-files="rootFiles"
        :archived-files="archivedFiles"
        :current-file-id="currentFileId"
        :get-children="getChildren"
        :is-dark="isDark"
        :sort-mode="fileSystem.sortMode.value"
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
        @open-import="showImportModal = true"
      />
    </div>

    <!-- 编辑器 -->
    <div class="flex-1 min-w-0 flex flex-col">
      <Editor
        v-if="currentFile"
        :content="currentFile?.content || ''"
        :current-file="currentFile"
        :is-preview-mode="isPreviewMode"
        :is-fullscreen-preview="isFullscreenPreview"
        :split-position="splitPosition"
        :is-resizing="isResizing"
        :is-dark="isDark"
        :files="fileSystem.files.value"
        @update:content="handleUpdateContent"
        @togglePreviewMode="togglePreviewMode"
        @toggleFullscreenPreview="toggleFullscreenPreview"
        @exitPreviewMode="exitPreviewMode"
        @startResize="startResize"
        @toggleTheme="toggleTheme"
        @tabChange="handleTabChange"
        @globalSearchOpen="handleGlobalSearchOpen"
        @renameFile="handleRenameFile"
        ref="editorComponent"
      />

      <div v-if="!currentFile" class="w-full h-full flex items-center justify-center theme-text-muted">
        <div class="text-center">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="text-lg font-medium mb-2">没有打开的文件</p>
          <p class="text-sm opacity-60">请在左侧文件管理器中选择一个文件，或创建一个新文件</p>
        </div>
      </div>
    </div>

    <!-- 导入文件弹窗 -->
    <ImportModal
      :visible="showImportModal"
      :is-dark="isDark"
      @close="showImportModal = false"
      @import="handleImport"
    />

    <!-- 全局搜索 -->
    <GlobalSearch
      :visible="showGlobalSearch"
      :is-dark="isDark"
      :files="fileSystem.files.value"
      @close="showGlobalSearch = false"
      @open="handleGlobalSearchOpen"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Editor from './components/Editor.vue'
import FileManager from './components/FileManager.vue'
import ImportModal from './components/ImportModal.vue'
import GlobalSearch from './components/GlobalSearch.vue'
import { useFileSystem } from './composables/useFileSystem.js'
import { useTheme } from './composables/useTheme.js'

const { theme, isDark, toggleTheme } = useTheme()
const fileSystem = useFileSystem()

const showImportModal = ref(false)
const showGlobalSearch = ref(false)

const editorComponent = ref(null)
const editorRef = computed(() => editorComponent.value?.editorRef)
const splitEditorRef = computed(() => editorComponent.value?.splitEditorRef)

const isPreviewMode = ref(false)
const isFullscreenPreview = ref(false)
const splitPosition = ref(50)
const isResizing = ref(false)

const currentFileId = fileSystem.currentFileId
const currentFile = fileSystem.currentFile
const rootFiles = fileSystem.rootFiles
const archivedFiles = fileSystem.archivedFiles

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

function handleDeleteFile(fileId) {
  fileSystem.deleteFile(fileId)
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

const togglePreviewMode = () => {
  isPreviewMode.value = !isPreviewMode.value
  if (!isPreviewMode.value) {
    isFullscreenPreview.value = false
    setTimeout(() => {
      const editor = editorRef.value || splitEditorRef.value
      if (editor) editor.focus()
    }, 100)
  }
}

const toggleFullscreenPreview = () => {
  isFullscreenPreview.value = !isFullscreenPreview.value
}

const exitPreviewMode = () => {
  isPreviewMode.value = false
  isFullscreenPreview.value = false
  setTimeout(() => {
    const editor = editorRef.value || splitEditorRef.value
    if (editor) editor.focus()
  }, 100)
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

import { onMounted } from 'vue'

onMounted(() => {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'F') {
      e.preventDefault()
      showGlobalSearch.value = true
    }
  })

  window.addEventListener('file-delete', (e) => {
    fileSystem.deleteFile(e.detail.fileId)
  })
})
</script>
