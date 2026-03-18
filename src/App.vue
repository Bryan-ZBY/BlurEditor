<template>
  <div class="relative min-h-screen bg-black overflow-hidden">
    <!-- 网格背景 -->
    <div class="grid-bg"></div>
    
    <!-- 扫描线效果 -->
    <div class="scanline-overlay"></div>
    
    <!-- HUD角落装饰 - 左上角 -->
    <div class="hud-corner hud-corner-tl">
      <div class="hud-line hud-line-h" style="left: 0; top: 0;"></div>
      <div class="hud-line hud-line-v" style="left: 0; top: 0;"></div>
    </div>
    
    <!-- HUD角落装饰 - 右上角 -->
    <div class="hud-corner hud-corner-tr">
      <div class="hud-line hud-line-h" style="right: 0; top: 0;"></div>
      <div class="hud-line hud-line-v" style="right: 0; top: 0;"></div>
    </div>
    
    <!-- HUD角落装饰 - 左下角 -->
    <div class="hud-corner hud-corner-bl">
      <div class="hud-line hud-line-h" style="left: 0; bottom: 0;"></div>
      <div class="hud-line hud-line-v" style="left: 0; bottom: 0;"></div>
    </div>
    
    <!-- HUD角落装饰 - 右下角 -->
    <div class="hud-corner hud-corner-br">
      <div class="hud-line hud-line-h" style="right: 0; bottom: 0;"></div>
      <div class="hud-line hud-line-v" style="right: 0; bottom: 0;"></div>
    </div>
    
    <!-- 浮动粒子 -->
    <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>

    <!-- 发光圆圈跟随鼠标 - 多层 -->
    <div
      v-show="isMouseInEditor"
      class="fixed pointer-events-none z-[5]"
      :style="glowCircleStyle"
    >
      <div class="absolute w-48 h-48 rounded-full bg-cyan-500/10 blur-3xl" style="left: -96px; top: -96px;"></div>
      <div class="absolute w-36 h-36 rounded-full bg-cyan-400/15 blur-2xl" style="left: -72px; top: -72px;"></div>
      <div class="absolute w-24 h-24 rounded-full bg-cyan-300/20 blur-xl" style="left: -48px; top: -48px;"></div>
    </div>

    <!-- 编辑器容器 -->
    <div 
      class="relative z-10 w-full h-full"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <textarea
        v-model="content"
        ref="editorRef"
        class="fullscreen bg-cover bg-right-bottom bg-no-repeat text-editor-text font-mono text-sm md:text-base p-6 md:p-10 custom-scrollbar relative z-[15] editor-spotlight-mode"
        :class="{ 'blur-effect': isBlurred, 'no-blur': !isBlurred }"
        :style="editorStyleWithBg"
        placeholder="点击开始输入内容... (双击ESC键退出编辑)"
        @keydown="handleKeydown"
        @input="handleInput"
        @click="handleClick"
        @focus="handleFocus"
        @blur="handleBlur"
        @keyup="updateStatus"
      ></textarea>
    </div>

    <!-- Toast通知 - 科技风 -->
    <div
      id="save-toast"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 glass-tech px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 z-50 animate-slide-in"
      :class="showSaveToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'"
    >
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400/30 to-emerald-600/20 border border-emerald-400/40 flex items-center justify-center shadow-lg shadow-emerald-500/30 animate-glow">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-emerald-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div>
        <div class="text-sm font-semibold text-emerald-300">保存成功</div>
        <div class="text-xs text-emerald-200/60">内容已自动保存到历史记录</div>
      </div>
    </div>

    <div
      id="favorite-toast"
      class="fixed top-6 left-1/2 transform -translate-x-1/2 glass-tech px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 z-50"
      :class="showFavoriteToast ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'"
    >
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-400/40 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-glow">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
          <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </div>
      <div>
        <div class="text-sm font-semibold text-amber-300">收藏成功</div>
        <div class="text-xs text-amber-200/60">内容已添加到收藏列表</div>
      </div>
    </div>

    <div
      class="fixed top-6 left-1/2 transform -translate-x-1/2 glass-tech px-6 py-4 rounded-2xl flex items-center gap-4 transition-all duration-500 z-50"
      :class="copySuccess ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'"
    >
      <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-glow">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
        </svg>
      </div>
      <div>
        <div class="text-sm font-semibold text-cyan-300">复制成功</div>
        <div class="text-xs text-cyan-200/60">内容已复制到剪贴板</div>
      </div>
    </div>

    <div
      class="fixed top-20 left-1/2 transform -translate-x-1/2 glass-tech border-l-4 border-yellow-400 px-6 py-4 rounded-r-2xl flex items-center gap-4 transition-all duration-500 z-[60]"
      :class="emptyToast.show ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'"
    >
      <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-400/30 to-orange-500/20 border border-yellow-400/40 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h0m-6-8h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      </div>
      <span class="text-sm font-medium text-yellow-200">{{ emptyToast.message }}</span>
    </div>

    <!-- 状态栏 - 科技风增强 -->
    <div
      class="statusbar fixed bottom-20 left-1/2 transform -translate-x-1/2 glass-tech px-4 py-3 rounded-2xl flex flex-wrap gap-4 justify-between items-center z-[100] w-auto max-w-[90vw] panel-tech"
      :class="{ 'statusbar-visible': showStatusbar }"
    >
      <!-- 左侧装饰线 -->
      <div class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-cyan-400 to-transparent opacity-50"></div>
      
      <div class="flex flex-wrap gap-6">
        <!-- 字符统计 -->
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
              <span id="char-count" class="text-xl font-bold text-cyan-100 font-mono">{{ charCount }}</span>
              <span class="text-[10px] text-cyan-400/50">chars</span>
            </div>
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="w-px h-10 bg-gradient-to-b from-transparent via-cyan-500/30 to-transparent"></div>
        
        <!-- 单词统计 -->
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
              <span id="word-count" class="text-xl font-bold text-purple-100 font-mono">{{ wordCount }}</span>
              <span class="text-[10px] text-purple-400/50">words</span>
            </div>
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="w-px h-10 bg-gradient-to-b from-transparent via-emerald-500/30 to-transparent"></div>
        
        <!-- 行数统计 -->
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
              <span id="line-count" class="text-xl font-bold text-emerald-100 font-mono">{{ lineCount }}</span>
              <span class="text-[10px] text-emerald-400/50">lines</span>
            </div>
          </div>
        </div>
        
        <!-- 分隔线 -->
        <div class="w-px h-10 bg-gradient-to-b from-transparent via-amber-500/30 to-transparent"></div>
        
        <!-- 光标位置 -->
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
              <span id="cursor-position" class="text-lg font-bold text-amber-100 font-mono">{{ currentLine }}:{{ currentColumn }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧操作区 -->
      <div class="flex items-center gap-4">
        <!-- 最后保存时间 -->
        <div class="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-cyan-500/20">
          <div class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-cyan-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span id="last-saved" class="text-xs text-cyan-200/70 font-mono">{{ lastSavedTime || '--:--:--' }}</span>
        </div>
        
        <!-- 分隔线 -->
        <div class="h-8 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
        
        <!-- 历史按钮 -->
        <button id="show-history" @click="openHistoryPanel" class="btn-tech group relative px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/40 hover:to-blue-500/40 border border-cyan-400/40 hover:border-cyan-300/60 text-cyan-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>历史</span>
          <span v-if="history.length > 0" class="px-1.5 py-0.5 text-[10px] rounded-md bg-cyan-400/30 text-cyan-200">{{ history.length }}</span>
        </button>
        
        <!-- 收藏按钮 -->
        <button id="show-favorites" @click="openFavoritesPanel" class="btn-tech group relative px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/40 hover:to-orange-500/40 border border-amber-400/40 hover:border-amber-300/60 text-amber-100 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>收藏</span>
          <span v-if="favorites.length > 0" class="px-1.5 py-0.5 text-[10px] rounded-md bg-amber-400/30 text-amber-200">{{ favorites.length }}</span>
        </button>
      </div>
      
      <!-- 右侧装饰线 -->
      <div class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-gradient-to-b from-transparent via-amber-400 to-transparent opacity-50"></div>
    </div>

    <!-- 侧边面板 - 科技风 -->
    <div
      class="history-panel fixed top-0 right-0 h-full glass-tech border-l border-cyan-500/20 z-50 shadow-2xl shadow-cyan-500/10"
      :class="{ 'history-panel-visible': showHistoryPanel }"
    >
      <!-- 头部 - 科技风增强 -->
      <div class="relative p-5 border-b border-cyan-500/30 flex justify-between items-center bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-cyan-500/10 overflow-hidden">
        <!-- 背景装饰 -->
        <div class="absolute inset-0 opacity-30">
          <div class="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          <div class="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        </div>
        
        <div class="flex items-center gap-4 relative z-10">
          <!-- Logo图标 -->
          <div class="relative">
            <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400/40 via-blue-500/30 to-purple-500/40 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/30 animate-glow">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-cyan-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <!-- 脉冲环 -->
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
        
        <!-- 关闭按钮 -->
        <button id="close-history" @click="showHistoryPanel = false" class="group relative w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-400 hover:text-cyan-200 transition-all duration-300 overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 标签切换 -->
      <div class="flex p-4 gap-3 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
        <button
          id="history-tab"
          class="flex-1 py-3 px-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border whitespace-nowrap"
          :class="activeTab === 'history' ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-100 border-cyan-400/50 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-cyan-400/70 hover:text-cyan-300 hover:bg-white/10 border-cyan-500/20'"
          @click="activeTab = 'history'"
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
          id="favorites-tab"
          class="flex-1 py-3 px-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 border whitespace-nowrap"
          :class="activeTab === 'favorites' ? 'bg-gradient-to-r from-amber-500/30 to-orange-500/30 text-amber-100 border-amber-400/50 shadow-lg shadow-amber-500/20' : 'bg-white/5 text-amber-400/70 hover:text-amber-300 hover:bg-white/10 border-amber-500/20'"
          @click="activeTab = 'favorites'"
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

      <!-- 历史列表 -->
      <div id="history-tab-content" class="tab-content h-[calc(100%-160px)]" :class="{ active: activeTab === 'history' }">
        <div id="history-list" class="p-4 space-y-3 custom-scrollbar h-full overflow-y-auto">
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
            <!-- 背景渐变 - 科技蓝 -->
            <div class="absolute inset-0 bg-gradient-to-br from-slate-800/80 via-slate-900/80 to-black/90 border border-cyan-500/20 group-hover:border-cyan-400/50 rounded-2xl transition-all duration-300"></div>
            
            <!-- 左侧装饰条 -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-cyan-500/50"></div>
            
            <!-- 顶部光效 -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <!-- 角落装饰 -->
            <div class="absolute top-2 right-2 w-2 h-2 border-t border-r border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-cyan-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div class="relative p-4">
              <div class="flex justify-between items-start gap-3">
                <div class="flex-1 min-w-0">
                  <!-- 顶部信息行 -->
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
                  
                  <!-- 内容预览 -->
                  <div class="text-sm text-slate-200 line-clamp-2 leading-relaxed mb-3 pl-10">{{ truncateText(record.content) }}</div>
                  
                  <!-- 底部统计 -->
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
                
                <!-- 删除按钮 -->
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

      <!-- 收藏列表 -->
      <div id="favorites-tab-content" class="tab-content h-[calc(100%-160px)]" :class="{ active: activeTab === 'favorites' }">
        <div id="favorite-list" class="p-4 space-y-3 custom-scrollbar h-full overflow-y-auto">
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
            <!-- 背景渐变 - 琥珀色系 -->
            <div class="absolute inset-0 bg-gradient-to-br from-amber-700/25 via-orange-700/15 to-amber-800/30 border border-amber-300/25 group-hover:border-amber-400/40 rounded-2xl transition-all duration-300"></div>

            <!-- 左侧装饰条 -->
            <div class="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg shadow-amber-500/50"></div>

            <!-- 顶部光效 -->
            <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <!-- 角落装饰 -->
            <div class="absolute top-2 right-2 w-2 h-2 border-t border-r border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div class="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-amber-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div class="relative p-4">
              <div class="flex justify-between items-start gap-3">
                <div class="flex-1 min-w-0">
                  <!-- 顶部信息行 -->
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

                  <!-- 内容预览 -->
                  <div class="text-sm text-amber-100/95 line-clamp-2 leading-relaxed mb-3 pl-10">{{ truncateText(record.content) }}</div>

                  <!-- 底部统计 -->
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

                <!-- 删除按钮 -->
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

    <!-- 历史记录模态框 - 科技风 -->
    <div
      id="history-modal"
      class="modal fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
      :class="{ 'modal-visible': showHistoryModalFlag }"
      @click.self="closeHistoryModal"
    >
      <div class="glass-tech rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-cyan-500/20 modal-content border border-cyan-500/30">
        <div class="flex justify-between items-center p-5 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-purple-500/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400/30 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 id="modal-title" class="text-lg font-bold gradient-text">历史记录预览</h3>
          </div>
          <button id="close-modal" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-400 hover:text-cyan-200 transition-all duration-300 hover:rotate-90" @click="closeHistoryModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="history-preview" class="flex-1 overflow-y-auto p-5 bg-black/40 font-mono text-sm text-cyan-100/90 whitespace-pre-wrap custom-scrollbar leading-relaxed">{{ currentHistoryPreview }}</div>
        <div class="flex justify-between items-center p-5 bg-gradient-to-r from-cyan-500/5 to-purple-500/5 border-t border-cyan-500/30">
          <div class="flex items-center gap-2 text-xs text-cyan-400/70" id="history-time">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ currentHistoryTime }}
          </div>
          <div class="flex gap-3">
            <button id="copy-content" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-200 transition-all duration-300 flex items-center gap-2" @click="copyCurrentContent">
              <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span v-if="!copySuccess">复制</span>
              <svg v-if="copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-if="copySuccess" class="text-emerald-400">已复制</span>
            </button>
            <button id="delete-history" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-400/50 text-red-300 transition-all duration-300 flex items-center gap-2" @click="deleteCurrentRecord">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
            <button id="apply-history" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 flex items-center gap-2" @click="applyHistory">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              应用
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 收藏模态框 - 科技风 -->
    <div
      id="favorite-modal"
      class="modal fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[1000] p-4"
      :class="{ 'modal-visible': showFavoriteModalFlag }"
      @click.self="closeFavoriteModal"
    >
      <div class="glass-tech rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl shadow-amber-500/20 modal-content border border-amber-500/30">
        <div class="flex justify-between items-center p-5 border-b border-amber-500/30 bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/30 to-orange-500/20 border border-amber-400/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 id="favorite-modal-title" class="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-300">收藏预览</h3>
          </div>
          <button id="close-favorite-modal" class="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 border border-amber-500/30 hover:border-amber-400/50 text-amber-400 hover:text-amber-200 transition-all duration-300 hover:rotate-90" @click="closeFavoriteModal">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div id="favorite-preview" class="flex-1 overflow-y-auto p-5 bg-black/40 font-mono text-sm text-amber-100/90 whitespace-pre-wrap custom-scrollbar leading-relaxed">{{ currentFavoritePreview }}</div>
        <div class="flex justify-between items-center p-5 bg-gradient-to-r from-amber-500/5 to-orange-500/5 border-t border-amber-500/30">
          <div class="flex items-center gap-2 text-xs text-amber-400/70" id="favorite-time">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {{ currentFavoriteTime }}
          </div>
          <div class="flex gap-3">
            <button id="copy-favorite" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 border border-cyan-500/30 hover:border-cyan-400/50 text-cyan-200 transition-all duration-300 flex items-center gap-2" @click="copyCurrentContent">
              <svg v-if="!copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span v-if="!copySuccess">复制</span>
              <svg v-if="copySuccess" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <span v-if="copySuccess" class="text-emerald-400">已复制</span>
            </button>
            <button id="delete-favorite" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-500/20 to-red-600/20 hover:from-red-500/30 hover:to-red-600/30 border border-red-500/30 hover:border-red-400/50 text-red-300 transition-all duration-300 flex items-center gap-2" @click="deleteCurrentRecord">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              删除
            </button>
            <button id="apply-favorite" class="btn-tech px-5 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/30 transition-all duration-300 flex items-center gap-2" @click="applyFavorite">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              应用
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const content = ref('')
const editorRef = ref(null)
const isBlurred = ref(true)
const showStatusbar = ref(true)
const showHistoryPanel = ref(false)
const showHistoryModalFlag = ref(false)
const showFavoriteModalFlag = ref(false)
const showSaveToast = ref(false)
const showFavoriteToast = ref(false)
const activeTab = ref('history')

