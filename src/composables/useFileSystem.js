import { computed, ref } from 'vue'

const STORAGE_KEY = 'file_system_v1'
const CURRENT_FILE_KEY = 'current_file_id'
const SORT_MODE_KEY = 'file_sort_mode'
const MAX_RECENT_FILES = 12

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function normalizeFile(file, now = Date.now()) {
  if (!file || typeof file !== 'object') return null
  return {
    id: file.id || generateId(),
    name: file.name || 'untitled.md',
    type: file.type || 'file',
    parentId: file.parentId ?? null,
    content: file.content || '',
    tags: Array.isArray(file.tags) ? file.tags : [],
    isArchived: Boolean(file.isArchived),
    isFavorite: Boolean(file.isFavorite),
    createdAt: Number.isFinite(file.createdAt) ? file.createdAt : now,
    updatedAt: Number.isFinite(file.updatedAt) ? file.updatedAt : now,
    lastOpenedAt: Number.isFinite(file.lastOpenedAt) ? file.lastOpenedAt : now,
    order: Number.isFinite(file.order) ? file.order : now
  }
}

function createDefaultFiles() {
  const welcomeId = generateId()
  return {
    files: [
      {
        id: welcomeId,
        name: '欢迎使用.md',
        type: 'file',
        parentId: null,
        content: `# 欢迎使用 Markdown 编辑器\n\n这是一个默认示例文件。\n\n## 功能清单\n\n- 文件管理：新建/删除/归档\n- 编辑/预览\n- 主题切换\n- 命令面板\n- 文档大纲\n\n## 示例标题\n\n### 子标题\n\n#### 三级标题\n\nMarkdown 代码示例：\n\n\`\`\`javascript\nfunction hello() {\n  return 'hello world'\n}\n\`\`\`\n`,
        isArchived: false,
        isFavorite: true,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        lastOpenedAt: Date.now(),
        order: 0
      }
    ],
    currentFileId: welcomeId
  }
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw)
    if (!data || !Array.isArray(data.files)) return null

    const now = Date.now()
    const files = data.files
      .map((file) => normalizeFile(file, now))
      .filter(Boolean)

    const currentFileId = data.currentFileId
    const exists = files.some((file) => file.id === currentFileId && file.type === 'file' && !file.isArchived)
    return {
      files,
      currentFileId: exists ? currentFileId : null
    }
  } catch (e) {
    console.error('Failed to load file system:', e)
  }
  return null
}

function saveToStorage(files, currentFileId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ files, currentFileId }))
  } catch (e) {
    console.error('Failed to save file system:', e)
  }
}

const sortMode = ref(localStorage.getItem(SORT_MODE_KEY) || 'name')

