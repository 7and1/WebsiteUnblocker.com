import { getClientIp } from './request'

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

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: Map<string, RateLimitState> | undefined
}

const store: Map<string, RateLimitState> = globalThis.__rateLimitStore ?? new Map()
if (!globalThis.__rateLimitStore) {
  globalThis.__rateLimitStore = store
}

export function rateLimit({ request, limit, windowMs, keyPrefix }: RateLimitOptions): RateLimitResult {
  const ip = getClientIp(request)
  const key = `${keyPrefix}:${ip}`
  const now = Date.now()
  const current = store.get(key)

  if (!current || now > current.reset) {
    const reset = now + windowMs
    store.set(key, { count: 1, reset })
    return {
      allowed: true,
      limit,
      remaining: limit - 1,
      reset: Math.floor(reset / 1000),
      retryAfter: Math.ceil(windowMs / 1000),
    }
  }

  const nextCount = current.count + 1
  current.count = nextCount
  store.set(key, current)

  const remaining = Math.max(limit - nextCount, 0)
  const allowed = nextCount <= limit
  const retryAfter = Math.max(Math.ceil((current.reset - now) / 1000), 1)

  return {
    allowed,
    limit,
    remaining,
    reset: Math.floor(current.reset / 1000),
    retryAfter,
  }
}

export function rateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
    'Retry-After': result.retryAfter.toString(),
  }
}
