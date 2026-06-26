import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'

const renderer = new Renderer()

renderer.code = function({ text, lang }) {
  const isMermaid = lang === 'mermaid'
  const codeHtml = hljs.getLanguage(lang)
    ? hljs.highlight(text, { language: lang }).value
    : hljs.highlightAuto(text).value

  const mermaidClass = isMermaid ? ' mermaid-source' : ''

  return `
    <div class="code-block-wrapper${mermaidClass}" data-lang="${lang || 'text'}">
      <div class="code-block-header">
        <span>${lang || 'text'}</span>
        <button class="copy-btn" onclick="navigator.clipboard.writeText(this.closest('.code-block-wrapper').querySelector('code').innerText)">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          <span>复制</span>
        </button>
      </div>
      <pre><code class="hljs language-${lang || 'text'}">${codeHtml}</code></pre>
    </div>
  `
}

marked.use({
  renderer,
  breaks: true,
  gfm: true
})

export function exportAsMarkdown(content, fileName) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, ensureMdExtension(fileName))
}

export function exportAsHTML(content, fileName, options = {}) {
  const { isDark = false, title = fileName } = options
  const htmlContent = marked(content)

  const primaryColor = isDark ? '#e2e8f0' : '#1e293b'
  const secondaryColor = isDark ? '#94a3b8' : '#64748b'
  const accentIndigo = '#6366f1'
  const accentPurple = '#8b5cf6'
  const borderColor = isDark ? '#334155' : '#e2e8f0'
  const hoverBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'

  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css">
  <style>
    :root {
      --text-primary: ${primaryColor};
      --text-secondary: ${secondaryColor};
      --text-muted: ${secondaryColor};
      --accent-indigo: ${accentIndigo};
      --accent-purple: ${accentPurple};
      --border-color: ${borderColor};
      --border-color-strong: ${isDark ? '#475569' : '#cbd5e1'};
      --hover-bg: ${hoverBg};
      --hover-bg-strong: ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'};
      --transition-fast: 0.15s;
      --transition-normal: 0.25s;
    }
    
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: var(--text-primary);
      background: ${isDark ? '#0f172a' : '#ffffff'};
      padding: 2rem;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }

    .markdown-preview {
      color: var(--text-primary);
      line-height: 1.7;
      font-size: 16px;
      word-wrap: break-word;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
    }

    .markdown-preview h1,
    .markdown-preview h2,
    .markdown-preview h3,
    .markdown-preview h4,
    .markdown-preview h5,
    .markdown-preview h6 {
      margin-top: 28px;
      margin-bottom: 16px;
      font-weight: 700;
      line-height: 1.25;
      color: var(--text-primary);
      letter-spacing: -0.02em;
    }

    .markdown-preview h1 {
      font-size: 2.2em;
      padding-bottom: 0.4em;
      border-bottom: 2px solid var(--border-color);
    }

    .markdown-preview h2 {
      font-size: 1.6em;
      padding-bottom: 0.35em;
      border-bottom: 1px solid var(--border-color);
      position: relative;
    }

    .markdown-preview h2::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-indigo), var(--accent-purple));
      border-radius: 2px;
    }

    .markdown-preview h3 { font-size: 1.3em; font-weight: 600; }
    .markdown-preview h4 { font-size: 1.1em; font-weight: 600; }
    .markdown-preview h5 { font-size: 0.95em; font-weight: 600; }
    .markdown-preview h6 {
      font-size: 0.85em;
      color: var(--text-muted);
      font-weight: 600;
    }

    .markdown-preview p {
      margin-top: 0;
      margin-bottom: 16px;
    }

    .markdown-preview strong {
      font-weight: 700;
      color: var(--text-primary);
    }

    .markdown-preview em {
      font-style: italic;
      color: var(--text-secondary);
    }

    .markdown-preview del {
      text-decoration: line-through;
      opacity: 0.6;
      text-decoration-color: var(--accent-indigo);
      text-decoration-thickness: 2px;
    }

    .markdown-preview code {
      padding: 0.2em 0.45em;
      margin: 0 2px;
      font-size: 85%;
      font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
      background: var(--hover-bg);
      border-radius: 5px;
      color: var(--accent-indigo);
      word-break: break-word;
    }

    .markdown-preview pre {
      padding: 0;
      margin: 0;
      overflow: hidden;
      font-size: 14px;
      line-height: 1.6;
      background: transparent;
      border: none;
      border-radius: 0;
    }

    .markdown-preview pre code {
      display: block;
      padding: 1em 1.25em;
      overflow-x: auto;
      margin: 0;
      line-height: 1.6;
      word-wrap: break-word;
      word-break: break-all;
      white-space: pre-wrap;
      background-color: transparent;
      border: none;
      font-size: 100%;
      border-radius: 0;
    }

    .markdown-preview .code-block-wrapper {
      position: relative;
      margin: 1.25em 0;
      border-radius: 8px;
      border: 1px solid rgba(30, 41, 59, 0.6);
      overflow: hidden;
      background: #0d0d0d;
    }

    .markdown-preview .code-block-wrapper:hover {
      border-color: ${isDark ? '#475569' : '#cbd5e1'};
    }

    .markdown-preview .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.4em 0.85em;
      background: rgba(30, 41, 59, 0.5);
      border-bottom: 1px solid rgba(30, 41, 59, 0.6);
      position: relative;
      z-index: 2;
    }

    .markdown-preview .code-block-header > span:first-child {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    .markdown-preview .code-block-wrapper .copy-btn {
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      padding: 0.25rem 0.55rem;
      border-radius: 5px;
      font-size: 0.7rem;
      font-weight: 500;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }

    .markdown-preview .code-block-wrapper .copy-btn:hover {
      background: var(--hover-bg-strong);
      border-color: var(--border-color-strong);
      color: var(--text-primary);
    }

    .markdown-preview .code-block-wrapper .copy-btn:active {
      background: var(--hover-bg);
    }

    .markdown-preview .hljs,
    .markdown-preview pre.hljs,
    .markdown-preview pre {
      background: transparent !important;
      border-radius: 0 !important;
      color: #e2e8f0 !important;
    }

    .markdown-preview ul,
    .markdown-preview ol {
      margin-top: 0;
      margin-bottom: 16px;
      padding-left: 2em;
    }

    .markdown-preview ul {
      list-style-type: disc;
    }

    .markdown-preview ol {
      list-style-type: decimal;
    }

    .markdown-preview li {
      margin: 0.35em 0;
    }

    .markdown-preview li > p {
      margin-top: 0.5em;
    }

    .markdown-preview ul li input[type="checkbox"] {
      margin-right: 0.5em;
      accent-color: var(--accent-indigo);
      width: 1.1em;
      height: 1.1em;
      cursor: pointer;
    }

    .markdown-preview blockquote {
      padding: 1em 1.25em;
      margin: 1.25em 0;
      color: var(--text-secondary);
      background: var(--hover-bg);
      border-radius: 0 10px 10px 0;
      position: relative;
      overflow: hidden;
    }

    .markdown-preview blockquote::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 3px;
      background: linear-gradient(180deg, var(--accent-indigo), var(--accent-purple));
    }

    .markdown-preview blockquote > :first-child {
      margin-top: 0;
    }

    .markdown-preview blockquote > :last-child {
      margin-bottom: 0;
    }

    .markdown-preview a {
      color: var(--accent-indigo);
      text-decoration: none;
      position: relative;
      font-weight: 500;
      transition: color var(--transition-fast) ease;
    }

    .markdown-preview a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(90deg, var(--accent-indigo), var(--accent-purple));
      border-radius: 1px;
      transition: width var(--transition-normal) ease;
    }

    .markdown-preview a:hover {
      color: var(--accent-purple);
    }

    .markdown-preview a:hover::after {
      width: 100%;
    }

    .markdown-preview hr {
      height: 2px;
      padding: 0;
      margin: 32px 0;
      background: linear-gradient(90deg, transparent, var(--border-color-strong), transparent);
      border: none;
      position: relative;
    }

    .markdown-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 14px;
    }

    .markdown-preview table th,
    .markdown-preview table td {
      padding: 10px 14px;
      border: 1px solid var(--border-color);
      text-align: left;
    }

    .markdown-preview table th {
      background: ${isDark ? '#1e293b' : '#f8fafc'};
      font-weight: 600;
      color: var(--text-primary);
    }

    .markdown-preview table tr:nth-child(even) {
      background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'};
    }

    .markdown-preview table tr:hover {
      background: var(--hover-bg);
    }

    .markdown-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 16px 0;
    }

    .markdown-preview .mermaid-chart {
      display: flex;
      justify-content: center;
      margin: 1.5em 0;
      background: ${isDark ? '#1e293b' : '#ffffff'};
      padding: 1em;
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .markdown-preview details {
      margin: 16px 0;
      padding: 12px 16px;
      background: var(--hover-bg);
      border-radius: 8px;
      border: 1px solid var(--border-color);
    }

    .markdown-preview summary {
      cursor: pointer;
      font-weight: 600;
      color: var(--text-primary);
      list-style: none;
      position: relative;
      padding-left: 1.2em;
    }

    .markdown-preview summary::before {
      content: '▶';
      position: absolute;
      left: 0;
      font-size: 0.7em;
      color: var(--accent-indigo);
      transition: transform 0.2s;
    }

    .markdown-preview details[open] summary::before {
      transform: rotate(90deg);
    }

    .markdown-preview details > :last-child {
      margin-bottom: 0;
      margin-top: 8px;
    }

    .markdown-preview kbd {
      display: inline-flex;
      align-items: center;
      padding: 0.15em 0.4em;
      font-size: 0.75em;
      font-family: 'SF Mono', 'Fira Code', monospace;
      background: var(--hover-bg);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      color: var(--text-secondary);
      box-shadow: 0 1px 0 rgba(0,0,0,0.05);
    }
  </style>
</head>
<body>
  <div class="container markdown-preview">
    ${htmlContent}
  </div>
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.0/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'dark' });
  </script>
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
