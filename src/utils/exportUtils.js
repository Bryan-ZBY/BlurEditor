import { marked, Renderer } from 'marked'
import hljs from 'highlight.js'

const FONT_FAMILY_OPTIONS = {
  system: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif",
  serif: "fangsong, 'FangSong', STFangSong, 'STFangsong', serif",
  mono: "'SF Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace"
}

const DEFAULT_EXPORT_OPTIONS = {
  isDark: false,
  themeMode: 'current',
  title: 'document.md',
  previewFont: 'system',
  previewFontSize: '16',
  previewLineHeight: '1.75',
  tableOfContentsTitle: '目录',
  includeTableOfContents: true,
  previewPageWidth: 100,
  offline: false,
  includeExternalLinks: true,
  autoPrint: false
}

const THEME_PRESETS = {
  light: 'beige',
  dark: 'midnight'
}

function createThemeProbe(themeName) {
  const probe = document.createElement('div')
  probe.setAttribute('data-theme', themeName)
  probe.style.position = 'absolute'
  probe.style.inset = '-9999px 0 0 -9999px'
  probe.style.opacity = '0'
  probe.style.pointerEvents = 'none'
  return probe
}

function readThemeToken(styles, key, fallback) {
  return styles.getPropertyValue(key).trim() || fallback
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = String(text ?? '')
  return div.innerHTML
}

function resolveThemeTokens(themeMode = 'current') {
  const mode = THEME_PRESETS[themeMode] ? themeMode : 'current'
  const useProbe = mode !== 'current'
  let probe = null
  let styles = getComputedStyle(document.documentElement)

  if (useProbe) {
    probe = createThemeProbe(THEME_PRESETS[mode])
    document.body.appendChild(probe)
    styles = getComputedStyle(probe)
  }

  try {
    return {
      editorBg: readThemeToken(styles, '--editor-bg', '#ffffff'),
      previewBg: readThemeToken(styles, '--preview-bg', '#ffffff'),
      textPrimary: readThemeToken(styles, '--text-primary', '#111827'),
      textSecondary: readThemeToken(styles, '--text-secondary', '#334155'),
      textMuted: readThemeToken(styles, '--text-muted', '#64748b'),
      accentIndigo: readThemeToken(styles, '--accent-indigo', '#6366f1'),
      accentPurple: readThemeToken(styles, '--accent-purple', '#8b5cf6'),
      borderColor: readThemeToken(styles, '--border-color', '#e2e8f0'),
      borderStrong: readThemeToken(styles, '--border-color-strong', '#cbd5e1'),
      hoverBg: readThemeToken(styles, '--hover-bg', 'rgba(0,0,0,0.03)'),
      hoverBgStrong: readThemeToken(styles, '--hover-bg-strong', 'rgba(0,0,0,0.06)'),
      editorText: readThemeToken(styles, '--editor-text', '#1f2937'),
      menuBg: readThemeToken(styles, '--menu-bg', '#ffffff'),
      menuBorder: readThemeToken(styles, '--menu-border', '#e5e7eb')
    }
  } finally {
    if (probe && probe.parentNode) {
      probe.parentNode.removeChild(probe)
    }
  }
}

function clampPageWidth(value) {
  const number = Number(value)
  const safe = Number.isFinite(number) ? number : 100
  return Math.max(40, Math.min(100, safe))
}

function slugifyHeading(text) {
  const base = String(text || '')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~[\](){}#+.!]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fff\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'heading'
}

function extractHeadings(markdown) {
  const lines = String(markdown || '').split('\n')
  const headings = []
  const slugCount = new Map()
  let inCodeBlock = false
  let inMathBlock = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (/^\$\$/.test(line)) {
      inMathBlock = !inMathBlock
      continue
    }
    if (inCodeBlock || inMathBlock) continue

    const match = /^(#{1,6})\s+(.+)$/.exec(line)
    if (!match) continue

    const level = match[1].length
    const text = match[2].trim()
    const rawSlug = slugifyHeading(text)
    const index = slugCount.get(rawSlug) || 0
    const id = `${rawSlug}${index ? `-${index}` : ''}`
    slugCount.set(rawSlug, index + 1)
    headings.push({ id, level, text, line: i, offset: i })
  }

  return headings
}