// 鼠标跟随效果
const mouseX = ref(-1000)
const mouseY = ref(-1000)
const isMouseInEditor = ref(false)

const glowCircleStyle = computed(() => {
  return {
    left: `${mouseX.value}px`,
    top: `${mouseY.value}px`,
  }
})

const editorStyle = computed(() => {
  if (!isMouseInEditor.value) {
    return {}
  }
  return {
    textShadow: `0 0 20px rgba(56, 189, 248, 0.5),
                 0 0 40px rgba(56, 189, 248, 0.3)`,
  }
})

const editorStyleWithBg = computed(() => {
  const baseStyle = {
    backgroundImage: 'url(/bg.png)',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  }
  if (!isMouseInEditor.value) {
    return baseStyle
  }
  return {
    ...baseStyle,
    textShadow: `0 0 20px rgba(56, 189, 248, 0.5),
                 0 0 40px rgba(56, 189, 248, 0.3)`,
  }
})

const handleMouseMove = (e) => {
  mouseX.value = e.clientX
  mouseY.value = e.clientY
  isMouseInEditor.value = true
}

const handleMouseLeave = () => {
  isMouseInEditor.value = false
}

// 粒子样式
const getParticleStyle = (i) => {
  return {
    left: `${Math.random() * 100}%`,
    width: `${2 + Math.random() * 4}px`,
    height: `${2 + Math.random() * 4}px`,
    animationDelay: `${i * 1.2}s`,
    animationDuration: `${8 + Math.random() * 8}s`,
    background: Math.random() > 0.5 
      ? 'rgba(56, 189, 248, 0.4)' 
      : 'rgba(168, 85, 247, 0.4)',
  }
}

