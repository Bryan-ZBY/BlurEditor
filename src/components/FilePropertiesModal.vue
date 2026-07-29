<template>
  <Transition name="modal">
    <div
      v-if="visible && file"
      class="fp-modal-overlay"
      @click.self="$emit('close')"
      @contextmenu.prevent="$emit('close')"
    >
      <div class="fp-modal" :class="isDark ? 'dark' : 'light'">
        <div class="fp-modal-header">
          <h3>文件属性</h3>
          <button @click="$emit('close')" class="fp-modal-close">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="fp-modal-body">
          <div class="fp-detail-icon">
            <svg v-if="file.type === 'folder'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" :class="isDark ? 'text-slate-400' : 'text-gray-400'" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div class="fp-detail-info">
            <p class="fp-detail-name">{{ file.name }}</p>
            <p class="fp-detail-type">{{ file.type === 'folder' ? '文件夹' : 'Markdown 文件' }}</p>
          </div>
        </div>

        <div class="fp-detail-list">
          <div class="fp-detail-row">
            <span>创建时间</span>
            <span>{{ formatDate(file.createdAt) }}</span>
          </div>
          <div class="fp-detail-row">
            <span>修改时间</span>
            <span>{{ formatDate(file.updatedAt) }}</span>
          </div>
          <div v-if="file.type === 'file'" class="fp-detail-row">
            <span>文件大小</span>
            <span>{{ formatSize(file.content?.length || 0) }}</span>
          </div>
          <div v-if="file.type === 'file'" class="fp-detail-row">
            <span>字符数</span>
            <span>{{ file.content?.length || 0 }}</span>
          </div>
          <div v-if="file.type === 'file'" class="fp-detail-row">
            <span>行数</span>
            <span>{{ file.content ? file.content.split('\n').length : 0 }}</span>
          </div>
          <div v-if="file.type === 'folder'" class="fp-detail-row">
            <span>子项数量</span>
            <span>{{ childCount }}</span>
          </div>
          <div class="fp-detail-row">
            <span>文件 ID</span>
            <span class="font-mono">{{ file.id?.substring(0, 8) }}...</span>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  file: Object,
  isDark: Boolean,
  childCount: { type: Number, default: 0 }
})

defineEmits(['close'])

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
.fp-modal-overlay {
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

.fp-modal {
  width: 22rem;
  max-width: calc(100vw - 2rem);
  border-radius: 1rem;
  border: 1px solid;
  box-shadow: var(--dialog-shadow);
  overflow: hidden;
  animation: scaleIn 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.fp-modal.light {
  background: #ffffff;
  border-color: rgba(59, 130, 246, 0.1);
}

.fp-modal.dark {
  background: #151528;
  border-color: rgba(59, 130, 246, 0.2);
}

.fp-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid;
}

.fp-modal.light .fp-modal-header {
  border-color: rgba(59, 130, 246, 0.1);
}

.fp-modal.dark .fp-modal-header {
  border-color: rgba(59, 130, 246, 0.15);
}

.fp-modal-header h3 {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
}

.fp-modal.light .fp-modal-header h3 {
  color: #0f172a;
}

.fp-modal.dark .fp-modal-header h3 {
  color: #e2e8f0;
}

.fp-modal-close {
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

.fp-modal-close:hover {
  background: rgba(0,0,0,0.05);
  color: #0f172a;
}

.fp-modal.dark .fp-modal-close:hover {
  background: rgba(255,255,255,0.05);
  color: #f1f5f9;
}

.fp-modal-body {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.25rem;
}

.fp-detail-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.fp-modal.light .fp-detail-icon {
  background: #f1f5f9;
}

.fp-modal.dark .fp-detail-icon {
  background: rgba(255,255,255,0.05);
}

.fp-detail-info {
  min-width: 0;
}

.fp-detail-name {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  overflow-wrap: anywhere;
}

.fp-modal.light .fp-detail-name {
  color: #0f172a;
}

.fp-modal.dark .fp-detail-name {
  color: #e2e8f0;
}

.fp-detail-type {
  margin: 0.125rem 0 0;
  font-size: 0.75rem;
}

.fp-modal.light .fp-detail-type,
.fp-modal.dark .fp-detail-type {
  color: #64748b;
}

.fp-detail-list {
  padding: 0 1.25rem 1.25rem;
}

.fp-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  font-size: 0.75rem;
  border-bottom: 1px solid;
}

.fp-modal.light .fp-detail-row {
  border-color: rgba(59, 130, 246, 0.06);
  color: #475569;
}

.fp-modal.dark .fp-detail-row {
  border-color: rgba(59, 130, 246, 0.1);
  color: #94a3b8;
}

.fp-detail-row span:last-child {
  font-weight: 500;
  text-align: right;
  overflow-wrap: anywhere;
}

.fp-modal.light .fp-detail-row span:last-child {
  color: #0f172a;
}

.fp-modal.dark .fp-detail-row span:last-child {
  color: #e2e8f0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
