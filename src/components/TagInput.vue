<template>
  <div class="tag-input" :class="{ 'is-dark': isDark, focused: isFocused }">
    <div class="tag-list" v-if="selectedTags.length > 0">
      <TagBadge
        v-for="tag in selectedTags"
        :key="tag.id"
        :tag="tag"
        removable
        @remove="handleRemoveTag"
      />
    </div>

    <div class="input-wrapper">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="input"
        :placeholder="placeholder"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter.prevent="handleSelectSuggestion"
        @keydown.escape="handleEscape"
        @keydown.backspace="handleBackspace"
        @input="handleInput"
      />

      <Transition name="suggestions">
        <div v-if="showSuggestions && (filteredTags.length > 0 || query)" class="suggestions custom-scrollbar">
          <div
            v-for="(tag, index) in filteredTags"
            :key="tag.id"
            class="suggestion-item"
            :class="{ active: selectedIndex === index }"
            :style="{ animationDelay: index * 30 + 'ms' }"
            @mousedown.prevent="selectSuggestion(tag)"
            @mouseenter="selectedIndex = index"
          >
            <span
              class="suggestion-dot"
              :style="{ backgroundColor: tag.bg }"
            ></span>
            <span class="suggestion-name">{{ tag.name }}</span>
            <span class="suggestion-count">{{ tag.count }} 个文档</span>
          </div>

          <div
            v-if="query && !filteredTags.some(t => t.name.toLowerCase() === query.toLowerCase())"
            class="suggestion-item create-new"
            :class="{ active: selectedIndex === filteredTags.length }"
            :style="{ animationDelay: filteredTags.length * 30 + 'ms' }"
            @mousedown.prevent="createAndSelect"
            @mouseenter="selectedIndex = filteredTags.length"
          >
            <div class="create-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
              </svg>
            </div>
            <span>创建 "<strong>{{ query }}</strong>"</span>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import TagBadge from './TagBadge.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  tags: {
    type: Array,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '添加标签...'
  },
  isDark: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'change'])

const inputRef = ref(null)
const query = ref('')
const isFocused = ref(false)
const selectedIndex = ref(-1)
const showSuggestions = ref(false)

const selectedTags = computed(() => {
  return props.modelValue.map(tagId => props.tags.find(t => t.id === tagId)).filter(Boolean)
})

const filteredTags = computed(() => {
  if (!query.value) {
    return props.tags.filter(t => !props.modelValue.includes(t.id))
  }

  const lowerQuery = query.value.toLowerCase()
  return props.tags
    .filter(t =>
      !props.modelValue.includes(t.id) &&
      t.name.toLowerCase().includes(lowerQuery)
    )
    .slice(0, 10)
})

function handleFocus() {
  isFocused.value = true
  showSuggestions.value = true
  selectedIndex.value = -1
}

function handleBlur() {
  setTimeout(() => {
    isFocused.value = false
    showSuggestions.value = false
  }, 150)
}

function handleInput() {
  selectedIndex.value = -1
}

function handleEscape() {
  showSuggestions.value = false
  inputRef.value?.blur()
}

function handleBackspace() {
  if (query.value === '' && props.modelValue.length > 0) {
    removeTag(props.modelValue[props.modelValue.length - 1])
  }
}

function handleSelectSuggestion() {
  if (selectedIndex.value === filteredTags.value.length) {
    createAndSelect()
  } else if (selectedIndex.value >= 0 && selectedIndex.value < filteredTags.value.length) {
    selectSuggestion(filteredTags.value[selectedIndex.value])
  } else if (filteredTags.value.length > 0) {
    selectSuggestion(filteredTags.value[0])
  }
}

function selectSuggestion(tag) {
  addTag(tag.id)
  query.value = ''
  selectedIndex.value = -1
  nextTick(() => {
    inputRef.value?.focus()
  })
}

function createAndSelect() {
  const newTag = {
    id: Date.now().toString(36) + Math.random().toString(36).substring(2, 7),
    name: query.value,
    color: 'blue',
    bg: '#eff6ff',
    text: '#2563eb',
    count: 0
  }
  addTag(newTag.id)
  query.value = ''
  emit('change', { action: 'create', tag: newTag })
}

function addTag(tagId) {
  if (!props.modelValue.includes(tagId)) {
    emit('update:modelValue', [...props.modelValue, tagId])
    emit('change', { action: 'add', tagId })
  }
}

function removeTag(tagId) {
  emit('update:modelValue', props.modelValue.filter(id => id !== tagId))
  emit('change', { action: 'remove', tagId })
}

function handleRemoveTag(tag) {
  removeTag(tag.id)
}

function focus() {
  inputRef.value?.focus()
}

function blur() {
  inputRef.value?.blur()
}

watch(query, () => {
  selectedIndex.value = -1
})

defineExpose({ focus, blur })
</script>

<style scoped>
.tag-input {
  position: relative;
  padding: 0.375rem 0.5rem;
  border: 1px solid var(--tag-input-border, #e5e7eb);
  border-radius: 0.625rem;
  background: var(--tag-input-bg, #fff);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.tag-input.is-dark {
  --tag-input-border: #334155;
  --tag-input-bg: #1e293b;
  --tag-input-text: #f1f5f9;
  --tag-input-muted: #64748b;
  --tag-input-hover: rgba(99, 102, 241, 0.1);
  --tag-input-active: rgba(99, 102, 241, 0.15);
}

.tag-input.focused {
  border-color: var(--accent-indigo, #6366f1);
  box-shadow: 0 0 0 3px var(--accent-glow, rgba(99, 102, 241, 0.15));
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-bottom: 0.25rem;
}

.input-wrapper {
  position: relative;
}

.input {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--tag-input-text, #1e293b);
  padding: 0.25rem 0;
}

.input::placeholder {
  color: var(--tag-input-muted, #94a3b8);
}

/* 建议列表 */
.suggestions {
  position: absolute;
  top: calc(100% + 6px);
  left: -0.625rem;
  right: -0.625rem;
  min-width: 200px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--tag-input-bg, #fff);
  border: 1px solid var(--tag-input-border, #e5e7eb);
  border-radius: 0.625rem;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.15);
  z-index: 100;
  padding: 0.375rem;
}

.suggestions-enter-active,
.suggestions-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.suggestions-enter-from,
.suggestions-leave-to {
  opacity: 0;
  transform: translateY(-4px) scale(0.98);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--tag-input-text, #1e293b);
  transition: all 0.15s ease;
  opacity: 0;
  animation: fadeInUp 0.25s ease forwards;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: var(--tag-input-hover, #f1f5f9);
}

.suggestion-item.active {
  background: var(--tag-input-active, rgba(99, 102, 241, 0.08));
}

.suggestion-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.suggestion-item:hover .suggestion-dot {
  transform: scale(1.3);
}

.suggestion-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.suggestion-count {
  font-size: 0.7rem;
  color: var(--tag-input-muted, #94a3b8);
  font-weight: 500;
}

.suggestion-item.create-new {
  color: var(--accent-indigo, #6366f1);
  border-top: 1px solid var(--tag-input-border, #e5e7eb);
  margin-top: 0.25rem;
  padding-top: 0.625rem;
  font-weight: 500;
}

.create-icon {
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #8b5cf6));
  color: #fff;
  flex-shrink: 0;
}

.create-icon svg {
  width: 0.75rem;
  height: 0.75rem;
}

.suggestion-item.create-new strong {
  font-weight: 600;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
