<template>
  <Teleport to="body">
    <div v-if="visible" class="command-palette-overlay" @click.self="close">
      <div class="command-palette glass" :class="{ 'is-dark': isDark }">
        <div class="command-palette-header">
          <div class="command-search">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              type="text"
              placeholder="搜索命令、文件、正文或标签..."
              @keydown.enter="runCurrent"
              @keydown.arrow-down.prevent="move(1)"
              @keydown.arrow-up.prevent="move(-1)"
              @keydown.escape.prevent="close"
            />
          </div>
          <button class="icon-btn" @click="close" title="关闭">×</button>
        </div>

        <div class="command-sections custom-scrollbar" ref="resultsRef">
          <div v-for="group in groupedResults" :key="group.name" class="command-group">
            <div class="command-group-title">
              <span>{{ group.name }}</span>
              <span>{{ group.results.length }}</span>
            </div>
            <button
              v-for="(result, index) in group.results"
              :key="result.id"
              class="command-item"
              :class="{ active: group.start + index === activeIndex }"
              @mousedown.prevent
              @click="runResult(result)"
              @mouseenter="activeIndex = group.start + index"
            >
              <span class="result-kind">{{ result.badge }}</span>
              <span class="result-copy">
                <span class="command-title" v-html="highlightResultText(result.title)"></span>
                <span class="command-hint" v-html="highlightResultText(result.hint)"></span>
              </span>
              <span class="result-action">{{ result.actionLabel }}</span>
            </button>
          </div>
          <div v-if="flattenedResults.length === 0" class="command-empty">
            <p>没有找到匹配结果</p>
            <span>试试文件名、正文关键词、标签名或命令名称</span>
          </div>
        </div>

        <div class="command-footer">
          <span><kbd>↑↓</kbd> 选择</span>
          <span><kbd>Enter</kbd> 打开</span>
          <span><kbd>Ctrl</kbd> + <kbd>K</kbd> 或 <kbd>Alt</kbd> + <kbd>G</kbd> 全局入口</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick, onMounted } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  commands: { type: Array, default: () => [] },
  files: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'execute', 'open-file'])

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)
const resultsRef = ref(null)

const normalizedQuery = computed(() => query.value.trim().toLowerCase())

const searchableFiles = computed(() => {
  return (props.files || []).filter((file) => file?.type === 'file' && !file.isArchived)
})

const allResults = computed(() => {
  const q = normalizedQuery.value
  return [
    ...commandResults(q),
    ...fileResults(q),
    ...contentResults(q),
    ...tagResults(q)
  ]
})

const groupedResults = computed(() => {
  const groups = []
  let cursor = 0

  allResults.value.forEach((result) => {
    let group = groups.find((item) => item.name === result.group)
    if (!group) {
      group = { name: result.group, start: cursor, results: [] }
      groups.push(group)
    }
    group.results.push(result)
    cursor += 1
  })

  return groups
})

const flattenedResults = computed(() => allResults.value)

function commandResults(q) {
  const source = props.commands || []
  const filtered = q
    ? source.filter((command) => {
      const tags = (command.tags || []).join(' ')
      const text = `${command.title} ${command.hint} ${tags}`.toLowerCase()
      return text.includes(q)
    })
    : source

  return filtered.slice(0, 12).map((command) => ({
    id: command.id,
    type: 'command',
    group: q ? '命令' : (command.group || '命令'),
    badge: '命令',
    title: command.title,
    hint: command.hint,
    actionLabel: '执行',
    command
  }))
}

function fileResults(q) {
  if (!q) return []

  return searchableFiles.value
    .filter((file) => normalize(file.name).includes(q))
    .sort((a, b) => {
      const aExact = normalize(a.name).startsWith(q) ? 0 : 1
      const bExact = normalize(b.name).startsWith(q) ? 0 : 1
      if (aExact !== bExact) return aExact - bExact
      return (b.lastOpenedAt || b.updatedAt || 0) - (a.lastOpenedAt || a.updatedAt || 0)
    })
    .slice(0, 8)
    .map((file) => ({
      id: `file:${file.id}`,
      type: 'file',
      group: '文件',
      badge: '文件',
      title: file.name,
      hint: getFilePath(file.id),
      actionLabel: '打开',
      fileId: file.id
    }))
}

function contentResults(q) {
  if (!q) return []

  const results = []
  for (const file of searchableFiles.value) {
    const content = file.content || ''
    const lines = content.split('\n')

    lines.forEach((line, lineIndex) => {
      if (!normalize(line).includes(q)) return

      results.push({
        id: `content:${file.id}:${lineIndex}`,
        type: 'content',
        group: '正文',
        badge: '正文',
        title: file.name,
        hint: `第 ${lineIndex + 1} 行 · ${buildPreview(line, q)}`,
        actionLabel: '定位',
        fileId: file.id,
        lineIndex
      })
    })
  }

  return results
}

function tagResults(q) {
  if (!q) return []

  const results = []
  for (const file of searchableFiles.value) {
    const matchedTag = (file.tags || []).map(tagToText).find((tag) => normalize(tag).includes(q))
    if (!matchedTag) continue

    results.push({
      id: `tag:${file.id}:${matchedTag}`,
      type: 'tag',
      group: '标签',
      badge: '标签',
      title: matchedTag,
      hint: file.name,
      actionLabel: '打开',
      fileId: file.id
    })

    if (results.length >= 8) break
  }

  return results
}

function normalize(value) {
  return String(value || '').toLowerCase()
}

function tagToText(tag) {
  if (!tag) return ''
  if (typeof tag === 'object') return tag.name || tag.title || tag.id || ''
  return String(tag)
}