const HISTORY_KEY = 'editor_history'
const FAVORITES_KEY = 'editor_favorites'
const STORAGE_KEY = 'editor_content'
const MAX_HISTORY_ITEMS = 50
const AUTO_SAVE_INTERVAL = 10000

const history = ref(JSON.parse(localStorage.getItem(HISTORY_KEY)) || [])
const favorites = ref(JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [])

let lastEscPressTime = 0
const escDoublePressThreshold = 300
let autoSaveTimer = null

let currentHistoryId = null
let currentFavoriteId = null
let currentModalType = null

const charCount = computed(() => content.value.length)

const wordCount = computed(() => {
  return content.value.trim() ? content.value.trim().split(/\s+/).length : 0
})

const lineCount = computed(() => {
  return content.value ? content.value.split('\n').length : 1
})

const currentLine = ref(1)
const currentColumn = ref(1)

const lastSavedTime = ref('')

const currentHistoryPreview = ref('')
const currentHistoryTime = ref('')
const currentFavoritePreview = ref('')
const currentFavoriteTime = ref('')
const copySuccess = ref(false)
const emptyToast = ref({ show: false, message: '', color: 'yellow' })
const emptyToastTimer = ref(null)

const showEmptyToast = (message, color = 'yellow') => {
  if (emptyToastTimer.value) {
    clearTimeout(emptyToastTimer.value)
  }
  emptyToast.value = { show: true, message, color }
  emptyToastTimer.value = setTimeout(() => {
    emptyToast.value.show = false
  }, 2500)
}