function addHeadingIds(html, headings) {
  let index = 0
  return html.replace(/<(h[1-6])>([\s\S]*?)<\/\1>/g, (match, level, content) => {
    const heading = headings[index++]
    if (!heading?.id) return match
    return `<${level} id="${escapeHtml(heading.id)}">${content}</${level}>`
  })
}

function buildTableOfContents(headings, title = '目录') {
  if (!headings.length) return ''

  const items = headings
    .map((heading) => `<li class="toc-item toc-level-${heading.level}"><a href="#${escapeHtml(heading.id)}">${escapeHtml(heading.text)}</a></li>`)
    .join('\n')

  return `
    <nav class="markdown-toc">
      <h2>${escapeHtml(title)}</h2>
      <ul class="toc-list">
        ${items}
      </ul>
    </nav>
  `
}

function createRenderer() {
  const renderer = new Renderer()

  renderer.code = function({ text, lang }) {
    const safeLang = lang || 'text'
    const codeHtml = hljs.getLanguage(safeLang)
      ? hljs.highlight(text, { language: safeLang }).value
      : hljs.highlightAuto(text).value

    const mermaidClass = safeLang === 'mermaid' ? ' mermaid-source' : ''

    return `
      <div class="code-block-wrapper${mermaidClass}" data-lang="${safeLang}" data-raw="${encodeURIComponent(text || '')}">
        <div class="code-block-header">
          <span>${safeLang}</span>
          <button class="copy-btn" onclick="window.__blurExportCopyCode(this)">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            <span>复制</span>
          </button>
        </div>
        <pre><code class="hljs language-${safeLang}">${codeHtml}</code></pre>
      </div>
    `
  }

  return renderer
}

