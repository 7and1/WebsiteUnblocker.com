/**
 * Base Repository
 *
 * Generic base repository with common CRUD operations and caching support.
 * Provides a consistent interface for data access across the application.
 */

import { logger } from '@/lib/logger'
import type { Payload, CollectionSlug, Where } from 'payload'

// Re-export Payload's Where type for convenience
export type { Where }

export type PaginationOptions = {
  page?: number
  limit?: number
  sort?: string
}

export interface QueryOptions extends PaginationOptions {
  where?: Where
  depth?: number
  select?: Record<string, boolean>
}

export interface PaginatedResult<T> {
  docs: T[]
  totalDocs: number
  totalPages: number
  page: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

/**
 * Type assertion helper for collection slugs
 */
export function asCollectionSlug(slug: string): CollectionSlug {
  return slug as CollectionSlug
}

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

/**
 * Simple in-memory cache for development/local testing
 * In production, this would use Cloudflare KV
 */
class MemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private defaultTTL = 60_000 // 1 minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined
    if (!entry) return null

    // Check expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTTL,
    })
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(pattern?: string): void {
    if (!pattern) {
      this.cache.clear()
      return
    }

    // Delete keys matching pattern
    for (const key of this.cache.keys()) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  get size(): number {
    return this.cache.size
  }
}

const cache = new MemoryCache()

/**
 * Base repository class
 */
export abstract class BaseRepository<T> {
  protected cache: MemoryCache
  protected cachePrefix: string

  constructor(
    protected payload: Payload,
    collectionSlug: string,
    protected defaultCacheTTL: number = 60_000
  ) {
    this.cachePrefix = collectionSlug
    this.cache = cache
  }

  /**
   * Generate cache key for a query
   */
  protected getCacheKey(operation: string, params: Record<string, unknown> = {}): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(k => `${k}=${JSON.stringify(params[k])}`)
      .join('&')
    return `${this.cachePrefix}:${operation}:${sortedParams}`
  }

  /**
   * Get from cache
   */
  protected getFromCache<R>(key: string): R | null {
    try {
      return this.cache.get<R>(key)
    } catch (error) {
      logger.warn('Cache get failed', { error, key })
      return null
    }
  }

  /**
   * Set cache
   */
  protected setCache<R>(key: string, data: R, ttl?: number): void {
    try {
      this.cache.set(key, data, ttl ?? this.defaultCacheTTL)
    } catch (error) {
      logger.warn('Cache set failed', { error, key })
    }
  }

  /**
   * Invalidate cache for this repository
   */
  clearCache(pattern?: string): void {
    this.cache.clear(pattern ? `${this.cachePrefix}:${pattern}` : `${this.cachePrefix}:`)
  }

  /**
   * Find one document by ID
   */
  async findById(
    id: string,
    options: { depth?: number; useCache?: boolean } = {}
  ): Promise<T | null> {
    const { depth = 1, useCache = true } = options
    const cacheKey = this.getCacheKey('findById', { id, depth })

    if (useCache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) return cached
    }

    try {
      const result = await this.payload.findByID({
        collection: asCollectionSlug(this.cachePrefix),
        id,
        depth,
      })

      if (result) {
        this.setCache(cacheKey, result as T)
      }

      return result as T | null
    } catch (error) {
      logger.error('findById failed', error as Error, { collection: this.cachePrefix, id })
      throw error
    }
  }

  /**
   * Find one document by where clause
   */
  async findOne(
    where: Where,
    options: { depth?: number; useCache?: boolean } = {}
  ): Promise<T | null> {
    const { depth = 1, useCache = true } = options
    const cacheKey = this.getCacheKey('findOne', { where, depth })

    if (useCache) {
      const cached = this.getFromCache<T>(cacheKey)
      if (cached) return cached
    }

    try {
      const result = await this.payload.find({
        collection: asCollectionSlug(this.cachePrefix),
        where,
        depth,
        limit: 1,
      })

      const doc = result.docs[0] as T | null
      if (doc && useCache) {
        this.setCache(cacheKey, doc)
      }

      return doc
    } catch (error) {
      logger.error('findOne failed', error as Error, { collection: this.cachePrefix, where })
      throw error
    }
  }

  /**
   * Find many documents with pagination
   */
  async findMany(
    options: QueryOptions & { useCache?: boolean } = {}
  ): Promise<PaginatedResult<T>> {
    const { useCache = true, ...queryOptions } = options
    const cacheKey = this.getCacheKey('findMany', queryOptions)

    if (useCache) {
      const cached = this.getFromCache<PaginatedResult<T>>(cacheKey)
      if (cached) return cached
    }

    try {
      const result = await this.payload.find({
        collection: asCollectionSlug(this.cachePrefix),
        ...queryOptions,
      })

      const paginated = {
        docs: result.docs as T[],
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
        page: result.page ?? 1,
        limit: result.limit,
        hasNextPage: result.hasNextPage,
        hasPrevPage: result.hasPrevPage,
      }

      if (useCache) {
        this.setCache(cacheKey, paginated)
      }

      return paginated
    } catch (error) {
      logger.error('findMany failed', error as Error, { collection: this.cachePrefix, options })
      throw error
    }
  }

  /**
   * Create a new document
   */
  async create(data: Partial<T>, options: { clearCache?: boolean } = {}): Promise<T> {
    const { clearCache = true } = options

    try {
      const result = await this.payload.create({
        collection: asCollectionSlug(this.cachePrefix),
        data: data as Record<string, unknown>,
      })

      if (clearCache) {
        this.clearCache()
      }

      return result as T
    } catch (error) {
      logger.error('create failed', error as Error, { collection: this.cachePrefix, data })
      throw error
    }
  }

  /**
   * Update a document
   */
  async update(
    id: string,
    data: Partial<T>,
    options: { clearCache?: boolean } = {}
  ): Promise<T> {
    const { clearCache = true } = options

    try {
      const result = await this.payload.update({
        collection: asCollectionSlug(this.cachePrefix),
        id,
        data: data as Record<string, unknown>,
      })

      if (clearCache) {
        this.clearCache()
      }

      return result as T
    } catch (error) {
      logger.error('update failed', error as Error, { collection: this.cachePrefix, id, data })
      throw error
    }
  }

  /**
   * Delete a document
   */
  async delete(id: string, options: { clearCache?: boolean } = {}): Promise<T> {
    const { clearCache = true } = options

    try {
      const result = await this.payload.delete({
        collection: asCollectionSlug(this.cachePrefix),
        id,
      })

      if (clearCache) {
        this.clearCache()
      }

      return result as T
    } catch (error) {
      logger.error('delete failed', error as Error, { collection: this.cachePrefix, id })
      throw error
    }
  }

  /**
   * Count documents matching where clause
   */
  async count(where?: Where): Promise<number> {
    try {
      const result = await this.payload.count({
        collection: asCollectionSlug(this.cachePrefix),
        where,
      })
      return result.totalDocs
    } catch (error) {
      logger.error('count failed', error as Error, { collection: this.cachePrefix, where })
      throw error
    }
  }
}

/**
 * Export cache instance for direct access if needed
 */
export { cache as repositoryCache }
