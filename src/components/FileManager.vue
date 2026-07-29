<template>
  <div class="file-manager" :class="{ 'is-dark': isDark }">
    <div class="fm-header">
      <div class="fm-header-left">
        <div class="fm-logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
          </svg>
        </div>
        <span class="fm-title">文件管理</span>
      </div>
      <div class="fm-actions">
        <button
          @click="showNewMenu = !showNewMenu"
          class="fm-action-btn"
          :class="{ active: showNewMenu }"
          title="新建"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button
          @click="$emit('openImport')"
          class="fm-action-btn"
          title="导入文件"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
        </button>
        <button
          @click="showSortMenu = !showSortMenu"
          class="fm-action-btn"
          :class="{ active: showSortMenu }"
          :title="sortButtonTitle"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 4h13M3 16h13M16 4l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </button>
      </div>
    </div>

    <Transition name="slide">
      <div v-if="showNewMenu" class="fm-new-menu">
        <button @click="createNewFile" class="fm-new-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>新建文件</span>
        </button>
        <button @click="createNewFolder" class="fm-new-item">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>新建文件夹</span>
        </button>
      </div>
    </Transition>

    <Transition name="slide">
      <div v-if="showSortMenu" class="fm-sort-menu">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          @click="handleSort(option.value)"
          class="fm-sort-item"
          :class="{ active: sortMode === option.value }"
        >
          <svg v-if="option.icon === 'name'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
          </svg>
          <svg v-else-if="option.icon === 'date'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
          </svg>
          <svg v-else-if="option.icon === 'size'" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"/>
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M7 12h10M10 16h4" />
          </svg>
          <span>{{ option.label }}</span>
          <span v-if="sortMode === option.value" class="fm-sort-direction">
            {{ sortDirectionLabel }}
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" :class="{ desc: sortDirection === 'desc' }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v14m0 0l-5-5m5 5l5-5"/>
            </svg>
          </span>
        </button>
      </div>
    </Transition>

    <div class="fm-toolbar">
      <div class="fm-search">
        <svg class="fm-search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchText" type="text" placeholder="搜索文件名..." />
        <button v-if="searchText" class="fm-search-clear" @click="searchText = ''">×</button>
      </div>
      <button class="fm-fav-toggle" @click="showFavorites = !showFavorites">
        收藏 {{ favoriteFiles.length }}
      </button>
    </div>

    <div v-if="showFavorites && favoriteFiles.length > 0" class="fm-quick-list">
      <div class="fm-quick-title">收藏</div>
      <div
        v-for="file in favoriteFiles"
        :key="file.id"
        class="fm-quick-item"
        @click="handleQuickSelect(file.id)"
      >
        <span class="quick-dot">★</span>
        <FileHoverPreview :file="file" :is-dark="isDark" name-class="truncate" />
      </div>
    </div>

    <div v-if="recentList.length > 0" class="fm-quick-list">
      <div class="fm-quick-title">最近打开</div>
      <div
        v-for="file in recentList"
        :key="file.id"
        class="fm-quick-item"
        @click="handleQuickSelect(file.id)"
      >
        <span class="quick-dot recent"></span>
        <FileHoverPreview :file="file" :is-dark="isDark" name-class="truncate" />
      </div>
    </div>

    <div
      class="fm-body custom-scrollbar"
      :class="{ 'root-drop-over': isRootDragOver }"
      @dragover.prevent="handleRootDragOver"
      @dragleave="handleRootDragLeave"
      @drop.prevent="handleRootDrop"
    >
      <template v-if="searchText">
        <div v-if="searchMatches.length === 0" class="fm-empty">
          <div class="fm-empty-icon">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <p class="fm-empty-text">未找到匹配文件</p>
        </div>
        <div v-else class="fm-search-results">
          <div
            v-for="file in searchMatches"
            :key="file.id"
            class="fm-search-item"
            @click="handleQuickSelect(file.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <FileHoverPreview :file="file" :is-dark="isDark" name-class="fm-search-name" />
            <span class="fm-search-hint">{{ file.type === 'folder' ? '文件夹' : '文档' }}</span>
          </div>
        </div>
      </template>

      <TransitionGroup v-if="!searchText" name="list" tag="div">
        <FileTreeItem
          v-for="(file, index) in displayedFiles"
          :key="file.id"
          :file="file"
          :index="index"
          :level="0"
          :current-file-id="currentFileId"
          :expanded-ids="expandedIds"
          :is-dark="isDark"
          :get-children="getChildren"
          :get-sorted-files="getSortedFiles"
          :root-files="rootFiles"
          :auto-rename-file-id="autoRenameFileId"
          :style="{ animationDelay: index * 30 + 'ms' }"
          @select="$emit('selectFile', $event)"
          @toggle="toggleFolder"
          @create-file="$emit('createFile', $event)"
          @create-folder="$emit('createFolder', $event)"
          @move="$emit('moveFile', $event)"
          @reorder="handleReorder"
          @rename="$emit('renameFile', $event)"
          @archive="$emit('archiveFile', $event)"
          @duplicate="$emit('duplicateFile', $event)"
          @toggleFavorite="$emit('toggleFavorite', $event)"
          @show-details="openFileProperties"
          @context-open="closeFileProperties"
          @auto-rename-consumed="$emit('auto-rename-consumed', $event)"
        />
      </TransitionGroup>

      <div v-if="displayedFiles.length === 0 && !searchText" class="fm-empty">
        <div class="fm-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <p class="fm-empty-text">暂无文件</p>
        <p class="fm-empty-hint">点击新建按钮创建一个文件</p>
      </div>
    </div>

    <div v-if="archivedFiles.length > 0" class="fm-archive">
      <div class="fm-archive-bar">
        <button @click="showArchived = !showArchived" class="fm-archive-toggle">
          <span class="fm-archive-left">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 archive-icon" :class="{ open: showArchived }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <span>回收站 ({{ archivedFiles.length }})</span>
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-3.5 h-3.5 chevron"
            :class="{ open: showArchived }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button class="fm-trash-empty" title="清空回收站" @click="$emit('emptyTrash')">
          清空
        </button>
      </div>
      <Transition name="expand">
        <div v-if="showArchived" class="fm-archive-list">
          <div
            v-for="(file, index) in archivedFiles"
            :key="file.id"
            @click="$emit('unarchiveFile', file.id)"
            @contextmenu.prevent.stop="showArchivedContextMenu($event, file)"
            class="fm-archive-item"
            :style="{ animationDelay: index * 40 + 'ms' }"
          >
            <svg v-if="file.type === 'folder'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <FileHoverPreview :file="file" :is-dark="isDark" name-class="truncate" />
            <span class="restore-badge">恢复</span>
          </div>
        </div>
      </Transition>
    </div>

    <Teleport to="body">
      <Transition name="context">
        <div
          v-if="archivedContextMenuVisible"
          class="fm-context-menu"
          :class="isDark ? 'dark' : 'light'"
          :style="{ left: archivedContextMenuX + 'px', top: archivedContextMenuY + 'px' }"
        >
          <button class="fm-context-item" @click="handleArchivedContextAction('restore')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a5 5 0 010 10H7m-4-10l4-4m-4 4l4 4" />
            </svg>
            <span>恢复</span>
          </button>
          <div class="fm-context-divider"></div>
          <button class="fm-context-item danger" @click="handleArchivedContextAction('delete')">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>删除</span>
          </button>
        </div>
      </Transition>
    </Teleport>

    <FilePropertiesModal
      :visible="Boolean(propertyFile)"
      :file="propertyFile"
      :is-dark="isDark"
      :child-count="propertyFileChildCount"
      @close="closeFileProperties"
    />
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import FileTreeItem from './FileTreeItem.vue'
import FileHoverPreview from './FileHoverPreview.vue'
import FilePropertiesModal from './FilePropertiesModal.vue'

