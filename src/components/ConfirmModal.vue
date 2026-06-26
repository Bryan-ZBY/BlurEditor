<template>
  <Transition name="overlay">
    <div v-if="visible" class="confirm-overlay" @click.self="$emit('cancel')">
      <Transition name="modal-scale">
        <div v-if="visible" class="confirm-modal" :class="{ 'is-dark': isDark }">
          <div class="confirm-icon-wrapper">
            <div class="confirm-icon" :class="iconType">
              <svg v-if="iconType === 'warning'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <svg v-else-if="iconType === 'success'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
          <h3 class="confirm-title">{{ title }}</h3>
          <p class="confirm-desc">{{ message }}</p>
          <div class="confirm-actions">
            <button class="btn btn-secondary" @click="$emit('cancel')">取消</button>
            <button class="btn btn-danger" @click="$emit('confirm')">确认</button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  visible: Boolean,
  isDark: { type: Boolean, default: false },
  title: { type: String, default: '确认操作' },
  message: { type: String, default: '确定要执行此操作吗？' },
  iconType: { type: String, default: 'warning' }
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.overlay-enter-active,
.overlay-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}

.confirm-modal {
  width: 380px;
  max-width: calc(100vw - 2rem);
  background: var(--confirm-bg, #fff);
  border-radius: 1rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  border: 1px solid var(--confirm-border, #e2e8f0);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
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

.confirm-modal.is-dark {
  --confirm-bg: #151528;
  --confirm-border: rgba(99, 102, 241, 0.15);
  --confirm-text: #f1f5f9;
  --confirm-muted: #64748b;
  --confirm-hover: rgba(99, 102, 241, 0.1);
}

.confirm-icon-wrapper {
  margin-bottom: 1rem;
}

.confirm-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.confirm-icon svg {
  width: 1.75rem;
  height: 1.75rem;
}

.confirm-icon.warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.confirm-icon.success {
  background: rgba(34, 197, 94, 0.1);
  color: #22c55e;
}

.confirm-icon.info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.confirm-title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--confirm-text, #1e293b);
}

.confirm-desc {
  margin: 0 0 1.5rem;
  font-size: 0.875rem;
  color: var(--confirm-muted, #64748b);
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
}

.btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-secondary {
  background: var(--confirm-hover, #f1f5f9);
  color: var(--confirm-text, #1e293b);
}

.btn-secondary:hover {
  background: var(--confirm-border, #e2e8f0);
  transform: translateY(-1px);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

.btn-danger:hover {
  background: linear-gradient(135deg, #dc2626, #b91c1c);
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(239, 68, 68, 0.3);
}
</style>