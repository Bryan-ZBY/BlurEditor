<template>
  <div
    :class="[isRenaming ? '' : 'select-none']"
    :style="{ paddingLeft: level * 12 + 'px' }"
    :draggable="!isRenaming"
    @dragstart="handleDragStart"
    @dragover.prevent="handleDragOver"
    @drop="handleDrop"
    @dragleave="handleDragLeave"
  >
    <div
      v-if="file.type === 'folder'"
      class="flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md cursor-pointer transition-colors"
      :class="[
        isDraggingOver ? (isDark ? 'bg-slate-700' : 'bg-blue-50') : '',
        isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-700'
      ]"
      @click="!isRenaming && $emit('toggle', file.id)"
      @dblclick.stop="startRename"
      @contextmenu.prevent="showContextMenu($event, file)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4 transition-transform shrink-0"
        :class="{ 'rotate-90': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <template v-if="isRenaming">
        <input
          ref="renameInput"
          v-model="renameValue"
          class="flex-1 text-sm bg-transparent border-b-2 outline-none px-0 py-0"
          :class="isNameDuplicate ? 'border-red-500 text-red-400' : (isDark ? 'border-sky-500 text-slate-300' : 'border-sky-500 text-gray-700')"
          @keydown.enter="confirmRename"
          @keydown.escape="cancelRename"
          @blur="confirmRename"
        />
      </template>
      <span v-else class="text-sm truncate">{{ file.name }}</span>
      <span v-if="children.length > 0" class="text-xs opacity-50 ml-auto">{{ children.length }}</span>
    </div>

    <div
      v-else
      class="flex items-center gap-1.5 px-2 py-1 mx-1 rounded-md cursor-pointer transition-colors"
      :class="[
        isDraggingOver ? (isDark ? 'bg-slate-700' : 'bg-blue-50') : '',
        isCurrent
          ? (isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-50 text-sky-600')
          : (isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-gray-100 text-gray-700')
      ]"
      @click="!isRenaming && $emit('select', file.id)"
      @dblclick.stop="startRename"
      @contextmenu.prevent="showContextMenu($event, file)"
    >
      <span class="w-4 shrink-0"></span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" :class="isDark ? 'text-slate-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <template v-if="isRenaming">
        <input
          ref="renameInput"
          v-model="renameValue"
          class="flex-1 text-sm bg-transparent border-b-2 outline-none px-0 py-0"
          :class="isNameDuplicate ? 'border-red-500 text-red-400' : (isDark ? 'border-sky-500 text-slate-300' : 'border-sky-500 text-gray-700')"
          @keydown.enter="confirmRename"
          @keydown.escape="cancelRename"
          @blur="confirmRename"
        />
      </template>
      <span v-else class="text-sm truncate flex-1">{{ file.name }}</span>
      <span class="text-xs opacity-50">{{ formatSize(file.content?.length || 0) }}</span>
    </div>

    <div v-if="file.type === 'folder' && isExpanded">
      <FileTreeItem
        v-for="child in children"
        :key="child.id"
        :file="child"
        :level="level + 1"
        :current-file-id="currentFileId"
        :expanded-ids="expandedIds"
        :is-dark="isDark"
        :get-children="getChildren"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
        @create-file="$emit('create-file', $event)"
        @create-folder="$emit('create-folder', $event)"
        @move="$emit('move', $event)"
        @rename="$emit('rename', $event)"
      />
      <div
        v-if="children.length === 0"
        class="px-2 py-1 mx-1 text-xs opacity-50"
        :style="{ paddingLeft: (level + 1) * 12 + 8 + 'px' }"
      >
        空文件夹
      </div>
    </div>

    <div
      v-if="contextMenuVisible"
      class="fixed z-50 py-1 rounded-lg shadow-lg border min-w-[160px]"
      :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'"
      :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
    >
      <button
        @click="handleAction('details')"
        class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
        :class="isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
        详情
      </button>
      <button
        @click="handleAction('rename')"
        class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
        :class="isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
        重命名
      </button>
      <button
        @click="handleAction('move')"
        class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
        :class="isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
        移动到
      </button>
      <template v-if="contextFile?.type === 'file'">
        <div class="my-1 border-t" :class="isDark ? 'border-slate-700' : 'border-gray-200'"></div>
        <button
          @click="handleAction('delete')"
          class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          删除
        </button>
      </template>
      <template v-else>
        <button
          @click="handleAction('createFile')"
          class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
          :class="isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          新建文件
        </button>
        <button
          @click="handleAction('createFolder')"
          class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 transition-colors"
          :class="isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
          新建文件夹
        </button>
        <div class="my-1 border-t" :class="isDark ? 'border-slate-700' : 'border-gray-200'"></div>
        <button
          @click="handleAction('delete')"
          class="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          删除
        </button>
      </template>
    </div>

    <div
      v-if="showFileDetails"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showFileDetails = false"
    >
      <div class="w-96 p-5 rounded-lg shadow-xl border" :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold" :class="isDark ? 'text-slate-200' : 'text-gray-800'">文件详情</h3>
          <button
            @click="showFileDetails = false"
            class="p-1 rounded-md"
            :class="isDark ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-gray-100 text-gray-500'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="space-y-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" :class="isDark ? 'bg-slate-700' : 'bg-gray-100'">
              <svg v-if="contextFile?.type === 'folder'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="isDark ? 'text-slate-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-medium" :class="isDark ? 'text-slate-200' : 'text-gray-800'">{{ contextFile?.name }}</p>
              <p class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">{{ contextFile?.type === 'folder' ? '文件夹' : 'Markdown 文件' }}</p>
            </div>
          </div>
          <div class="pt-2 border-t" :class="isDark ? 'border-slate-700' : 'border-gray-200'">
            <div class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">创建时间</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ formatDate(contextFile?.createdAt) }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">修改时间</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ formatDate(contextFile?.updatedAt) }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">文件大小</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ formatSize(contextFile?.content?.length || 0) }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">字符数</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ contextFile?.content?.length || 0 }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">行数</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ contextFile?.content ? contextFile.content.split('\n').length : 0 }}</span>
            </div>
            <div v-if="contextFile?.type === 'folder'" class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">子项数量</span>
              <span class="text-xs" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ children.length }}</span>
            </div>
            <div class="flex justify-between items-center py-2">
              <span class="text-xs" :class="isDark ? 'text-slate-500' : 'text-gray-500'">文件 ID</span>
              <span class="text-xs font-mono" :class="isDark ? 'text-slate-400' : 'text-gray-600'">{{ contextFile?.id?.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showMoveDialog"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      @click.self="showMoveDialog = false"
    >
      <div class="w-96 max-h-[70vh] p-5 rounded-lg shadow-xl border overflow-hidden" :class="isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-sm font-semibold" :class="isDark ? 'text-slate-200' : 'text-gray-800'">移动到</h3>
          <button
            @click="showMoveDialog = false"
            class="p-1 rounded-md theme-btn-secondary"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="flex items-center gap-2 mb-4 p-2 rounded-md" :class="isDark ? 'bg-slate-700' : 'bg-gray-100'">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0" :class="contextFile?.type === 'folder' ? 'text-amber-400' : (isDark ? 'text-slate-400' : 'text-gray-400')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path v-if="contextFile?.type === 'folder'" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="currentColor"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-sm truncate" :class="isDark ? 'text-slate-300' : 'text-gray-700'">{{ contextFile?.name }}</span>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar">
          <div
            class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors mb-1"
            :class="selectedFolderId === null ? (isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-50 text-sky-600') : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700')"
            @click="selectedFolderId = null"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <span class="text-sm">根目录</span>
          </div>
          <template v-for="folder in allFolders" :key="folder.id">
            <div
              v-if="folder.id !== contextFile?.id"
              class="flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors"
              :class="[
                selectedFolderId === folder.id ? (isDark ? 'bg-sky-900/50 text-sky-300' : 'bg-sky-50 text-sky-600') : (isDark ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-100 text-gray-700'),
                { 'pl-6': folder.parentId }
              ]"
              @click="selectedFolderId = folder.id"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 shrink-0 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span class="text-sm truncate">{{ folder.name }}</span>
            </div>
          </template>
        </div>
        <div class="flex justify-end gap-2 mt-4 pt-3 border-t" :class="isDark ? 'border-slate-700' : 'border-gray-200'">
          <button
            @click="showMoveDialog = false"
            class="px-4 py-1.5 rounded-md text-sm theme-btn-secondary"
          >
            取消
          </button>
          <button
            @click="confirmMove"
            class="px-4 py-1.5 rounded-md text-sm font-medium theme-btn-primary"
          >
            确定移动
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  file: Object,
  level: Number,
  currentFileId: String,
  expandedIds: Object,
  isDark: Boolean,
  getChildren: Function,
  rootFiles: Array
})