const props = defineProps({
  rootFiles: Array,
  archivedFiles: Array,
  recentFiles: Array,
  files: Array,
  currentFileId: String,
  getChildren: Function,
  isDark: Boolean,
  sortMode: String,
  sortDirection: { type: String, default: 'asc' },
  getSortedFiles: Function,
  autoRenameFileId: String
})

const emit = defineEmits([
  'selectFile',
  'createFile',
  'createFolder',
  'moveFile',
  'reorderFile',
  'archiveFile',
  'deleteFile',
  'duplicateFile',
  'exportFile',
  'unarchiveFile',
  'emptyTrash',
  'renameFile',
  'openImport',
  'setSortMode',
  'toggleFavorite',
  'auto-rename-consumed'
])

const showNewMenu = ref(false)
const showArchived = ref(false)
const showSortMenu = ref(false)
const showFavorites = ref(true)
const searchText = ref('')
const expandedIds = ref(new Set())
const isRootDragOver = ref(false)
const archivedContextMenuVisible = ref(false)
const archivedContextMenuX = ref(0)
const archivedContextMenuY = ref(0)
const archivedContextFile = ref(null)
const propertyFile = ref(null)
const CLOSE_FILE_PREVIEW_EVENT = 'blur-editor-close-file-previews'
const CLOSE_FILE_CONTEXT_MENUS_EVENT = 'blur-editor-close-file-context-menus'
const FILE_DRAG_MIME = 'application/x-blureditor-file-id'

