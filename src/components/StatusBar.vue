<template>
  <div
    class="statusbar fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-tech px-4 py-3 rounded-2xl flex flex-wrap gap-4 justify-between items-center z-40 w-auto max-w-[90vw] panel-tech"
    :class="{ 'statusbar-visible': showStatusbar }"
  >
    <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-50"></div>
    
    <div class="flex flex-wrap gap-6">
      <div class="flex items-center gap-3 group relative">
        <div class="absolute -inset-2 bg-cyan-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cyan-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <div class="relative">
          <span class="text-[9px] text-cyan-400/60 uppercase tracking-widest font-semibold">Characters</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-cyan-100 font-mono">{{ charCount }}</span>
            <span class="text-[10px] text-cyan-400/50">chars</span>
          </div>
        </div>
      </div>
      
      <div class="w-px h-10 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
      
      <div class="flex items-center gap-3 group relative">
        <div class="absolute -inset-2 bg-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/30 to-pink-600/20 border border-purple-400/40 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-purple-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        </div>
        <div class="relative">
          <span class="text-[9px] text-purple-400/60 uppercase tracking-widest font-semibold">Words</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-purple-100 font-mono">{{ wordCount }}</span>
            <span class="text-[10px] text-purple-400/50">words</span>
          </div>
        </div>
      </div>
      
      <div class="w-px h-10 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent"></div>
      
      <div class="flex items-center gap-3 group relative">
        <div class="absolute -inset-2 bg-emerald-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-600/20 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </div>
        <div class="relative">
          <span class="text-[9px] text-emerald-400/60 uppercase tracking-widest font-semibold">Lines</span>
          <div class="flex items-baseline gap-1">
            <span class="text-xl font-bold text-emerald-100 font-mono">{{ lineCount }}</span>
            <span class="text-[10px] text-emerald-400/50">lines</span>
          </div>
        </div>
      </div>
      
      <div class="w-px h-10 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent"></div>
      
      <div class="flex items-center gap-3 group relative">
        <div class="absolute -inset-2 bg-amber-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
        <div class="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-600/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-300 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </div>
        <div class="relative">
          <span class="text-[9px] text-amber-400/60 uppercase tracking-widest font-semibold">Position</span>
          <div class="flex items-baseline gap-1">
            <span class="text-lg font-bold text-amber-100 font-mono">{{ currentLine }}:{{ currentColumn }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-2 px-4 h-10 rounded-xl bg-black/40 border border-cyan-500/20">
        <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span class="text-xs text-cyan-200/70 font-mono">{{ lastSavedTime || '--:--:--' }}</span>
      </div>
      
      <div class="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      
      <button @click="openHistoryPanel" class="btn-tech group relative px-5 h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 hover:border-cyan-300/60 text-cyan-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>历史</span>
        <span v-if="history.length > 0" class="px-1.5 h-5 flex items-center text-[10px] rounded-md bg-cyan-400/30 text-cyan-200">{{ history.length }}</span>
      </button>
      
      <button @click="openFavoritesPanel" class="btn-tech group relative px-5 h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-400/40 hover:border-amber-300/60 text-amber-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <span>收藏</span>
        <span v-if="favorites.length > 0" class="px-1.5 h-5 flex items-center text-[10px] rounded-md bg-amber-400/30 text-amber-200">{{ favorites.length }}</span>
      </button>
      
      <div class="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
      
      <button @click="togglePreviewMode" class="btn-tech group relative px-5 h-10 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/40 hover:to-pink-500/40 border border-purple-400/40 hover:border-purple-300/60 text-purple-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        <svg v-if="!isPreviewMode" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        <span>{{ isPreviewMode ? '编辑' : '预览' }}</span>
      </button>
    </div>
    
    <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-50"></div>
  </div>
</template>

<script setup>
const props = defineProps({
  showStatusbar: Boolean,
  charCount: Number,
  wordCount: Number,
  lineCount: Number,
  currentLine: Number,
  currentColumn: Number,
  lastSavedTime: String,
  history: Array,
  favorites: Array,
  isPreviewMode: Boolean
})

const emit = defineEmits(['openHistoryPanel', 'openFavoritesPanel', 'togglePreviewMode'])

const openHistoryPanel = () => emit('openHistoryPanel')
const openFavoritesPanel = () => emit('openFavoritesPanel')
const togglePreviewMode = () => emit('togglePreviewMode')
</script>
