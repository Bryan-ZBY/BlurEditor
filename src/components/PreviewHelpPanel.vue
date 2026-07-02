<template>
  <Teleport to="body">
    <Transition name="preview-help">
      <div v-if="visible" class="preview-help-overlay" @click.self="close">
        <section class="preview-help-panel" :class="{ 'is-dark': isDark }" role="dialog" aria-modal="true">
          <header class="preview-help-header">
            <div>
              <p class="preview-help-kicker">预览模式</p>
              <h2>快捷键与常用操作</h2>
            </div>
            <button class="preview-help-close" title="关闭" @click="close">×</button>
          </header>

          <div class="preview-help-body custom-scrollbar">
            <section
              v-for="section in shortcutSections"
              :key="section.title"
              class="preview-help-section"
            >
              <h3>{{ section.title }}</h3>
              <div class="preview-help-list">
                <div v-for="item in section.items" :key="item.label" class="preview-help-row">
                  <div class="preview-help-keys">
                    <kbd v-for="key in item.keys" :key="key">{{ key }}</kbd>
                  </div>
                  <div class="preview-help-copy">
                    <strong>{{ item.label }}</strong>
                  </div>
                </div>
              </div>
            </section>

            <section class="preview-help-section">
              <h3>常用操作</h3>
              <div class="preview-help-ops">
                <div v-for="item in operationTips" :key="item.title" class="preview-help-op">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.description }}</span>
                </div>
              </div>
            </section>
          </div>

          <footer class="preview-help-footer">
            <span><kbd>Esc</kbd> 关闭</span>
            <span><kbd>?</kbd> 再次按下关闭</span>
          </footer>
        </section>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({
  visible: { type: Boolean, default: false },
  isDark: { type: Boolean, default: false }
})

const emit = defineEmits(['close'])

const shortcutSections = [
  {
    title: '预览导航',
    items: [
      { keys: ['?'], label: '打开帮助' },
      { keys: ['Space'], label: '向下翻页' },
      { keys: ['Shift', 'Space'], label: '向上翻页' },
      { keys: ['j'], label: '向下滚动' },
      { keys: ['k'], label: '向上滚动' },
      { keys: ['d'], label: '向下半屏' },
      { keys: ['u'], label: '向上半屏' },
      { keys: ['g', 'g'], label: '回到顶部' },
      { keys: ['G'], label: '跳到底部' },
      { keys: ['{'], label: '上一个标题' },
      { keys: ['}'], label: '下一个标题' }
    ]
  },
  {
    title: '查找与退出',
    items: [
      { keys: ['/'], label: '打开全局入口' },
      { keys: ['n'], label: '下一个搜索结果' },
      { keys: ['Shift', 'N'], label: '上一个搜索结果' },
      { keys: ['q'], label: '退出预览层级' },
      { keys: ['Esc'], label: '关闭帮助面板' }
    ]
  },
  {
    title: '全局快捷键',
    items: [
      { keys: ['Ctrl/Cmd', 'K'], label: '全局入口' },
      { keys: ['Alt', 'G'], label: '全局入口' },
      { keys: ['Ctrl/Cmd', 'S'], label: '保存提示' },
      { keys: ['Alt', 'V'], label: '编辑/预览' },
      { keys: ['Alt', 'S'], label: '分栏/全屏' },
      { keys: ['Alt', 'Z'], label: '禅模式' },
      { keys: ['Alt', 'H'], label: '文档大纲' },
      { keys: ['Alt', 'L'], label: '上一个主题' },
      { keys: ['Alt', 'N'], label: '下一个主题' },
      { keys: ['Ctrl/Cmd', 'Z'], label: '撤销' },
      { keys: ['Ctrl/Cmd', 'Y'], label: '恢复' },
      { keys: ['Ctrl/Cmd', 'Shift', 'Z'], label: '恢复' }
    ]
  }
]

const operationTips = [
  {
    title: '打开或创建文档',
    description: '左侧选择、新建、导入。'
  },
  {
    title: '查找内容',
    description: '输入关键词后跳转。'
  },
  {
    title: '阅读布局',
    description: '编辑、分栏、禅模式。'
  },
  {
    title: '预览样式',
    description: '字体、字号、宽度。'
  },
  {
    title: '大纲跳转',
    description: '大纲或标题跳转。'
  },
  {
    title: '导出内容',
    description: '导出文档或备份。'
  }
]

function close() {
  emit('close')
}
</script>

