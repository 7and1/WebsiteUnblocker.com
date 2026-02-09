import { describe, it, expect } from 'vitest'
import {
  buildContentExcerpt,
  buildGuideTagStats,
  extractLexicalText,
  slugifyTag,
} from '../postUtils'

describe('content/postUtils', () => {
  it('slugifyTag should normalize labels into URL-safe slugs', () => {
    expect(slugifyTag('  VPN Guide 2026  ')).toBe('vpn-guide-2026')
    expect(slugifyTag('Privacy & Security')).toBe('privacy-security')
  })

  it('extractLexicalText should flatten lexical nodes into plain text', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [
              { type: 'text', text: 'Hello' },
              { type: 'text', text: 'world' },
            ],
          },
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'from guide' }],
          },
        ],
      },
    }

    expect(extractLexicalText(content)).toBe('Hello world from guide')
  })

  it('buildContentExcerpt should use lexical text and truncate safely', () => {
    const content = {
      root: {
        type: 'root',
        children: [
          {
            type: 'paragraph',
            children: [{ type: 'text', text: 'a'.repeat(200) }],
          },
        ],
      },
    }

    const excerpt = buildContentExcerpt(content, 'fallback text', 50)

    expect(excerpt.length).toBeLessThanOrEqual(50)
    expect(excerpt.endsWith('...')).toBe(true)
  })

  it('buildGuideTagStats should aggregate and sort tag counts', () => {
    const stats = buildGuideTagStats([
      { tags: ['VPN Guide', 'Privacy Tips'] },
      { tags: ['VPN Guide'] },
      { tags: ['Streaming Access'] },
      { tags: ['VPN Guide', 'Streaming Access'] },
    ])

    expect(stats[0]).toMatchObject({
      name: 'VPN Guide',
      slug: 'vpn-guide',
      count: 3,
    })

    const streaming = stats.find((entry) => entry.slug === 'streaming-access')
    expect(streaming?.count).toBe(2)
  })
})
