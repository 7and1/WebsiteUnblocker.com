import { NextResponse } from 'next/server'
import { rateLimit, rateLimitHeaders } from '@/lib/api/rateLimit'
import { validateUrl, logValidationFailure } from '@/middleware/validation'
import { getClientIp } from '@/lib/api/request'
import { checkWebsite } from '@/services/WebsiteCheckService'
import { RateLimitError, BadRequestError } from '@/errors'
import { generateRequestId, logger } from '@/lib/logger'

// Cloudflare Workers compatible runtime
export const dynamic = 'force-dynamic'

// Maximum URL length to prevent abuse
const MAX_URL_LENGTH = 2048

/**
 * GET /api/check?url=example.com
 *
 * Check if a website is accessible
 */
export async function GET(request: Request) {
  const requestId = generateRequestId()
  const clientIp = getClientIp(request)
  const { searchParams } = new URL(request.url)
  const rawUrl = searchParams.get('url')

  logger.info('Website check request', { requestId, url: rawUrl, ip: clientIp })

  // Rate limit check (async for KV support)
  const rate = await rateLimit({ request, limit: 100, windowMs: 60_000, keyPrefix: 'check' })
  const baseHeaders = {
    ...rateLimitHeaders(rate),
    'Cache-Control': 'no-store',
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

  // Validate URL parameter exists
  if (!rawUrl) {
    const error = new BadRequestError('URL parameter is required', undefined, requestId)
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
  }

  // Check URL length before processing
  if (rawUrl.length > MAX_URL_LENGTH) {
    logValidationFailure({
      type: 'url_too_long',
      input: rawUrl.substring(0, 100),
      ip: clientIp,
    })
    const error = new BadRequestError(
      `URL exceeds maximum length of ${MAX_URL_LENGTH} characters`,
      { field: 'url', maxLength: MAX_URL_LENGTH },
      requestId
    )
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
  }

  // Validate URL format and security
  const urlValidation = validateUrl(rawUrl, {
    allowedProtocols: ['http:', 'https:'],
    allowUserPass: false,
    maxLength: MAX_URL_LENGTH,
  })

  if (!urlValidation.valid) {
    logValidationFailure({
      type: 'invalid_url',
      input: rawUrl,
      ip: clientIp,
    })
    const error = new BadRequestError(
      urlValidation.error === 'INTERNAL_ADDRESS_NOT_ALLOWED'
        ? 'Internal IP addresses are not allowed'
        : 'Invalid URL format or not allowed',
      { field: 'url', code: urlValidation.error },
      requestId
    )
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
  }

  const targetUrl = urlValidation.sanitized!

  try {
    // Use service layer for website checking
    const result = await checkWebsite(targetUrl, {
      timeout: 5000,
      maxRetries: 1,
      requestId,
    })

    logger.info('Website check completed', {
      requestId,
      targetUrl,
      status: result.status,
      isAccessible: result.isAccessible,
      latency: result.latency,
    })

    // Build response with rate limit headers
    return NextResponse.json(
      {
        status: result.isAccessible ? 'accessible' : result.status,
        code: result.code,
        latency: result.latency,
        target: result.target,
        ...(result.blockReason && { blockReason: result.blockReason }),
        ...(result.error && { error: result.error }),
        ...(result.retryCount !== undefined && { retryCount: result.retryCount }),
      },
      { headers: baseHeaders }
    )
  } catch (error) {
    // Handle unexpected errors
    logger.error('Website check failed', error as Error, { requestId, targetUrl })
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unable to check website status',
          requestId,
        },
      },
      { status: 500, headers: baseHeaders }
    )
  }
}
