<template>
  <div class="editor-tabs" :class="{ 'is-dark': isDark }">
    <div class="tabs-scroll">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.fileId"
        class="tab-item"
        :class="{
          active: activeTabId === tab.fileId,
          dirty: isTabDirty(tab.fileId),
          pinned: tab.isPinned,
          renaming: renamingTabId === tab.fileId
        }"
        @click="renamingTabId !== tab.fileId && setActiveTab(tab.fileId)"
        @dblclick="startRename(tab)"
        @contextmenu.prevent="showContextMenu(tab, index, $event)"
        :draggable="renamingTabId !== tab.fileId"
        @dragstart="handleDragStart(index, $event)"
        @dragover.prevent="handleDragOver(index, $event)"
        @drop="handleDrop(index, $event)"
        @dragend="handleDragEnd"
      >
        <svg class="tab-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <template v-if="renamingTabId === tab.fileId">
          <input
            ref="renameInput"
            v-model="renameValue"
            class="tab-title-input"
            :class="{ 'duplicate': isRenameDuplicate }"
            @keydown.enter="confirmRename"
            @keydown.escape="cancelRename"
            @blur="confirmRename"
          />
        </template>
        <span v-else class="tab-title">{{ tab.fileName }}</span>
        <span v-if="isTabDirty(tab.fileId)" class="tab-dirty"></span>
        <button
          class="tab-close"
          @click.stop="closeTab(tab.fileId)"
          title="关闭"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
    <div v-if="contextMenu.visible" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-item" @click="handleRename">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>重命名</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleCloseTab">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
        <span>关闭</span>
        <span class="shortcut">Ctrl+W</span>
      </div>
      <div class="context-menu-item" @click="handleCloseOthers">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7" />
        </svg>
        <span>关闭其他</span>
      </div>
      <div class="context-menu-item" @click="handleCloseLeft">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
        <span>关闭左侧</span>
      </div>
      <div class="context-menu-item" @click="handleCloseRight">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
        <span>关闭右侧</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleCloseAll">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        <span>全部关闭</span>
      </div>
      <div class="context-menu-divider"></div>
      <div class="context-menu-item" @click="handleTogglePin">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
        <span>{{ contextMenu.tab?.isPinned ? '取消固定' : '固定标签' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  tabs: { type: Array, default: () => [] },
  activeTabId: { type: String, default: null },
  isDark: { type: Boolean, default: false },
  getChildren: { type: Function, default: () => [] }
})

const emit = defineEmits([
  'closeTab',
  'setActiveTab',
  'closeOtherTabs',
  'closeLeftTabs',
  'closeRightTabs',
  'closeAllTabs',
  'moveTab',
  'togglePinTab',
  'renameTab'
])

const contextMenu = ref({
  visible: false,
  x: 0,
  y: 0,
  tab: null,
  index: -1
})

const renamingTabId = ref(null)
const renameValue = ref('')
const renameInput = ref(null)

const contextMenuStyle = computed(() => ({
  left: contextMenu.value.x + 'px',
  top: contextMenu.value.y + 'px'
}))

function isTabDirty(fileId) {
  return false
}

function startRename(tab) {
  renamingTabId.value = tab.fileId
  renameValue.value = tab.fileName
  setTimeout(() => {
    if (renameInput.value) {
      renameInput.value.focus()
      const name = tab.fileName
      const lastDot = name.lastIndexOf('.')
      if (lastDot > 0) {
        renameInput.value.setSelectionRange(0, lastDot)
      } else {
        renameInput.value.setSelectionRange(0, name.length)
      }
    }
  }, 0)
}

function cancelRename() {
  renamingTabId.value = null
}

function confirmRename() {
  const newName = renameValue.value.trim()
  if (!newName) {
    cancelRename()
    return
  }
  const tab = props.tabs.find(t => t.fileId === renamingTabId.value)
  if (!tab || newName === tab.fileName) {
    cancelRename()
    return
  }
  if (isRenameDuplicate.value) {
    return
  }
  emit('renameTab', { fileId: tab.fileId, newName })
  renamingTabId.value = null
}

const isRenameDuplicate = computed(() => {
  if (!renamingTabId.value) return false
  const newName = renameValue.value.trim()
  if (!newName) return false
  const tab = props.tabs.find(t => t.fileId === renamingTabId.value)
  if (!tab || newName === tab.fileName) return false
  return props.tabs.some(t => t.fileId !== renamingTabId.value && t.fileName === newName)
})

function handleRename() {
  if (contextMenu.value.tab) {
    startRename(contextMenu.value.tab)
  }
  hideContextMenu()
}

function closeTab(fileId) {
  emit('closeTab', fileId)
}

function setActiveTab(fileId) {
  emit('setActiveTab', fileId)
}

function showContextMenu(tab, index, event) {
  contextMenu.value = {
    visible: true,
    x: event.clientX,
    y: event.clientY,
    tab,
    index
  }
}

