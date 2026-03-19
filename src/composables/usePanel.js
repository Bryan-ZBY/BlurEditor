import { ref } from 'vue'

export function usePanel() {
  const showHistoryPanel = ref(false)
  const showHistoryModalFlag = ref(false)
  const showFavoriteModalFlag = ref(false)
  const activeTab = ref('history')

  const currentHistoryId = ref(null)
  const currentFavoriteId = ref(null)
  const currentModalType = ref(null)
  const currentHistoryPreview = ref('')
  const currentHistoryTime = ref('')
  const currentFavoritePreview = ref('')
  const currentFavoriteTime = ref('')

  const openHistoryPanel = () => {
    showHistoryPanel.value = true
    activeTab.value = 'history'
  }

  const openFavoritesPanel = () => {
    showHistoryPanel.value = true
    activeTab.value = 'favorites'
  }

  const closeHistoryPanel = () => {
    showHistoryPanel.value = false
  }

  const showHistoryModal = (record) => {
    currentModalType.value = 'history'
    currentHistoryId.value = record.id
    currentHistoryPreview.value = record.content
    currentHistoryTime.value = `保存时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
    showHistoryModalFlag.value = true
  }

  const closeHistoryModal = () => {
    showHistoryModalFlag.value = false
    currentHistoryId.value = null
    currentModalType.value = null
  }

  const showFavoriteModal = (record) => {
    currentModalType.value = 'favorite'
    currentFavoriteId.value = record.id
    currentFavoritePreview.value = record.content
    currentFavoriteTime.value = `收藏时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`
    showFavoriteModalFlag.value = true
  }

  const closeFavoriteModal = () => {
    showFavoriteModalFlag.value = false
    currentFavoriteId.value = null
    currentModalType.value = null
  }

  return {
    showHistoryPanel,
    showHistoryModalFlag,
    showFavoriteModalFlag,
    activeTab,
    currentHistoryId,
    currentFavoriteId,
    currentModalType,
    currentHistoryPreview,
    currentHistoryTime,
    currentFavoritePreview,
    currentFavoriteTime,
    openHistoryPanel,
    openFavoritesPanel,
    closeHistoryPanel,
    showHistoryModal,
    closeHistoryModal,
    showFavoriteModal,
    closeFavoriteModal
  }
}