const sortOptions = [
  { value: 'name', label: '按名称', icon: 'name' },
  { value: 'date', label: '按时间', icon: 'date' },
  { value: 'size', label: '按大小', icon: 'size' }
]

const activeSortOption = computed(() => sortOptions.find((option) => option.value === props.sortMode) || sortOptions[0])
const sortDirectionLabel = computed(() => (props.sortDirection === 'desc' ? '逆序' : '正序'))
const sortButtonTitle = computed(() => `排序：${activeSortOption.value.label}，${sortDirectionLabel.value}`)

const displayedFiles = computed(() => {
  if (props.getSortedFiles) return props.getSortedFiles(props.rootFiles || [])
  return props.rootFiles || []
})

const searchMatches = computed(() => {
  const q = searchText.value.trim().toLowerCase()
  if (!q || !props.files) return []
  return props.files
    .filter((file) => !file.isArchived && file.type === 'file' && file.name.toLowerCase().includes(q))
    .sort((a, b) => (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt))
})

const favoriteFiles = computed(() => {
  if (!props.files) return []
  return props.files
    .filter((f) => !f.isArchived && f.isFavorite)
    .sort((a, b) => (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt))
})

const recentList = computed(() => (props.recentFiles || []).slice(0, 5))
const propertyFileChildCount = computed(() => {
  if (!propertyFile.value || propertyFile.value.type !== 'folder') return 0
  return props.getChildren?.(propertyFile.value.id)?.length || 0
})

watch(
  () => props.autoRenameFileId,
  (fileId) => {
    if (!fileId) return
    const file = props.files?.find((item) => item.id === fileId)
    if (!file) return

    searchText.value = ''
    expandAncestors(file)
  },
  { immediate: true }
)

function expandAncestors(file) {
  let parentId = file?.parentId
  while (parentId) {
    expandedIds.value.add(parentId)
    parentId = props.files?.find((item) => item.id === parentId)?.parentId
  }
}

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

function handleSort(mode) {
  const isCurrentMode = mode === props.sortMode
  emit('setSortMode', mode)
  if (!isCurrentMode) showSortMenu.value = false
}

function handleQuickSelect(fileId) {
  emit('selectFile', fileId)
}

function handleReorder(payload) {
  emit('reorderFile', payload)
}

function handleRootDragOver(event) {
  if (!Array.from(event.dataTransfer?.types || []).includes(FILE_DRAG_MIME)) return
  event.dataTransfer.dropEffect = 'move'
  isRootDragOver.value = true
}

function handleRootDragLeave(event) {
  if (event.currentTarget?.contains(event.relatedTarget)) return
  isRootDragOver.value = false
}

function handleRootDrop(event) {
  isRootDragOver.value = false
  const fileId = event.dataTransfer?.getData(FILE_DRAG_MIME)
  if (!fileId) return

  emit('reorderFile', {
    fileId,
    targetParentId: null,
    targetIndex: displayedFiles.value.length
  })
}

