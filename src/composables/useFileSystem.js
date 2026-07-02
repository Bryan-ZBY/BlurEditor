import { computed, ref } from 'vue'

const STORAGE_KEY = 'file_system_v1'
const CURRENT_FILE_KEY = 'current_file_id'
const SORT_MODE_KEY = 'file_sort_mode'
const SORT_DIRECTION_KEY = 'file_sort_direction'
const IMPORT_BACKUP_KEY = 'file_system_backup_before_import_v1'
const MAX_RECENT_FILES = 12
const WORKSPACE_SCHEMA = 'blureditor-workspace'
const WORKSPACE_VERSION = 1
const WORKSPACE_APP = 'blureditor'
const VALID_SORT_MODES = new Set(['name', 'date', 'size'])
const VALID_SORT_DIRECTIONS = new Set(['asc', 'desc'])
const DEFAULT_SORT_DIRECTIONS = {
  name: 'asc',
  date: 'desc',
  size: 'desc'
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

function toTimestamp(value, fallback) {
  const timestamp = Number(value)
  return Number.isFinite(timestamp) ? timestamp : fallback
}

function normalizeFile(file, now = Date.now()) {
  if (!file || typeof file !== 'object') return null
  const type = file.type === 'folder' ? 'folder' : 'file'
  return {
    id: file.id || generateId(),
    name: file.name || 'untitled.md',
    type,
    parentId: file.parentId ?? null,
    content: type === 'folder' ? '' : String(file.content || ''),
    tags: Array.isArray(file.tags) ? file.tags : [],
    isArchived: Boolean(file.isArchived),
    isFavorite: Boolean(file.isFavorite),
    createdAt: toTimestamp(file.createdAt, now),
    updatedAt: toTimestamp(file.updatedAt, now),
    lastOpenedAt: toTimestamp(file.lastOpenedAt, now),
    order: toTimestamp(file.order, now)
  }
}

function isWorkspaceData(data) {
  return Boolean(
    data &&
    typeof data === 'object' &&
    data.schema === WORKSPACE_SCHEMA &&
    Array.isArray(data.files)
  )
}

export function parseWorkspaceContent(content) {
  if (typeof content !== 'string') return null
  const text = content.trim()
  if (!text.startsWith('{') || !text.includes(WORKSPACE_SCHEMA)) return null

  try {
    const data = JSON.parse(text)
    return isWorkspaceData(data) ? data : null
  } catch (e) {
    return null
  }
}

function normalizeSortMode(mode) {
  return VALID_SORT_MODES.has(mode) ? mode : 'name'
}

function getDefaultSortDirection(mode) {
  return DEFAULT_SORT_DIRECTIONS[normalizeSortMode(mode)] || 'asc'
}

function normalizeSortDirection(direction, mode = 'name') {
  return VALID_SORT_DIRECTIONS.has(direction) ? direction : getDefaultSortDirection(mode)
}

function cloneFileForWorkspace(file) {
  return {
    id: file.id,
    name: file.name,
    type: file.type === 'folder' ? 'folder' : 'file',
    parentId: file.parentId ?? null,
    content: file.type === 'folder' ? '' : String(file.content || ''),
    tags: Array.isArray(file.tags) ? [...file.tags] : [],
    isArchived: Boolean(file.isArchived),
    isFavorite: Boolean(file.isFavorite),
    createdAt: toTimestamp(file.createdAt, Date.now()),
    updatedAt: toTimestamp(file.updatedAt, Date.now()),
    lastOpenedAt: toTimestamp(file.lastOpenedAt, Date.now()),
    order: toTimestamp(file.order, Date.now())
  }
}

function createWorkspaceData(fileList, selectedFileId, selectedSortMode, selectedSortDirection, options = {}) {
  const includeArchived = options.includeArchived !== false
  const files = (Array.isArray(fileList) ? fileList : [])
    .filter((file) => includeArchived || !file.isArchived)
    .map(cloneFileForWorkspace)

  const exportedIds = new Set(files.map((file) => file.id))
  files.forEach((file) => {
    if (file.parentId && !exportedIds.has(file.parentId)) {
      file.parentId = null
    }
  })

  const currentFile = files.find((file) => file.id === selectedFileId && file.type === 'file')
    || files.find((file) => file.type === 'file' && !file.isArchived)
    || files.find((file) => file.type === 'file')

  return {
    schema: WORKSPACE_SCHEMA,
    version: WORKSPACE_VERSION,
    app: WORKSPACE_APP,
    exportedAt: Date.now(),
    includeArchived,
    sortMode: normalizeSortMode(selectedSortMode),
    sortDirection: normalizeSortDirection(selectedSortDirection, selectedSortMode),
    currentFileId: currentFile?.id || null,
    files
  }
}

export function getWorkspaceSummary(workspace) {
  if (!isWorkspaceData(workspace)) {
    return {
      valid: false,
      compatible: false,
      warnings: ['这不是 BlurEditor 工作区文件']
    }
  }

  const rawFiles = Array.isArray(workspace.files) ? workspace.files : []
  const ids = new Set(rawFiles.map((file) => file?.id).filter(Boolean))
  const invalidParentCount = rawFiles.filter((file) =>
    file?.parentId && (!ids.has(file.parentId) || file.parentId === file.id)
  ).length
  const fileCount = rawFiles.filter((file) => file?.type !== 'folder').length
  const folderCount = rawFiles.filter((file) => file?.type === 'folder').length
  const archivedCount = rawFiles.filter((file) => file?.isArchived).length
  const favoriteCount = rawFiles.filter((file) => file?.isFavorite).length
  const totalCharacters = rawFiles.reduce((total, file) => (
    file?.type === 'folder' ? total : total + String(file?.content || '').length
  ), 0)
  const version = Number(workspace.version) || 0
  const compatible = version <= WORKSPACE_VERSION
  const warnings = []

  if (!compatible) warnings.push(`工作区版本 v${version} 高于当前支持的 v${WORKSPACE_VERSION}，将尝试兼容导入`)
  if (invalidParentCount > 0) warnings.push(`${invalidParentCount} 个项目的父级无效，导入时会移动到根目录`)
  if (fileCount === 0) warnings.push('工作区里没有可打开的文档')

  return {
    valid: true,
    compatible,
    schema: workspace.schema,
    version,
    app: workspace.app || WORKSPACE_APP,
    exportedAt: Number(workspace.exportedAt) || null,
    includeArchived: Boolean(workspace.includeArchived),
    sortMode: normalizeSortMode(workspace.sortMode),
    sortDirection: normalizeSortDirection(workspace.sortDirection, workspace.sortMode),
    totalCount: rawFiles.length,
    fileCount,
    folderCount,
    archivedCount,
    favoriteCount,
    invalidParentCount,
    totalCharacters,
    warnings
  }
}

function normalizeWorkspaceData(workspace) {
  if (!isWorkspaceData(workspace)) return null

  const now = Date.now()
  const usedIds = new Set()
  const files = workspace.files
    .map((file) => normalizeFile(file, now))
    .filter(Boolean)
    .map((file) => {
      if (!file.id || usedIds.has(file.id)) {
        file.id = generateId()
      }
      usedIds.add(file.id)
      return file
    })

  if (!files.some((file) => file.type === 'file')) return null

  const byId = new Map(files.map((file) => [file.id, file]))
  files.forEach((file) => {
    if (file.parentId && (!byId.has(file.parentId) || file.parentId === file.id)) {
      file.parentId = null
    }
  })

  files.forEach((file) => {
    const seen = new Set([file.id])
    let cursor = file.parentId
    while (cursor) {
      if (seen.has(cursor)) {
        file.parentId = null
        break
      }
      seen.add(cursor)
      cursor = byId.get(cursor)?.parentId || null
    }
  })

  const requestedCurrentFile = files.find(
    (file) => file.id === workspace.currentFileId && file.type === 'file' && !file.isArchived
  )
  const firstFile = files.find((file) => file.type === 'file' && !file.isArchived)
    || files.find((file) => file.type === 'file')

  return {
    files,
    currentFileId: requestedCurrentFile?.id || firstFile?.id || null,
    sortMode: normalizeSortMode(workspace.sortMode),
    sortDirection: normalizeSortDirection(workspace.sortDirection, workspace.sortMode)
  }
}

function buildImportBackupInfo(backup) {
  if (!backup?.workspace) return null
  const summary = getWorkspaceSummary(backup.workspace)
  return {
    createdAt: Number(backup.createdAt) || null,
    reason: backup.reason || 'import',
    summary
  }
}

function loadImportBackup() {
  try {
    const raw = localStorage.getItem(IMPORT_BACKUP_KEY)
    if (!raw) return null
    const backup = JSON.parse(raw)
    return backup?.workspace ? backup : null
  } catch (e) {
    console.error('Failed to load import backup:', e)
  }
  return null
}

function getStoredImportBackupInfo() {
  return buildImportBackupInfo(loadImportBackup())
}

function findAccidentallyImportedWorkspace(files) {
  if (!Array.isArray(files)) return null
  for (const file of files) {
    const name = String(file?.name || '').toLowerCase()
    const mightBeWorkspaceFile = name.includes('blur-editor-workspace') || name.endsWith('.json')
    if (!mightBeWorkspaceFile) continue

    const workspace = parseWorkspaceContent(file?.content)
    if (workspace) return workspace
  }
  return null
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
        content: `# 欢迎使用 BlurEditor\n\nBlurEditor 是一个本地 Markdown 知识工作台，适合整理个人笔记、项目文档、会议纪要和技术草稿。\n\n## 你可以在这里做什么\n\n- 用左侧文件树管理文档和文件夹\n- 用标签页在多篇文档之间切换\n- 用分栏预览查看 Markdown 渲染结果\n- 用全局入口搜索命令、文件、正文和标签\n- 用全局入口执行新建、导入、预览、主题和大纲操作\n- 将内容导出为 Markdown、HTML、TXT 或富文本\n\n## 快速入口\n\n- Ctrl/Cmd+K 或 Alt+G：打开全局入口\n- Alt+H：显示或隐藏文档大纲\n- Alt+Z：进入或退出禅模式\n\n## Markdown 示例\n\n\`\`\`javascript\nfunction hello() {\n  return 'hello world'\n}\n\`\`\`\n`,
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

    const importedWorkspace = findAccidentallyImportedWorkspace(data.files)
    if (importedWorkspace) {
      const restored = normalizeWorkspaceData(importedWorkspace)
      if (restored) {
        saveToStorage(restored.files, restored.currentFileId)
        if (restored.sortMode) {
          localStorage.setItem(SORT_MODE_KEY, restored.sortMode)
        }
        if (restored.sortDirection) {
          localStorage.setItem(SORT_DIRECTION_KEY, restored.sortDirection)
        }
        return restored
      }
    }

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

const sortMode = ref(normalizeSortMode(localStorage.getItem(SORT_MODE_KEY)))
const sortDirection = ref(normalizeSortDirection(localStorage.getItem(SORT_DIRECTION_KEY), sortMode.value))

export function useFileSystem() {
  const saved = loadFromStorage()
  const defaultData = createDefaultFiles()

  const files = ref(saved?.files || defaultData.files)
  const currentFileId = ref(saved?.currentFileId || defaultData.currentFileId)
  const importBackupInfo = ref(getStoredImportBackupInfo())
  const now = Date.now()

  if (saved?.sortMode) {
    sortMode.value = saved.sortMode
    localStorage.setItem(SORT_MODE_KEY, saved.sortMode)
  }
  if (saved?.sortDirection) {
    sortDirection.value = normalizeSortDirection(saved.sortDirection, saved.sortMode)
    localStorage.setItem(SORT_DIRECTION_KEY, sortDirection.value)
  }

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

  function backupCurrentWorkspace(reason = 'import') {
    const workspace = createWorkspaceData(files.value, currentFileId.value, sortMode.value, sortDirection.value, { includeArchived: true })
    const backup = {
      createdAt: Date.now(),
      reason,
      workspace
    }

    try {
      localStorage.setItem(IMPORT_BACKUP_KEY, JSON.stringify(backup))
      importBackupInfo.value = buildImportBackupInfo(backup)
      return true
    } catch (e) {
      console.error('Failed to create import backup:', e)
      return false
    }
  }

  function makeUniqueNameInList(fileList, parentId, name, type = 'file') {
    const fallback = type === 'folder' ? '新建文件夹' : '新建文档.md'
    const requestedName = String(name || fallback).trim() || fallback
    const normalized = normalizeName(requestedName)
    const hasName = (candidate) => fileList.some((file) =>
      file.parentId === parentId &&
      !file.isArchived &&
      normalizeName(file.name) === normalizeName(candidate)
    )

    if (!normalized || !hasName(requestedName)) return requestedName

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
    } while (hasName(candidate))

    return candidate
  }

  function mergeWorkspace(restored) {
    const idMap = new Map()
    restored.files.forEach((file) => {
      idMap.set(file.id, generateId())
    })

    const nextFiles = [...files.value]
    const importedFiles = restored.files.map((file) => {
      const imported = {
        ...file,
        id: idMap.get(file.id),
        parentId: file.parentId ? idMap.get(file.parentId) || null : null,
        tags: Array.isArray(file.tags) ? [...file.tags] : [],
        createdAt: toTimestamp(file.createdAt, Date.now()),
        updatedAt: Date.now(),
        lastOpenedAt: Date.now(),
        order: Date.now() + nextFiles.length
      }

      imported.name = makeUniqueNameInList(nextFiles, imported.parentId, imported.name, imported.type)
      nextFiles.push(imported)
      return imported
    })

    const importedCurrentId = idMap.get(restored.currentFileId)
    const currentImportedFile = importedFiles.find((file) => file.id === importedCurrentId && file.type === 'file')
      || importedFiles.find((file) => file.type === 'file' && !file.isArchived)
      || importedFiles.find((file) => file.type === 'file')

    files.value = nextFiles
    currentFileId.value = currentImportedFile?.id || currentFileId.value
    persist()

    return {
      files: files.value,
      currentFileId: currentFileId.value,
      sortMode: sortMode.value,
      sortDirection: sortDirection.value,
      importedCount: importedFiles.length
    }
  }

  function replaceWorkspace(restored) {
    files.value = restored.files
    currentFileId.value = restored.currentFileId
    setSortMode(restored.sortMode, { toggleSame: false, direction: restored.sortDirection })
    persist()

    return {
      files: files.value,
      currentFileId: currentFileId.value,
      sortMode: sortMode.value,
      sortDirection: sortDirection.value,
      importedCount: restored.files.length
    }
  }

  function importWorkspace(workspace, options = {}) {
    const restored = normalizeWorkspaceData(workspace)
    if (!restored) return { ok: false, error: 'invalid_workspace' }

    const mode = options.mode === 'merge' ? 'merge' : 'replace'
    const backupCreated = backupCurrentWorkspace(mode === 'merge' ? 'merge-import' : 'replace-import')
    if (!backupCreated) return { ok: false, error: 'backup_failed' }

    const result = mode === 'merge'
      ? mergeWorkspace(restored)
      : replaceWorkspace(restored)

    return {
      ok: true,
      mode,
      backupCreated,
      ...result
    }
  }

  function restoreImportBackup() {
    const backup = loadImportBackup()
    const restored = normalizeWorkspaceData(backup?.workspace)
    if (!restored) return { ok: false, error: 'missing_backup' }

    const result = replaceWorkspace(restored)
    return {
      ok: true,
      mode: 'restore',
      ...result
    }
  }

  function exportWorkspace(options = {}) {
    const workspace = createWorkspaceData(files.value, currentFileId.value, sortMode.value, sortDirection.value, {
      includeArchived: options.includeArchived !== false
    })
    const date = new Date(workspace.exportedAt).toISOString().slice(0, 10)
    const blob = new Blob([JSON.stringify(workspace, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `blur-editor-workspace-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
    return workspace
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

    const originalParentId = file.parentId
    const originalIndex = originalParentId === targetParentId
      ? getActiveSiblings(targetParentId).findIndex((item) => item.id === fileId)
      : -1
    const siblings = getActiveSiblings(targetParentId).filter((f) => f.id !== fileId)
    let nextIndex = Math.max(0, Math.min(Number(targetIndex) || 0, siblings.length))
    if (originalIndex >= 0 && originalIndex < nextIndex) {
      nextIndex -= 1
    }
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

  function setSortMode(mode, options = {}) {
    const nextMode = normalizeSortMode(mode)
    const hasDirection = Object.prototype.hasOwnProperty.call(options, 'direction')
    if (nextMode === sortMode.value) {
      if (options.toggleSame === false) {
        sortDirection.value = hasDirection
          ? normalizeSortDirection(options.direction, nextMode)
          : normalizeSortDirection(sortDirection.value, nextMode)
        localStorage.setItem(SORT_MODE_KEY, nextMode)
        localStorage.setItem(SORT_DIRECTION_KEY, sortDirection.value)
        return
      }
      setSortDirection(sortDirection.value === 'asc' ? 'desc' : 'asc')
      return
    }
    sortMode.value = nextMode
    sortDirection.value = hasDirection
      ? normalizeSortDirection(options.direction, nextMode)
      : getDefaultSortDirection(nextMode)
    localStorage.setItem(SORT_MODE_KEY, nextMode)
    localStorage.setItem(SORT_DIRECTION_KEY, sortDirection.value)
  }

  function setSortDirection(direction) {
    const nextDirection = normalizeSortDirection(direction, sortMode.value)
    sortDirection.value = nextDirection
    localStorage.setItem(SORT_DIRECTION_KEY, nextDirection)
  }

  function getSortedFiles(fileList) {
    const sorted = [...fileList]
    const direction = sortDirection.value === 'desc' ? -1 : 1
    switch (sortMode.value) {
      case 'name':
        return sorted.sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return direction * a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
        })
      case 'date':
        return sorted.sort((a, b) => direction * (a.updatedAt - b.updatedAt))
      case 'size':
        return sorted.sort((a, b) => {
          if (a.type === 'folder' && b.type !== 'folder') return -1
          if (a.type !== 'folder' && b.type === 'folder') return 1
          return direction * ((a.content?.length || 0) - (b.content?.length || 0))
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
    sortDirection,
    importBackupInfo,
    getChildren,
    getSortedFiles,
    importWorkspace,
    restoreImportBackup,
    exportWorkspace,
    backupCurrentWorkspace,
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
    setSortDirection,
    addFileTag,
    removeFileTag,
    getFileTags,
    updateFileTags,
    touchFile,
    toggleFavorite
  }
}
