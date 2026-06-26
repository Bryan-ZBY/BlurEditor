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
      class="ft-item"
      :data-file-id="file.id"
      :class="[
        isDraggingOver ? 'drag-over' : '',
        isDark ? 'dark' : 'light'
      ]"
      @click="!isRenaming && $emit('toggle', file.id)"
      @dblclick.stop="startRename"
      @contextmenu.prevent="showContextMenu($event, file)"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-3.5 h-3.5 ft-chevron"
        :class="{ 'is-open': isExpanded }"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ft-folder" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
      <template v-if="isRenaming">
        <input
          ref="renameInput"
          v-model="renameValue"
          class="ft-rename-input"
          :class="isNameDuplicate ? 'duplicate' : (isDark ? 'dark' : 'light')"
          @keydown.enter="confirmRename"
          @keydown.escape="cancelRename"
          @blur="confirmRename"
        />
      </template>
      <span v-else class="ft-name">{{ file.name }}</span>
      <span v-if="children.length > 0" class="ft-count">{{ children.length }}</span>
    </div>

    <div
      v-else
      class="ft-item"
      :data-file-id="file.id"
      :class="[
        isDraggingOver ? 'drag-over' : '',
        isCurrent ? 'current' : '',
        isDark ? 'dark' : 'light'
      ]"
      @click="!isRenaming && $emit('select', file.id)"
      @dblclick.stop="startRename"
      @contextmenu.prevent="showContextMenu($event, file)"
    >
      <span class="w-3.5 shrink-0"></span>
      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ft-file" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <template v-if="isRenaming">
        <input
          ref="renameInput"
          v-model="renameValue"
          class="ft-rename-input"
          :class="isNameDuplicate ? 'duplicate' : (isDark ? 'dark' : 'light')"
          @keydown.enter="confirmRename"
          @keydown.escape="cancelRename"
          @blur="confirmRename"
        />
      </template>
      <span v-else class="ft-name">{{ file.name }}</span>
      <span class="ft-size">{{ formatSize(file.content?.length || 0) }}</span>
      <span class="ft-date">{{ formatDate(file.updatedAt) }}</span>
    </div>

    <Transition name="tree">
      <div v-if="file.type === 'folder' && isExpanded" class="ft-children">
        <FileTreeItem
          v-for="child in children"
          :key="child.id"
          :file="child"
          :level="level + 1"
          :current-file-id="currentFileId"
          :expanded-ids="expandedIds"
          :is-dark="isDark"
          :get-children="getChildren"
          :get-sorted-files="getSortedFiles"
          @select="$emit('select', $event)"
          @toggle="$emit('toggle', $event)"
          @create-file="$emit('create-file', $event)"
          @create-folder="$emit('create-folder', $event)"
          @move="$emit('move', $event)"
          @rename="$emit('rename', $event)"
        />
        <div
          v-if="children.length === 0"
          class="ft-empty"
          :style="{ paddingLeft: (level + 1) * 12 + 8 + 'px' }"
        >
          空文件夹
        </div>
      </div>
    </Transition>

    <!-- 上下文菜单 -->
    <Teleport to="body">
      <Transition name="context">
        <div
          v-if="contextMenuVisible"
          class="ft-context-menu"
          :class="isDark ? 'dark' : 'light'"
          :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        >
          <button @click="handleAction('details')" class="ft-context-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <span>详情</span>
          </button>
          <button @click="handleAction('rename')" class="ft-context-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            <span>重命名</span>
          </button>
          <button @click="handleAction('move')" class="ft-context-item">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
            <span>移动到</span>
          </button>
          <template v-if="contextFile?.type === 'file'">
            <div class="ft-context-divider"></div>
            <button @click="handleAction('delete')" class="ft-context-item danger">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>删除</span>
            </button>
          </template>
          <template v-else>
            <button @click="handleAction('createFile')" class="ft-context-item">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              <span>新建文件</span>
            </button>
            <button @click="handleAction('createFolder')" class="ft-context-item">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              <span>新建文件夹</span>
            </button>
            <div class="ft-context-divider"></div>
            <button @click="handleAction('delete')" class="ft-context-item danger">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              <span>删除</span>
            </button>
          </template>
        </div>
      </Transition>
    </Teleport>

    <!-- 删除确认弹窗 -->
    <ConfirmModal
      :visible="showDeleteConfirm"
      :is-dark="isDark"
      title="确认删除"
      :message="deleteConfirmMessage"
      icon-type="warning"
      @confirm="handleDeleteConfirm"
      @cancel="showDeleteConfirm = false"
    />

    <!-- 文件详情弹窗 -->
    <Transition name="modal">
      <div
        v-if="showFileDetails"
        class="ft-modal-overlay"
        @click.self="showFileDetails = false"
      >
        <div class="ft-modal" :class="isDark ? 'dark' : 'light'">
          <div class="ft-modal-header">
            <h3>文件详情</h3>
            <button @click="showFileDetails = false" class="ft-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="ft-modal-body">
            <div class="ft-detail-icon">
              <svg v-if="contextFile?.type === 'folder'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" :class="isDark ? 'text-slate-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div class="ft-detail-info">
              <p class="ft-detail-name">{{ contextFile?.name }}</p>
              <p class="ft-detail-type">{{ contextFile?.type === 'folder' ? '文件夹' : 'Markdown 文件' }}</p>
            </div>
          </div>
          <div class="ft-detail-list">
            <div class="ft-detail-row">
              <span>创建时间</span>
              <span>{{ formatDate(contextFile?.createdAt) }}</span>
            </div>
            <div class="ft-detail-row">
              <span>修改时间</span>
              <span>{{ formatDate(contextFile?.updatedAt) }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="ft-detail-row">
              <span>文件大小</span>
              <span>{{ formatSize(contextFile?.content?.length || 0) }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="ft-detail-row">
              <span>字符数</span>
              <span>{{ contextFile?.content?.length || 0 }}</span>
            </div>
            <div v-if="contextFile?.type === 'file'" class="ft-detail-row">
              <span>行数</span>
              <span>{{ contextFile?.content ? contextFile.content.split('\n').length : 0 }}</span>
            </div>
            <div v-if="contextFile?.type === 'folder'" class="ft-detail-row">
              <span>子项数量</span>
              <span>{{ children.length }}</span>
            </div>
            <div class="ft-detail-row">
              <span>文件 ID</span>
              <span class="font-mono">{{ contextFile?.id?.substring(0, 8) }}...</span>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 移动对话框 -->
    <Transition name="modal">
      <div
        v-if="showMoveDialog"
        class="ft-modal-overlay"
        @click.self="showMoveDialog = false"
      >
        <div class="ft-modal" :class="isDark ? 'dark' : 'light'">
          <div class="ft-modal-header">
            <h3>移动到</h3>
            <button @click="showMoveDialog = false" class="ft-modal-close">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="ft-move-current">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" :class="contextFile?.type === 'folder' ? 'text-amber-400' : (isDark ? 'text-slate-400' : 'text-gray-400')" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path v-if="contextFile?.type === 'folder'" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" fill="currentColor"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>{{ contextFile?.name }}</span>
          </div>
          <div class="ft-move-list custom-scrollbar">
            <div
              class="ft-move-option"
              :class="{ active: selectedFolderId === null, dark: isDark }"
              @click="selectedFolderId = null"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span>根目录</span>
            </div>
            <template v-for="folder in allFolders" :key="folder.id">
              <div
                v-if="folder.id !== contextFile?.id"
                class="ft-move-option"
                :class="{ active: selectedFolderId === folder.id, dark: isDark, child: folder.parentId }"
                @click="selectedFolderId = folder.id"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                <span>{{ folder.name }}</span>
              </div>
            </template>
          </div>
          <div class="ft-modal-footer">
            <button @click="showMoveDialog = false" class="ft-btn-secondary">
              取消
            </button>
            <button @click="confirmMove" class="ft-btn-primary">
              确定移动
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ConfirmModal from './ConfirmModal.vue'

const props = defineProps({
  file: Object,
  level: Number,
  currentFileId: String,
  expandedIds: Object,
  isDark: Boolean,
  getChildren: Function,
  getSortedFiles: Function,
  rootFiles: Array
})

const emit = defineEmits([
  'select', 'toggle', 'create-file', 'create-folder', 'move', 'rename'
])

const isCurrent = computed(() => props.file.id === props.currentFileId)
const isExpanded = computed(() => props.expandedIds.has(props.file.id))
const children = computed(() => {
  const rawChildren = props.getChildren(props.file.id)
  if (props.getSortedFiles) {
    return props.getSortedFiles(rawChildren)
  }
  return rawChildren
})
const deleteConfirmMessage = computed(() => {
  return `确定要删除 "${deleteFile.value?.name || ''}" 吗？此操作无法撤销。`
})
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
const showDeleteConfirm = ref(false)
const deleteFile = ref(null)

function showContextMenu(e, file) {
  contextFile.value = file

  const menuWidth = 170
  const menuHeight = 220
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let x = e.clientX
  let y = e.clientY

  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 8
  }
  if (y + menuHeight > windowHeight) {
    y = windowHeight - menuHeight - 8
  }

  x = Math.max(8, x)
  y = Math.max(8, y)

  contextMenuX.value = x
  contextMenuY.value = y
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
      deleteFile.value = file
      showDeleteConfirm.value = true
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

function handleDeleteConfirm() {
  const file = deleteFile.value
  if (file) {
    window.dispatchEvent(new CustomEvent('file-delete', { detail: { fileId: file.id } }))
  }
  showDeleteConfirm.value = false
  deleteFile.value = null
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
  e.target.style.opacity = '0.4'
  setTimeout(() => {
    e.target.style.opacity = ''
  }, 0)
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

<style scoped>
/* 文件树项 */
.ft-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.35rem 0.5rem;
  margin: 0 0.25rem;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.8125rem;
  position: relative;
  overflow: hidden;
}

.ft-item.light {
  color: #475569;
}
.ft-item.light:hover {
  background: rgba(59, 130, 246, 0.06);
  color: #0f172a;
}
.ft-item.light.current {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
  font-weight: 600;
}
.ft-item.light.current::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-radius: 0 2px 2px 0;
}

.ft-item.dark {
  color: #94a3b8;
}
.ft-item.dark:hover {
  background: rgba(59, 130, 246, 0.1);
  color: #f1f5f9;
}
.ft-item.dark.current {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  font-weight: 600;
}
.ft-item.dark.current::before {
  content: '';
  position: absolute;
  left: 0;
  top: 20%;
  bottom: 20%;
  width: 3px;
  background: linear-gradient(180deg, #3b82f6, #2563eb);
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
}

.ft-item.drag-over {
  background: rgba(59, 130, 246, 0.15) !important;
  border: 1px dashed var(--accent-indigo, #3b82f6);
  box-shadow: 0 0 12px var(--accent-glow, rgba(59,130,246,0.2));
}

/* 展开箭头 */
.ft-chevron {
  flex-shrink: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  opacity: 0.5;
}
.ft-chevron.is-open {
  transform: rotate(90deg);
  opacity: 0.8;
}

/* 图标 */
.ft-folder {
  flex-shrink: 0;
  color: #f59e0b;
  filter: drop-shadow(0 1px 2px rgba(245, 158, 11, 0.2));
}
.ft-file {
  flex-shrink: 0;
  opacity: 0.5;
  transition: opacity 0.15s ease;
}
.ft-item:hover .ft-file {
  opacity: 0.8;
}

/* 名称 */
.ft-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.ft-count {
  font-size: 0.65rem;
  font-weight: 600;
  padding: 0.1rem 0.375rem;
  border-radius: 9999px;
  background: var(--hover-bg, rgba(0,0,0,0.04));
  color: var(--text-muted, #94a3b8);
  min-width: 1.25rem;
  text-align: center;
}

.ft-size {
  font-size: 0.7rem;
  opacity: 0.5;
  font-variant-numeric: tabular-nums;
  margin-left: auto;
  white-space: nowrap;
}

.ft-date {
  font-size: 0.65rem;
  opacity: 0;
  width: 0;
  overflow: hidden;
  font-variant-numeric: tabular-nums;
  margin-left: 0;
  white-space: nowrap;
  transition: all 0.2s ease;
  pointer-events: none;
}

.ft-item:hover .ft-date {
  opacity: 0.5;
  width: auto;
  margin-left: 0.75rem;
}

/* 重命名输入框 */
.ft-rename-input {
  flex: 1;
  font-size: 0.8125rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--accent-indigo, #3b82f6);
  outline: none;
  padding: 0;
  font-weight: 500;
  transition: all 0.15s ease;
}
.ft-rename-input.light {
  color: #0f172a;
}
.ft-rename-input.dark {
  color: #f1f5f9;
}
.ft-rename-input.duplicate {
  border-bottom-color: #ef4444;
  color: #ef4444;
}

/* 子项展开动画 */
.ft-children {
  overflow: hidden;
}

.tree-enter-active,
.tree-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 800px;
}

.tree-enter-from,
.tree-leave-to {
  opacity: 0;
  max-height: 0;
}

/* 空文件夹 */
.ft-empty {
  padding: 0.25rem 0.5rem;
  margin: 0 0.25rem;
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  opacity: 0.6;
}

/* 上下文菜单 */
.ft-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 170px;
  padding: 0.5rem;
  border-radius: 0.625rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transform-origin: top left;
}

.ft-context-menu.light {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.12);
}
.ft-context-menu.dark {
  background: rgba(21, 21, 40, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.ft-context-item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.625rem;
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.15s ease;
  color: #334155;
}
.ft-context-menu.dark .ft-context-item {
  color: #e2e8f0;
}
.ft-context-item:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateX(2px);
}
.ft-context-menu.dark .ft-context-item:hover {
  background: rgba(59, 130, 246, 0.15);
}
.ft-context-item.danger {
  color: #ef4444;
}
.ft-context-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}
.ft-context-item svg {
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}
.ft-context-item:hover svg {
  opacity: 1;
}

