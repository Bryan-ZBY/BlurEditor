<template>
  <div class="doc-outline" :class="{ 'is-dark': isDark, collapsed: isCollapsed }">
    <div class="outline-header" @click="toggleCollapse">
      <svg class="collapse-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
      </svg>
      <span class="outline-title">文档大纲</span>
      <span v-if="headings.length" class="outline-count">{{ headings.length }}</span>
    </div>
    <div v-show="!isCollapsed" class="outline-body">
      <div v-if="headings.length === 0" class="outline-empty">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7"/>
        </svg>
        <span>暂无标题</span>
      </div>
      <ul v-else class="outline-list">
        <li
          v-for="(heading, index) in headings"
          :key="index"
          class="outline-item"
          :class="[`level-${heading.level}`, { active: activeIndex === index }]"
          @click="scrollToHeading(index)"
        >
          <span class="outline-dot"></span>
          <span class="outline-text">{{ heading.text }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  content: { type: String, default: '' },
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['scrollToHeading'])

const isCollapsed = ref(false)
const activeIndex = ref(-1)

const headings = computed(() => {
  const lines = props.content.split('\n')
  const result = []
  const inCodeBlock = false

  for (const line of lines) {
    if (line.trim().startsWith('```')) continue
    const match = line.match(/^(#{1,6})\s+(.+)/)
    if (match) {
      result.push({
        level: match[1].length,
        text: match[2].trim()
      })
    }
  }
  return result
})

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function scrollToHeading(index) {
  activeIndex.value = index
  emit('scrollToHeading', { index, heading: headings.value[index] })
}

watch(() => props.content, () => {
  activeIndex.value = -1
})
</script>

<style scoped>
.doc-outline {
  width: 220px;
  border-left: 1px solid var(--outline-border, #e2e8f0);
  background: var(--outline-bg, #f8fafc);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.2s ease;
  overflow: hidden;
}

.doc-outline.collapsed {
  width: 32px;
}

.doc-outline.is-dark {
  --outline-bg: #0f172a;
  --outline-border: #334155;
  --outline-text: #94a3b8;
  --outline-text-hover: #e2e8f0;
  --outline-active: #3b82f6;
  --outline-item-hover: #1e293b;
}

.outline-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 0.75rem;
  border-bottom: 1px solid var(--outline-border, #e2e8f0);
  cursor: pointer;
  color: var(--outline-text, #64748b);
  font-size: 0.8125rem;
  font-weight: 500;
  white-space: nowrap;
  user-select: none;
}

.collapse-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.outline-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.outline-count {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: var(--outline-item-hover, #e2e8f0);
  font-size: 0.7rem;
}

.outline-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.outline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 2rem 1rem;
  color: var(--outline-text, #94a3b8);
  font-size: 0.8125rem;
  text-align: center;
}

.outline-empty svg {
  width: 2rem;
  height: 2rem;
  opacity: 0.5;
}

.outline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  color: var(--outline-text, #64748b);
  font-size: 0.8125rem;
  line-height: 1.4;
  transition: all 0.15s ease;
  border-left: 2px solid transparent;
}

.outline-item:hover {
  background: var(--outline-item-hover, #f1f5f9);
  color: var(--outline-text-hover, #1e293b);
}

.outline-item.active {
  color: var(--outline-active, #3b82f6);
  border-left-color: var(--outline-active, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.outline-item.level-1 {
  padding-left: 0.75rem;
  font-weight: 600;
}

.outline-item.level-2 {
  padding-left: 1.5rem;
}

.outline-item.level-3 {
  padding-left: 2.25rem;
  font-size: 0.75rem;
}

.outline-item.level-4 {
  padding-left: 3rem;
  font-size: 0.75rem;
}

.outline-item.level-5 {
  padding-left: 3.75rem;
  font-size: 0.75rem;
}

.outline-item.level-6 {
  padding-left: 4.5rem;
  font-size: 0.75rem;
}

.outline-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.5;
  flex-shrink: 0;
}

.outline-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
