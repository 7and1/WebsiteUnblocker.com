export interface GuideTag {
  name: string
  slug: string
  count: number
}

function normalizeTagLabel(tag: string) {
  return tag.trim().replace(/\s+/g, ' ')
}

function collectText(node: unknown, chunks: string[]) {
  if (!node || typeof node !== 'object') {
    return
  }

  const record = node as Record<string, unknown>

  if (record.root && typeof record.root === 'object') {
    collectText(record.root, chunks)
  }

  if (typeof record.text === 'string') {
    chunks.push(record.text)
  }

  if (Array.isArray(record.children)) {
    for (const child of record.children) {
      collectText(child, chunks)
    }
  }
}

export function slugifyTag(tag: string): string {
  return normalizeTagLabel(tag)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function extractLexicalText(content: unknown): string {
  const chunks: string[] = []
  collectText(content, chunks)
  return chunks
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function buildContentExcerpt(content: unknown, fallback: string, maxLength = 160): string {
  const plainText = extractLexicalText(content)
  const source = plainText || fallback

  if (source.length <= maxLength) {
    return source
  }

  return `${source.slice(0, maxLength - 3).trimEnd()}...`
}

export function buildGuideTagStats(posts: Array<{ tags?: string[] | null }>): GuideTag[] {
  const counter = new Map<string, number>()

  for (const post of posts) {
    const tags = post.tags || []

    for (const tag of tags) {
      const normalized = normalizeTagLabel(tag)

      if (!normalized) {
        continue
      }

      counter.set(normalized, (counter.get(normalized) || 0) + 1)
    }
  }

  return Array.from(counter.entries())
    .map(([name, count]) => ({
      name,
      slug: slugifyTag(name),
      count,
    }))
    .filter((tag) => Boolean(tag.slug))
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count
      }

      return a.name.localeCompare(b.name)
    })
}