const updateStatus = () => {
  if (!editorRef.value) return

  const cursorPos = editorRef.value.selectionStart
  const textToCursor = content.value.substring(0, cursorPos)
  currentLine.value = textToCursor.split('\n').length
  currentColumn.value = textToCursor.split('\n').pop().length + 1
}

const updateSavedTime = () => {
  const now = new Date()
  lastSavedTime.value = now.toLocaleTimeString()
}

const addHistoryRecord = () => {
  const now = new Date()
  const currentContent = content.value

  if (!currentContent.trim()) return

  if (history.value.length > 0 && history.value[0].content === currentContent) return

  const record = {
    id: Date.now(),
    content: currentContent,
    timestamp: now.getTime(),
    date: now.toLocaleString(),
    charCount: currentContent.length,
    wordCount: currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0
  }

  history.value.unshift(record)

  if (history.value.length > MAX_HISTORY_ITEMS) {
    history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
}

const addFavorite = () => {
  const now = new Date()
  const currentContent = content.value

  if (!currentContent.trim()) {
    showEmptyToast('内容为空，无法收藏', 'yellow')
    return
  }

  const isAlreadyFavorite = favorites.value.some(fav => fav.content === currentContent)
  if (isAlreadyFavorite) {
    showEmptyToast('该内容已在收藏列表中', 'yellow')
    return
  }

  const record = {
    id: Date.now(),
    content: currentContent,
    timestamp: now.getTime(),
    date: now.toLocaleString(),
    charCount: currentContent.length,
    wordCount: currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0
  }

  favorites.value.unshift(record)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))

  showFavoriteToast.value = true
  setTimeout(() => {
    showFavoriteToast.value = false
  }, 3000)
}

