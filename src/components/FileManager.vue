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
          title="排序"
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
          <span>{{ option.label }}</span>
          <svg v-if="sortMode === option.value" xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
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
        <span class="truncate">{{ file.name }}</span>
      </div>
    </div>

    <div class="fm-body custom-scrollbar">
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
            <span>{{ file.name }}</span>
            <span class="fm-search-hint">{{ file.type === 'folder' ? '文件夹' : '文档' }}</span>
          </div>
        </div>
      </template>

      <TransitionGroup name="list" tag="div">
        <FileTreeItem
          v-for="(file, index) in displayedFiles"
          :key="file.id"
          :file="file"
          :level="0"
          :current-file-id="currentFileId"
          :expanded-ids="expandedIds"
          :is-dark="isDark"
          :get-children="getChildren"
          :get-sorted-files="getSortedFiles"
          :root-files="rootFiles"
          :style="{ animationDelay: index * 30 + 'ms' }"
          @select="$emit('selectFile', $event)"
          @toggle="toggleFolder"
          @create-file="$emit('createFile', $event)"
          @create-folder="$emit('createFolder', $event)"
          @move="$emit('moveFile', $event)"
          @rename="$emit('renameFile', $event)"
          @toggleFavorite="$emit('toggleFavorite', $event)"
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
      <Transition name="expand">
        <div v-if="showArchived" class="fm-archive-list">
          <div
            v-for="(file, index) in archivedFiles"
            :key="file.id"
            @click="$emit('unarchiveFile', file.id)"
            class="fm-archive-item"
            :style="{ animationDelay: index * 40 + 'ms' }"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="truncate">{{ file.name }}</span>
            <span class="restore-badge">恢复</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import FileTreeItem from './FileTreeItem.vue'

const props = defineProps({
  rootFiles: Array,
  archivedFiles: Array,
  files: Array,
  currentFileId: String,
  getChildren: Function,
  isDark: Boolean,
  sortMode: String,
  getSortedFiles: Function
})

const emit = defineEmits([
  'selectFile',
  'createFile',
  'createFolder',
  'moveFile',
  'unarchiveFile',
  'renameFile',
  'openImport',
  'setSortMode',
  'toggleFavorite'
])

const showNewMenu = ref(false)
const showArchived = ref(false)
const showSortMenu = ref(false)
const showFavorites = ref(true)
const searchText = ref('')
const expandedIds = ref(new Set())

const sortOptions = [
  { value: 'name', label: '按名称', icon: 'name' },
  { value: 'date', label: '按时间', icon: 'date' },
  { value: 'size', label: '按大小', icon: 'size' }
]

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
  emit('setSortMode', mode)
  showSortMenu.value = false
}

function handleQuickSelect(fileId) {
  emit('selectFile', fileId)
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

.fm-body {
  flex: 1;
  min-height: 0;
  padding: 0.25rem 0;
  overflow-y: auto;
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

.fm-archive-toggle {
  width: 100%;
  border: none;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.45rem;
  padding: 0.45rem 0.65rem;
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
