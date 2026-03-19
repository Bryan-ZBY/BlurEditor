import { ref, onMounted } from 'vue'

const STORAGE_KEY = 'editor_content'
const HISTORY_KEY = 'editor_history'
const FAVORITES_KEY = 'editor_favorites'
const MAX_HISTORY_ITEMS = 50

export function useStorage() {
  const content = ref('')
  const history = ref([])
  const favorites = ref([])

  const loadFromStorage = () => {
    const savedContent = localStorage.getItem(STORAGE_KEY)
    if (savedContent) {
      content.value = savedContent
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY)
    if (savedHistory) {
      history.value = JSON.parse(savedHistory)
    }

    const savedFavorites = localStorage.getItem(FAVORITES_KEY)
    if (savedFavorites) {
      favorites.value = JSON.parse(savedFavorites)
    }
  }

  const saveContent = () => {
    localStorage.setItem(STORAGE_KEY, content.value)
  }

  const saveHistory = () => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value))
  }

  const saveFavorites = () => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites.value))
  }

  const addHistoryRecord = (record) => {
    if (!record.content.trim()) return

    if (history.value.length > 0 && history.value[0].content === record.content) return

    history.value.unshift(record)

    if (history.value.length > MAX_HISTORY_ITEMS) {
      history.value = history.value.slice(0, MAX_HISTORY_ITEMS)
    }

    saveHistory()
  }

  const addFavorite = (record) => {
    if (!record.content.trim()) return false

    const isAlreadyFavorite = favorites.value.some(fav => fav.content === record.content)
    if (isAlreadyFavorite) return false

    favorites.value.unshift(record)
    saveFavorites()
    return true
  }

  const deleteHistory = (id) => {
    history.value = history.value.filter(record => record.id !== id)
    saveHistory()
  }

  const deleteFavorite = (id) => {
    favorites.value = favorites.value.filter(record => record.id !== id)
    saveFavorites()
  }

  onMounted(() => {
    loadFromStorage()
  })

  return {
    content,
    history,
    favorites,
    saveContent,
    addHistoryRecord,
    addFavorite,
    deleteHistory,
    deleteFavorite,
    loadFromStorage
  }
}
