function slugify(input) {
  const base = input
    .replace(/<[^>]+>/g, '')
    .replace(/[`*_~[\](){}#+.!]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\u4e00-\u9fa5]/g, (m) => m)
    .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return base || 'heading'
}

function parseHeadings(markdown) {
  const lines = (markdown || '').split('\n')
  const headings = []
  const slugCount = new Map()
  let inCodeBlock = false
  let inMathBlock = false

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const line = raw.trim()

    if (/^```/.test(line)) {
      inCodeBlock = !inCodeBlock
      continue
    }
    if (/^\$\$/.test(line)) {
      inMathBlock = !inMathBlock
      continue
    }
    if (inCodeBlock || inMathBlock) {
      continue
    }

    const m = /^(#{1,6})\s+(.+)$/.exec(line)
    if (!m) {
      continue
    }

    const level = m[1].length
    const text = m[2].trim()
    const rawSlug = slugify(text)
    const count = slugCount.get(rawSlug) || 0
    const finalSlug = `${rawSlug}${count ? `-${count}` : ''}`
    slugCount.set(rawSlug, count + 1)

    headings.push({
      id: finalSlug,
      level,
      text,
      line: i,
      offset: i
    })
  }

  return headings
}

export function useOutlineParser(content) {
  function getHeadings() {
    return parseHeadings(content.value ?? '')
  }

  function getHeadingTree() {
    const flat = getHeadings()
    const roots = []
    const stack = []

    flat.forEach((item) => {
      const node = { ...item, children: [] }
      while (stack.length && stack[stack.length - 1].level >= node.level) {
        stack.pop()
      }
      if (stack.length === 0) {
        roots.push(node)
      } else {
        stack[stack.length - 1].children.push(node)
      }
      stack.push(node)
    })

    return roots
  }

  return {
    getHeadings,
    getHeadingTree
  }
}
