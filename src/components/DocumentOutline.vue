<template>
  <div class="doc-outline" :class="{ 'is-dark': isDark, collapsed: isCollapsed }">
    <div class="outline-header" @click="toggleCollapse">
      <div class="header-left">
        <svg
          class="collapse-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span class="outline-title">文档大纲</span>
      </div>
      <div class="header-right">
        <span v-if="filteredHeadings.length" class="outline-count">{{ filteredHeadings.length }}</span>
      </div>
    </div>
    <Transition name="expand">
      <div v-show="!isCollapsed" class="outline-body custom-scrollbar">
        <div class="outline-search">
          <input
            v-model.trim="searchKeyword"
            type="text"
            class="outline-search-input"
            placeholder="搜索标题..."
            @click.stop
          />
          <button v-if="searchKeyword" class="outline-search-clear" @click.stop="searchKeyword = ''">
            ×
          </button>
        </div>
        <Transition name="fade" mode="out-in">
          <div v-if="filteredHeadings.length === 0" key="empty" class="outline-empty">
            <div class="empty-icon-wrapper">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              <div class="empty-glow"></div>
            </div>
            <span>暂无标题</span>
          </div>
          <ul v-else key="list" class="outline-list">
            <li
              v-for="(heading, index) in filteredHeadings"
              :key="heading.id"
              class="outline-item"
              :class="[`level-${heading.level}`, { active: heading.id === propsActiveId }]"
              :style="{ animationDelay: index * 30 + 'ms' }"
              @click="scrollToHeading(heading)"
            >
              <div class="item-gutter">
                <span class="outline-dot"></span>
                <div class="indent-line" :style="{ '--level': heading.level }"></div>
              </div>
              <span class="outline-text">{{ heading.text }}</span>
            </li>
          </ul>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useOutlineParser } from '../composables/useOutlineParser.js'

const props = defineProps({
  content: {
    type: String,
    default: ''
  },
  isDark: {
    type: Boolean,
    default: false
  },
  activeHeadingId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['scrollToHeading'])

const isCollapsed = ref(false)
const searchKeyword = ref('')

const parserSource = computed(() => props.content || '')
const { getHeadings } = useOutlineParser(parserSource)
const headings = computed(() => getHeadings())

const normalizedSearchKeyword = computed(() => searchKeyword.value.trim().toLowerCase())
const filteredHeadings = computed(() => {
  const query = normalizedSearchKeyword.value
  if (!query) return headings.value
  return headings.value.filter((heading) =>
    heading.text.toLowerCase().includes(query)
  )
})

const propsActiveId = computed(() => props.activeHeadingId || '')

function toggleCollapse() {
  isCollapsed.value = !isCollapsed.value
}

function scrollToHeading(heading) {
  emit('scrollToHeading', { heading })
}
</script>

<style scoped>
.doc-outline {
  width: 230px;
  border-left: 1px solid var(--outline-border, #e2e8f0);
  background: var(--outline-bg, #f8fafc);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  position: relative;
}

.doc-outline.is-dark {
  --outline-bg: #0f172a;
  --outline-border: #334155;
  --outline-text: #94a3b8;
  --outline-text-hover: #e2e8f0;
  --outline-active: #3b82f6;
  --outline-item-hover: rgba(59, 130, 246, 0.08);
  --outline-item-active: rgba(59, 130, 246, 0.12);
  --outline-glow: rgba(59, 130, 246, 0.15);
}

.doc-outline::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, transparent, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.doc-outline:hover::before {
  opacity: 0.3;
}

.doc-outline.collapsed {
  width: 36px;
}

.outline-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.75rem;
  border-bottom: 1px solid var(--outline-border, #e2e8f0);
  cursor: pointer;
  color: var(--outline-text, #64748b);
  font-size: 0.8125rem;
  font-weight: 600;
  white-space: nowrap;
  user-select: none;
  transition: all 0.2s ease;
}

.outline-header:hover {
  background: var(--outline-item-hover, #f1f5f9);
  color: var(--outline-text-hover, #1e293b);
}

.outline-search {
  position: relative;
  padding: 0.5rem;
  border-bottom: 1px solid var(--outline-border, #e2e8f0);
}

.outline-search-input {
  width: 100%;
  border-radius: 0.5rem;
  border: 1px solid var(--outline-border, #e2e8f0);
  background: var(--editor-bg, #fff);
  color: var(--text-primary, #0f172a);
  padding: 0.35rem 2rem 0.35rem 0.6rem;
  font-size: 0.75rem;
  outline: none;
}

.outline-search-input:focus {
  border-color: var(--outline-active, #6366f1);
  box-shadow: 0 0 0 2px var(--outline-glow, rgba(99, 102, 241, 0.2));
}

.outline-search-clear {
  position: absolute;
  right: 0.8rem;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  color: var(--outline-text, #94a3b8);
  font-size: 1rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.collapse-icon {
  width: 1rem;
  height: 1rem;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.collapsed .collapse-icon {
  transform: rotate(-90deg);
}

.outline-title {
  overflow: hidden;
  text-overflow: ellipsis;
}

.header-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.outline-count {
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  min-width: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 8px var(--accent-glow, rgba(99, 102, 241, 0.2));
}

.outline-body {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem 0;
}

.expand-enter-active,
.expand-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}

.outline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 2.5rem 1rem;
  color: var(--outline-text, #94a3b8);
  font-size: 0.8125rem;
  text-align: center;
}

.empty-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.outline-empty svg {
  width: 2rem;
  height: 2rem;
  opacity: 0.4;
  animation: float 3s ease-in-out infinite;
}

.empty-glow {
  position: absolute;
  inset: -6px;
  background: radial-gradient(circle, var(--outline-glow, rgba(99, 102, 241, 0.1)) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulseGlow 3s ease-in-out infinite;
  pointer-events: none;
}

.outline-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.outline-item {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0.375rem 0.75rem;
  cursor: pointer;
  color: var(--outline-text, #64748b);
  font-size: 0.8125rem;
  line-height: 1.4;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-left: 2px solid transparent;
  margin: 0 0.5rem;
  border-radius: 0 0.5rem 0.5rem 0;
  opacity: 0;
  animation: fadeInLeft 0.35s ease forwards;
  position: relative;
}

.outline-item:hover {
  background: var(--outline-item-hover, #f1f5f9);
  color: var(--outline-text-hover, #1e293b);
}

.outline-item.active {
  color: var(--outline-active, #6366f1);
  background: var(--outline-item-active, rgba(99, 102, 241, 0.08));
  border-left-color: var(--outline-active, #6366f1);
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

.item-gutter {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.375rem;
  position: relative;
  flex-shrink: 0;
}

.outline-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: currentColor;
  opacity: 0.4;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

.outline-item:hover .outline-dot {
  opacity: 0.7;
  transform: scale(1.3);
}

.outline-item.active .outline-dot {
  opacity: 1;
  background: var(--outline-active, #6366f1);
  transform: scale(1.4);
  box-shadow: 0 0 8px var(--accent-glow, rgba(99, 102, 241, 0.4));
}

.indent-line {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 1px;
  height: 0;
  background: linear-gradient(180deg, var(--outline-border, #e2e8f0), transparent);
  opacity: 0;
  transition: all 0.2s ease;
}

.outline-item:hover .indent-line {
  opacity: 0.5;
  height: 100%;
}

.outline-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

@keyframes pulseGlow {
  0%,
  100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
  }
}
</style>
