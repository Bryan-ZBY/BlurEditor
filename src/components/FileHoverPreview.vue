<template>
  <span
    ref="triggerEl"
    :class="['file-preview-trigger', nameClass]"
    :aria-label="file?.name"
    @mouseenter="schedulePreview"
    @mouseleave="scheduleHidePreview"
  >
    {{ file?.name }}
  </span>

  <Teleport to="body">
    <Transition name="file-preview">
      <div
        v-if="showPreview"
        ref="popoverEl"
        class="file-preview-popover"
        :class="isDark ? 'dark' : 'light'"
        :style="previewStyle"
        role="tooltip"
        @mouseenter="keepPreview"
        @mouseleave="scheduleHidePreview"
      >
        <div class="file-preview-name">{{ file?.name }}</div>
        <div class="file-preview-meta">{{ previewMeta }}</div>
        <pre v-if="file?.type === 'file'" class="file-preview-content">{{ previewText }}</pre>
        <div v-else class="file-preview-folder">文件夹没有可预览的正文内容</div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({
  inheritAttrs: false
})

const props = defineProps({
  file: Object,
  isDark: Boolean,
  nameClass: {
    type: [String, Array, Object],
    default: ''
  },
  disabled: Boolean
})

const PREVIEW_DELAY_MS = 500
const HIDE_DELAY_MS = 180
const MAX_PREVIEW_CHARS = 1200
const PREVIEW_WIDTH = 340
const PREVIEW_HEIGHT = 280
const VIEWPORT_GAP = 10
const CLOSE_PREVIEW_EVENT = 'blur-editor-close-file-previews'

const triggerEl = ref(null)
const popoverEl = ref(null)
const showPreview = ref(false)
const previewStyle = ref({})
let previewTimer = null
let hideTimer = null

const previewText = computed(() => {
  const content = String(props.file?.content ?? '').replace(/\r\n/g, '\n')
  if (!content.trim()) return '空文件'

  if (content.length <= MAX_PREVIEW_CHARS) return content
  return `${content.slice(0, MAX_PREVIEW_CHARS).trimEnd()}\n...`
})

const previewMeta = computed(() => {
  if (props.file?.type === 'folder') return '文件夹'

  const size = formatSize(String(props.file?.content ?? '').length)
  const lines = props.file?.content ? String(props.file.content).split('\n').length : 0
  return `Markdown 文件 · ${size} · ${lines} 行`
})

function schedulePreview() {
  if (props.disabled) return
  clearHideTimer()
  clearPreviewTimer()
  previewTimer = window.setTimeout(() => {
    updatePreviewPosition()
    showPreview.value = true
  }, PREVIEW_DELAY_MS)
}

function keepPreview() {
  clearHideTimer()
}

function scheduleHidePreview() {
  clearPreviewTimer()
  clearHideTimer()
  hideTimer = window.setTimeout(() => {
    showPreview.value = false
    hideTimer = null
  }, HIDE_DELAY_MS)
}

function hidePreview() {
  clearPreviewTimer()
  clearHideTimer()
  showPreview.value = false
}

function clearPreviewTimer() {
  if (!previewTimer) return
  window.clearTimeout(previewTimer)
  previewTimer = null
}

function clearHideTimer() {
  if (!hideTimer) return
  window.clearTimeout(hideTimer)
  hideTimer = null
}

function handleDocumentScroll(event) {
  if (popoverEl.value?.contains(event.target)) return
  hidePreview()
}

function updatePreviewPosition() {
  const target = triggerEl.value
  if (!target) return

  const rect = target.getBoundingClientRect()
  const width = Math.min(PREVIEW_WIDTH, window.innerWidth - VIEWPORT_GAP * 2)
  let left = rect.right + VIEWPORT_GAP
  let top = rect.top

  if (left + width > window.innerWidth - VIEWPORT_GAP) {
    left = rect.left - width - VIEWPORT_GAP
  }
  if (left < VIEWPORT_GAP) {
    left = VIEWPORT_GAP
  }
  if (top + PREVIEW_HEIGHT > window.innerHeight - VIEWPORT_GAP) {
    top = window.innerHeight - PREVIEW_HEIGHT - VIEWPORT_GAP
  }
  if (top < VIEWPORT_GAP) {
    top = VIEWPORT_GAP
  }

  previewStyle.value = {
    left: `${left}px`,
    top: `${top}px`,
    width: `${width}px`
  }
}

function formatSize(bytes) {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

watch(showPreview, (visible) => {
  if (visible) {
    document.addEventListener('scroll', handleDocumentScroll, true)
    window.addEventListener('resize', hidePreview)
  } else {
    document.removeEventListener('scroll', handleDocumentScroll, true)
    window.removeEventListener('resize', hidePreview)
  }
})

onMounted(() => {
  window.addEventListener(CLOSE_PREVIEW_EVENT, hidePreview)
})

onBeforeUnmount(() => {
  clearPreviewTimer()
  clearHideTimer()
  document.removeEventListener('scroll', handleDocumentScroll, true)
  window.removeEventListener('resize', hidePreview)
  window.removeEventListener(CLOSE_PREVIEW_EVENT, hidePreview)
})
</script>

<style scoped>
.file-preview-trigger {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.file-preview-popover {
  position: fixed;
  z-index: 10000;
  max-height: 280px;
  border-radius: 0.65rem;
  border: 1px solid;
  box-shadow: 0 18px 40px -18px rgba(15, 23, 42, 0.55);
  padding: 0.75rem;
  pointer-events: auto;
  user-select: text;
  overflow: hidden;
}

.file-preview-popover.light {
  color: #0f172a;
  background: rgba(255, 255, 255, 0.98);
  border-color: rgba(59, 130, 246, 0.14);
}

.file-preview-popover.dark {
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.98);
  border-color: rgba(96, 165, 250, 0.24);
}

.file-preview-name {
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.file-preview-meta {
  margin-top: 0.3rem;
  color: #64748b;
  font-size: 0.7rem;
}

.file-preview-popover.dark .file-preview-meta {
  color: #94a3b8;
}

.file-preview-content {
  margin: 0.65rem 0 0;
  max-height: 190px;
  padding: 0.65rem;
  border-radius: 0.5rem;
  overflow: auto;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.72rem;
  line-height: 1.45;
}

.file-preview-popover.light .file-preview-content {
  color: #334155;
  background: rgba(241, 245, 249, 0.9);
}

.file-preview-popover.dark .file-preview-content {
  color: #cbd5e1;
  background: rgba(30, 41, 59, 0.9);
}

.file-preview-folder {
  margin-top: 0.65rem;
  color: #64748b;
  font-size: 0.75rem;
}

.file-preview-popover.dark .file-preview-folder {
  color: #94a3b8;
}

.file-preview-enter-active,
.file-preview-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.file-preview-enter-from,
.file-preview-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
