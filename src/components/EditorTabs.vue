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
    <Transition name="context">
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
    </Transition>
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
  // 添加拖拽时的视觉反馈
  const tab = event.target
  tab.style.opacity = '0.5'
  setTimeout(() => {
    tab.style.opacity = ''
  }, 0)
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
  background: var(--tabs-bg, rgba(250,251,252,0.9));
  border-bottom: 1px solid var(--tabs-border, rgba(99,102,241,0.1));
  overflow: hidden;
  height: 38px;
  flex-shrink: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.editor-tabs.is-dark {
  --tabs-bg: rgba(15, 15, 26, 0.9);
  --tabs-border: rgba(99, 102, 241, 0.15);
  --tab-bg: rgba(30, 41, 59, 0.5);
  --tab-active-bg: rgba(99, 102, 241, 0.15);
  --tab-text: #64748b;
  --tab-active-text: #f1f5f9;
  --tab-hover-bg: rgba(99, 102, 241, 0.1);
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

/* 标签项 - 精致设计 */
.tab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0 0.875rem;
  height: 100%;
  min-width: 120px;
  max-width: 200px;
  border-right: 1px solid var(--tabs-border, rgba(99,102,241,0.08));
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: var(--tab-bg, rgba(0,0,0,0.02));
  color: var(--tab-text, #64748b);
  user-select: none;
  font-size: 0.8125rem;
}

.tab-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  border-radius: 2px 2px 0 0;
  transform: scaleX(0);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tab-item:hover {
  background: var(--tab-hover-bg, rgba(99,102,241,0.05));
  color: var(--tab-active-text, #1e293b);
}

.tab-item:hover::after {
  transform: scaleX(0.3);
}

.tab-item.active {
  background: var(--tab-active-bg, rgba(99,102,241,0.08));
  color: var(--tab-active-text, #1e293b);
}

.tab-item.active::after {
  transform: scaleX(1);
}

.tab-item.renaming {
  user-select: text;
}

.tab-item[draggable="true"] {
  cursor: grab;
}

.tab-item[draggable="true"]:active {
  cursor: grabbing;
}

.tab-icon {
  width: 0.9rem;
  height: 0.9rem;
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.tab-item:hover .tab-icon,
.tab-item.active .tab-icon {
  opacity: 1;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.tab-title-input {
  flex: 1;
  font-size: 0.8125rem;
  border: 1px solid var(--accent-indigo, #6366f1);
  border-radius: 4px;
  padding: 2px 6px;
  outline: none;
  background: var(--editor-bg, #fff);
  color: var(--tab-active-text, #1e293b);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(99,102,241,0.2));
}

.editor-tabs.is-dark .tab-title-input {
  background: #1e293b;
  color: #f1f5f9;
}

.tab-title-input.duplicate {
  border-color: #ef4444;
  color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

/* 未保存指示器 - 脉冲动画 */
.tab-dirty {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-indigo, #6366f1);
  flex-shrink: 0;
  animation: pulseGlow 2s ease-in-out infinite;
}

/* 关闭按钮 - 精致动画 */
.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.375rem;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

.tab-close::after {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--hover-bg, rgba(0,0,0,0.05));
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.tab-item:hover .tab-close,
.tab-item.dirty .tab-close {
  opacity: 0.6;
}

.tab-close:hover {
  opacity: 1 !important;
  color: #ef4444;
}

.tab-close:hover::after {
  opacity: 1;
}

.tab-close:active {
  transform: scale(0.9);
}

.tab-close svg {
  width: 0.875rem;
  height: 0.875rem;
  position: relative;
  z-index: 1;
}

.tab-item.pinned {
  min-width: auto;
}

.tab-item.pinned .tab-title {
  display: none;
}

/* 上下文菜单 - 玻璃态 */
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 190px;
  padding: 0.5rem;
  background: var(--context-menu-bg, rgba(255,255,255,0.95));
  border: 1px solid var(--context-menu-border, rgba(99,102,241,0.12));
  border-radius: 0.625rem;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0,0,0,0.03);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  transform-origin: top left;
}

.editor-tabs.is-dark .context-menu {
  --context-menu-bg: rgba(21, 21, 40, 0.95);
  --context-menu-border: rgba(99, 102, 241, 0.2);
  --context-menu-text: #e2e8f0;
  --context-menu-hover: rgba(99, 102, 241, 0.12);
  --context-menu-shortcut: #64748b;
}

.context-menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--context-menu-text, #334155);
  transition: all 0.15s ease;
}

.context-menu-item:hover {
  background: var(--context-menu-hover, rgba(99,102,241,0.06));
  transform: translateX(2px);
}

.context-menu-item svg {
  width: 1rem;
  height: 1rem;
  opacity: 0.6;
  transition: opacity 0.15s ease;
}

.context-menu-item:hover svg {
  opacity: 1;
}

.context-menu-item span:last-child:not(.shortcut) {
  flex: 1;
}

.shortcut {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--context-menu-shortcut, #94a3b8);
  padding: 0.125rem 0.375rem;
  background: var(--hover-bg, rgba(0,0,0,0.04));
  border-radius: 0.25rem;
}

.context-menu-divider {
  height: 1px;
  margin: 0.375rem 0;
  background: var(--context-menu-border, rgba(99,102,241,0.1));
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
</style>
