<template>
  <Transition name="overlay">
    <div v-if="visible" class="import-overlay" @click.self="handleClose">
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
            <button class="close-btn" @click="handleClose" title="关闭">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <div v-if="importError" class="import-error">
              {{ importError }}
            </div>

            <div v-if="pendingWorkspace" class="workspace-preview">
              <div class="workspace-title-row">
                <div>
                  <p class="workspace-kicker">工作区备份</p>
                  <h4>{{ pendingWorkspaceName }}</h4>
                </div>
                <span class="workspace-version">v{{ workspaceSummary.version || 1 }}</span>
              </div>

              <div class="workspace-meta">
                <span>{{ formatDate(workspaceSummary.exportedAt) }}</span>
                <span>{{ workspaceSummary.sortMode }}</span>
                <span>{{ workspaceSummary.includeArchived ? '含归档' : '不含归档' }}</span>
              </div>

              <div class="workspace-stats">
                <div class="workspace-stat">
                  <strong>{{ workspaceSummary.fileCount || 0 }}</strong>
                  <span>文档</span>
                </div>
                <div class="workspace-stat">
                  <strong>{{ workspaceSummary.folderCount || 0 }}</strong>
                  <span>文件夹</span>
                </div>
                <div class="workspace-stat">
                  <strong>{{ workspaceSummary.archivedCount || 0 }}</strong>
                  <span>归档</span>
                </div>
                <div class="workspace-stat">
                  <strong>{{ formatNumber(workspaceSummary.totalCharacters || 0) }}</strong>
                  <span>字符</span>
                </div>
              </div>

              <div v-if="workspaceSummary.warnings?.length" class="workspace-warnings">
                <div v-for="warning in workspaceSummary.warnings" :key="warning" class="workspace-warning">
                  {{ warning }}
                </div>
              </div>

              <div class="import-mode">
                <button
                  class="mode-option"
                  :class="{ active: importMode === 'replace' }"
                  @click="importMode = 'replace'"
                >
                  <span>替换</span>
                  <small>先备份当前工作区，再恢复此备份</small>
                </button>
                <button
                  class="mode-option"
                  :class="{ active: importMode === 'merge' }"
                  @click="importMode = 'merge'"
                >
                  <span>合并</span>
                  <small>追加到当前工作区，重名自动改名</small>
                </button>
              </div>

              <div class="workspace-actions">
                <button class="secondary-btn" @click="clearWorkspaceDraft">取消</button>
                <button class="primary-btn" @click="confirmWorkspaceImport">
                  {{ importMode === 'replace' ? '恢复工作区' : '合并工作区' }}
                </button>
              </div>
            </div>

            <div
              v-else
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
              <span class="drop-subtitle">支持 Markdown、纯文本、HTML、工作区 JSON 格式</span>
              <div class="file-types">
                <span class="file-badge">.md</span>
                <span class="file-badge">.txt</span>
                <span class="file-badge">.html</span>
                <span class="file-badge">.json</span>
              </div>
              <input ref="fileInputRef" type="file" class="file-input" multiple accept=".md,.txt,.html,.json,application/json" @change="handleFileSelect" />
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>

  <ConfirmModal
    :visible="largeFileConfirm.visible"
    :is-dark="isDark"
    title="继续导入大文件？"
    :message="largeFileConfirm.message"
    icon-type="warning"
    confirm-text="继续导入"
    cancel-text="跳过"
    confirm-variant="primary"
    @confirm="resolveLargeFileConfirm(true)"
    @cancel="resolveLargeFileConfirm(false)"
  />
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { readFileContent, getFileName } from '../utils/fileParser.js'
import { getWorkspaceSummary, parseWorkspaceContent } from '../composables/useFileSystem.js'
import ConfirmModal from './ConfirmModal.vue'

const LARGE_FILE_WARNING_BYTES = 5 * 1024 * 1024

