import { NextResponse } from 'next/server'
import { normalizeUrl } from '@/lib/utils'
import { rateLimit, rateLimitHeaders } from '@/lib/api/rateLimit'

export const runtime = 'edge'

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')?.trim()

  const rate = rateLimit({ request, limit: 100, windowMs: 60_000, keyPrefix: 'check' })
  const responseHeaders = { ...rateLimitHeaders(rate), 'Cache-Control': 'no-store' }
  if (!rate.allowed) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again in 60 seconds.',
        },
      },
      { status: 429, headers: responseHeaders }
    )
  }

  if (!url) {
    return NextResponse.json(
      {
        error: {
          code: 'URL_REQUIRED',
          message: 'URL required',
        },
      },
      { status: 400, headers: responseHeaders }
    )
  }

  const normalized = normalizeUrl(url)
  if (!normalized) {
    return NextResponse.json(
      {
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format',
        },
      },
      { status: 400, headers: responseHeaders }
    )
  }

  const startTime = Date.now()

  try {
    const response = await fetch(normalized, {
      method: 'HEAD',
      headers: {
        'User-Agent': USER_AGENT,
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    })

    return NextResponse.json(
      {
        status: response.ok ? 'accessible' : 'error',
        code: response.status,
        latency: Date.now() - startTime,
        target: normalized,
      },
      { headers: responseHeaders }
    )
  } catch (error) {
    return NextResponse.json(
      {
        status: 'blocked',
        latency: Date.now() - startTime,
        target: normalized,
        error: 'Connection Timeout or Blocked',
      },
      { headers: responseHeaders }
    )
  }
}