function hideContextMenu() {
  contextMenu.value.visible = false
}

function handleCloseTab() {
  if (contextMenu.value.tab) {
    emit('closeTab', contextMenu.value.tab.fileId)
  }
  hideContextMenu()
}

function handleCloseOthers() {
  if (contextMenu.value.tab) {
    emit('closeOtherTabs', contextMenu.value.tab.fileId)
  }
  hideContextMenu()
}

function handleCloseLeft() {
  if (contextMenu.value.tab) {
    emit('closeLeftTabs', contextMenu.value.tab.fileId)
  }
  hideContextMenu()
}

function handleCloseRight() {
  if (contextMenu.value.tab) {
    emit('closeRightTabs', contextMenu.value.tab.fileId)
  }
  hideContextMenu()
}

function handleCloseAll() {
  emit('closeAllTabs')
  hideContextMenu()
}

function handleTogglePin() {
  if (contextMenu.value.tab) {
    emit('togglePinTab', contextMenu.value.tab.fileId)
  }
  hideContextMenu()
}

let dragIndex = -1

function handleDragStart(index, event) {
  dragIndex = index
  event.dataTransfer.effectAllowed = 'move'
}

function handleDragOver(index, event) {
  event.dataTransfer.dropEffect = 'move'
}

function handleDrop(index, event) {
  if (dragIndex !== -1 && dragIndex !== index) {
    emit('moveTab', dragIndex, index)
  }
  dragIndex = -1
}

function handleDragEnd() {
  dragIndex = -1
}

function handleClickOutside() {
  hideContextMenu()
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

defineExpose({ isTabDirty })
</script>

<style scoped>
.editor-tabs {
  display: flex;
  align-items: stretch;
  background: var(--tabs-bg, #f8fafc);
  border-bottom: 1px solid var(--tabs-border, #e2e8f0);
  overflow: hidden;
  height: 36px;
  flex-shrink: 0;
}

.editor-tabs.is-dark {
  --tabs-bg: #0f172a;
  --tabs-border: #334155;
  --tab-bg: #1e293b;
  --tab-active-bg: #334155;
  --tab-text: #94a3b8;
  --tab-active-text: #f1f5f9;
}

.tabs-scroll {
  display: flex;
  align-items: stretch;
  overflow-x: auto;
  overflow-y: hidden;
  flex: 1;
  scrollbar-width: none;
}

.tabs-scroll::-webkit-scrollbar {
  display: none;
}

.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.75rem;
  height: 100%;
  min-width: 120px;
  max-width: 200px;
  border-right: 1px solid var(--tabs-border, #e2e8f0);
  cursor: pointer;
  transition: background 0.15s ease;
  position: relative;
  background: var(--tab-bg, #f1f5f9);
  color: var(--tab-text, #64748b);
  user-select: none;
}

.tab-item.renaming {
  user-select: text;
}

.tab-item:hover {
  background: var(--tab-active-bg, #e2e8f0);
}

.tab-item.active {
  background: var(--tab-active-bg, #fff);
  color: var(--tab-active-text, #1e293b);
}

.tab-item.active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #3b82f6;
}

.tab-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.8125rem;
}

.tab-title-input {
  flex: 1;
  font-size: 0.8125rem;
  border: 1px solid #3b82f6;
  border-radius: 2px;
  padding: 2px 4px;
  outline: none;
  background: #fff;
  color: #1e293b;
}

.editor-tabs.is-dark .tab-title-input {
  background: #1e293b;
  color: #f1f5f9;
  border-color: #3b82f6;
}

.tab-title-input.duplicate {
  border-color: #ef4444;
  color: #ef4444;
}

.tab-dirty {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.tab-item:hover .tab-close,
.tab-item.dirty .tab-close {
  opacity: 1;
}

.tab-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.tab-close svg {
  width: 0.875rem;
  height: 0.875rem;
}

.tab-item.pinned {
  min-width: auto;
}

.tab-item.pinned .tab-title {
  display: none;
}

.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 180px;
  padding: 0.375rem;
  background: var(--context-menu-bg, #fff);
  border: 1px solid var(--context-menu-border, #e2e8f0);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
}

.editor-tabs.is-dark .context-menu {
  --context-menu-bg: #1e293b;
  --context-menu-border: #334155;
  --context-menu-text: #e2e8f0;
  --context-menu-hover: #334155;
  --context-menu-shortcut: #64748b;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--context-menu-text, #334155);
  transition: background 0.15s ease;
}

.context-menu-item:hover {
  background: var(--context-menu-hover, #f1f5f9);
}

.context-menu-item svg {
  width: 1rem;
  height: 1rem;
  opacity: 0.7;
}

.context-menu-item span:last-child:not(.shortcut) {
  flex: 1;
}

.shortcut {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--context-menu-shortcut, #94a3b8);
}

.context-menu-divider {
  height: 1px;
  margin: 0.375rem 0;
  background: var(--context-menu-border, #e2e8f0);
}
</style>