const props = defineProps({
  visible: Boolean,
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['close', 'import'])

const fileInputRef = ref(null)
const isDragging = ref(false)
const importError = ref('')
const importMode = ref('replace')
const pendingWorkspace = ref(null)
const pendingWorkspaceName = ref('')
const largeFileConfirm = ref({
  visible: false,
  message: ''
})
let largeFileConfirmResolver = null
const workspaceSummary = computed(() => (
  pendingWorkspace.value ? getWorkspaceSummary(pendingWorkspace.value) : {}
))

function triggerFileInput() {
  fileInputRef.value?.click()
}

function resetState() {
  isDragging.value = false
  importError.value = ''
  importMode.value = 'replace'
  pendingWorkspace.value = null
  pendingWorkspaceName.value = ''
  resolveLargeFileConfirm(false)
}

function handleClose() {
  resetState()
  emit('close')
}

function clearWorkspaceDraft() {
  resetState()
}

function confirmWorkspaceImport() {
  if (!pendingWorkspace.value) return
  emit('import', {
    type: 'workspace',
    workspace: pendingWorkspace.value,
    mode: importMode.value
  })
}

function formatDate(timestamp) {
  if (!timestamp) return '未知时间'
  return new Date(timestamp).toLocaleString()
}

function formatNumber(value) {
  return new Intl.NumberFormat().format(value)
}

function resolveLargeFileConfirm(result) {
  const resolver = largeFileConfirmResolver
  largeFileConfirmResolver = null
  largeFileConfirm.value = {
    visible: false,
    message: ''
  }
  resolver?.(result)
}

function confirmLargeFile(message) {
  if (largeFileConfirmResolver) {
    resolveLargeFileConfirm(false)
  }

  largeFileConfirm.value = {
    visible: true,
    message
  }

  return new Promise((resolve) => {
    largeFileConfirmResolver = resolve
  })
}

async function shouldReadLargeFile(file) {
  if (!file?.size || file.size <= LARGE_FILE_WARNING_BYTES) return true
  const size = (file.size / 1024 / 1024).toFixed(1)
  return confirmLargeFile(`${file.name} 有 ${size} MB，导入时可能需要一些时间，是否继续？`)
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
  importError.value = ''
  clearWorkspaceDraft()
  
  for (const file of fileList) {
    if (!(await shouldReadLargeFile(file))) continue

    try {
      const content = await readFileContent(file)
      const workspace = parseWorkspaceContent(content)

      if (workspace) {
        pendingWorkspace.value = workspace
        pendingWorkspaceName.value = file.name
        return
      }

      if (/\.json$/i.test(file.name)) {
        importError.value = `${file.name} 不是有效的 MDViewer 工作区备份。`
        continue
      }

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

watch(() => props.visible, (visible) => {
  if (!visible) resetState()
})
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

.import-error {
  margin-bottom: 0.875rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.24);
  color: #b91c1c;
  background: rgba(254, 226, 226, 0.72);
  font-size: 0.8125rem;
  line-height: 1.4;
}

.import-modal.is-dark .import-error {
  color: #fecaca;
  background: rgba(127, 29, 29, 0.24);
  border-color: rgba(248, 113, 113, 0.24);
}

.workspace-preview {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.workspace-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.workspace-kicker {
  margin: 0 0 0.2rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-indigo, #6366f1);
  text-transform: uppercase;
}

.workspace-title-row h4 {
  margin: 0;
  max-width: 22rem;
  color: var(--modal-text, #1e293b);
  font-size: 1rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.workspace-version {
  flex-shrink: 0;
  padding: 0.2rem 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid var(--modal-border, #e2e8f0);
  color: var(--modal-muted, #64748b);
  font-size: 0.75rem;
  font-weight: 700;
}

.workspace-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.workspace-meta span {
  padding: 0.25rem 0.5rem;
  border-radius: 0.5rem;
  background: var(--modal-hover, #f1f5f9);
  color: var(--modal-muted, #64748b);
  font-size: 0.75rem;
  line-height: 1.2;
}

.workspace-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.workspace-stat {
  min-width: 0;
  padding: 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid var(--modal-border, #e2e8f0);
  background: color-mix(in srgb, var(--modal-bg, #fff) 90%, var(--accent-indigo, #6366f1) 10%);
}

.workspace-stat strong,
.workspace-stat span {
  display: block;
}

.workspace-stat strong {
  color: var(--modal-text, #1e293b);
  font-size: 0.95rem;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.workspace-stat span {
  margin-top: 0.25rem;
  color: var(--modal-muted, #64748b);
  font-size: 0.72rem;
}

.workspace-warnings {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.workspace-warning {
  padding: 0.5rem 0.625rem;
  border-radius: 0.5rem;
  border: 1px solid rgba(245, 158, 11, 0.28);
  background: rgba(254, 243, 199, 0.7);
  color: #92400e;
  font-size: 0.78rem;
  line-height: 1.35;
}

.import-modal.is-dark .workspace-warning {
  color: #fde68a;
  background: rgba(120, 53, 15, 0.24);
  border-color: rgba(251, 191, 36, 0.24);
}

.import-mode {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
}

.mode-option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 0.5rem;
  border: 1px solid var(--modal-border, #e2e8f0);
  background: var(--modal-bg, #fff);
  color: var(--modal-text, #1e293b);
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
}

.mode-option span {
  font-weight: 700;
}

.mode-option small {
  color: var(--modal-muted, #64748b);
  font-size: 0.74rem;
  line-height: 1.35;
}

.mode-option.active {
  border-color: var(--accent-indigo, #6366f1);
  background: color-mix(in srgb, var(--modal-bg, #fff) 84%, var(--accent-indigo, #6366f1) 16%);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(99, 102, 241, 0.14));
}

.workspace-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.625rem;
}

.secondary-btn,
.primary-btn {
  min-height: 2.25rem;
  padding: 0 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.secondary-btn {
  border: 1px solid var(--modal-border, #e2e8f0);
  background: transparent;
  color: var(--modal-muted, #64748b);
}

.primary-btn {
  border: 1px solid transparent;
  background: var(--accent-indigo, #6366f1);
  color: #fff;
  box-shadow: 0 8px 18px var(--accent-glow, rgba(99, 102, 241, 0.25));
}

.secondary-btn:hover,
.primary-btn:hover {
  transform: translateY(-1px);
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
  box-shadow: var(--surface-shadow-hover);
}

.drop-zone:hover .drop-icon {
  animation: bounceSoft 1s ease-in-out infinite;
}

.drop-zone.is-dragging {
  border-color: var(--accent-indigo, #6366f1);
  border-style: solid;
  background: var(--modal-hover, rgba(99, 102, 241, 0.05));
  transform: scale(1.02);
  box-shadow: 0 0 0 4px var(--accent-glow, rgba(99, 102, 241, 0.15)), var(--surface-shadow-hover);
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

@media (max-width: 560px) {
  .workspace-stats,
  .import-mode {
    grid-template-columns: 1fr 1fr;
  }

  .workspace-actions {
    flex-direction: column-reverse;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }
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