const emit = defineEmits([
  'select', 'toggle', 'create-file', 'create-folder', 'move', 'rename'
])

const isCurrent = computed(() => props.file.id === props.currentFileId)
const isExpanded = computed(() => props.expandedIds.has(props.file.id))
const children = computed(() => props.getChildren(props.file.id))
const allFolders = computed(() => {
  const folders = []
  const rootItems = props.rootFiles || []
  const collectFolders = (items) => {
    if (!items) return
    items.forEach(item => {
      if (item.type === 'folder') {
        folders.push(item)
        collectFolders(props.getChildren(item.id))
      }
    })
  }
  collectFolders(rootItems)
  return folders
})

const contextMenuVisible = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextFile = ref(null)
const showFileDetails = ref(false)
const isDraggingOver = ref(false)
const showMoveDialog = ref(false)
const selectedFolderId = ref(null)
const isRenaming = ref(false)
const renameValue = ref('')
const renameInput = ref(null)

function showContextMenu(e, file) {
  contextFile.value = file
  contextMenuX.value = e.clientX
  contextMenuY.value = e.clientY
  contextMenuVisible.value = true

  const closeHandler = () => {
    contextMenuVisible.value = false
    document.removeEventListener('click', closeHandler)
    document.removeEventListener('scroll', closeHandler)
  }
  setTimeout(() => {
    document.addEventListener('click', closeHandler)
    document.addEventListener('scroll', closeHandler)
  }, 0)
}

