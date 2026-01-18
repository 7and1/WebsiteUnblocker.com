/**
 * KV-Based Distributed Rate Limiting for Cloudflare Workers
 *
 * This module implements sliding window rate limiting using Cloudflare KV for
 * distributed state across the edge network. Falls back gracefully when KV is
 * not available (development environments).
 */

import type { KVNamespace } from '@/lib/cache/kvCache'

type RateLimitOptions = {
  request: Request
  limit: number
  windowMs: number
  keyPrefix: string
}

type RateLimitState = {
  count: number
  reset: number
}

type RateLimitResult = {
  allowed: boolean
  limit: number
  remaining: number
  reset: number
  retryAfter: number
}

// Cloudflare KV namespace type (available at runtime in Cloudflare Workers)
declare global {
  // eslint-disable-next-line no-var
  var RATE_LIMIT_KV: KVNamespace | undefined
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitState> | undefined
}

/**
 * Security event logger for rate limit violations
 */
function logSecurityEvent(event: {
  type: 'rate_limit_exceeded' | 'rate_limit_error'
  ip: string
  keyPrefix: string
  details?: string
}) {
  // In production, this could send to a logging service
  // For now, we use console with structured data
  const timestamp = new Date().toISOString()
  console.warn(JSON.stringify({ timestamp, ...event }))
}

/**
 * Extract client IP with fallback for spoofed headers
 */
function getClientIp(request: Request): string {
  // Prefer CF connecting IP as it's verified by Cloudflare
  const cf = request.headers.get('cf-connecting-ip')
  if (cf) {
    // Validate IP format to prevent injection
    if (/^[\d.:a-fA-F]+$/.test(cf) && cf.length <= 45) {
      return cf
    }
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim()
    if (/^[\d.:a-fA-F]+$/.test(firstIp) && firstIp.length <= 45) {
      return firstIp
    }
  }

  return '0.0.0.0'
}

/**
 * In-memory fallback for development when KV is not available
 */
const fallbackStore: Map<string, RateLimitState> =
  globalThis.__rateLimitStore ?? new Map()

if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = fallbackStore
}

/**
 * Sliding window rate limiting using Cloudflare KV
 *
 * Uses a simplified sliding window approach:
 * - Stores timestamp and count in KV
 * - Cleans up expired entries on each check
 * - Falls back to no rate limiting if KV is unavailable
 */
async function kvRateLimit(
  kv: KVNamespace,
  key: string,
  limit: number,
  windowMs: number
): Promise<{ allowed: boolean; state: RateLimitState }> {
  const now = Date.now()
  const windowStart = now - windowMs

  try {
    // Get current state
    const entry = await kv.get<RateLimitState>(key, { type: 'json' } as { type: 'json' })
    const state: RateLimitState = entry ?? { count: 0, reset: now + windowMs }

    // Reset if window expired
    if (now > state.reset) {
      state.count = 0
      state.reset = now + windowMs
    }

    // Increment counter
    state.count += 1

    // Save updated state with TTL matching window
    await kv.put(key, JSON.stringify(state), {
      expirationTtl: Math.ceil(windowMs / 1000),
    })

    return {
      allowed: state.count <= limit,
      state,
    }
  } catch (error) {
    // Log KV errors but allow request through (fail-open)
    console.error('KV rate limit error:', error)
    return { allowed: true, state: { count: 0, reset: now + windowMs } }
  }
}

/**
 * Fallback in-memory rate limiting for development
 */
function memoryRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; state: RateLimitState } {
  const now = Date.now()
  const current = fallbackStore.get(key)

  if (!current || now > current.reset) {
    const reset = now + windowMs
    const state = { count: 1, reset }
    fallbackStore.set(key, state)
    return { allowed: true, state }
  }

  const nextCount = current.count + 1
  current.count = nextCount
  fallbackStore.set(key, current)

  return {
    allowed: nextCount <= limit,
    state: current,
  }
}

/**
 * Main rate limit function
 *
 * Automatically detects and uses KV if available, otherwise falls back to
 * in-memory limiting for development environments.
 */
export async function rateLimit({
  request,
  limit,
  windowMs,
  keyPrefix,
}: RateLimitOptions): Promise<RateLimitResult> {
  const ip = getClientIp(request)
  const key = `${keyPrefix}:${ip}`

  // Try KV-based limiting first (production)
  const kv = typeof globalThis.RATE_LIMIT_KV !== 'undefined' ? globalThis.RATE_LIMIT_KV : undefined

  let result: { allowed: boolean; state: RateLimitState }

  if (kv) {
    result = await kvRateLimit(kv, key, limit, windowMs)
  } else {
    // Fallback to in-memory for development
    result = memoryRateLimit(key, limit, windowMs)
  }

  const remaining = Math.max(limit - result.state.count, 0)
  const retryAfter = Math.max(Math.ceil((result.state.reset - Date.now()) / 1000), 1)

  // Log security events for rate limit violations
  if (!result.allowed) {
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      ip,
      keyPrefix,
      details: `Count: ${result.state.count}/${limit}`,
    })
  }

  return {
    allowed: result.allowed,
    limit,
    remaining,
    reset: Math.floor(result.state.reset / 1000),
    retryAfter,
  }
}

/**
 * Generate rate limit headers for HTTP responses
 */
export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'Retry-After': result.retryAfter.toString(),
  }
}
