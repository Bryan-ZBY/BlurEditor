import { ref, watch } from 'vue'

const TABS_STORAGE_KEY = 'editor_tabs_v1'
const ACTIVE_TAB_KEY = 'active_tab_id'

function loadFromStorage() {
  try {
    const data = localStorage.getItem(TABS_STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
    }
  } catch (e) {
    console.error('Failed to load tabs:', e)
  }
  return null
}

function saveToStorage(tabs, activeTabId) {
  try {
    localStorage.setItem(TABS_STORAGE_KEY, JSON.stringify({ tabs, activeTabId }))
  } catch (e) {
    console.error('Failed to save tabs:', e)
  }
}

const tabs = ref([])
const activeTabId = ref(null)
const dirtyTabs = ref(new Set())

export function useTabs() {
  const saved = loadFromStorage()
  if (saved && saved.tabs && saved.tabs.length > 0) {
    tabs.value = saved.tabs
    activeTabId.value = saved.activeTabId
  }

  function persist() {
    saveToStorage(tabs.value, activeTabId.value)
  }

  function openTab(fileId, fileName) {
    const existingTab = tabs.value.find(t => t.fileId === fileId)
    if (existingTab) {
      activeTabId.value = fileId
      persist()
      return
    }
    tabs.value.push({
      fileId,
      fileName,
      isPinned: false
    })
    activeTabId.value = fileId
    persist()
  }

  function closeTab(fileId) {
    const index = tabs.value.findIndex(t => t.fileId === fileId)
    if (index === -1) return

    const wasActive = activeTabId.value === fileId
    tabs.value.splice(index, 1)
    dirtyTabs.value.delete(fileId)

    if (wasActive) {
      if (tabs.value.length > 0) {
        const newIndex = Math.min(index, tabs.value.length - 1)
        activeTabId.value = tabs.value[newIndex].fileId
      } else {
        activeTabId.value = null
      }
    }
    persist()
  }

  function closeOtherTabs(fileId) {
    tabs.value = tabs.value.filter(t => t.fileId === fileId)
    activeTabId.value = fileId
    dirtyTabs.value = new Set([...dirtyTabs.value].filter(id => id === fileId))
    persist()
  }

  function closeRightTabs(fileId) {
    const index = tabs.value.findIndex(t => t.fileId === fileId)
    if (index === -1) return
    tabs.value = tabs.value.slice(0, index + 1)
    const remainingIds = new Set(tabs.value.map(t => t.fileId))
    dirtyTabs.value = new Set([...dirtyTabs.value].filter(id => remainingIds.has(id)))
    if (!remainingIds.has(activeTabId.value)) {
      activeTabId.value = fileId
    }
    persist()
  }

  function closeLeftTabs(fileId) {
    const index = tabs.value.findIndex(t => t.fileId === fileId)
    if (index === -1) return
    tabs.value = tabs.value.slice(index)
    const remainingIds = new Set(tabs.value.map(t => t.fileId))
    dirtyTabs.value = new Set([...dirtyTabs.value].filter(id => remainingIds.has(id)))
    if (!remainingIds.has(activeTabId.value)) {
      activeTabId.value = fileId
    }
    persist()
  }

  function closeAllTabs() {
    tabs.value = []
    activeTabId.value = null
    dirtyTabs.value.clear()
    persist()
  }

  function setActiveTab(fileId) {
    const tab = tabs.value.find(t => t.fileId === fileId)
    if (tab) {
      activeTabId.value = fileId
      persist()
    }
  }

  function setTabDirty(fileId, isDirty) {
    if (isDirty) {
      dirtyTabs.value.add(fileId)
    } else {
      dirtyTabs.value.delete(fileId)
    }
  }

  function isTabDirty(fileId) {
    return dirtyTabs.value.has(fileId)
  }

  function updateTabName(fileId, newName) {
    const tab = tabs.value.find(t => t.fileId === fileId)
    if (tab) {
      tab.fileName = newName
      persist()
    }
  }

  function moveTab(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= tabs.value.length) return
    if (toIndex < 0 || toIndex >= tabs.value.length) return
    const [tab] = tabs.value.splice(fromIndex, 1)
    tabs.value.splice(toIndex, 0, tab)
    persist()
  }

  function togglePinTab(fileId) {
    const tab = tabs.value.find(t => t.fileId === fileId)
    if (tab) {
      tab.isPinned = !tab.isPinned
      persist()
    }
  }

  function validateTabs(validFileIds) {
    const validIds = new Set(validFileIds)
    const invalidTabs = tabs.value.filter(t => !validIds.has(t.fileId))
    invalidTabs.forEach(tab => closeTab(tab.fileId))
  }

  watch([tabs, activeTabId], persist, { deep: true })

  return {
    tabs,
    activeTabId,
    openTab,
    closeTab,
    closeOtherTabs,
    closeRightTabs,
    closeLeftTabs,
    closeAllTabs,
    setActiveTab,
    setTabDirty,
    isTabDirty,
    updateTabName,
    moveTab,
    togglePinTab,
    validateTabs
  }
}