function buildExportStyles(theme, options) {
  const font = FONT_FAMILY_OPTIONS[options.previewFont] || FONT_FAMILY_OPTIONS.system
  const isDark = Boolean(options.isDark)
  const fontSize = `${options.previewFontSize || 16}px`
  const width = `${clampPageWidth(options.previewPageWidth)}%`

  return `
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: ${font};
      color: ${theme.textPrimary};
      background: ${theme.previewBg};
      line-height: 1.7;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .container {
      width: 100%;
      max-width: ${width};
      margin: 0 auto;
      padding: 2rem 1.25rem;
      background: ${theme.editorBg};
      min-height: 100vh;
    }
    .markdown-preview {
      color: ${theme.textPrimary};
      line-height: ${options.previewLineHeight};
      font-size: ${fontSize};
      font-family: ${font};
      overflow-wrap: break-word;
      word-wrap: break-word;
      word-break: break-word;
    }
    .markdown-preview h1,
    .markdown-preview h2,
    .markdown-preview h3,
    .markdown-preview h4,
    .markdown-preview h5,
    .markdown-preview h6 {
      color: ${theme.textPrimary};
      margin-top: 1.35em;
      margin-bottom: 0.6em;
      line-height: 1.25;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .markdown-preview h1 {
      font-size: 2rem;
      border-bottom: 2px solid ${theme.borderColor};
      padding-bottom: 0.4rem;
      background: linear-gradient(135deg, ${theme.textPrimary} 0%, ${theme.accentIndigo} 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      color: ${theme.textPrimary};
    }
    .markdown-preview h2 {
      font-size: 1.55rem;
      border-bottom: 1px solid ${theme.borderColor};
      padding-bottom: 0.3rem;
    }
    .markdown-preview h2::after {
      content: '';
      display: block;
      width: 58px;
      height: 2px;
      margin-top: 0.32rem;
      background: linear-gradient(90deg, ${theme.accentIndigo}, ${theme.accentPurple});
      border-radius: 2px;
    }
    .markdown-preview p,
    .markdown-preview ul,
    .markdown-preview ol {
      margin-top: 0;
      margin-bottom: 1rem;
    }
    .markdown-preview a { color: ${theme.accentIndigo}; }
    .markdown-preview a:hover { color: ${theme.accentPurple}; }
    .markdown-preview pre {
      margin: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      overflow: hidden;
      line-height: 1.6;
    }
    .markdown-preview pre code {
      display: block;
      padding: 1em 1.25em;
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-word;
      border: 0;
      border-radius: 0;
      color: ${isDark ? '#e2e8f0' : theme.textPrimary};
      background: transparent;
    }
    .markdown-preview code {
      font-family: ${FONT_FAMILY_OPTIONS.mono};
      font-size: 85%;
      padding: 0.18em 0.45em;
      border-radius: 5px;
      background: ${theme.hoverBg};
      color: ${theme.textPrimary};
      white-space: pre-wrap;
      word-break: break-word;
    }
    .markdown-preview .code-block-wrapper {
      position: relative;
      margin: 1.25em 0;
      border-radius: 8px;
      border: 1px solid ${theme.borderColor};
      overflow: hidden;
      background: ${isDark ? '#0d0d0d' : `${theme.hoverBgStrong}`};
      transition: border-color 0.2s ease;
    }
    .markdown-preview .code-block-wrapper:hover {
      border-color: ${theme.borderStrong};
    }
    .markdown-preview .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.4rem 0.85rem;
      background: ${isDark ? 'rgba(30, 41, 59, 0.5)' : 'rgba(241,245,249,0.95)'};
      border-bottom: 1px solid ${isDark ? 'rgba(30, 41, 59, 0.6)' : 'rgba(100,116,139,0.26)'};
      color: ${theme.textMuted};
      font-size: 0.75rem;
    }
    .markdown-preview .copy-btn {
      background-color: transparent;
      border: 1px solid ${theme.borderColor};
      color: ${theme.textMuted};
      padding: 0.25rem 0.55rem;
      border-radius: 5px;
      font-size: 0.7rem;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .markdown-preview .copy-btn:hover {
      background: ${theme.hoverBg};
      border-color: ${theme.borderStrong};
      color: ${theme.textPrimary};
    }
    .markdown-preview .copy-btn:active {
      background: ${theme.hoverBgStrong};
    }
    .markdown-preview ul { margin-left: 1.3rem; }
    .markdown-preview ol { margin-left: 1.3rem; }
    .markdown-preview img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 0.5rem 0;
      border: 1px solid ${theme.borderColor};
    }
    .markdown-preview blockquote {
      margin: 1.25em 0;
      padding: 1em 1.2em;
      color: ${theme.textSecondary};
      background: ${theme.hoverBg};
      border-left: 3px solid ${theme.accentIndigo};
      border-radius: 0 8px 8px 0;
    }
    .markdown-preview hr {
      border: none;
      height: 2px;
      margin: 2rem 0;
      background: linear-gradient(90deg, transparent, ${theme.borderStrong}, transparent);
    }
    .markdown-preview table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.2rem 0;
      border: 1px solid ${theme.borderColor};
      border-radius: 10px;
      overflow: hidden;
    }
    .markdown-preview th,
    .markdown-preview td {
      border-bottom: 1px solid ${theme.borderColor};
      padding: 0.7rem 0.85rem;
      text-align: left;
    }
    .markdown-preview th { background: ${theme.hoverBgStrong}; }
    .markdown-preview tr:nth-child(even) { background: ${isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}; }
    .markdown-preview tr:hover { background: ${theme.hoverBg}; }
    .markdown-toc {
      margin-bottom: 2rem;
      padding: 1rem;
      border: 1px dashed ${theme.borderColor};
      border-radius: 10px;
      background: ${theme.menuBg};
      color: ${theme.textPrimary};
    }
    .markdown-toc h2 {
      margin-top: 0;
      margin-bottom: 0.8rem;
      font-size: 0.95rem;
      text-transform: uppercase;
      color: ${theme.textSecondary};
      letter-spacing: 0.02em;
      font-weight: 700;
    }
    .markdown-toc .toc-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .markdown-toc .toc-item {
      margin: 0.34rem 0;
      line-height: 1.4;
    }
    .markdown-toc .toc-level-2 { margin-left: 0.85rem; }
    .markdown-toc .toc-level-3 { margin-left: 1.7rem; }
    .markdown-toc .toc-level-4 { margin-left: 2.55rem; }
    .markdown-toc .toc-level-5 { margin-left: 3.4rem; }
    .markdown-toc .toc-level-6 { margin-left: 4.25rem; }
    .markdown-toc a {
      color: ${theme.textSecondary};
      text-decoration: none;
    }
    .markdown-toc a:hover {
      color: ${theme.accentIndigo};
      text-decoration: underline;
    }
    .markdown-preview mark {
      background: ${isDark ? 'rgba(79,70,229,.25)' : 'rgba(147,197,253,.45)'};
      color: inherit;
      padding: 0.05rem 0.12rem;
      border-radius: 2px;
    }
    .markdown-preview .mermaid-source { position: relative; }
    .markdown-preview .mermaid-chart svg {
      width: 100%;
      height: auto;
    }
  `
}

