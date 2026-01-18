/**
 * Post Service
 *
 * Abstracts all post-related operations with caching at service level
 * and optimized queries.
 */

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { createPostRepository, type PostSummary } from '@/repositories'
import type { PaginatedResult } from '@/repositories/BaseRepository'
import { logger } from '@/lib/logger'

export interface PostListOptions {
  page?: number
  limit?: number
  tags?: string[]
  sort?: string
  search?: string
}

export interface PostWithRelated extends PostSummary {
  related?: PostSummary[]
}

/**
 * Cache TTL at service level (longer than repository cache)
 */
const SERVICE_CACHE_TTL = {
  LIST: 60_000, // 1 minute
  DETAIL: 300_000, // 5 minutes
  TAGS: 600_000, // 10 minutes
  RECENT: 120_000, // 2 minutes
}

/**
 * Simple in-memory cache for service layer
 */
class ServiceCache {
  private cache = new Map<string, { data: unknown; expires: number }>()

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  set(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    })
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }
}

const cache = new ServiceCache()

/**
 * Post Service
 */
export class PostService {
  private getRepository = async () => {
    const payload = await getPayload({ config: configPromise })
    return createPostRepository(payload)
  }

  /**
   * Get paginated list of published posts
   */
  async getList(options: PostListOptions = {}): Promise<PaginatedResult<PostSummary>> {
    const cacheKey = `posts:list:${JSON.stringify(options)}`

    const cached = cache.get<PaginatedResult<PostSummary>>(cacheKey)
    if (cached) {
      logger.debug('Post list cache hit', { options })
      return cached
    }

    const repository = await this.getRepository()
    const result = await repository.getPublishedList({
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      tags: options.tags,
      sort: options.sort,
      search: options.search,
    })

    cache.set(cacheKey, result, SERVICE_CACHE_TTL.LIST)

    logger.info('Retrieved post list', {
      page: result.page,
      limit: result.limit,
      total: result.totalDocs,
    })

    return result
  }

  /**
   * Get single post by slug
   */
  async getBySlug(slug: string): Promise<{ post: PostSummary | null; related?: PostSummary[] }> {
    const cacheKey = `posts:detail:${slug}`

    const cached = cache.get<{ post: PostSummary; related?: PostSummary[] }>(cacheKey)
    if (cached) {
      logger.debug('Post detail cache hit', { slug })
      return cached
    }

    const repository = await this.getRepository()
    const post = await repository.findBySlug(slug)

    if (!post) {
      logger.info('Post not found', { slug })
      return { post: null }
    }

    let related: PostSummary[] | undefined
    if (post.tags && post.tags.length > 0) {
      related = await repository.getRelatedByTags(post.tags, String(post.id), 3)
    }

    const result = {
      post: post as PostSummary,
      related,
    }

    cache.set(cacheKey, result, SERVICE_CACHE_TTL.DETAIL)

    logger.info('Retrieved post detail', { slug, hasRelated: !!related?.length })

    return result
  }

  /**
   * Get all available tags
   */
  async getAllTags(): Promise<string[]> {
    const cacheKey = 'posts:tags:all'

    const cached = cache.get<string[]>(cacheKey)
    if (cached) {
      logger.debug('Tags cache hit')
      return cached
    }

    const repository = await this.getRepository()
    const tags = await repository.getAllTags()

    cache.set(cacheKey, tags, SERVICE_CACHE_TTL.TAGS)

    logger.info('Retrieved all tags', { count: tags.length })

    return tags
  }

  /**
   * Get recent posts
   */
  async getRecent(limit: number = 5): Promise<PostSummary[]> {
    const cacheKey = `posts:recent:${limit}`

    const cached = cache.get<PostSummary[]>(cacheKey)
    if (cached) {
      logger.debug('Recent posts cache hit', { limit })
      return cached
    }

    const repository = await this.getRepository()
    const posts = await repository.getRecent(limit)

    cache.set(cacheKey, posts, SERVICE_CACHE_TTL.RECENT)

    logger.info('Retrieved recent posts', { count: posts.length })

    return posts
  }

  /**
   * Search posts
   */
  async search(query: string, limit: number = 10): Promise<PostSummary[]> {
    const cacheKey = `posts:search:${query}:${limit}`

    const cached = cache.get<PostSummary[]>(cacheKey)
    if (cached) {
      logger.debug('Search cache hit', { query, limit })
      return cached
    }

    const repository = await this.getRepository()
    const results = await repository.search(query, limit)

    // Short cache for searches
    cache.set(cacheKey, results, 30_000)

    logger.info('Searched posts', { query, count: results.length })

    return results
  }

  /**
   * Get posts by tag
   */
  async getByTag(tag: string, options: PostListOptions = {}): Promise<PaginatedResult<PostSummary>> {
    return this.getList({
      ...options,
      tags: [tag],
    })
  }

  /**
   * Invalidate cache for posts
   */
  invalidateCache(pattern?: string): void {
    cache.invalidate(pattern ? `posts:${pattern}` : 'posts:')
    logger.info('Post cache invalidated', { pattern })
  }
}

/**
 * Singleton instance
 */
export const postService = new PostService()

/**
 * Convenience functions
 */
export async function getPostList(options?: PostListOptions): Promise<PaginatedResult<PostSummary>> {
  return postService.getList(options)
}

export async function getPostBySlug(slug: string): Promise<{
  post: PostSummary | null
  related?: PostSummary[]
}> {
  return postService.getBySlug(slug)
}

export async function getAllTags(): Promise<string[]> {
  return postService.getAllTags()
}

export async function getRecentPosts(limit?: number): Promise<PostSummary[]> {
  return postService.getRecent(limit)
}

export async function searchPosts(query: string, limit?: number): Promise<PostSummary[]> {
  return postService.search(query, limit)
}
