<template>
  <div 
    class="relative z-10 w-full h-full"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <textarea
        v-show="!isPreviewMode"
        :value="content"
        ref="editorRef"
        class="fullscreen bg-cover bg-right-bottom bg-no-repeat text-editor-text font-mono text-sm md:text-base p-6 md:p-10 custom-scrollbar relative z-[15] editor-spotlight-mode"
        :class="{ 'blur-effect': isBlurred, 'no-blur': !isBlurred }"
        :style="editorStyleWithBg"
        placeholder="点击开始输入内容... (双击ESC键退出编辑)&#10;&#10;支持 Markdown 语法：&#10;# 标题&#10;**粗体** *斜体*&#10;- 列表项&#10;`代码` ```代码块```&#10;&gt; 引用"
        @keydown="handleKeydown"
        @input="handleInput"
        @click="handleClick"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup="updateStatus"
      ></textarea>
    
    <div
      v-show="isPreviewMode"
      class="flex w-full"
      style="height: 100vh;"
    >
      <div
        v-show="!isFullscreenPreview"
        class="bg-cover bg-right-bottom bg-no-repeat relative overflow-hidden"
        :style="{ width: splitPosition + '%', height: '100%', ...editorStyleWithBg }"
      >
        <textarea
          :value="content"
          ref="splitEditorRef"
          class="w-full bg-transparent text-editor-text font-mono text-sm md:text-base p-6 md:p-10 custom-scrollbar editor-spotlight-mode resize-none border-none outline-none"
          :class="{ 'blur-effect': isBlurred, 'no-blur': !isBlurred }"
          :style="{ height: '100%' }"
          placeholder="点击开始输入内容..."
          @keydown="handleKeydown"
          @input="handleInput"
          @click="handleClick"
          @focus="handleFocus"
          @blur="handleBlur"
          @keyup="updateStatus"
        ></textarea>
      </div>
      
      <div
        v-show="!isFullscreenPreview"
        class="w-2 bg-gradient-to-b from-cyan-400 via-purple-500 to-cyan-400 cursor-col-resize hover:w-3 z-30 flex-shrink-0 relative"
        style="height: 100%;"
        :class="{ 'opacity-50': isResizing }"
        @mousedown="startResize"
      >
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-8 bg-white/50 rounded-full"></div>
      </div>
      
      <div
        class="bg-black/80 relative overflow-hidden flex flex-col markdown-preview preview-area"
        :class="{ 'fullscreen-active': isFullscreenPreview }"
        :style="previewAreaStyle"
      >
        <div class="sticky top-0 z-[70] flex items-center justify-end gap-2 p-4 bg-black/60 backdrop-blur-sm border-b border-cyan-500/20">
          <button
            @click.stop="toggleFullscreenPreview"
            class="btn-tech group px-3 h-8 rounded-lg text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 hover:border-cyan-300/60 text-cyan-100 transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
          >
            <svg v-if="!isFullscreenPreview" xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9L4 4m0 0l5 5M4 4h5m11 5l-5-5m5 5v-5m0 5h-5M9 15l-5 5m0 0l5-5m-5 5v-5m0 5h5" />
            </svg>
            <span>{{ isFullscreenPreview ? '退出全屏' : '全屏' }}</span>
          </button>
          <button
            @click.stop="exitPreviewMode"
            class="btn-tech group px-3 h-8 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 border border-purple-400/40 hover:border-purple-300/60 text-purple-100 transition-all duration-300 flex items-center gap-1.5 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>退出</span>
          </button>
        </div>
        <div class="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10" v-html="previewContent" @click="handlePreviewClick"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  content: String,
  isBlurred: Boolean,
  isPreviewMode: Boolean,
  isFullscreenPreview: Boolean,
  splitPosition: Number,
  isResizing: Boolean,
  editorStyleWithBg: Object,
  previewAreaStyle: Object
})

const emit = defineEmits([
  'update:content',
  'keydown',
  'input',
  'click',
  'focus',
  'blur',
  'keyup',
  'previewClick',
  'toggleFullscreenPreview',
  'exitPreviewMode',
  'startResize'
])

const editorRef = ref(null)
const splitEditorRef = ref(null)

const localContent = computed({
  get: () => props.content,
  set: (value) => emit('update:content', value)
})

const previewContent = computed(() => {
  return marked(props.content || '')
})

const handleKeydown = (e) => emit('keydown', e)
const handleInput = (e) => {
  localContent.value = e.target.value
  emit('input', e)
}
const handleClick = () => emit('click')
const handleFocus = () => emit('focus')
const handleBlur = () => emit('blur')
const updateStatus = () => emit('keyup')
const handlePreviewClick = () => emit('previewClick')
const toggleFullscreenPreview = () => emit('toggleFullscreenPreview')
const exitPreviewMode = () => emit('exitPreviewMode')
const startResize = (e) => emit('startResize', e)

defineExpose({ editorRef, splitEditorRef })
</script>