<style scoped>
.preview-help-overlay {
  position: fixed;
  inset: 0;
  z-index: 1300;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 7vh 1rem 1rem;
  background: rgba(7, 10, 18, 0.5);
}

.preview-help-panel {
  width: min(900px, calc(100vw - 2rem));
  max-height: 86vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 0.9rem;
  background: rgba(248, 250, 252, 0.97);
  color: #0f172a;
  box-shadow: 0 30px 80px -30px rgba(2, 6, 23, 0.75), 0 0 0 1px rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(18px);
}

.preview-help-panel.is-dark {
  background: rgba(15, 23, 42, 0.97);
  color: #e2e8f0;
  border-color: rgba(99, 102, 241, 0.24);
}

.preview-help-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.1rem 0.85rem;
  border-bottom: 1px solid rgba(99, 102, 241, 0.16);
}

.preview-help-kicker {
  margin: 0 0 0.22rem;
  color: #6366f1;
  font-size: 0.72rem;
  font-weight: 700;
}

.preview-help-header h2 {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 750;
}

.preview-help-close {
  width: 2.1rem;
  height: 2.1rem;
  border: 1px solid transparent;
  border-radius: 0.6rem;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  font-size: 1.35rem;
  line-height: 1;
}

.preview-help-close:hover {
  background: rgba(99, 102, 241, 0.12);
  color: inherit;
}

.preview-help-body {
  overflow: auto;
  padding: 0.9rem 1.1rem 1rem;
}

.preview-help-section + .preview-help-section {
  margin-top: 1rem;
}

.preview-help-section h3 {
  margin: 0 0 0.55rem;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 750;
}

.preview-help-panel.is-dark .preview-help-section h3 {
  color: #94a3b8;
}

.preview-help-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.35rem;
}

.preview-help-row,
.preview-help-op {
  min-width: 0;
  border: 1px solid rgba(99, 102, 241, 0.12);
  border-radius: 0.65rem;
  background: rgba(99, 102, 241, 0.06);
}

.preview-help-row {
  display: grid;
  grid-template-columns: minmax(7.5rem, 9.5rem) minmax(0, 1fr);
  gap: 0.55rem;
  padding: 0.52rem 0.6rem;
}

.preview-help-panel.is-dark .preview-help-row,
.preview-help-panel.is-dark .preview-help-op {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(148, 163, 184, 0.14);
}

.preview-help-keys {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 0.25rem;
}

kbd {
  min-width: 1.5rem;
  padding: 0.14rem 0.38rem;
  border: 1px solid rgba(100, 116, 139, 0.28);
  border-radius: 0.38rem;
  background: rgba(255, 255, 255, 0.72);
  color: #334155;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  font-size: 0.72rem;
  font-weight: 700;
  text-align: center;
}

.preview-help-panel.is-dark kbd {
  background: rgba(15, 23, 42, 0.82);
  color: #cbd5e1;
  border-color: rgba(148, 163, 184, 0.26);
}

.preview-help-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.preview-help-copy strong,
.preview-help-op strong {
  font-size: 0.8rem;
  font-weight: 750;
}

.preview-help-op span {
  color: #64748b;
  font-size: 0.72rem;
  line-height: 1.35;
}

.preview-help-panel.is-dark .preview-help-op span {
  color: #94a3b8;
}

.preview-help-ops {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.35rem;
}

.preview-help-op {
  display: flex;
  flex-direction: column;
  gap: 0.18rem;
  padding: 0.58rem 0.65rem;
}

.preview-help-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.9rem;
  padding: 0.75rem 1.1rem;
  border-top: 1px solid rgba(99, 102, 241, 0.16);
  color: #64748b;
  font-size: 0.76rem;
}

.preview-help-panel.is-dark .preview-help-footer {
  color: #94a3b8;
}

.preview-help-enter-active,
.preview-help-leave-active {
  transition: opacity 0.16s ease;
}

.preview-help-enter-active .preview-help-panel,
.preview-help-leave-active .preview-help-panel {
  transition: transform 0.16s ease, opacity 0.16s ease;
}

.preview-help-enter-from,
.preview-help-leave-to {
  opacity: 0;
}

.preview-help-enter-from .preview-help-panel,
.preview-help-leave-to .preview-help-panel {
  opacity: 0;
  transform: translateY(8px) scale(0.98);
}

@media (max-width: 760px) {
  .preview-help-list,
  .preview-help-ops {
    grid-template-columns: 1fr;
  }

  .preview-help-row {
    grid-template-columns: 1fr;
  }

  .preview-help-footer {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
}
</style>
