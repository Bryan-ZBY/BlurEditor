<template>
  <div>
    <div
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
  </div>
</template>

<script setup>
defineProps({
  showSaveToast: Boolean,
  showFavoriteToast: Boolean,
  copySuccess: Boolean,
  emptyToast: Object
})
</script>