function buildPreview(line, q) {
  const source = String(line || '').trim()
  if (!source) return '空行'

  const index = normalize(source).indexOf(q)
  if (index === -1) return source.slice(0, 72)

  const start = Math.max(0, index - 24)
  const end = Math.min(source.length, index + q.length + 48)
  return `${start > 0 ? '...' : ''}${source.slice(start, end)}${end < source.length ? '...' : ''}`
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function highlightResultText(value) {
  const text = escapeHtml(value)
  const q = query.value.trim()
  if (!q) return text

  const escapedQuery = escapeHtml(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return text.replace(new RegExp(`(${escapedQuery})`, 'gi'), '<mark>$1</mark>')
}

function getFilePath(fileId) {
  const path = []
  let current = props.files.find((file) => file.id === fileId)
  while (current) {
    path.unshift(current.name)
    current = props.files.find((file) => file.id === current.parentId)
  }
  return path.join(' / ')
}

function move(delta) {
  const total = flattenedResults.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
  scrollToActive()
}

function runCurrent() {
  const result = flattenedResults.value[activeIndex.value]
  if (!result) return
  runResult(result)
}

function runResult(result) {
  if (result.type === 'command') {
    emit('execute', result.command)
  } else {
    emit('open-file', {
      fileId: result.fileId,
      lineIndex: result.lineIndex,
      source: result.type,
      query: query.value
    })
  }
  close()
}

function scrollToActive() {
  nextTick(() => {
    const container = resultsRef.value
    const activeItem = container?.querySelector('.command-item.active')
    activeItem?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  })
}

function close() {
  emit('close')
}

function focusInput() {
  nextTick(() => {
    inputRef.value?.focus()
  })
}

watch(() => props.visible, (val) => {
  if (!val) {
    query.value = ''
    activeIndex.value = 0
    return
  }
  focusInput()
})

watch([query, allResults], () => {
  activeIndex.value = 0
})

onMounted(() => {
  if (props.visible) {
    focusInput()
  }
})
</script>

<style scoped>
.command-palette-overlay {
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(7, 10, 18, 0.45);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 9vh;
  animation: fadeIn 0.15s ease;
}

.command-palette {
  width: 720px;
  max-width: calc(100vw - 2rem);
  border-radius: 0.9rem;
  border: 1px solid var(--border-color, rgba(99, 102, 241, 0.2));
  background: rgba(15, 23, 42, 0.94);
  color: var(--text-primary, #e2e8f0);
  box-shadow: 0 30px 80px -30px rgba(2, 6, 23, 0.75), 0 0 0 1px rgba(99, 102, 241, 0.14);
  backdrop-filter: blur(18px);
  overflow: hidden;
}

.command-palette.is-dark {
  background: rgba(15, 23, 42, 0.95);
}

.command-palette:not(.is-dark) {
  background: rgba(248, 250, 252, 0.95);
  color: var(--text-primary, #0f172a);
}

.command-palette-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem;
  border-bottom: 1px solid var(--border-color, rgba(99, 102, 241, 0.18));
}

.command-search {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  width: 1.15rem;
  height: 1.15rem;
  position: absolute;
  left: 0.7rem;
  color: var(--text-muted, #94a3b8);
  pointer-events: none;
}

.command-search input {
  width: 100%;
  height: 2.6rem;
  border-radius: 0.65rem;
  border: 1px solid var(--border-color, rgba(99, 102, 241, 0.2));
  background: transparent;
  color: inherit;
  padding: 0 0.8rem 0 2.55rem;
  font-size: 0.95rem;
  outline: none;
}

.icon-btn {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 0.6rem;
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
}

.icon-btn:hover {
  color: var(--text-primary, #e2e8f0);
  background: rgba(99, 102, 241, 0.12);
}

.command-sections {
  max-height: 58vh;
  overflow: auto;
  padding: 0.55rem;
}

.command-group {
  margin-bottom: 0.75rem;
}

.command-group:last-child {
  margin-bottom: 0;
}

.command-group-title {
  display: flex;
  justify-content: space-between;
  padding: 0.2rem 0.4rem 0.45rem;
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.command-item {
  width: 100%;
  display: grid;
  grid-template-columns: 2.8rem minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.65rem;
  padding: 0.58rem 0.65rem;
  text-align: left;
  background: transparent;
  border: 0;
  border-radius: 0.55rem;
  color: inherit;
  cursor: pointer;
}

.command-item:hover,
.command-item.active {
  background: rgba(99, 102, 241, 0.14);
}

.result-kind {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.5rem;
  height: 1.45rem;
  border-radius: 0.45rem;
  background: rgba(99, 102, 241, 0.14);
  color: var(--accent-indigo, #6366f1);
  font-size: 0.7rem;
  font-weight: 700;
}

.result-copy {
  min-width: 0;
  display: grid;
  gap: 0.16rem;
}

.command-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 600;
}

.command-hint {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
}

:deep(mark) {
  padding: 0.02rem 0.14rem;
  border-radius: 0.2rem;
  background: rgba(250, 204, 21, 0.45);
  color: inherit;
}

.result-action {
  color: var(--text-muted, #94a3b8);
  font-size: 0.72rem;
}

.command-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid var(--border-color, rgba(99, 102, 241, 0.15));
  padding: 0.55rem 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-size: 0.72rem;
}

.command-empty {
  color: var(--text-muted, #94a3b8);
  text-align: center;
  padding: 2rem 1rem;
}

.command-empty p {
  margin: 0 0 0.35rem;
  color: var(--text-primary, #e2e8f0);
}

.command-empty span {
  font-size: 0.78rem;
}

kbd {
  padding: 0 0.28rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color, #cbd5e1);
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.68rem;
}

@media (max-width: 720px) {
  .command-footer {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .command-item {
    grid-template-columns: 2.8rem minmax(0, 1fr);
  }

  .result-action {
    display: none;
  }
}
</style>
