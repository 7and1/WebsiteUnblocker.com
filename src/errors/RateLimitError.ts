/**
 * Rate Limit Error
 *
 * Specialized error for rate limit violations with retry-after information.
 */

import { AppError, type ErrorResponse } from './AppError'

export interface RateLimitErrorResponse extends ErrorResponse {
  error: {
    code: 'RATE_LIMIT_EXCEEDED'
    message: string
    retryAfter: number
    limit?: number
    remaining?: number
    reset?: number
    requestId?: string
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfter: number
  public readonly limit?: number
  public readonly remaining?: number
  public readonly reset?: number

  constructor(
    message: string = 'Rate limit exceeded',
    retryAfter: number = 60,
    options?: {
      limit?: number
      remaining?: number
      reset?: number
      requestId?: string
    }
  ) {
    super(message, 'RATE_LIMIT_EXCEEDED', 429, undefined, options?.requestId)
    this.retryAfter = retryAfter
    this.limit = options?.limit
    this.remaining = options?.remaining
    this.reset = options?.reset
  }

  /**
   * Convert error to rate limit specific response format
   */
  override toJSON(): RateLimitErrorResponse {
    return {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: this.message,
        retryAfter: this.retryAfter,
        ...(this.limit !== undefined && { limit: this.limit }),
        ...(this.remaining !== undefined && { remaining: this.remaining }),
        ...(this.reset !== undefined && { reset: this.reset }),
        ...(this.requestId !== undefined && { requestId: this.requestId }),
      },
    }
  }

  /**
   * Get rate limit headers for the response
   */
  getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Retry-After': this.retryAfter.toString(),
    }

    if (this.limit !== undefined) {
      headers['X-RateLimit-Limit'] = this.limit.toString()
    }

    if (this.remaining !== undefined) {
      headers['X-RateLimit-Remaining'] = this.remaining.toString()
    }

    if (this.reset !== undefined) {
      headers['X-RateLimit-Reset'] = this.reset.toString()
    }

    return headers
  }
}