.ft-context-divider {
  height: 1px;
  margin: 0.375rem 0;
  background: rgba(59, 130, 246, 0.1);
}

/* 上下文菜单动画 */
.context-enter-active,
.context-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.context-enter-from,
.context-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 模态框 */
.ft-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
}

.ft-modal {
  width: 22rem;
  max-width: calc(100vw - 2rem);
  border-radius: 1rem;
  border: 1px solid;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
  overflow: hidden;
  animation: scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.ft-modal.light {
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.1);
}
.ft-modal.dark {
  background: #151528;
  border-color: rgba(59, 130, 246, 0.2);
}

.ft-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid;
}
.ft-modal.light .ft-modal-header {
  border-color: rgba(59, 130, 246, 0.1);
}
.ft-modal.dark .ft-modal-header {
  border-color: rgba(59, 130, 246, 0.15);
}
.ft-modal-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}
.ft-modal.light .ft-modal-header h3 {
  color: #0f172a;
}
.ft-modal.dark .ft-modal-header h3 {
  color: #e2e8f0;
}

.ft-modal-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  border: none;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.ft-modal-close:hover {
  background: rgba(0,0,0,0.05);
  color: #0f172a;
}
.ft-modal.dark .ft-modal-close:hover {
  background: rgba(255,255,255,0.05);
  color: #f1f5f9;
}