function buildExportScripts(options) {
  const copyScript = `
    <script>
      window.__blurExportCopyCode = function(button) {
        const wrapper = button && button.closest('.code-block-wrapper')
        if (!wrapper) return
        const code = wrapper.querySelector('code')
        if (!code) return
        const text = code.innerText
        const original = button.innerHTML
        if (!navigator.clipboard || !navigator.clipboard.writeText) {
          return
        }
        navigator.clipboard.writeText(text).then(() => {
          button.innerHTML = '已复制'
          setTimeout(() => {
            button.innerHTML = original
          }, 1800)
        }).catch(() => {
          button.innerHTML = '复制失败'
        })
      }
    </script>
  `

  if (!options.includeExternalLinks) {
    return copyScript
  }

  return `${copyScript}
    <script type="module">
      import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11.15.0/dist/mermaid.esm.min.mjs'
      mermaid.initialize({
        startOnLoad: false,
        theme: ${options.isDark ? '"dark"' : '"default"'},
        securityLevel: 'loose'
      })

      window.__blurRenderMermaidCharts = async function() {
        const nodes = Array.from(document.querySelectorAll('.mermaid-source:not([data-rendered])'))
        for (const [index, node] of nodes.entries()) {
          const raw = decodeURIComponent(node.getAttribute('data-raw') || '')
          node.setAttribute('data-rendered', '1')
          try {
            const { svg } = await mermaid.render('__blur-export-mermaid-' + index, raw)
            const target = document.createElement('div')
            target.className = 'mermaid-chart'
            target.innerHTML = svg
            node.appendChild(target)
          } catch (error) {
            console.error(error)
          }
        }
      }
      window.__blurRenderMermaidCharts()

      if (${options.autoPrint ? 'true' : 'false'}) {
        window.addEventListener('load', () => {
          setTimeout(() => {
            window.print()
          }, 300)
        })
      }
    </script>
  `
}

function buildExportHtml(content, fileName, inputOptions = {}) {
  const options = { ...DEFAULT_EXPORT_OPTIONS, ...inputOptions, title: inputOptions.title || fileName || 'document.md' }
  const theme = resolveThemeTokens(options.themeMode || 'current')
  const headings = extractHeadings(content)
  const renderer = createRenderer()
  const markdownHtml = addHeadingIds(
    marked(String(content || ''), { renderer, breaks: true, gfm: true }),
    headings
  )

  const toc = options.includeTableOfContents
    ? buildTableOfContents(headings, options.tableOfContentsTitle)
    : ''

  const themeStyle = buildExportStyles(theme, options)
  const includeExternal = Boolean(options.includeExternalLinks && !options.offline)
  const hljsTheme = options.isDark ? 'github-dark' : 'github'
  const hljsStyle = includeExternal
    ? `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/${hljsTheme}.min.css">`
    : ''

  return `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(options.title || fileName || '导出文档')}</title>
    ${hljsStyle}
    <style>${themeStyle}</style>
  </head>
  <body>
    <div class="container">
      <main class="markdown-preview">
        ${toc}
        ${markdownHtml}
      </main>
    </div>
    ${buildExportScripts({
      includeExternalLinks: includeExternal,
      isDark: options.isDark,
      autoPrint: options.autoPrint
    })}
  </body>
</html>`
}

export function exportAsMarkdown(content, fileName) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  downloadBlob(blob, ensureMdExtension(fileName))
}

export function exportAsHTML(content, fileName, options = {}) {
  const mergedOptions = { ...DEFAULT_EXPORT_OPTIONS, ...options, title: options.title || fileName }
  const html = buildExportHtml(content, fileName, mergedOptions)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  downloadBlob(blob, replaceExtension(fileName, '.html'))
}

export function exportAsPDF(content, fileName, options = {}) {
  const mergedOptions = {
    ...DEFAULT_EXPORT_OPTIONS,
    ...options,
    title: options.title || fileName,
    includeExternalLinks: true,
    autoPrint: true,
    offline: false
  }
  const html = buildExportHtml(content, fileName, mergedOptions)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const win = window.open(url, '_blank')
  if (!win) {
    alert('未能打开新窗口，请允许弹窗后重试。')
    URL.revokeObjectURL(url)
    return
  }
  win.addEventListener('load', () => {
    setTimeout(() => URL.revokeObjectURL(url), 2000)
  }, { once: true })
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
