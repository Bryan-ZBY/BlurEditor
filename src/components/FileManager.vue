<template>
  <div class="w-64 h-full flex flex-col border-r theme-border" :class="isDark ? 'bg-slate-900' : 'bg-white'">
    <div class="flex items-center justify-between p-3 border-b theme-border shrink-0">
      <span class="text-sm font-semibold theme-text-primary">文件管理</span>
      <div class="flex items-center gap-1">
        <button
          @click="showNewMenu = !showNewMenu"
          class="p-1.5 rounded-md theme-btn-secondary"
          title="新建"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          @click="$emit('openImport')"
          class="p-1.5 rounded-md theme-btn-secondary"
          title="导入文件"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </button>
      </div>
    </div>

    <div v-if="showNewMenu" class="px-3 py-2 border-b theme-border shrink-0">
      <button @click="createNewFile" class="w-full text-left px-3 py-2 rounded-md text-sm theme-btn-secondary flex items-center gap-2 mb-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        新建文件
      </button>
      <button @click="createNewFolder" class="w-full text-left px-3 py-2 rounded-md text-sm theme-btn-secondary flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        新建文件夹
      </button>
    </div>

    <div class="flex-1 overflow-y-auto custom-scrollbar py-2">
      <FileTreeItem
        v-for="file in displayedFiles"
        :key="file.id"
        :file="file"
        :level="0"
        :current-file-id="currentFileId"
        :expanded-ids="expandedIds"
        :is-dark="isDark"
        :get-children="getChildren"
        :root-files="rootFiles"
        @select="$emit('selectFile', $event)"
        @toggle="toggleFolder"
        @create-file="$emit('createFile', $event)"
        @create-folder="$emit('createFolder', $event)"
        @move="$emit('moveFile', $event)"
        @rename="$emit('renameFile', $event)"
      />

      <div v-if="displayedFiles.length === 0" class="px-4 py-8 text-center text-sm theme-text-muted">
        暂无文件，点击上方 + 新建
      </div>
    </div>

    <div v-if="archivedFiles.length > 0" class="border-t theme-border shrink-0">
      <button
        @click="showArchived = !showArchived"
        class="w-full flex items-center justify-between px-4 py-2 text-xs theme-text-muted hover:theme-text-primary transition-colors"
      >
        <span class="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          归档 ({{ archivedFiles.length }})
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="w-3.5 h-3.5 transition-transform"
          :class="{ 'rotate-180': showArchived }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="showArchived" class="pb-2">
        <div
          v-for="file in archivedFiles"
          :key="file.id"
          @click="$emit('unarchiveFile', file.id)"
          class="flex items-center gap-2 px-4 py-1.5 text-sm cursor-pointer theme-text-muted hover:theme-text-primary hover:theme-bg-hover transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="truncate">{{ file.name }}</span>
          <span class="ml-auto text-xs opacity-50">点击恢复</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import FileTreeItem from './FileTreeItem.vue'

const props = defineProps({
  rootFiles: Array,
  archivedFiles: Array,
  currentFileId: String,
  getChildren: Function,
  isDark: Boolean
})

const emit = defineEmits([
  'selectFile', 'createFile', 'createFolder', 'moveFile', 'unarchiveFile', 'renameFile'
])

const showNewMenu = ref(false)
const showArchived = ref(false)
const expandedIds = ref(new Set())

const displayedFiles = computed(() => {
  return props.rootFiles
})

import { computed } from 'vue'

function toggleFolder(folderId) {
  if (expandedIds.value.has(folderId)) {
    expandedIds.value.delete(folderId)
  } else {
    expandedIds.value.add(folderId)
  }
}

function createNewFile() {
  showNewMenu.value = false
  emit('createFile', null)
}

function createNewFolder() {
  showNewMenu.value = false
  emit('createFolder', null)
}

function handleRootDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
}

function handleRootDragLeave() {
}

function handleRootDrop(e) {
  e.preventDefault()
  const draggedId = e.dataTransfer.getData('text/plain')
  if (draggedId) {
    emit('moveFile', { fileId: draggedId, newParentId: null })
  }
}

watch(showNewMenu, (val) => {
  if (val) {
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!e.target.closest('.theme-btn-secondary')) {
          showNewMenu.value = false
          document.removeEventListener('click', closeHandler)
        }
      }
      document.addEventListener('click', closeHandler)
    }, 0)
  }
})
</script>
