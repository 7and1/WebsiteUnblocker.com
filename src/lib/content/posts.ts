import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Post } from '@/payload-types'
import {
  buildContentExcerpt,
  buildGuideTagStats,
  extractLexicalText,
  slugifyTag,
  type GuideTag,
} from './postUtils'

export type GuidePost = Pick<
  Post,
  'slug' | 'title' | 'content' | 'published_date' | 'updatedAt' | 'meta_title' | 'meta_description' | 'tags'
>

export {
  buildContentExcerpt,
  buildGuideTagStats,
  extractLexicalText,
  slugifyTag,
}

export type { GuideTag }

function normalizeSlug(slug: string) {
  return slug.trim().toLowerCase()
}

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizeTagLabel(tag: string) {
  return tag.trim().replace(/\s+/g, ' ')
}

export async function getPublishedPosts(limit = 50): Promise<GuidePost[]> {
  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      limit,
      sort: '-published_date',
      where: {
        published_date: {
          exists: true,
        },
      },
      depth: 0,
    })

    return result.docs as GuidePost[]
  } catch {
    return []
  }
}

export async function getPublishedPostSlugs(limit = 1000): Promise<string[]> {
  const posts = await getPublishedPosts(limit)
  return posts
    .map((post) => post.slug)
    .filter((slug): slug is string => Boolean(slug))
}

export async function getPublishedPostBySlug(slug: string): Promise<GuidePost | null> {
  const normalizedSlug = normalizeSlug(slug)

  if (!normalizedSlug) {
    return null
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      limit: 1,
      sort: '-published_date',
      where: {
        and: [
          {
            slug: {
              equals: normalizedSlug,
            },
          },
          {
            published_date: {
              exists: true,
            },
          },
        ],
      },
      depth: 0,
    })

    const post = result.docs[0]
    return (post as GuidePost | undefined) ?? null
  } catch {
    return null
  }
}

export async function getPublishedPostsByTag(tag: string, limit = 50): Promise<GuidePost[]> {
  const normalizedTag = normalizeTagLabel(tag)

  if (!normalizedTag) {
    return []
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const result = await payload.find({
      collection: 'posts',
      limit,
      sort: '-published_date',
      where: {
        and: [
          {
            tags: {
              in: [normalizedTag],
            },
          },
          {
            published_date: {
              exists: true,
            },
          },
        ],
      },
      depth: 0,
    })

    return result.docs as GuidePost[]
  } catch {
    return []
  }
}

export async function getGuideTagStats(limit = 1000): Promise<GuideTag[]> {
  const posts = await getPublishedPosts(limit)
  return buildGuideTagStats(posts)
}

export async function resolveGuideTagFromSlug(tagSlug: string): Promise<GuideTag | null> {
  const normalizedInput = normalizeSlug(tagSlug)

  if (!normalizedInput) {
    return null
  }

  const tags = await getGuideTagStats(1000)
  const decodedInput = safeDecode(normalizedInput)
  const slugFromDecoded = slugifyTag(decodedInput)

  const resolved = tags.find(
    (tag) =>
      tag.slug === normalizedInput ||
      (slugFromDecoded && tag.slug === slugFromDecoded) ||
      tag.name.toLowerCase() === decodedInput.toLowerCase()
  )

  return resolved || null
}

export async function getPublishedPostsByTagSlug(
  tagSlug: string,
  limit = 50
): Promise<{ tag: GuideTag | null; posts: GuidePost[] }> {
  const tag = await resolveGuideTagFromSlug(tagSlug)

  if (!tag) {
    return {
      tag: null,
      posts: [],
    }
  }

  const posts = await getPublishedPostsByTag(tag.name, limit)

  return {
    tag,
    posts,
  }
}

export async function getLatestGuideUpdatedAt(): Promise<string | null> {
  const posts = await getPublishedPosts(1)
  const latest = posts[0]

  if (!latest) {
    return null
  }

  return latest.updatedAt || latest.published_date || null
}
