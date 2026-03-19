import { ref } from 'vue'

export function useToast() {
  const showSaveToast = ref(false)
  const showFavoriteToast = ref(false)
  const copySuccess = ref(false)
  const emptyToast = ref({ show: false, message: '', color: 'yellow' })
  const emptyToastTimer = ref(null)

  const showEmptyToastMessage = (message, color = 'yellow') => {
    if (emptyToastTimer.value) {
      clearTimeout(emptyToastTimer.value)
    }
    emptyToast.value = { show: true, message, color }
    emptyToastTimer.value = setTimeout(() => {
      emptyToast.value.show = false
    }, 2500)
  }

  const triggerSaveToast = () => {
    showSaveToast.value = true
    setTimeout(() => {
      showSaveToast.value = false
    }, 3000)
  }

  const triggerFavoriteToast = () => {
    showFavoriteToast.value = true
    setTimeout(() => {
      showFavoriteToast.value = false
    }, 3000)
  }

  const triggerCopySuccess = () => {
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  }

  return {
    showSaveToast,
    showFavoriteToast,
    copySuccess,
    emptyToast,
    showEmptyToastMessage,
    triggerSaveToast,
    triggerFavoriteToast,
    triggerCopySuccess
  }
}