const deleteHistory = (id) => {
  history.value = history.value.filter(record => record.id !== id)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))

  if (currentHistoryId === id && currentModalType === 'history') {
    closeHistoryModal()
  }
}

const deleteFavorite = (id) => {
  favorites.value = favorites.value.filter(record => record.id !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))

  if (currentFavoriteId === id && currentModalType === 'favorite') {
    closeFavoriteModal()
  }
}

const showHistoryModal = (record) => {
  currentModalType = 'history'
  currentHistoryId = record.id
  currentHistoryPreview.value = record.content
  currentHistoryTime.value = `保存时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
  showHistoryModalFlag.value = true
}

const closeHistoryModal = () => {
  showHistoryModalFlag.value = false
  currentHistoryId = null
  currentModalType = null
}

const showFavoriteModal = (record) => {
  currentModalType = 'favorite'
  currentFavoriteId = record.id
  currentFavoritePreview.value = record.content
  currentFavoriteTime.value = `收藏时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
  showFavoriteModalFlag.value = true
}

const closeFavoriteModal = () => {
  showFavoriteModalFlag.value = false
  currentFavoriteId = null
  currentModalType = null
}

const applyHistory = () => {
  if (currentModalType === 'history' && currentHistoryId) {
    const record = history.value.find(r => r.id === currentHistoryId)
    if (record) {
      content.value = record.content
      closeHistoryModal()
      focusEditor()
    }
  }
}