.ft-modal-body {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
}

.ft-detail-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.ft-modal.light .ft-detail-icon {
  background: #f1f5f9;
}
.ft-modal.dark .ft-detail-icon {
  background: rgba(255,255,255,0.05);
}

.ft-detail-info {
  min-width: 0;
}
.ft-detail-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
}
.ft-modal.light .ft-detail-name {
  color: #0f172a;
}
.ft-modal.dark .ft-detail-name {
  color: #e2e8f0;
}
.ft-detail-type {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
}
.ft-modal.light .ft-detail-type {
  color: #64748b;
}
.ft-modal.dark .ft-detail-type {
  color: #64748b;
}

.ft-detail-list {
  padding: 0 1.25rem 1.25rem;
}
.ft-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  border-bottom: 1px solid;
}
.ft-modal.light .ft-detail-row {
  border-color: rgba(59, 130, 246, 0.06);
  color: #475569;
}
.ft-modal.dark .ft-detail-row {
  border-color: rgba(59, 130, 246, 0.1);
  color: #94a3b8;
}
.ft-detail-row span:last-child {
  font-weight: 500;
}
.ft-modal.light .ft-detail-row span:last-child {
  color: #0f172a;
}
.ft-modal.dark .ft-detail-row span:last-child {
  color: #e2e8f0;
}

