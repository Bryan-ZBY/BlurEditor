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

    <div class="fm-body custom-scrollbar">
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
          :root-files="rootFiles"
          :style="{ animationDelay: index * 30 + 'ms' }"
          @select="$emit('selectFile', $event)"
          @toggle="toggleFolder"
          @create-file="$emit('createFile', $event)"
          @create-folder="$emit('createFolder', $event)"
          @move="$emit('moveFile', $event)"
          @rename="$emit('renameFile', $event)"
        />
      </TransitionGroup>

      <div v-if="displayedFiles.length === 0" class="fm-empty">
        <div class="fm-empty-icon">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          </svg>
        </div>
        <p class="fm-empty-text">暂无文件</p>
        <p class="fm-empty-hint">点击上方 + 新建</p>
      </div>
    </div>

    <div v-if="archivedFiles.length > 0" class="fm-archive">
      <button
        @click="showArchived = !showArchived"
        class="fm-archive-toggle"
      >
        <span class="fm-archive-left">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 archive-icon" :class="{ open: showArchived }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>归档 ({{ archivedFiles.length }})</span>
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
import { ref, computed, watch } from 'vue'
import FileTreeItem from './FileTreeItem.vue'

const props = defineProps({
  rootFiles: Array,
  archivedFiles: Array,
  currentFileId: String,
  getChildren: Function,
  isDark: Boolean
})

const emit = defineEmits([
  'selectFile', 'createFile', 'createFolder', 'moveFile', 'unarchiveFile', 'renameFile', 'openImport'
])

const showNewMenu = ref(false)
const showArchived = ref(false)
const expandedIds = ref(new Set())

const displayedFiles = computed(() => {
  return props.rootFiles
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
</script>

<style scoped>
.file-manager {
  width: 16rem;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--editor-bg, #fafbfc);
  border-right: 1px solid var(--border-color, rgba(99,102,241,0.1));
  transition: background var(--transition-normal), border-color var(--transition-normal);
}

.file-manager.is-dark {
  --fm-header-bg: rgba(15, 15, 26, 0.8);
  --fm-text: #94a3b8;
  --fm-text-hover: #f1f5f9;
}

/* 头部 */
.fm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid var(--border-color, rgba(99,102,241,0.1));
  flex-shrink: 0;
  backdrop-filter: blur(8px);
}

.fm-header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.fm-logo {
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: white;
  box-shadow: 0 2px 8px var(--accent-glow, rgba(99,102,241,0.3));
}

.fm-logo svg {
  width: 1rem;
  height: 1rem;
}

.fm-title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-primary, #0f172a);
  letter-spacing: -0.01em;
}

.fm-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.fm-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.fm-action-btn:hover {
  background: var(--hover-bg, rgba(0,0,0,0.04));
  color: var(--text-primary, #0f172a);
  border-color: var(--border-color, rgba(0,0,0,0.06));
  transform: translateY(-1px);
}

.fm-action-btn.active {
  background: var(--accent-indigo, #6366f1);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 12px var(--accent-glow, rgba(99,102,241,0.3));
}

/* 新建菜单 */
.fm-new-menu {
  padding: 0.5rem;
  border-bottom: 1px solid var(--border-color, rgba(99,102,241,0.1));
  background: var(--hover-bg, rgba(0,0,0,0.02));
  flex-shrink: 0;
}

.fm-new-item {
  width: 100%;
  text-align: left;
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--text-secondary, #475569);
  transition: all 0.15s ease;
  margin-bottom: 0.25rem;
}

.fm-new-item:last-child {
  margin-bottom: 0;
}

.fm-new-item:hover {
  background: var(--hover-bg-strong, rgba(99,102,241,0.08));
  color: var(--accent-indigo, #6366f1);
  transform: translateX(2px);
}

.fm-new-item svg {
  color: var(--text-muted, #94a3b8);
  transition: color 0.15s ease;
}

.fm-new-item:hover svg {
  color: var(--accent-indigo, #6366f1);
}

/* 列表动画 */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
  max-height: 0;
  padding: 0;
}

/* 主体 */
.fm-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.list-enter-active,
.list-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}

/* 空状态 */
.fm-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
  animation: fadeInScale 0.5s ease-out;
}

.fm-empty-icon {
  color: var(--text-muted, #94a3b8);
  opacity: 0.3;
  margin-bottom: 0.75rem;
  animation: float 4s ease-in-out infinite;
}

.fm-empty-text {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary, #475569);
  margin: 0;
}

.fm-empty-hint {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  margin: 0.25rem 0 0;
}

/* 归档区域 */
.fm-archive {
  border-top: 1px solid var(--border-color, rgba(99,102,241,0.1));
  flex-shrink: 0;
}

.fm-archive-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  border: none;
  background: transparent;
  transition: all 0.15s ease;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.fm-archive-toggle:hover {
  color: var(--text-primary, #0f172a);
  background: var(--hover-bg, rgba(0,0,0,0.02));
}

.fm-archive-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.archive-icon {
  transition: transform 0.2s ease;
}

.archive-icon.open {
  transform: scale(1.1);
}

.chevron {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.chevron.open {
  transform: rotate(180deg);
}

.fm-archive-list {
  padding: 0 0.5rem 0.5rem;
  overflow: hidden;
}

.fm-archive-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.8125rem;
  cursor: pointer;
  color: var(--text-muted, #64748b);
  transition: all 0.15s ease;
  animation: fadeInLeft 0.3s ease-out both;
}

.fm-archive-item:hover {
  background: var(--hover-bg, rgba(0,0,0,0.03));
  color: var(--text-primary, #0f172a);
  transform: translateX(2px);
}

.fm-archive-item svg {
  flex-shrink: 0;
  opacity: 0.5;
}

.restore-badge {
  margin-left: auto;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  background: var(--hover-bg-strong, rgba(99,102,241,0.08));
  color: var(--accent-indigo, #6366f1);
  opacity: 0;
  transition: all 0.15s ease;
}

.fm-archive-item:hover .restore-badge {
  opacity: 1;
}

/* 展开动画 */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 300px;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
</style>