function closeFileProperties() {
  propertyFile.value = null
}

function openFileProperties(file) {
  closeArchivedContextMenu()
  propertyFile.value = null
  nextTick(() => {
    propertyFile.value = file
  })
}

function closeArchivedContextMenu() {
  archivedContextMenuVisible.value = false
  archivedContextFile.value = null
}

function showArchivedContextMenu(event, file) {
  window.dispatchEvent(new CustomEvent(CLOSE_FILE_CONTEXT_MENUS_EVENT))
  window.dispatchEvent(new CustomEvent(CLOSE_FILE_PREVIEW_EVENT))
  closeFileProperties()
  archivedContextFile.value = file
  showNewMenu.value = false
  showSortMenu.value = false

  const menuWidth = 150
  const menuHeight = 96
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight

  let x = event.clientX
  let y = event.clientY

  if (x + menuWidth > windowWidth) {
    x = windowWidth - menuWidth - 8
  }
  if (y + menuHeight > windowHeight) {
    y = windowHeight - menuHeight - 8
  }

  archivedContextMenuX.value = Math.max(8, x)
  archivedContextMenuY.value = Math.max(8, y)
  archivedContextMenuVisible.value = true

  const closeHandler = () => {
    closeArchivedContextMenu()
    document.removeEventListener('click', closeHandler)
    document.removeEventListener('contextmenu', closeHandler)
    document.removeEventListener('scroll', closeHandler)
  }
  setTimeout(() => {
    document.addEventListener('click', closeHandler)
    document.addEventListener('contextmenu', closeHandler)
    document.addEventListener('scroll', closeHandler)
  }, 0)
}

function handleArchivedContextAction(action) {
  const file = archivedContextFile.value
  closeArchivedContextMenu()
  if (!file) return

  if (action === 'restore') {
    emit('unarchiveFile', file.id)
    return
  }

  if (action === 'delete') {
    emit('deleteFile', file.id)
  }
}

watch(showNewMenu, (val) => {
  if (val) {
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!e.target.closest('.fm-action-btn') && !e.target.closest('.fm-new-menu')) {
          showNewMenu.value = false
          document.removeEventListener('click', closeHandler)
        }
      }
      document.addEventListener('click', closeHandler)
    }, 0)
  }
})

watch(showSortMenu, (val) => {
  if (val) {
    setTimeout(() => {
      const closeHandler = (e) => {
        if (!e.target.closest('.fm-action-btn') && !e.target.closest('.fm-sort-menu')) {
          showSortMenu.value = false
          document.removeEventListener('click', closeHandler)
        }
      }
      document.addEventListener('click', closeHandler)
    }, 0)
  }
})

defineExpose({ expandToFile })

