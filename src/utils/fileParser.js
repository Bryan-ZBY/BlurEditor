export function readFileContent(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = reject
    reader.readAsText(file, 'utf-8')
  })
}

export function getFileName(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  const baseName = file.name.replace(/\.[^.]+$/, '')
  
  if (ext === 'md') {
    return file.name
  }
  
  return `${baseName}.md`
}
