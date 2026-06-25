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

      <div v-if="showSuggestions && filteredTags.length > 0" class="suggestions">
        <div
          v-for="(tag, index) in filteredTags"
          :key="tag.id"
          class="suggestion-item"
          :class="{ active: selectedIndex === index }"
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
          @mousedown.prevent="createAndSelect"
          @mouseenter="selectedIndex = filteredTags.length"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          <span>创建 "{{ query }}"</span>
        </div>
      </div>
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
  border-radius: 0.5rem;
  background: var(--tag-input-bg, #fff);
  transition: all 0.15s ease;
}

.tag-input.is-dark {
  --tag-input-border: #334155;
  --tag-input-bg: #1e293b;
  --tag-input-text: #f1f5f9;
  --tag-input-muted: #64748b;
  --tag-input-hover: #334155;
}

.tag-input.focused {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
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

.suggestions {
  position: absolute;
  top: calc(100% + 4px);
  left: -0.5rem;
  right: -0.5rem;
  min-width: 200px;
  max-height: 240px;
  overflow-y: auto;
  background: var(--tag-input-bg, #fff);
  border: 1px solid var(--tag-input-border, #e5e7eb);
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
  z-index: 100;
  padding: 0.25rem;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  color: var(--tag-input-text, #1e293b);
  transition: background 0.1s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: var(--tag-input-hover, #f1f5f9);
}

.suggestion-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.suggestion-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.suggestion-count {
  font-size: 0.7rem;
  color: var(--tag-input-muted, #94a3b8);
}

.suggestion-item.create-new {
  color: #3b82f6;
  border-top: 1px solid var(--tag-input-border, #e5e7eb);
  margin-top: 0.25rem;
  padding-top: 0.625rem;
}

.suggestion-item.create-new svg {
  width: 1rem;
  height: 1rem;
}
</style>