onMounted(() => {
  window.addEventListener(CLOSE_FILE_CONTEXT_MENUS_EVENT, closeArchivedContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener(CLOSE_FILE_CONTEXT_MENUS_EVENT, closeArchivedContextMenu)
})

function expandToFile(fileId, parentFolderIds) {
  parentFolderIds.forEach((id) => expandedIds.value.add(id))
  nextTick(() => {
    const fileEl = document.querySelector(`.ft-item[data-file-id="${fileId}"]`)
    if (fileEl) {
      fileEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  })
}
</script>

<style scoped>
.file-manager {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg, #0f172a);
  border-right: 1px solid var(--border-color, #e5e7eb);
  color: var(--text-primary, #e2e8f0);
}

.fm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.7rem 0.75rem;
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
}

.fm-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.fm-logo {
  width: 1.2rem;
  height: 1.2rem;
  color: var(--accent-indigo, #60a5fa);
}

.fm-title {
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.fm-actions {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.fm-action-btn {
  width: 1.95rem;
  height: 1.95rem;
  border-radius: 0.55rem;
  border: 1px solid transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted, #94a3b8);
  background: transparent;
  cursor: pointer;
}

.fm-action-btn svg {
  width: 0.9rem;
  height: 0.9rem;
}

.fm-action-btn:hover {
  color: var(--text-primary, #e2e8f0);
  background: var(--hover-bg, rgba(96, 165, 250, 0.08));
}

.fm-action-btn.active,
.fm-action-btn.active:hover {
  background: var(--hover-bg-strong, rgba(96, 165, 250, 0.14));
  color: var(--accent-indigo, #60a5fa);
  border-color: var(--accent-indigo, rgba(96, 165, 250, 0.25));
}

.fm-new-menu,
.fm-sort-menu {
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
  background: var(--editor-bg, #0f172a);
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fm-new-item,
.fm-sort-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
  text-align: left;
  border-radius: 0.5rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-primary, #e2e8f0);
  padding: 0.44rem 0.52rem;
  cursor: pointer;
  font-size: 0.8rem;
}

.fm-new-item:hover,
.fm-sort-item:hover {
  background: var(--hover-bg, rgba(96, 165, 250, 0.09));
}

.fm-new-item svg,
.fm-sort-item svg {
  width: 0.95rem;
  height: 0.95rem;
  color: var(--text-muted, #94a3b8);
  flex-shrink: 0;
}

.fm-sort-item {
  justify-content: flex-start;
}

.fm-sort-item.active {
  background: var(--hover-bg-strong, rgba(96, 165, 250, 0.16));
  border-color: var(--accent-indigo, rgba(96, 165, 250, 0.25));
}

.fm-sort-direction {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  color: var(--accent-indigo, #60a5fa);
  font-size: 0.68rem;
  font-weight: 700;
}

.fm-sort-direction svg {
  color: currentColor;
  transition: transform 0.16s ease;
}

.fm-sort-direction svg.desc {
  transform: rotate(180deg);
}

.fm-toolbar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.55rem 0.6rem 0.45rem;
}

.fm-search {
  position: relative;
  flex: 1;
}

.fm-search-icon {
  width: 0.95rem;
  height: 0.95rem;
  position: absolute;
  left: 0.55rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted, #94a3b8);
}

.fm-search input {
  width: 100%;
  border-radius: 0.6rem;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.25));
  background: transparent;
  color: var(--text-primary, #e2e8f0);
  height: 2rem;
  padding: 0 2rem 0 2rem;
  font-size: 0.82rem;
}

.fm-search input::placeholder {
  color: var(--text-muted, #94a3b8);
}

.fm-search-clear {
  position: absolute;
  right: 0.35rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  color: var(--text-muted, #94a3b8);
  background: var(--hover-bg, rgba(148, 163, 184, 0.15));
  cursor: pointer;
}

.fm-fav-toggle {
  border: 1px solid var(--border-color, rgba(96, 165, 250, 0.2));
  border-radius: 0.55rem;
  background: transparent;
  color: var(--text-primary, #e2e8f0);
  padding: 0 0.6rem;
  height: 2rem;
  font-size: 0.75rem;
  cursor: pointer;
}

.fm-fav-toggle:hover {
  background: var(--hover-bg, rgba(96, 165, 250, 0.08));
}

.fm-trash-empty {
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  border-radius: 0.45rem;
  background: transparent;
  color: var(--text-primary, #e2e8f0);
  font-size: 0.7rem;
  height: 1.65rem;
  padding: 0 0.45rem;
  cursor: pointer;
  white-space: nowrap;
}

.fm-trash-empty:hover {
  background: var(--hover-bg, rgba(96, 165, 250, 0.1));
}

.fm-body {
  flex: 1;
  min-height: 0;
  padding: 0.25rem 0;
  overflow-y: auto;
  border: 1px solid transparent;
  border-radius: 0.6rem;
  transition: background 0.16s ease, border-color 0.16s ease;
}

.fm-body.root-drop-over {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.24);
}

.fm-quick-list {
  margin: 0 0.5rem 0.45rem;
  border: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
  border-radius: 0.65rem;
  overflow: hidden;
}

.fm-quick-title {
  padding: 0.4rem 0.6rem;
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-bottom: 1px solid var(--border-color, rgba(148, 163, 184, 0.18));
}

.fm-quick-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.8rem;
  padding: 0.45rem 0.55rem;
  cursor: pointer;
}

.fm-quick-item:hover {
  background: var(--hover-bg, rgba(148, 163, 184, 0.08));
}

.quick-dot {
  width: 0.4rem;
  height: 0.4rem;
  border-radius: 50%;
  background: var(--accent-indigo, #60a5fa);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(96, 165, 250, 0.2));
}

.quick-dot.recent {
  background: var(--text-muted, #94a3b8);
  box-shadow: 0 0 0 3px var(--hover-bg, rgba(148, 163, 184, 0.1));
  opacity: 0.78;
}

.fm-search-results {
  padding: 0 0.4rem;
}

.fm-search-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.45rem;
  font-size: 0.8rem;
  border-radius: 0.5rem;
  cursor: pointer;
}

.fm-search-item:hover {
  background: var(--hover-bg, rgba(96, 165, 250, 0.08));
}

.fm-search-hint {
  margin-left: auto;
  font-size: 0.68rem;
  color: var(--text-muted, #94a3b8);
}

.fm-archive {
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.2));
  padding-top: 0.5rem;
}

.fm-archive-bar {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0 0.45rem 0.4rem;
}

.fm-archive-toggle {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.45rem 0.2rem;
  cursor: pointer;
}

.fm-archive-left {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
}

.archive-icon {
  transition: transform 0.2s ease;
}

.archive-icon.open {
  transform: rotate(-90deg);
}

.chevron {
  transition: transform 0.2s ease;
}

.chevron.open {
  transform: rotate(180deg);
}

.fm-archive-list {
  border-top: 1px solid var(--border-color, rgba(148, 163, 184, 0.15));
  padding: 0.3rem 0.55rem 0.35rem;
  background: var(--fm-archive-bg, rgba(30, 41, 59, 0.18));
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.fm-archive-item {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border-radius: 0.45rem;
  cursor: pointer;
  padding: 0.4rem 0.45rem;
  font-size: 0.78rem;
  transition: all 0.2s ease;
}

.fm-archive-item:hover {
  background: var(--hover-bg, rgba(96, 165, 250, 0.12));
}

.fm-archive-item svg {
  width: 0.85rem;
  height: 0.85rem;
}

.restore-badge {
  margin-left: auto;
  font-size: 0.66rem;
  padding: 0.08rem 0.38rem;
  border-radius: 0.65rem;
  color: var(--text-primary, #f8fafc);
  background: var(--accent-glow, rgba(96, 165, 250, 0.22));
}

.fm-context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 150px;
  padding: 0.45rem;
  border-radius: 0.625rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.22), 0 0 0 1px rgba(0,0,0,0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transform-origin: top left;
}

.fm-context-menu.light {
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(59, 130, 246, 0.12);
}

.fm-context-menu.dark {
  background: rgba(21, 21, 40, 0.96);
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.fm-context-item {
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

.fm-context-menu.dark .fm-context-item {
  color: #e2e8f0;
}

.fm-context-item:hover {
  background: rgba(59, 130, 246, 0.08);
  transform: translateX(2px);
}

.fm-context-menu.dark .fm-context-item:hover {
  background: rgba(59, 130, 246, 0.15);
}

.fm-context-item.danger {
  color: #ef4444;
}

.fm-context-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

.fm-context-item svg {
  flex-shrink: 0;
  opacity: 0.65;
}

.fm-context-divider {
  height: 1px;
  margin: 0.35rem 0;
  background: rgba(59, 130, 246, 0.1);
}

.context-enter-active,
.context-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}

.context-enter-from,
.context-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.fm-empty {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--text-muted, #94a3b8);
  font-size: 0.82rem;
}

.fm-empty-icon {
  width: 2.5rem;
  height: 2.5rem;
  margin: 0 auto 0.5rem;
  color: var(--text-muted, #94a3b8);
  opacity: 0.7;
}

.fm-empty-hint {
  color: var(--text-muted, #94a3b8);
  font-size: 0.75rem;
  margin-top: 0.2rem;
}
</style>
