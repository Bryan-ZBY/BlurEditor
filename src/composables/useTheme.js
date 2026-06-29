import { ref, computed } from 'vue'

const THEME_KEY = 'editor_theme'
const THEME_SEQUENCE = ['dark', 'light', 'midnight', 'forest', 'sunset', 'lavender']
const DARK_THEMES = new Set(THEME_SEQUENCE.filter((theme) => theme !== 'light'))

export function useTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)
  const initialTheme = THEME_SEQUENCE.includes(savedTheme) ? savedTheme : 'dark'
  const theme = ref(initialTheme)

  const isDark = computed(() => DARK_THEMES.has(theme.value))
  const isLight = computed(() => theme.value === 'light')

  function toggleTheme() {
    const currentIndex = THEME_SEQUENCE.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % THEME_SEQUENCE.length
    theme.value = THEME_SEQUENCE[nextIndex]
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  function setTheme(newTheme) {
    if (!THEME_SEQUENCE.includes(newTheme)) {
      return
    }
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
