<template>
  <Teleport to="body">
    <div class="onboarding-overlay" @click.self="close">
      <div class="onboarding-modal glass" :class="{ 'is-dark': isDark }">
        <div class="onboarding-header">
          <h2>新手引导</h2>
          <button class="small-btn" @click="close">跳过</button>
        </div>

        <div class="onboarding-body">
          <h3>{{ steps[currentIndex].title }}</h3>
          <p>{{ steps[currentIndex].desc }}</p>
          <div class="step-actions">
            <button class="small-btn primary" @click="nextStep">
              {{ currentIndex === steps.length - 1 ? '完成' : '下一步' }}
            </button>
          </div>
          <div class="onboarding-progress">
            <span v-for="(step, index) in steps" :key="index" :class="{ active: index === currentIndex }" />
          </div>
        </div>

        <div class="onboarding-footer">
          <button v-if="currentIndex > 0" class="small-btn" @click="prevStep">上一步</button>
          <button class="small-btn ghost" @click="close">关闭引导</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['complete', 'close'])
const currentIndex = ref(0)

const steps = computed(() => [
  {
    title: '欢迎使用 Blur Editor',
    desc: '这里是双栏编辑器 + 预览模式 + 文件树管理。你可以在预览模式下快速查看 Markdown 渲染效果。'
  },
  {
    title: '快捷键优化',
    desc: 'Alt+K 打开命令面板，Alt+Z 进入/退出禅模式，Alt+H 切换文档大纲，Alt+L 切换主题。'
  },
  {
    title: '文件管理增强',
    desc: '支持收藏文档/文件夹、最近打开列表和内置搜索，快速跳转你最常用内容。'
  },
  {
    title: '预览与大纲',
    desc: '预览区已支持更舒适的阅读控制；文档大纲支持层级、搜索和与滚动联动。'
  }
])

function nextStep() {
  if (currentIndex.value < steps.value.length - 1) {
    currentIndex.value += 1
  } else {
    emit('complete')
  }
}

function prevStep() {
  if (currentIndex.value > 0) {
    currentIndex.value -= 1
  }
}

function close() {
  emit('close')
}
</script>

<style scoped>
.onboarding-overlay {
  position: fixed;
  inset: 0;
  z-index: 1400;
  background: rgba(7, 10, 18, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.onboarding-modal {
  width: min(540px, 100%);
  border-radius: 1rem;
  border: 1px solid var(--border-color, rgba(99, 102, 241, 0.2));
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.96);
  color: var(--text-primary, #e2e8f0);
}

.onboarding-modal.is-dark {
  background: rgba(15, 23, 42, 0.96);
}

.onboarding-modal:not(.is-dark) {
  background: rgba(248, 250, 252, 0.97);
  color: var(--text-primary, #0f172a);
}

.onboarding-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.onboarding-header h2 {
  margin: 0;
  font-size: 1.05rem;
}

.onboarding-body {
  margin-top: 1rem;
}

.onboarding-body h3 {
  margin: 0 0 0.45rem;
}

.onboarding-body p {
  margin: 0;
  color: var(--text-secondary, #94a3b8);
  line-height: 1.7;
}

.step-actions {
  margin-top: 0.95rem;
}

.onboarding-progress {
  margin-top: 1rem;
  display: flex;
  gap: 0.4rem;
}

.onboarding-progress span {
  width: 1rem;
  height: 0.3rem;
  border-radius: 9999px;
  background: rgba(148, 163, 184, 0.25);
}

.onboarding-progress span.active {
  background: var(--accent-indigo, #6366f1);
  box-shadow: 0 0 10px var(--accent-glow, rgba(99, 102, 241, 0.45));
}

.onboarding-footer {
  margin-top: 1.2rem;
  display: flex;
  justify-content: space-between;
}

.small-btn {
  border: 1px solid var(--border-color, rgba(99, 102, 241, 0.2));
  border-radius: 0.5rem;
  background: transparent;
  color: inherit;
  padding: 0.42rem 0.75rem;
  cursor: pointer;
}

.small-btn.primary {
  background: linear-gradient(135deg, var(--accent-indigo, #6366f1), var(--accent-purple, #7c3aed));
  border-color: transparent;
  color: #fff;
}

.small-btn.ghost {
  border-color: transparent;
  background: rgba(99, 102, 241, 0.16);
}
</style>
