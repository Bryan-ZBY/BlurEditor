<template>
  <Transition name="overlay">
    <div v-if="visible" class="import-overlay" @click.self="$emit('close')">
      <Transition name="modal-scale">
        <div v-if="visible" class="import-modal" :class="{ 'is-dark': isDark }">
          <div class="modal-header">
            <div class="header-content">
              <div class="header-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
              </div>
              <h3>导入文件</h3>
            </div>
            <button class="close-btn" @click="$emit('close')" title="关闭">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div
              class="drop-zone"
              :class="{ 'is-dragging': isDragging, 'has-hover': !isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <div class="drop-icon-wrapper">
                <svg class="drop-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <div class="drop-icon-glow"></div>
              </div>
              <p class="drop-title">点击或拖拽文件到此处</p>
              <span class="drop-subtitle">支持 Markdown、纯文本、HTML 格式</span>
              <div class="file-types">
                <span class="file-badge">.md</span>
                <span class="file-badge">.txt</span>
                <span class="file-badge">.html</span>
              </div>
              <input ref="fileInputRef" type="file" class="file-input" multiple accept=".md,.txt,.html" @change="handleFileSelect" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
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
/* 遮罩层 */
.import-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

/* 模态框 */
.import-modal {
  width: 480px;
  max-width: calc(100vw - 2rem);
  background: var(--modal-bg, #fff);
  border-radius: 1rem;
  box-shadow: var(--dialog-shadow, 0 25px 50px -12px rgba(0, 0, 0, 0.25));
  overflow: hidden;
  border: 1px solid var(--modal-border, #e2e8f0);
}

.modal-scale-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-scale-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-scale-enter-from,
.modal-scale-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

.import-modal.is-dark {
  --modal-bg: #151528;
  --modal-border: rgba(99, 102, 241, 0.15);
  --modal-text: #f1f5f9;
  --modal-muted: #64748b;
  --modal-input-bg: rgba(30, 41, 59, 0.5);
  --modal-hover: rgba(99, 102, 241, 0.1);
}

/* 头部 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--modal-border, #e2e8f0);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.header-icon {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  box-shadow: 0 4px 12px var(--accent-glow, rgba(99, 102, 241, 0.25));
}

.header-icon svg {
  width: 1.125rem;
  height: 1.125rem;
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
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-btn:hover {
  background: var(--modal-hover, #f1f5f9);
  color: var(--modal-text, #1e293b);
  transform: rotate(90deg);
}

.close-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* 主体 */
.modal-body {
  padding: 1.25rem;
}

/* 拖拽区域 */
.drop-zone {
  border: 2px dashed var(--modal-border, #e2e8f0);
  border-radius: 1rem;
  padding: 2.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.875rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: var(--modal-bg, #fff);
  position: relative;
  overflow: hidden;
}

.drop-zone::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1) 0%, var(--accent-purple, #8b5cf6) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  border-radius: inherit;
}

.drop-zone:hover {
  border-color: var(--accent-indigo, #6366f1);
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);
}

.drop-zone:hover .drop-icon {
  animation: bounceSoft 1s ease-in-out infinite;
}

.drop-zone.is-dragging {
  border-color: var(--accent-indigo, #6366f1);
  border-style: solid;
  background: var(--modal-hover, rgba(99, 102, 241, 0.05));
  transform: scale(1.02);
  box-shadow: 0 0 0 4px var(--accent-glow, rgba(99, 102, 241, 0.15)), 0 12px 32px rgba(0, 0, 0, 0.1);
}

.drop-zone.is-dragging::before {
  opacity: 0.03;
}

.drop-zone.is-dragging .drop-icon {
  animation: bounceSoft 0.6s ease-in-out infinite;
}

.drop-zone.is-dragging .drop-icon-glow {
  animation: pulseGlow 1.5s ease-in-out infinite;
}

/* 图标 */
.drop-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.drop-icon {
  width: 3.5rem;
  height: 3.5rem;
  color: var(--accent-indigo, #6366f1);
  position: relative;
  z-index: 1;
  transition: color 0.3s ease;
}

.drop-icon-glow {
  position: absolute;
  inset: -12px;
  background: radial-gradient(circle, var(--accent-glow, rgba(99, 102, 241, 0.2)) 0%, transparent 70%);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.drop-zone:hover .drop-icon-glow,
.drop-zone.is-dragging .drop-icon-glow {
  opacity: 1;
}

/* 文字 */
.drop-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--modal-text, #1e293b);
  position: relative;
  z-index: 1;
}

.drop-subtitle {
  font-size: 0.8125rem;
  color: var(--modal-muted, #94a3b8);
  position: relative;
  z-index: 1;
}

/* 文件类型标签 */
.file-types {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
  position: relative;
  z-index: 1;
}

.file-badge {
  padding: 0.25rem 0.625rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', monospace;
  color: var(--accent-indigo, #6366f1);
  background: var(--modal-hover, rgba(99, 102, 241, 0.08));
  border: 1px solid var(--modal-border, rgba(99, 102, 241, 0.15));
  transition: all 0.2s ease;
}

.drop-zone:hover .file-badge,
.drop-zone.is-dragging .file-badge {
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  border-color: transparent;
  box-shadow: 0 4px 12px var(--accent-glow, rgba(99, 102, 241, 0.25));
}

.file-input {
  display: none;
}

@keyframes bounceSoft {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.2);
  }
}
</style>