const applyFavorite = () => {
  if (currentModalType === 'favorite' && currentFavoriteId) {
    const record = favorites.value.find(r => r.id === currentFavoriteId)
    if (record) {
      content.value = record.content
      closeFavoriteModal()
      focusEditor()
    }
  }
}

const focusEditor = () => {
  if (editorRef.value) {
    editorRef.value.focus()
    isBlurred.value = false
    showStatusbar.value = true
  }
}

const copyCurrentContent = () => {
  let contentToCopy = ''
  if (currentModalType === 'history' && currentHistoryId) {
    const record = history.value.find(r => r.id === currentHistoryId)
    if (record) contentToCopy = record.content
  } else if (currentModalType === 'favorite' && currentFavoriteId) {
    const record = favorites.value.find(r => r.id === currentFavoriteId)
    if (record) contentToCopy = record.content
  }

  if (!contentToCopy) return

  navigator.clipboard.writeText(contentToCopy).then(() => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  })
}

const deleteCurrentRecord = () => {
  if (currentModalType === 'history' && currentHistoryId) {
    deleteHistory(currentHistoryId)
  } else if (currentModalType === 'favorite' && currentFavoriteId) {
    deleteFavorite(currentFavoriteId)
  }
}

const handleKeydown = (e) => {
  if (e.altKey && e.key === 'h') {
    e.preventDefault()
    showHistoryPanel.value = true
  }

  if (e.ctrlKey && e.key === 'd') {
    e.preventDefault()
    addFavorite()
  }

  if (e.ctrlKey && e.key === 's') {
    e.preventDefault()
    addHistoryRecord()
    showSaveToast.value = true
    setTimeout(() => {
      showSaveToast.value = false
    }, 3000)
  }

  if (e.key === 'Escape') {
    if (showHistoryPanel.value) {
      showHistoryPanel.value = false
    }

    const now = Date.now()
    if (now - lastEscPressTime < escDoublePressThreshold) {
      if (editorRef.value) {
        editorRef.value.blur()
      }
      showHistoryPanel.value = false
      closeHistoryModal()
      closeFavoriteModal()
    }
    lastEscPressTime = now
  }

  updateStatus()
}