function handleAction(action) {
  const file = contextFile.value
  contextMenuVisible.value = false

  switch (action) {
    case 'details':
      showFileDetails.value = true
      break
    case 'delete':
      if (confirm(`确定要删除"${file.name}"吗？`)) {
        window.dispatchEvent(new CustomEvent('file-delete', { detail: { fileId: file.id } }))
      }
      break
    case 'move':
      showMoveDialog.value = true
      selectedFolderId.value = file.parentId
      break
    case 'rename':
      startRename()
      break
    case 'createFile':
      emit('create-file', file.id)
      break
    case 'createFolder':
      emit('create-folder', file.id)
      break
  }
}

function confirmMove() {
  const file = contextFile.value
  if (file && selectedFolderId.value !== file.parentId) {
    emit('move', { fileId: file.id, newParentId: selectedFolderId.value })
    showMoveDialog.value = false
  }
}

function startRename() {
  isRenaming.value = true
  renameValue.value = props.file.name
  setTimeout(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      const name = props.file.name
      const lastDot = name.lastIndexOf('.')
      if (lastDot > 0 && props.file.type === 'file') {
        renameInput.value.setSelectionRange(0, lastDot)
      } else {
        renameInput.value.setSelectionRange(0, name.length)
      }
    }
  }, 0)
}

function cancelRename() {
  isRenaming.value = false
}

function confirmRename() {
  const newName = renameValue.value.trim()
  if (!newName) {
    cancelRename()
    return
  }
  if (newName === props.file.name) {
    cancelRename()
    return
  }
  const siblings = props.getChildren(props.file.parentId) || []
  const hasDuplicate = siblings.some(s => s.id !== props.file.id && s.name === newName)
  if (hasDuplicate) {
    return
  }
  emit('rename', { fileId: props.file.id, newName })
  isRenaming.value = false
}

const isNameDuplicate = computed(() => {
  if (!isRenaming.value) return false
  const newName = renameValue.value.trim()
  if (!newName || newName === props.file.name) return false
  const siblings = props.getChildren(props.file.parentId) || []
  return siblings.some(s => s.id !== props.file.id && s.name === newName)
})

function handleDragStart(e) {
  e.dataTransfer.setData('text/plain', props.file.id)
  e.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(e) {
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  isDraggingOver.value = true
}

function handleDragLeave() {
  isDraggingOver.value = false
}

function handleDrop(e) {
  e.preventDefault()
  isDraggingOver.value = false
  const draggedId = e.dataTransfer.getData('text/plain')
  if (draggedId && draggedId !== props.file.id) {
    if (props.file.type === 'folder') {
      emit('move', { fileId: draggedId, newParentId: props.file.id })
    } else {
      emit('move', { fileId: draggedId, newParentId: props.file.parentId })
    }
  }
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

function formatDate(timestamp) {
  if (!timestamp) return '-'
  const date = new Date(timestamp)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>
