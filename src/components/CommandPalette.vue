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
              placeholder="命令搜索（例如：切换主题）"
              @keydown.enter="runCurrent"
              @keydown.arrow-down.prevent="move(1)"
              @keydown.arrow-up.prevent="move(-1)"
              @keydown.escape.prevent="close"
            />
          </div>
          <button class="icon-btn" @click="close" title="关闭">✕</button>
        </div>

        <div class="command-sections custom-scrollbar">
          <div v-for="group in groupedCommands" :key="group.name" class="command-group">
            <div class="command-group-title">{{ group.name }}</div>
            <button
              v-for="(command, index) in group.commands"
              :key="command.id"
              class="command-item"
              :class="{ active: globalIndex(groupIndex(group.name), index) === activeIndex }"
              @mousedown.prevent
              @click="runCommand(command)"
            >
              <span class="command-title">{{ command.title }}</span>
              <span class="command-hint">{{ command.hint }}</span>
            </button>
          </div>
          <div v-if="commands.length === 0" class="command-empty">暂无可用命令</div>
        </div>

        <div class="command-footer">
          <span><kbd>Alt</kbd> + <kbd>K</kbd> 打开面板</span>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false },
  commands: { type: Array, default: () => [] }
})

const emit = defineEmits(['close', 'execute'])

const query = ref('')
const activeIndex = ref(0)
const inputRef = ref(null)

const filteredCommands = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return props.commands
  return props.commands.filter((command) => {
    const text = `${command.title} ${command.hint}`.toLowerCase()
    return text.includes(q) || (command.tags || []).some((tag) => tag.toLowerCase().includes(q))
  })
})

const groupedCommands = computed(() => {
  const groups = new Map()
  filteredCommands.value.forEach((command) => {
    const key = command.group || '其它'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(command)
  })
  return [...groups.entries()].map(([name, commands]) => ({ name, commands }))
})

function groupIndex(groupName) {
  let sum = 0
  for (const group of groupedCommands.value) {
    if (group.name === groupName) return sum
    sum += group.commands.length
  }
  return 0
}

function globalIndex(startIndex, localIndex) {
  return startIndex + localIndex
}

function move(delta) {
  const total = filteredCommands.value.length
  if (total === 0) return
  activeIndex.value = (activeIndex.value + delta + total) % total
}

function getByGlobalIndex(index) {
  let cursor = 0
  for (const command of filteredCommands.value) {
    if (cursor === index) return command
    cursor += 1
  }
  return null
}

function runCurrent() {
  const command = getByGlobalIndex(activeIndex.value)
  if (!command) return
  emit('execute', command)
  close()
}

function runCommand(command) {
  emit('execute', command)
  close()
}

function close() {
  emit('close')
}

watch(() => props.visible, (val) => {
  if (!val) {
    query.value = ''
    activeIndex.value = 0
    return
  }
  nextTick(() => {
    inputRef.value?.focus()
  })
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
  width: 680px;
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

.command-sections {
  max-height: 55vh;
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
  padding: 0.2rem 0.4rem 0.45rem;
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.command-item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.command-title {
  font-size: 0.9rem;
}

.command-hint {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
}

.command-footer {
  border-top: 1px solid var(--border-color, rgba(99, 102, 241, 0.15));
  padding: 0.55rem 0.8rem;
  color: var(--text-muted, #94a3b8);
  font-size: 0.72rem;
  text-align: right;
}

.command-empty {
  color: var(--text-muted, #94a3b8);
  text-align: center;
  padding: 2rem 1rem;
}

kbd {
  padding: 0 0.28rem;
  border-radius: 0.25rem;
  border: 1px solid var(--border-color, #cbd5e1);
  background: rgba(255, 255, 255, 0.15);
  font-size: 0.68rem;
}
</style>
