<template>
  <div
    class="history-panel fixed top-0 right-0 h-full glass-tech border-l border-cyan-500/20 z-50 shadow-2xl shadow-cyan-500/10"
    :class="{ 'history-panel-visible': showHistoryPanel }"
  >
    <div class="relative p-5 border-b border-cyan-500/30 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 overflow-hidden">
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
      </div>
      
      <div class="flex items-center gap-4 relative z-10">
        <div class="relative">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-purple-500/40 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-glow">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div class="absolute inset-0 w-14 h-14 rounded-2xl border-2 border-cyan-400/30 pulse-ring"></div>
        </div>
        
        <div>
          <h3 class="text-xl font-bold gradient-text tracking-wide">RECORDS</h3>
          <p class="text-xs text-cyan-400/70 flex items-center gap-2 mt-1">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-lg shadow-cyan-400/50"></span>
              <span class="font-mono">{{ activeTab === 'history' ? history.length : favorites.length }}</span>
            </span>
            <span class="text-cyan-400/40">|</span>
            <span class="uppercase tracking-wider">{{ activeTab === 'history' ? 'History' : 'Favorites' }}</span>
          </p>
        </div>
      </div>
      
      <button @click="closeHistoryPanel" class="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-200 transition-all duration-300 overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <div class="flex p-4 gap-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
      <button
        class="flex-1 py-3 px-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border whitespace-nowrap"
        :class="activeTab === 'history' ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 border-cyan-400/50 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-cyan-400/70 hover:text-cyan-300 hover:bg-white/10 border-cyan-500/20'"
        @click="setActiveTab('history')"
      >
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400/40 to-blue-400/30 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <span class="hidden sm:inline">历史</span>
        <span v-if="history.length > 0" class="px-2 py-0.5 text-xs rounded-full bg-cyan-400/40 text-cyan-100 border border-cyan-400/30 shrink-0">{{ history.length }}</span>
      </button>
      <button
        class="flex-1 py-3 px-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border whitespace-nowrap"
        :class="activeTab === 'favorites' ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-100 border-amber-400/50 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-400/70 hover:text-amber-300 hover:bg-white/10 border-amber-500/20'"
        @click="setActiveTab('favorites')"
      >
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400/40 to-orange-400/30 flex items-center justify-center shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span class="hidden sm:inline">收藏</span>
        <span v-if="favorites.length > 0" class="px-2 py-0.5 text-xs rounded-full bg-amber-400/40 text-amber-100 border border-amber-400/30 shrink-0">{{ favorites.length }}</span>
      </button>
    </div>

    <div class="tab-content h-[calc(100%-160px)]" :class="{ active: activeTab === 'history' }">
      <div class="p-4 space-y-3 custom-scrollbar h-full overflow-y-auto">
        <div v-if="history.length === 0" class="flex flex-col items-center justify-center py-20 text-cyan-400/50">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 flex items-center justify-center mb-4 animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-cyan-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium">暂无历史记录</p>
          <p class="text-xs text-cyan-400/40 mt-2">编辑内容后将自动保存</p>
        </div>
        <div
          v-else
          v-for="(record, index) in history"
          :key="record.id"
          class="group relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/20"
          @click="showHistoryModal(record)"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-black/90 border border-cyan-500/20 group-hover:border-cyan-400/50 rounded-2xl transition-all duration-300"></div>
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-cyan-500/50"></div>
          <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div class="relative p-4">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400/30 to-blue-400/20 border border-cyan-400/40 shadow-lg shadow-cyan-500/20">
                      <span class="text-[10px] font-bold text-cyan-300">{{ String(history.length - index).padStart(2, '0') }}</span>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-cyan-300/70">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-cyan-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ record.date }}</span>
                    </div>
                  </div>
                </div>
                
                <div class="text-sm text-slate-200 line-clamp-1 leading-relaxed mb-2 pl-10">{{ truncateText(record.content) }}</div>
                
                <div class="flex items-center gap-3 pl-10">
                  <span class="flex items-center gap-1.5 text-[11px] text-cyan-200 bg-cyan-500/20 px-3 py-1.5 rounded-full border border-cyan-400/30 shadow-sm shadow-cyan-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ record.charCount }} 字符
                  </span>
                  <span class="flex items-center gap-1.5 text-[11px] text-blue-200 bg-blue-500/20 px-3 py-1.5 rounded-full border border-blue-400/30 shadow-sm shadow-blue-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {{ record.wordCount }} 词
                  </span>
                </div>
              </div>
              
              <button
                class="delete-btn opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800/80 border border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-300 text-slate-400 transition-all duration-200 hover:scale-110"
                @click.stop="deleteHistory(record.id)"
                title="删除记录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="tab-content h-[calc(100%-160px)]" :class="{ active: activeTab === 'favorites' }">
      <div class="p-4 space-y-3 custom-scrollbar h-full overflow-y-auto">
        <div v-if="favorites.length === 0" class="flex flex-col items-center justify-center py-20 text-amber-400/50">
          <div class="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 flex items-center justify-center mb-4 animate-float">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-amber-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <p class="text-sm font-medium">暂无收藏内容</p>
          <p class="text-xs text-amber-400/40 mt-2">按 Ctrl+D 收藏当前内容</p>
        </div>
        <div
          v-else
          v-for="(record, index) in favorites"
          :key="record.id"
          class="group relative rounded-2xl cursor-pointer overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-amber-500/20"
          @click="showFavoriteModal(record)"
        >
          <div class="absolute inset-0 bg-gradient-to-br from-amber-700/25 via-orange-700/15 to-amber-800/30 border border-amber-300/25 group-hover:border-amber-400/40 rounded-2xl transition-all duration-300"></div>
          <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-500/50"></div>
          <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute top-2 right-2 w-2 h-2 border-t border-r border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div class="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div class="relative p-4">
            <div class="flex justify-between items-start gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-3">
                  <div class="flex items-center gap-3">
                    <div class="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400/30 to-orange-400/20 border border-amber-400/40 shadow-lg shadow-amber-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-amber-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div class="flex items-center gap-1.5 text-xs text-amber-300/70">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5 text-amber-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{{ record.date }}</span>
                    </div>
                  </div>
                </div>

                <div class="text-sm text-amber-100/95 line-clamp-1 leading-relaxed mb-2 pl-10">{{ truncateText(record.content) }}</div>

                <div class="flex items-center gap-3 pl-10">
                  <span class="flex items-center gap-1.5 text-[11px] text-amber-200 bg-amber-500/20 px-3 py-1.5 rounded-full border border-amber-400/30 shadow-sm shadow-amber-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {{ record.charCount }} 字符
                  </span>
                  <span class="flex items-center gap-1.5 text-[11px] text-orange-200 bg-orange-500/20 px-3 py-1.5 rounded-full border border-orange-400/30 shadow-sm shadow-orange-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {{ record.wordCount }} 词
                  </span>
                </div>
              </div>

              <button
                class="delete-btn opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center rounded-lg bg-amber-700/40 border border-red-500/30 hover:bg-red-500/20 hover:border-red-400/50 hover:text-red-300 text-amber-300/80 transition-all duration-200 hover:scale-110"
                @click.stop="deleteFavorite(record.id)"
                title="删除记录"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showHistoryPanel: Boolean,
  activeTab: String,
  history: Array,
  favorites: Array
})

const emit = defineEmits([
  'update:activeTab',
  'closeHistoryPanel',
  'showHistoryModal',
  'showFavoriteModal',
  'deleteHistory',
  'deleteFavorite'
])

const closeHistoryPanel = () => emit('closeHistoryPanel')
const showHistoryModal = (record) => emit('showHistoryModal', record)
const showFavoriteModal = (record) => emit('showFavoriteModal', record)
const deleteHistory = (id) => emit('deleteHistory', id)
const deleteFavorite = (id) => emit('deleteFavorite', id)
const setActiveTab = (tab) => emit('update:activeTab', tab)

const truncateText = (text) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
</script>
