<template>
  <div>
    <div class="grid-bg"></div>
    <div class="scanline-overlay"></div>
    
    <div class="hud-corner hud-corner-tl">
      <div class="hud-line hud-line-h" style="left: 0; top: 0;"></div>
      <div class="hud-line hud-line-v" style="left: 0; top: 0;"></div>
    </div>
    
    <div class="hud-corner hud-corner-tr">
      <div class="hud-line hud-line-h" style="right: 0; top: 0;"></div>
      <div class="hud-line hud-line-v" style="right: 0; top: 0;"></div>
    </div>
    
    <div class="hud-corner hud-corner-bl">
      <div class="hud-line hud-line-h" style="left: 0; bottom: 0;"></div>
      <div class="hud-line hud-line-v" style="left: 0; bottom: 0;"></div>
    </div>
    
    <div class="hud-corner hud-corner-br">
      <div class="hud-line hud-line-h" style="right: 0; bottom: 0;"></div>
      <div class="hud-line hud-line-v" style="right: 0; bottom: 0;"></div>
    </div>
    
    <div v-for="i in 8" :key="i" class="particle" :style="getParticleStyle(i)"></div>

    <div
      v-show="isMouseInEditor"
      class="fixed pointer-events-none z-[60]"
      :style="glowCircleStyle"
    >
      <div class="absolute w-48 h-48 rounded-full bg-fuchsia-400/10 blur-3xl" style="left: -96px; top: -96px;"></div>
      <div class="absolute w-36 h-36 rounded-full bg-fuchsia-300/15 blur-2xl" style="left: -72px; top: -72px;"></div>
      <div class="absolute w-24 h-24 rounded-full bg-fuchsia-200/20 blur-xl" style="left: -48px; top: -48px;"></div>
    </div>
  </div>
</template>

<script setup>
import { useMouseEffects } from '../composables/useMouseEffects'

const { isMouseInEditor, glowCircleStyle, getParticleStyle } = useMouseEffects()
</script>
