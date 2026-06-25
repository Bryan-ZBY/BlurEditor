<template>
  <span
    class="tag-badge"
    :class="{ 'removable': removable, 'small': size === 'small', 'clickable': clickable }"
    :style="tagStyle"
    @click="handleClick"
  >
    <span class="tag-name">{{ tag.name }}</span>
    <button v-if="removable" class="tag-remove" @click.stop="handleRemove">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
      </svg>
    </button>
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && (value.name || value.text)
    }
  },
  removable: {
    type: Boolean,
    default: false
  },
  size: {
    type: String,
    default: 'default',
    validator: (value) => ['small', 'default'].includes(value)
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'remove'])

const tagStyle = computed(() => {
  return {
    backgroundColor: props.tag.bg || '#f3f4f6',
    color: props.tag.text || '#6b7280'
  }
})

function handleClick(e) {
  if (props.clickable) {
    emit('click', props.tag)
  }
}

function handleRemove() {
  emit('remove', props.tag)
}
</script>

<style scoped>
.tag-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.tag-badge.small {
  padding: 0.125rem 0.5rem;
  font-size: 0.6875rem;
}

.tag-badge.clickable {
  cursor: pointer;
}

.tag-badge.clickable:hover {
  filter: brightness(0.95);
}

.tag-name {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tag-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  padding: 0;
  border: none;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0.6;
  border-radius: 50%;
  transition: all 0.15s ease;
  margin-left: 0.125rem;
}

.tag-remove:hover {
  opacity: 1;
  background: rgba(0, 0, 0, 0.1);
}

.tag-remove svg {
  width: 0.75rem;
  height: 0.75rem;
}
</style>
