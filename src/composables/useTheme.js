import { ref, computed } from 'vue'

const THEME_KEY = 'editor_theme'
const THEME_SEQUENCE = [
  'lightgrey',
  'midnight',
  'lightgoldenrodyellow',
  'lavender',
  'antiquewhite',
  'beige',
  'cornsilk',
  'ivory',
  'lightgrey'
]
const DARK_THEMES = new Set(['midnight', 'lavender', 'lightgoldenrodyellow'])
const LIGHT_THEMES = new Set(THEME_SEQUENCE.filter((theme) => !DARK_THEMES.has(theme)))
const THEME_ALIASES = {
  dark: 'midnight',
  light: 'beige',
}

export function useTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY)
  const normalizedTheme = THEME_ALIASES[savedTheme] || savedTheme
  const initialTheme = THEME_SEQUENCE.includes(normalizedTheme) ? normalizedTheme : 'midnight'
  const theme = ref(initialTheme)

  const isDark = computed(() => DARK_THEMES.has(theme.value))
  const isLight = computed(() => LIGHT_THEMES.has(theme.value))

  function toggleTheme() {
    const currentIndex = THEME_SEQUENCE.indexOf(theme.value)
    const nextIndex = (currentIndex + 1) % THEME_SEQUENCE.length
    theme.value = THEME_SEQUENCE[nextIndex]
    localStorage.setItem(THEME_KEY, theme.value)
    applyTheme()
  }

  function toggleThemePrevious() {
    const currentIndex = THEME_SEQUENCE.indexOf(theme.value)
    const prevIndex = (currentIndex - 1 + THEME_SEQUENCE.length) % THEME_SEQUENCE.length
    theme.value = THEME_SEQUENCE[prevIndex]
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
    toggleThemePrevious,
    setTheme
  }
}
