<template>
  <div v-if="visible" class="import-overlay" @click.self="$emit('close')">
    <div class="import-modal" :class="{ 'is-dark': isDark }">
      <div class="modal-header">
        <h3>导入文件</h3>
        <button class="close-btn" @click="$emit('close')">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <div
          class="drop-zone"
          :class="{ 'is-dragging': isDragging }"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
          </svg>
          <p>点击或拖拽文件到此处</p>
          <span>支持 .md .txt .html 格式</span>
          <input ref="fileInputRef" type="file" class="file-input" multiple accept=".md,.txt,.html" @change="handleFileSelect" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { readFileContent, getFileName } from '../utils/fileParser.js'

const props = defineProps({
  visible: Boolean,
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'import'])

const fileInputRef = ref(null)
const isDragging = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function handleFileSelect(e) {
  const files = Array.from(e.target.files || [])
  importFiles(files)
  e.target.value = ''
}

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files || [])
  importFiles(files)
}

async function importFiles(fileList) {
  const results = []
  
  for (const file of fileList) {
    try {
      const content = await readFileContent(file)
      results.push({
        name: getFileName(file),
        content
      })
    } catch (e) {
      console.error('Failed to read file:', file.name, e)
    }
  }
  
  if (results.length > 0) {
    emit('import', results)
  }
}
</script>

<style scoped>
.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.import-modal {
  width: 480px;
  max-width: calc(100vw - 2rem);
  background: var(--modal-bg, #fff);
  border-radius: 0.75rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.import-modal.is-dark {
  --modal-bg: #1e293b;
  --modal-border: #334155;
  --modal-text: #f1f5f9;
  --modal-muted: #64748b;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--modal-border, #e2e8f0);
}

.modal-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--modal-text, #1e293b);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  color: var(--modal-muted, #64748b);
  cursor: pointer;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background: var(--modal-border, #f1f5f9);
  color: var(--modal-text, #1e293b);
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.modal-body {
  padding: 1.25rem;
}

.drop-zone {
  border: 2px dashed var(--modal-border, #e2e8f0);
  border-radius: 0.75rem;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--modal-bg, #fff);
}

.drop-zone:hover {
  border-color: #3b82f6;
}

.drop-zone.is-dragging {
  border-color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.drop-zone svg {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--modal-muted, #94a3b8);
}

.drop-zone p {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--modal-text, #1e293b);
}

.drop-zone span {
  font-size: 0.8125rem;
  color: var(--modal-muted, #94a3b8);
}

.file-input {
  display: none;
}
</style>
