import { NextResponse } from 'next/server'
import { rateLimit, rateLimitHeaders } from '@/lib/api/rateLimit'
import { processContactSubmission, type ContactSubmissionData } from '@/services/ContactService'
import { RateLimitError, ValidationError, BadRequestError } from '@/errors'
import { generateRequestId, logger } from '@/lib/logger'

// Node.js runtime required for Payload CMS
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/contact
 *
 * Handle contact form submission with spam detection
 */
export async function POST(request: Request) {
  const requestId = generateRequestId()

  logger.info('Contact form submission received', { requestId })

  // Rate limit check (async for KV support)
  const rate = await rateLimit({ request, limit: 5, windowMs: 60_000, keyPrefix: 'contact' })
  const baseHeaders = {
    ...rateLimitHeaders(rate),
    'X-Request-ID': requestId,
  }

  if (!rate.allowed) {
    const error = new RateLimitError('Too many submissions. Please try again later.', rate.retryAfter, {
      limit: rate.limit,
      remaining: rate.remaining,
      reset: rate.reset,
      requestId,
    })
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: { ...baseHeaders, ...error.getHeaders() } })
  }

  // Parse request body safely
  let data: unknown
  try {
    data = await request.json()
  } catch {
    const error = new BadRequestError('Invalid JSON in request body', undefined, requestId)
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
  }

  // Validate basic structure
  if (!data || typeof data !== 'object') {
    const error = new BadRequestError('Invalid request data format', undefined, requestId)
    return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
  }

  try {
    // Use service layer for processing
    const result = await processContactSubmission(data as ContactSubmissionData, request)

    logger.info('Contact form submission processed', {
      requestId,
      success: result.success,
    })

    return NextResponse.json(
      {
        success: result.success,
        message: result.message,
        ...(result.id && { id: result.id }),
      },
      { headers: baseHeaders }
    )
  } catch (error) {
    // Handle known errors
    if (error instanceof ValidationError) {
      return NextResponse.json(error.toJSON(), { status: error.statusCode, headers: baseHeaders })
    }

    // Handle unexpected errors
    logger.error('Contact form processing failed', error as Error, { requestId })
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Unable to submit your message right now.',
          requestId,
        },
      },
      { status: 500, headers: baseHeaders }
    )
  }
}