const handleInput = () => {
  updateStatus()
  localStorage.setItem(STORAGE_KEY, content.value)
  updateSavedTime()

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  autoSaveTimer = setTimeout(() => {
    addHistoryRecord()
  }, AUTO_SAVE_INTERVAL)
}

const handleClick = () => {
  updateStatus()
  if (showHistoryPanel.value) {
    showHistoryPanel.value = false
  }
}

const handleFocus = () => {
  isBlurred.value = false
  showStatusbar.value = true
}

const handleBlur = () => {
  // 延迟执行，让按钮点击事件先完成
  setTimeout(() => {
    // 如果侧边面板打开，不要隐藏状态栏
    if (!showHistoryPanel.value) {
      isBlurred.value = true
      showStatusbar.value = false
      addHistoryRecord()
    }
  }, 200)
}

const handleVisibilityChange = () => {
  if (document.hidden) {
    isBlurred.value = true
    showStatusbar.value = false
    addHistoryRecord()
  } else {
    if (document.activeElement === editorRef.value) {
      isBlurred.value = false
      showStatusbar.value = true
    }
  }
}

const adjustPadding = () => {
  if (!editorRef.value) return
  const width = window.innerWidth
  editorRef.value.classList.remove('p-4', 'p-6', 'p-10')
  if (width < 640) {
    editorRef.value.classList.add('p-4')
  } else if (width < 768) {
    editorRef.value.classList.add('p-6')
  } else {
    editorRef.value.classList.add('p-10')
  }
}

const toggleHistoryPanel = () => {
  showHistoryPanel.value = !showHistoryPanel.value
}

const openHistoryPanel = () => {
  showHistoryPanel.value = true
  activeTab.value = 'history'
  // 保持状态栏显示
  showStatusbar.value = true
  // 保持编辑器焦点
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

const openFavoritesPanel = () => {
  showHistoryPanel.value = true
  activeTab.value = 'favorites'
  // 保持状态栏显示
  showStatusbar.value = true
  // 保持编辑器焦点
  if (editorRef.value) {
    editorRef.value.focus()
  }
}

const truncateText = (text) => {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

onMounted(() => {
  const savedContent = localStorage.getItem(STORAGE_KEY)
  if (savedContent) {
    content.value = savedContent
    updateStatus()
    updateSavedTime()
  }

  const savedFavorites = localStorage.getItem(FAVORITES_KEY)
  if (savedFavorites) {
    favorites.value = JSON.parse(savedFavorites)
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'i' && isBlurred.value) {
      e.preventDefault()
      focusEditor()
    }
  })

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('resize', adjustPadding)
  adjustPadding()
})

onUnmounted(() => {
  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  window.removeEventListener('resize', adjustPadding)
})
</script>
