import { ref, computed } from 'vue'

export function useMouseEffects() {
  const mouseX = ref(-1000)
  const mouseY = ref(-1000)
  const isMouseInEditor = ref(false)

  const glowCircleStyle = computed(() => {
    return {
      left: `${mouseX.value}px`,
      top: `${mouseY.value}px`,
    }
  })

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

  const handleMouseMove = (e) => {
    mouseX.value = e.clientX
    mouseY.value = e.clientY
    isMouseInEditor.value = true
  }

  const handleMouseLeave = () => {
    isMouseInEditor.value = false
  }

  return {
    mouseX,
    mouseY,
    isMouseInEditor,
    glowCircleStyle,
    getParticleStyle,
    handleMouseMove,
    handleMouseLeave
  }
}
