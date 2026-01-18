/**
 * Post Repository
 *
 * Specialized repository for blog posts with optimized queries and cache-aware methods.
 */

import type { Payload, Where } from 'payload'
import {
  BaseRepository,
  type PaginatedResult,
  type QueryOptions,
  type Where as BaseWhere,
} from './BaseRepository'

export type PostStatus = 'draft' | 'published'

export interface Post {
  id: string | number  // Allow both since Payload may return number
  title: string
  slug: string
  content?: string
  published_date?: string | Date
  tags?: string[]
  meta_title?: string
  meta_description?: string
  createdAt?: string
  updatedAt?: string
}

export interface PostListOptions {
  status?: PostStatus
  tags?: string[]
  search?: string
  limit?: number
  page?: number
  sort?: string
}

export interface PostSummary {
  id: string | number  // Allow both since Payload may return number
  title: string
  slug: string
  published_date?: string | Date
  tags?: string[]
  meta_title?: string
  meta_description?: string
}

/**
 * Cache TTL durations (in milliseconds)
 */
const CACHE_TTL = {
  SHORT: 30_000, // 30 seconds
  MEDIUM: 300_000, // 5 minutes
  LONG: 3_600_000, // 1 hour
}

/**
 * Post Repository with specialized query methods
 */
export class PostRepository extends BaseRepository<Post> {
  constructor(payload: Payload) {
    super(payload, 'posts', CACHE_TTL.MEDIUM)
  }

  /**
   * Find published post by slug (for public pages)
   */
  async findBySlug(slug: string): Promise<Post | null> {
    const cacheKey = this.getCacheKey('findBySlug', { slug })

    const cached = this.getFromCache<Post>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        depth: 1,
        limit: 1,
      })

      const post = result.docs[0] as Post | null
      if (post) {
        this.setCache(cacheKey, post, CACHE_TTL.LONG)
      }

      return post
    } catch (error) {
      logger.error('findBySlug failed', error as Error, { slug })
      throw error
    }
  }

  /**
   * Get post list for public pages (optimized with field selection)
   */
  async getPublishedList(options: PostListOptions = {}): Promise<PaginatedResult<PostSummary>> {
    const {
      status = 'published',
      tags,
      search,
      limit = 10,
      page = 1,
      sort = '-published_date',
    } = options

    // Build where clause
    const where: Where = {}

    if (status === 'published') {
      // Only show posts with a published_date
      where.published_date = { exists: true }
    }

    if (tags && tags.length > 0) {
      where.tags = { in: tags }
    }

    if (search) {
      where.or = [
        { title: { like: search } },
        { meta_title: { like: search } },
        { meta_description: { like: search } },
      ]
    }

    const cacheKey = this.getCacheKey('getPublishedList', { where, limit, page, sort })
    const cached = this.getFromCache<PaginatedResult<PostSummary>>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where,

        limit,
        page,
        sort,
        depth: 0, // Shallow fetch for list views
        select: {
          id: true,
          title: true,
          slug: true,
          published_date: true,
          tags: true,
          meta_title: true,
          meta_description: true,
        },
      })

      const paginated: PaginatedResult<PostSummary> = {
        docs: result.docs as PostSummary[],
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page ?? 1,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }

      this.setCache(cacheKey, paginated, CACHE_TTL.MEDIUM)

      return paginated
    } catch (error) {
      logger.error('getPublishedList failed', error as Error, { options })
      throw error
    }
  }

  /**
   * Get all unique tags
   */
  async getAllTags(): Promise<string[]> {
    const cacheKey = this.getCacheKey('getAllTags')

    const cached = this.getFromCache<string[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where: { tags: { exists: true } },
        depth: 0,
        limit: 500, // Reasonable upper limit
        select: {
          tags: true,
        },
      })

      // Extract and deduplicate tags
      const allTags = new Set<string>()
      for (const doc of result.docs) {
        const post = doc as { tags?: string[] }
        if (post.tags) {
          for (const tag of post.tags) {
            allTags.add(tag)
          }
        }
      }

      const tagsArray = Array.from(allTags).sort()
      this.setCache(cacheKey, tagsArray, CACHE_TTL.LONG)

      return tagsArray
    } catch (error) {
      logger.error('getAllTags failed', error as Error)
      return []
    }
  }

  /**
   * Get related posts by tags
   */
  async getRelatedByTags(
    tags: string[],
    excludeId: string,
    limit: number = 3
  ): Promise<PostSummary[]> {
    if (tags.length === 0) return []

    const cacheKey = this.getCacheKey('getRelatedByTags', { tags, excludeId, limit })

    const cached = this.getFromCache<PostSummary[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where: {
          and: [
            { tags: { in: tags } },
            { id: { not_equals: excludeId } },
            { published_date: { exists: true } },
          ],
        },
        limit,
        sort: '-published_date',
        depth: 0,
        select: {
          id: true,
          title: true,
          slug: true,
          published_date: true,
          tags: true,
          meta_title: true,
          meta_description: true,
        },
      })

      const posts = result.docs as PostSummary[]
      this.setCache(cacheKey, posts, CACHE_TTL.MEDIUM)

      return posts
    } catch (error) {
      logger.error('getRelatedByTags failed', error as Error, { tags, excludeId })
      return []
    }
  }

  /**
   * Get recent posts
   */
  async getRecent(limit: number = 5): Promise<PostSummary[]> {
    const cacheKey = this.getCacheKey('getRecent', { limit })

    const cached = this.getFromCache<PostSummary[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where: { published_date: { exists: true } },
        limit,
        sort: '-published_date',
        depth: 0,
        select: {
          id: true,
          title: true,
          slug: true,
          published_date: true,
          tags: true,
          meta_title: true,
          meta_description: true,
        },
      })

      const posts = result.docs as PostSummary[]
      this.setCache(cacheKey, posts, CACHE_TTL.SHORT)

      return posts
    } catch (error) {
      logger.error('getRecent failed', error as Error, { limit })
      return []
    }
  }

  /**
   * Search posts
   */
  async search(query: string, limit: number = 10): Promise<PostSummary[]> {
    if (!query || query.trim().length < 2) return []

    const cacheKey = this.getCacheKey('search', { query, limit })

    const cached = this.getFromCache<PostSummary[]>(cacheKey)
    if (cached) return cached

    try {
      const result = await this.payload.find({
        collection: 'posts',
        where: {
          or: [
            { title: { like: query } },
            { meta_title: { like: query } },
            { meta_description: { like: query } },
          ],
        },
        limit,
        depth: 0,
        select: {
          id: true,
          title: true,
          slug: true,
          published_date: true,
          tags: true,
          meta_title: true,
          meta_description: true,
        },
      })

      const posts = result.docs as PostSummary[]
      this.setCache(cacheKey, posts, CACHE_TTL.SHORT)

      return posts
    } catch (error) {
      logger.error('search failed', error as Error, { query })
      return []
    }
  }
}

/**
 * Create a post repository instance
 */
export function createPostRepository(payload: Payload): PostRepository {
  return new PostRepository(payload)
}

// Re-export logger for use in this module
import { logger } from '@/lib/logger'
