import { NextResponse } from 'next/server'
import { rateLimit, rateLimitHeaders } from '@/lib/api/rateLimit'
import { RateLimitError } from '@/errors'
import { generateRequestId, logger } from '@/lib/logger'
import { kvCache } from '@/lib/cache/kvCache'
import { getProxyHealthSnapshot } from '@/services/ProxyHealthService'

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 15
const MIN_LIMIT = 3

export async function GET(request: Request) {
  const requestId = generateRequestId()
  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')

  const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : DEFAULT_LIMIT
  const limit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit, MIN_LIMIT), MAX_LIMIT)
    : DEFAULT_LIMIT

  const rate = await rateLimit({ request, limit: 60, windowMs: 60_000, keyPrefix: 'proxies' })
  const baseHeaders = {
    ...rateLimitHeaders(rate),
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=120',
    'X-Request-ID': requestId,
  }

  if (!rate.allowed) {
    const error = new RateLimitError('Too many requests. Please try again later.', rate.retryAfter, {
      limit: rate.limit,
      remaining: rate.remaining,
      reset: rate.reset,
      requestId,
    })
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: { ...baseHeaders, ...error.getHeaders() } })
  }

  try {
    const snapshot = await kvCache({
      key: `proxy-health:${limit}`,
      ttl: 120,
      swrTtl: 240,
      fetchFn: () => getProxyHealthSnapshot(limit),
    })

    return NextResponse.json(snapshot, { headers: baseHeaders })
  } catch (error) {
    logger.error('Proxy health snapshot failed', error as Error, { requestId })
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unable to retrieve proxy health',
          requestId,
        },
      },
      { status: 500, headers: baseHeaders }
    )
  }
}
