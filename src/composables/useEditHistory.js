import { ref, computed, watch } from 'vue'

const MAX_HISTORY = 100

export function useEditHistory(getContent, setContent) {
  const history = ref([])
  const historyIndex = ref(-1)

  function saveState(nextContent = getContent()) {
    const content = String(nextContent ?? '')

    if (history.value[historyIndex.value] === content) {
      return
    }

    // 如果当前在历史中间位置，删除后面的历史
    if (historyIndex.value < history.value.length - 1) {
      history.value = history.value.slice(0, historyIndex.value + 1)
    }

    // 添加新历史
    history.value.push(content)

    // 限制历史数量
    if (history.value.length > MAX_HISTORY) {
      history.value.shift()
    }

    historyIndex.value = history.value.length - 1
  }

  function undo() {
    if (historyIndex.value <= 0) return false

    historyIndex.value--
    setContent(history.value[historyIndex.value])
    return true
  }

  function redo() {
    if (historyIndex.value >= history.value.length - 1) return false

    historyIndex.value++
    setContent(history.value[historyIndex.value])
    return true
  }

  const canUndo = computed(() => historyIndex.value > 0)
  const canRedo = computed(() => historyIndex.value < history.value.length - 1)

  function clearHistory() {
    history.value = []
    historyIndex.value = -1
  }

  function resetHistory(content = getContent()) {
    history.value = [String(content ?? '')]
    historyIndex.value = 0
  }

  return {
    saveState,
    undo,
    redo,
    canUndo,
    canRedo,
    clearHistory,
    resetHistory,
    historyLength: computed(() => history.value.length)
  }
}
