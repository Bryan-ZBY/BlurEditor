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
        content: `# 欢迎使用 BlurEditor\n\nBlurEditor 是一个本地 Markdown 知识工作台，适合整理个人笔记、项目文档、会议纪要和技术草稿。\n\n## 你可以在这里做什么\n\n- 用左侧文件树管理文档和文件夹\n- 用标签页在多篇文档之间切换\n- 用分栏预览查看 Markdown 渲染结果\n- 用全局入口搜索命令、文件、正文和标签\n- 用全局入口执行新建、导入、预览、主题和大纲操作\n- 将内容导出为 Markdown、HTML、TXT 或富文本\n\n## 快速入口\n\n- Ctrl/Cmd+K 或 Alt+F：打开全局入口\n- Alt+H：显示或隐藏文档大纲\n- Alt+Z：进入或退出禅模式\n\n## Markdown 示例\n\n\`\`\`javascript\nfunction hello() {\n  return 'hello world'\n}\n\`\`\`\n`,
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

  function normalizeName(name) {
    return String(name || '').trim().toLocaleLowerCase()
  }

  function getActiveSiblings(parentId) {
    return files.value.filter((f) => f.parentId === parentId && !f.isArchived)
  }

  function hasDuplicateName(parentId, name, excludeId = null) {
    const normalized = normalizeName(name)
    if (!normalized) return false
    return getActiveSiblings(parentId).some((f) => f.id !== excludeId && normalizeName(f.name) === normalized)
  }

  function getUniqueName(parentId, name, type = 'file', excludeId = null) {
    const fallback = type === 'folder' ? '新建文件夹' : '新建文档.md'
    const requestedName = String(name || fallback).trim() || fallback
    if (!hasDuplicateName(parentId, requestedName, excludeId)) return requestedName

    const lastDot = type === 'file' ? requestedName.lastIndexOf('.') : -1
    const baseName = lastDot > 0 ? requestedName.slice(0, lastDot) : requestedName
    const ext = type === 'file' ? (lastDot > 0 ? requestedName.slice(lastDot) : '.md') : ''
    let counter = 1
    let candidate = ''

    do {
      candidate = type === 'folder'
        ? `${requestedName}${counter}`
        : `${baseName}${counter}${ext}`
      counter += 1
    } while (hasDuplicateName(parentId, candidate, excludeId))

    return candidate
  }

  function getFileAndDescendantIds(fileId) {
    const ids = []
    const collect = (id) => {
      ids.push(id)
      files.value
        .filter((f) => f.parentId === id)
        .forEach((child) => collect(child.id))
    }
    collect(fileId)
    return ids
  }

  function isFolderDescendant(folderId, possibleAncestorId) {
    let cursor = folderId
    while (cursor) {
      if (cursor === possibleAncestorId) return true
      const parent = files.value.find((f) => f.id === cursor)
      cursor = parent?.parentId || null
    }
    return false
  }

  function resolveCurrentFile(excludedIds = new Set()) {
    if (currentFileId.value && !excludedIds.has(currentFileId.value)) return
    const nextFile = files.value.find((f) => f.type === 'file' && !f.isArchived && !excludedIds.has(f.id))
    currentFileId.value = nextFile ? nextFile.id : null
  }

  function createFile(parentId = null, name = '新建文档.md', content = '', tags = []) {
    const finalName = getUniqueName(parentId, name, 'file')

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
    const finalName = getUniqueName(parentId, name, 'folder')

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
    const nextName = String(newName || '').trim()
    if (!file || !nextName) return false
    if (hasDuplicateName(file.parentId, nextName, file.id)) return false
    file.name = nextName
    file.updatedAt = Date.now()
    persist()
    return true
  }

  function deleteFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return false
    const idsToDelete = new Set(getFileAndDescendantIds(fileId))
    files.value = files.value.filter((f) => !idsToDelete.has(f.id))
    resolveCurrentFile(idsToDelete)
    persist()
    return true
  }

  function moveFile(fileId, newParentId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.id === newParentId) return false
    if (newParentId && !files.value.some((f) => f.id === newParentId && f.type === 'folder' && !f.isArchived)) return false
    if (file.parentId === newParentId) return true
    if (file.type === 'folder' && isFolderDescendant(newParentId, file.id)) return false
    if (hasDuplicateName(newParentId, file.name, file.id)) return false

    file.parentId = newParentId
    file.order = Date.now()
    file.updatedAt = Date.now()
    persist()
    return true
  }

  function reorderFile(fileId, targetParentId, targetIndex = 0) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file || file.id === targetParentId) return false
    if (targetParentId && !files.value.some((f) => f.id === targetParentId && f.type === 'folder' && !f.isArchived)) return false
    if (file.type === 'folder' && isFolderDescendant(targetParentId, file.id)) return false
    if (file.parentId !== targetParentId && hasDuplicateName(targetParentId, file.name, file.id)) return false

    const siblings = getActiveSiblings(targetParentId).filter((f) => f.id !== fileId)
    const nextIndex = Math.max(0, Math.min(Number(targetIndex) || 0, siblings.length))
    file.parentId = targetParentId
    file.updatedAt = Date.now()

    const orderedFiles = [...siblings]
    orderedFiles.splice(nextIndex, 0, file)
    const baseOrder = Date.now()
    orderedFiles.forEach((item, index) => {
      item.order = baseOrder + index
    })
    persist()
    return true
  }

  function archiveFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return false
    const idsToArchive = new Set(getFileAndDescendantIds(fileId))
    const now = Date.now()
    files.value.forEach((item) => {
      if (idsToArchive.has(item.id)) {
        item.isArchived = true
        item.updatedAt = now
      }
    })
    resolveCurrentFile(idsToArchive)
    persist()
    return true
  }

  function unarchiveFile(fileId) {
    const file = files.value.find((f) => f.id === fileId)
    if (!file) return false

    const idsToRestore = new Set(getFileAndDescendantIds(fileId))
    const parent = files.value.find((f) => f.id === file.parentId)
    if (parent?.isArchived && !idsToRestore.has(parent.id)) {
      file.parentId = null
    }
    if (hasDuplicateName(file.parentId, file.name, file.id)) {
      file.name = getUniqueName(file.parentId, file.name, file.type, file.id)
    }

    const now = Date.now()
    files.value.forEach((item) => {
      if (idsToRestore.has(item.id)) {
        item.isArchived = false
        item.updatedAt = now
      }
    })
    persist()
    return true
  }

  function emptyTrash() {
    const idsToDelete = new Set()
    files.value
      .filter((f) => f.isArchived)
      .forEach((file) => {
        getFileAndDescendantIds(file.id).forEach((id) => idsToDelete.add(id))
      })
    if (idsToDelete.size === 0) return 0

    files.value = files.value.filter((f) => !idsToDelete.has(f.id))
    resolveCurrentFile(idsToDelete)
    persist()
    return idsToDelete.size
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
    hasDuplicateName,
    renameFile,
    deleteFile,
    moveFile,
    reorderFile,
    archiveFile,
    unarchiveFile,
    emptyTrash,
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