export function useFileSystem() {
  const saved = loadFromStorage()
  const defaultData = createDefaultFiles()

  const files = ref(saved?.files || defaultData.files)
  const currentFileId = ref(saved?.currentFileId || defaultData.currentFileId)
  const now = Date.now()

  if (!currentFileId.value || !files.value.some((f) => f.id === currentFileId.value && f.type === 'file')) {
    const firstFile = files.value.find((f) => f.type === 'file' && !f.isArchived)
    currentFileId.value = firstFile ? firstFile.id : null
  }
  files.value.forEach((file) => {
    if (!Number.isFinite(file.createdAt)) file.createdAt = now
    if (!Number.isFinite(file.updatedAt)) file.updatedAt = now
    if (!Number.isFinite(file.lastOpenedAt)) file.lastOpenedAt = file.createdAt
  })

  const currentFile = computed(() =>
    files.value.find((f) => f.id === currentFileId.value) || null
  )

  const rootFiles = computed(() =>
    files.value
      .filter((f) => f.parentId === null && !f.isArchived)
      .sort((a, b) => a.order - b.order)
  )

  const archivedFiles = computed(() => files.value.filter((f) => f.isArchived))

  const favoriteFiles = computed(() => {
    const result = files.value.filter((f) => !f.isArchived && f.isFavorite)
    return result.sort((a, b) => (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt))
  })

  const recentFiles = computed(() => {
    return files.value
      .filter((f) => f.type === 'file' && !f.isArchived)
      .sort((a, b) => (b.lastOpenedAt || b.updatedAt) - (a.lastOpenedAt || a.updatedAt))
      .slice(0, MAX_RECENT_FILES)
  })

  function getChildren(parentId) {
    return files.value
      .filter((f) => f.parentId === parentId && !f.isArchived)
      .sort((a, b) => a.order - b.order)
  }

  function persist() {
    saveToStorage(files.value, currentFileId.value)
  }

  function createFile(parentId = null, name = '新建文档.md', content = '', tags = []) {
    const siblings = files.value.filter((f) => f.parentId === parentId && !f.isArchived)
    const baseName = name.replace(/\.md$/, '')
    const ext = '.md'

    let finalName = name
    let counter = 1
    while (siblings.some((s) => s.name === finalName)) {
      finalName = `${baseName}${counter}${ext}`
      counter += 1
    }

    const newFile = {
      id: generateId(),
      name: finalName,
      type: 'file',
      parentId,
      content,
      tags,
      isArchived: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFile)
    persist()
    return newFile
  }

  function createFolder(parentId = null, name = '新建文件夹') {
    const siblings = files.value.filter((f) => f.parentId === parentId && !f.isArchived)

    let finalName = name
    let counter = 1
    while (siblings.some((s) => s.name === finalName)) {
      finalName = `${name}${counter}`
      counter += 1
    }

    const newFolder = {
      id: generateId(),
      name: finalName,
      type: 'folder',
      parentId,
      content: '',
      isArchived: false,
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFolder)
    persist()
    return newFolder
  }

  function renameFile(fileId, newName) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    file.name = newName
    file.updatedAt = Date.now()
    persist()
  }

  function deleteFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    if (file.type === 'folder') {
      const children = files.value.filter((f) => f.parentId === fileId)
      children.forEach((child) => deleteFile(child.id))
    }
    files.value = files.value.filter((f) => f.id !== fileId)
    if (currentFileId.value === fileId) {
      const remaining = files.value.filter((f) => f.type === 'file' && !f.isArchived)
      currentFileId.value = remaining.length ? remaining[0].id : null
    }
    persist()
  }

  function moveFile(fileId, newParentId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.id === newParentId) return

    if (file.type === 'folder') {
      let cursor = newParentId
      while (cursor) {
        if (cursor === file.id) return
        const parent = files.value.find((f) => f.id === cursor)
        cursor = parent?.parentId || null
      }
    }

    file.parentId = newParentId
    file.updatedAt = Date.now()
    persist()
  }

  function archiveFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    file.isArchived = true
    file.updatedAt = Date.now()
    persist()
  }

  function unarchiveFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    file.isArchived = false
    file.updatedAt = Date.now()
    persist()
  }

  function duplicateFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.type !== 'file') return null

    const lastDot = file.name.lastIndexOf('.')
    const hasExt = lastDot > -1
    const baseName = hasExt ? file.name.slice(0, lastDot) : file.name
    const ext = hasExt ? file.name.slice(lastDot) : '.md'
    const siblings = files.value.filter((f) => f.parentId === file.parentId && !f.isArchived)
    let finalName = `${baseName} - 复制${ext}`
    let counter = 1
    while (siblings.some((f) => f.name === finalName)) {
      finalName = `${baseName} - 复制 (${counter})${ext}`
      counter += 1
    }

    const newFile = {
      ...file,
      id: generateId(),
      name: finalName,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastOpenedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFile)
    persist()
    return newFile
  }

  function updateFileContent(fileId, content) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.type !== 'file') return
    file.content = content
    file.updatedAt = Date.now()
    file.lastOpenedAt = Date.now()
    persist()
  }

  function touchFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    file.lastOpenedAt = Date.now()
    persist()
  }

  function setCurrentFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.type !== 'file') return
    currentFileId.value = fileId
    touchFile(fileId)
    persist()
  }

  function exportFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.type !== 'file') return
    const blob = new Blob([file.content || ''], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  function getFilePath(fileId) {
    const path = []
    let current = files.value.find((f) => f.id === fileId)
    while (current) {
      path.unshift(current.name)
      current = files.value.find((f) => f.id === current.parentId)
    }
    return path.join(' / ')
  }

  function getParentFolderIds(fileId) {
    const result = []
    let current = files.value.find((f) => f.id === fileId)
    while (current?.parentId) {
      result.unshift(current.parentId)
      current = files.value.find((f) => f.id === current.parentId)
    }
    return result
  }

  function addFileTag(fileId, tagId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return false
    if (!file.tags) file.tags = []
    if (!file.tags.includes(tagId)) {
      file.tags.push(tagId)
      persist()
      return true
    }
    return false
  }

  function removeFileTag(fileId, tagId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || !file.tags) return false
    const index = file.tags.indexOf(tagId)
    if (index === -1) return false
    file.tags.splice(index, 1)
    persist()
    return true
  }

  function getFileTags(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    return file?.tags || []
  }

  function updateFileTags(fileId, tagIds) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return
    file.tags = tagIds
    file.updatedAt = Date.now()
    persist()
  }

  function setSortMode(mode) {
    sortMode.value = mode
    localStorage.setItem(SORT_MODE_KEY, mode)
  }

  function getSortedFiles(fileList) {
    const sorted = [...fileList]
    switch (sortMode.value) {
      case 'name':
        return sorted.sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        })
      case 'date':
        return sorted.sort((a, b) => b.updatedAt - a.updatedAt)
      case 'size':
        return sorted.sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return (b.content?.length || 0) - (a.content?.length || 0)
        })
      default:
        return sorted.sort((a, b) => a.order - b.order)
    }
  }

  function toggleFavorite(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return false
    file.isFavorite = !file.isFavorite
    file.updatedAt = Date.now()
    persist()
    return file.isFavorite
  }

  return {
    files,
    currentFileId,
    currentFile,
    rootFiles,
    archivedFiles,
    favoriteFiles,
    recentFiles,
    sortMode,
    getChildren,
    getSortedFiles,
    createFile,
    createFolder,
    renameFile,
    deleteFile,
    moveFile,
    archiveFile,
    unarchiveFile,
    duplicateFile,
    updateFileContent,
    setCurrentFile,
    exportFile,
    getFilePath,
    getParentFolderIds,
    setSortMode,
    addFileTag,
    removeFileTag,
    getFileTags,
    updateFileTags,
    touchFile,
    toggleFavorite
  }
}
