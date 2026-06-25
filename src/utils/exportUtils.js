import { marked } from 'marked'

export function exportAsMarkdown(content, fileName) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, ensureMdExtension(fileName))
}

export function exportAsHTML(content, fileName, options = {}) {
  const { isDark = false, title = fileName } = options
  const htmlContent = marked(content)

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: ${isDark ? '#e2e8f0' : '#1e293b'};
      background: ${isDark ? '#0f172a' : '#fff'};
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    h1, h2, h3, h4, h5, h6 {
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      font-weight: 600;
      line-height: 1.3;
    }
    h1 { font-size: 2rem; border-bottom: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-bottom: 0.3em; }
    h2 { font-size: 1.5rem; border-bottom: 1px solid ${isDark ? '#334155' : '#e2e8f0'}; padding-bottom: 0.3em; }
    h3 { font-size: 1.25rem; }
    p { margin: 1em 0; }
    a { color: #3b82f6; text-decoration: none; }
    a:hover { text-decoration: underline; }
    code {
      background: ${isDark ? '#1e293b' : '#f1f5f9'};
      padding: 0.2em 0.4em;
      border-radius: 4px;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      font-size: 0.9em;
    }
    pre {
      background: ${isDark ? '#1e293b' : '#f8fafc'};
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      margin: 1em 0;
    }
    pre code {
      background: none;
      padding: 0;
      font-size: 0.875rem;
      line-height: 1.6;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      padding: 0.5em 1em;
      margin: 1em 0;
      color: ${isDark ? '#94a3b8' : '#64748b'};
      background: ${isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)'};
      border-radius: 0 8px 8px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1em 0;
    }
    th, td {
      border: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
      padding: 0.5em 1em;
      text-align: left;
    }
    th {
      background: ${isDark ? '#1e293b' : '#f8fafc'};
      font-weight: 600;
    }
    tr:nth-child(even) {
      background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
    }
    ul, ol {
      margin: 1em 0;
      padding-left: 2em;
    }
    li { margin: 0.3em 0; }
    hr {
      border: none;
      border-top: 1px solid ${isDark ? '#334155' : '#e2e8f0'};
      margin: 2em 0;
    }
    img {
      max-width: 100%;
      border-radius: 8px;
    }
    .mermaid-chart {
      display: flex;
      justify-content: center;
      margin: 1.5em 0;
    }
  </style>
</head>
<body>
  <div class="container">
    ${htmlContent}
  </div>
</body>
</html>`

  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, replaceExtension(fileName, '.html'))
}

export function exportAsPlainText(content, fileName) {
  const text = content.replace(/[#*_`~\[\]()>!-]/g, '')
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  downloadBlob(blob, replaceExtension(fileName, '.txt'))
}

export function copyAsRichText(content) {
  const htmlContent = marked(content)
  const textContent = content

  if (navigator.clipboard && window.ClipboardItem) {
    const htmlBlob = new Blob([htmlContent], { type: 'text/html' })
    const textBlob = new Blob([textContent], { type: 'text/plain' })
    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob
    })
    return navigator.clipboard.write([clipboardItem])
  }
  return navigator.clipboard.writeText(textContent)
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function ensureMdExtension(fileName) {
  if (!fileName) return 'document.md'
  if (fileName.endsWith('.md')) return fileName
  return fileName + '.md'
}

function replaceExtension(fileName, newExt) {
  if (!fileName) return 'document' + newExt
  const base = fileName.replace(/\.[^.]+$/, '')
  return base + newExt
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}
