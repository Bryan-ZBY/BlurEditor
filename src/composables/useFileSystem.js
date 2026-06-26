import { ref, computed } from 'vue'

const STORAGE_KEY = 'file_system_v1'
const CURRENT_FILE_KEY = 'current_file_id'
const SORT_MODE_KEY = 'file_sort_mode'

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9)
}

const sortMode = ref(localStorage.getItem(SORT_MODE_KEY) || 'name')

function createDefaultFiles() {
  const rootId = generateId()
  const welcomeId = generateId()
  return {
    files: [
      {
        id: welcomeId,
        name: '欢迎使用.md',
        type: 'file',
        parentId: null,
        content: `# 欢迎使用 Markdown 编辑器

这是一个**纯粹**的 Markdown 编辑和预览工具。

## 功能特点

- 文件管理：支持新建、重命名、删除、移动文件和文件夹
- 实时预览：支持分栏预览和全屏预览
- 语法高亮：代码块自动语法高亮
- 主题切换：支持白天/夜间模式

## Markdown 语法示例

### 标题
# 一级标题
## 二级标题
### 三级标题

### 文本样式
**粗体**、*斜体*、~~删除线~~、\`行内代码\`

### 列表
- 无序列表项 1
- 无序列表项 2
  - 嵌套项

1. 有序列表项 1
2. 有序列表项 2

### 代码块
\`\`\`javascript
function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('World'));
\`\`\`

### 引用
> 这是一段引用文字
> 可以有多行

### 表格
| 名称 | 类型 | 说明 |
|------|------|------|
| id | string | 唯一标识 |
| name | string | 文件名称 |

### 链接
[Markdown 指南](https://www.markdownguide.org/)

---

开始你的创作吧！`,
        isArchived: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        order: 0
      }
    ],
    currentFileId: welcomeId
  }
}

function loadFromStorage() {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      return JSON.parse(data)
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

export function useFileSystem() {
  const saved = loadFromStorage()
  const defaultData = createDefaultFiles()

  const files = ref(saved?.files || defaultData.files)
  const currentFileId = ref(saved?.currentFileId || defaultData.currentFileId)

  const currentFile = computed(() =>
    files.value.find(f => f.id === currentFileId.value) || null
  )

  const rootFiles = computed(() =>
    files.value
      .filter(f => f.parentId === null && !f.isArchived)
      .sort((a, b) => a.order - b.order)
  )

  const archivedFiles = computed(() =>
    files.value.filter(f => f.isArchived)
  )

  function getChildren(parentId) {
    return files.value
      .filter(f => f.parentId === parentId && !f.isArchived)
      .sort((a, b) => a.order - b.order)
  }

  function persist() {
    saveToStorage(files.value, currentFileId.value)
  }

  function createFile(parentId = null, name = '未命名.md', content = '', tags = []) {
    const siblings = files.value.filter(f => f.parentId === parentId && !f.isArchived)
    const baseName = name.replace(/\.md$/, '')
    const ext = '.md'
    
    let finalName = name
    let counter = 1
    while (siblings.some(s => s.name === finalName)) {
      finalName = `${baseName}${counter}${ext}`
      counter++
    }
    
    const newFile = {
      id: generateId(),
      name: finalName,
      type: 'file',
      parentId,
      content,
      tags,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFile)
    persist()
    return newFile
  }

  function createFolder(parentId = null, name = '新建文件夹') {
    const siblings = files.value.filter(f => f.parentId === parentId && !f.isArchived)
    
    let finalName = name
    let counter = 1
    while (siblings.some(s => s.name === finalName)) {
      finalName = `${name}${counter}`
      counter++
    }
    
    const newFolder = {
      id: generateId(),
      name: finalName,
      type: 'folder',
      parentId,
      content: '',
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFolder)
    persist()
    return newFolder
  }

  function renameFile(fileId, newName) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      file.name = newName
      file.updatedAt = Date.now()
      persist()
    }
  }

  function deleteFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (!file) return

    // 如果是文件夹，递归删除所有子项
    if (file.type === 'folder') {
      const children = files.value.filter(f => f.parentId === fileId)
      children.forEach(child => deleteFile(child.id))
    }

    files.value = files.value.filter(f => f.id !== fileId)

    if (currentFileId.value === fileId) {
      const remaining = files.value.filter(f => f.type === 'file')
      currentFileId.value = remaining.length > 0 ? remaining[0].id : null
    }
    persist()
  }

  function renameFile(fileId, newName) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      file.name = newName
      file.updatedAt = Date.now()
      persist()
    }
  }

  function moveFile(fileId, newParentId) {
    const file = files.value.find(f => f.id === fileId)
    if (file && file.id !== newParentId) {
      // 防止将文件夹移动到自己的子文件夹中
      if (file.type === 'folder') {
        let parent = newParentId
        while (parent) {
          const p = files.value.find(f => f.id === parent)
          if (!p) break
          if (p.id === file.id) return
          parent = p.parentId
        }
      }
      file.parentId = newParentId
      file.updatedAt = Date.now()
      persist()
    }
  }

  function archiveFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      file.isArchived = true
      file.updatedAt = Date.now()
      persist()
    }
  }

  function unarchiveFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      file.isArchived = false
      file.updatedAt = Date.now()
      persist()
    }
  }

  function duplicateFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (!file || file.type !== 'file') return null

    const newFile = {
      ...file,
      id: generateId(),
      name: file.name.replace(/(\.[^.]*)?$/, ' - 副本$1'),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      order: Date.now()
    }
    files.value.push(newFile)
    persist()
    return newFile
  }

  function updateFileContent(fileId, content) {
    const file = files.value.find(f => f.id === fileId)
    if (file && file.type === 'file') {
      file.content = content
      file.updatedAt = Date.now()
      persist()
    }
  }

  function setCurrentFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (file && file.type === 'file') {
      currentFileId.value = fileId
      persist()
    }
  }

  function exportFile(fileId) {
    const file = files.value.find(f => f.id === fileId)
    if (!file || file.type !== 'file') return

    const blob = new Blob([file.content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.name
    a.click()
    URL.revokeObjectURL(url)
  }

  function getFilePath(fileId) {
    const path = []
    let current = files.value.find(f => f.id === fileId)
    while (current) {
      path.unshift(current.name)
      current = files.value.find(f => f.id === current.parentId)
    }
    return path.join(' / ')
  }

  function getParentFolderIds(fileId) {
    const ids = []
    let current = files.value.find(f => f.id === fileId)
    while (current && current.parentId) {
      ids.unshift(current.parentId)
      current = files.value.find(f => f.id === current.parentId)
    }
    return ids
  }

  function addFileTag(fileId, tagId) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      if (!file.tags) file.tags = []
      if (!file.tags.includes(tagId)) {
        file.tags.push(tagId)
        persist()
        return true
      }
    }
    return false
  }

  function removeFileTag(fileId, tagId) {
    const file = files.value.find(f => f.id === fileId)
    if (file && file.tags) {
      const index = file.tags.indexOf(tagId)
      if (index !== -1) {
        file.tags.splice(index, 1)
        persist()
        return true
      }
    }
    return false
  }

  function getFileTags(fileId) {
    const file = files.value.find(f => f.id === fileId)
    return file?.tags || []
  }

  function updateFileTags(fileId, tagIds) {
    const file = files.value.find(f => f.id === fileId)
    if (file) {
      file.tags = tagIds
      persist()
    }
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
          // 文件夹优先
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

  return {
    files,
    currentFileId,
    currentFile,
    rootFiles,
    archivedFiles,
    getChildren,
    sortMode,
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
    updateFileTags
  }
}
