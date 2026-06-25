import { ref, computed } from 'vue'

const THEME_KEY = 'editor_theme'

export function useTheme() {
  const theme = ref(localStorage.getItem(THEME_KEY) || 'dark')

  const isDark = computed(() => theme.value === 'dark')
  const isLight = computed(() => theme.value === 'light')

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  function setTheme(newTheme) {
    theme.value = newTheme
    localStorage.setItem(THEME_KEY, newTheme)
    applyTheme()
  }

  function applyTheme() {
    document.documentElement.setAttribute('data-theme', theme.value)
  }

  // 初始化时应用主题
  applyTheme()

  return {
    theme,
    isDark,
    isLight,
    toggleTheme,
    setTheme
  }
}
