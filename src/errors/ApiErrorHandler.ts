/**
 * Global API Error Handler Middleware
 *
 * Provides consistent error handling across all API routes with proper
 * logging and user-friendly error messages.
 */

import { NextResponse } from 'next/server'
import { AppError } from './AppError'
import { RateLimitError } from './RateLimitError'
import { ValidationError } from './ValidationError'
import { logger, generateRequestId, type LogContext } from '@/lib/logger'

/**
 * Handle API errors and return appropriate response
 */
export function handleApiError(error: unknown, context?: LogContext): NextResponse {
  const requestId = context?.requestId

  // Convert unknown errors to AppError
  const appError = AppError.fromUnknown(error, requestId)

  // Log the error with context
  if (error instanceof AppError) {
    if (error.statusCode >= 500) {
      logger.error(error.message, error, context)
    } else {
      logger.warn(error.message, { ...context, code: error.code })
    }
  } else {
    logger.error('Unhandled error', error instanceof Error ? error : new Error(String(error)), context)
  }

  // Build response headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add rate limit headers if applicable
  if (error instanceof RateLimitError) {
    Object.assign(headers, error.getHeaders())
  }

  // Return error response
  return NextResponse.json(appError.toJSON(), {
    status: appError.statusCode,
    headers,
  })
}

/**
 * Wrapper for API route handlers with automatic error handling
 */
export function withErrorHandler<T>(
  handler: (request: Request, context?: T) => Promise<NextResponse>,
  options?: {
    logRequest?: boolean
    logResponse?: boolean
  }
) {
  return async (request: Request, context?: T): Promise<NextResponse> => {
    const requestId = generateRequestId()
    const logContext: LogContext = {
      requestId,
      method: request.method,
      url: request.url,
    }

    if (options?.logRequest !== false) {
      logger.info('Incoming request', logContext)
    }

    try {
      const response = await handler(request, context)

      if (options?.logResponse !== false) {
        logger.info('Request completed', {
          ...logContext,
          status: response.status,
        })
      }

      // Add request ID to response headers for tracing
      const newResponse = NextResponse.json(
        await response.clone().json().catch(() => ({})),
        {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'X-Request-ID': requestId,
          },
        }
      )

      return newResponse
    } catch (error) {
      return handleApiError(error, logContext)
    }
  }
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  status: number = 400,
  details?: unknown,
  requestId?: string
): NextResponse {
  return NextResponse.json(
    {
      error: {
        code,
        message,
        ...(details !== undefined && { details }),
        ...(requestId && { requestId }),
      },
    },
    { status, headers: { 'Content-Type': 'application/json' } }
  )
}

/**
 * Re-export all error types for convenience
 */
export * from './AppError'
export * from './RateLimitError'
export * from './ValidationError'
