import { getCloudflareContext } from '@opennextjs/cloudflare'

/**
 * Extend the CloudflareEnv interface to include the CACHE KV binding
 */
declare global {
  interface CloudflareEnv {
    CACHE?: KVNamespace
  }
}

/**
 * KV Namespace type for Cloudflare Workers
 */
export interface KVNamespace {
  get(key: string): Promise<string | null>
  get(key: string, type: 'text'): Promise<string | null>
  get(key: string, options: { type: 'json' }): Promise<unknown>
  get<T = unknown>(key: string, options: { type: 'json' }): Promise<T | null>
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>
  delete(key: string): Promise<void>
}

/**
 * KV Cache Options
 */
type KvCacheOptions<T> = {
  /** Cache key prefix */
  key: string
  /** Time-to-live in seconds (default: 300 = 5 minutes) */
  ttl?: number
  /** Function to fetch fresh data on cache miss */
  fetchFn: () => Promise<T>
  /** Optional stale-while-revalidate TTL */
  swrTtl?: number
}

/**
 * Cache entry metadata stored alongside the actual data
 */
type CacheMetadata = {
  expires: number
  swrExpires: number
}

/**
 * In-memory pending requests map for cache stampede protection
 * Key: cache key, Value: promise that resolves when the fetch completes
 */
declare global {
  // eslint-disable-next-line no-var
  var __kvPendingRequests: Map<string, Promise<unknown>> | undefined
}

const pendingRequests: Map<string, Promise<unknown>> =
  globalThis.__kvPendingRequests ?? new Map()
if (!globalThis.__kvPendingRequests) {
  globalThis.__kvPendingRequests = pendingRequests
}

/**
 * Parse cache entry with metadata
 */
function parseCacheEntry<T>(value: string | null): { data: T | null; metadata: CacheMetadata | null } {
  if (!value) return { data: null, metadata: null }

  try {
    const parts = value.split('|metadata=')
    if (parts.length !== 2) return { data: null, metadata: null }

    const data = JSON.parse(parts[0]) as T
    const metadata = JSON.parse(parts[1]) as CacheMetadata

    return { data, metadata }
  } catch {
    return { data: null, metadata: null }
  }
}

/**
 * Build cache entry with metadata
 */
function buildCacheEntry<T>(data: T, metadata: CacheMetadata): string {
  return `${JSON.stringify(data)}|metadata=${JSON.stringify(metadata)}`
}

/**
 * Get a value from KV cache or fetch fresh data
 *
 * Features:
 * - Checks KV cache first
 * - Falls back to database query on miss
 * - Stores results in KV with TTL
 * - Cache stampede protection (dedupes concurrent requests)
 * - Stale-while-revalidate support
 *
 * @example
 * ```ts
 * const posts = await kvCache({
 *   key: 'posts:latest',
 *   ttl: 300, // 5 minutes
 *   fetchFn: () => payload.find({ collection: 'posts', limit: 6 })
 * })
 * ```
 */
export async function kvCache<T>({ key, ttl = 300, fetchFn, swrTtl }: KvCacheOptions<T>): Promise<T> {
  const now = Date.now()

  try {
    const { env } = await getCloudflareContext({ async: true })
    const kv = env?.CACHE as KVNamespace | undefined

    if (!kv) {
      // No KV binding available, fetch directly
      return fetchFn()
    }

    // Check for pending request (cache stampede protection)
    const pendingKey = `pending:${key}`
    const pending = pendingRequests.get(pendingKey)
    if (pending) {
      return pending as Promise<T>
    }

    // Try to get from cache
    const cached = await kv.get(key, 'text')
    const { data, metadata } = parseCacheEntry<T>(cached)

    // Check if cache is still valid (within TTL)
    if (data && metadata && now < metadata.expires) {
      return data
    }

    // Check if stale-while-revalidate applies
    const isStale = metadata && now >= metadata.expires && now < metadata.swrExpires
    const staleData = isStale ? data : null

    // Create pending promise for cache stampede protection
    const fetchPromise = (async (): Promise<T> => {
      try {
        const fresh = await fetchFn()

        // Store in cache with metadata
        const expires = now + ttl * 1000
        const swrExpires = swrTtl ? now + swrTtl * 1000 : expires + ttl * 1000

        await kv.put(key, buildCacheEntry(fresh, { expires, swrExpires }), {
          expirationTtl: ttl + (swrTtl || ttl),
        })

        return fresh
      } finally {
        // Clean up pending request
        pendingRequests.delete(pendingKey)
      }
    })()

    pendingRequests.set(pendingKey, fetchPromise)

    // Return stale data immediately if available (stale-while-revalidate)
    if (staleData) {
      // Don't wait for fresh data, return stale immediately
      fetchPromise.catch(() => {
        // Silently ignore background revalidation errors
      })
      return staleData
    }

    return fetchPromise
  } catch {
    // On any error, fall back to direct fetch
    return fetchFn()
  }
}

/**
 * Invalidate a cache entry by key pattern
 * Note: KV doesn't support pattern-based deletion, so you must delete exact keys
 */
export async function kvCacheDelete(key: string): Promise<void> {
  try {
    const { env } = await getCloudflareContext({ async: true })
    const kv = env?.CACHE as KVNamespace | undefined
    if (kv) {
      await kv.delete(key)
    }
  } catch {
    // Silently ignore deletion errors
  }
}

/**
 * Invalidate multiple cache entries
 */
export async function kvCacheDeleteMany(keys: string[]): Promise<void> {
  await Promise.all(keys.map((key) => kvCacheDelete(key)))
}