/* 移动对话框 */
.ft-move-current {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 1.25rem 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
}
.ft-modal.light .ft-move-current {
  background: #f1f5f9;
  color: #334155;
}
.ft-modal.dark .ft-move-current {
  background: rgba(255,255,255,0.05);
  color: #cbd5e1;
}

.ft-move-list {
  max-height: 16rem;
  overflow-y: auto;
  margin: 0 1.25rem;
  padding: 0.25rem;
  border-radius: 0.5rem;
}
.ft-modal.light .ft-move-list {
  background: #f8fafc;
}
.ft-modal.dark .ft-move-list {
  background: rgba(0,0,0,0.2);
}

.ft-move-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all 0.15s ease;
  margin-bottom: 0.125rem;
  color: #475569;
}
.ft-move-option.dark {
  color: #94a3b8;
}
.ft-move-option.child {
  padding-left: 1.5rem;
}
.ft-move-option:hover {
  background: rgba(59, 130, 246, 0.08);
  color: #2563eb;
}
.ft-move-option.dark:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
}
.ft-move-option.active {
  background: rgba(59, 130, 246, 0.12);
  color: #2563eb;
  font-weight: 600;
}
.ft-move-option.dark.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
}

.ft-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.875rem 1.25rem;
  border-top: 1px solid;
  margin-top: 0.75rem;
}
.ft-modal.light .ft-modal-footer {
  border-color: rgba(59, 130, 246, 0.1);
}
.ft-modal.dark .ft-modal-footer {
  border-color: rgba(59, 130, 246, 0.15);
}

.ft-btn-secondary {
  padding: 0.45rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid;
  font-size: 0.8125rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  background: transparent;
}
.ft-modal.light .ft-btn-secondary {
  border-color: rgba(59, 130, 246, 0.2);
  color: #475569;
}
.ft-modal.light .ft-btn-secondary:hover {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.3);
}
.ft-modal.dark .ft-btn-secondary {
  border-color: rgba(59, 130, 246, 0.2);
  color: #94a3b8;
}
.ft-modal.dark .ft-btn-secondary:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.ft-btn-primary {
  padding: 0.45rem 1rem;
  border-radius: 0.5rem;
  border: none;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}
.ft-btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}
.ft-btn-primary:active {
  transform: translateY(0);
}

/* 模态框动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .ft-modal,
.modal-leave-to .ft-modal {
  transform: scale(0.95);
  opacity: 0;
}
</style>
