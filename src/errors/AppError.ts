/**
 * Base Application Error
 *
 * Provides structured error responses with status codes and error codes
 * for consistent API error handling.
 */

export type ErrorCode =
  | 'INTERNAL_ERROR'
  | 'INVALID_REQUEST'
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'RATE_LIMIT_EXCEEDED'
  | 'SERVICE_UNAVAILABLE'
  | 'URL_REQUIRED'
  | 'URL_TOO_LONG'
  | 'INVALID_URL'
  | 'INVALID_EMAIL'
  | 'INVALID_JSON'
  | 'DATABASE_ERROR'

export interface ErrorResponse {
  error: {
    code: ErrorCode
    message: string
    details?: unknown
    requestId?: string
  }
}

export class AppError extends Error {
  public readonly statusCode: number
  public readonly code: ErrorCode
  public readonly details?: unknown
  public readonly requestId?: string
  public readonly isOperational: boolean

  constructor(
    message: string,
    code: ErrorCode = 'INTERNAL_ERROR',
    statusCode: number = 500,
    details?: unknown,
    requestId?: string
  ) {
    super(message)
    this.name = this.constructor.name
    this.code = code
    this.statusCode = statusCode
    this.details = details
    this.requestId = requestId
    this.isOperational = true

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor)
  }

  /**
   * Convert error to standardized API response format
   */
  toJSON(): ErrorResponse {
    const response: ErrorResponse = {
      error: {
        code: this.code,
        message: this.message,
      },
    }

    if (this.details !== undefined) {
      response.error.details = this.details
    }

    if (this.requestId !== undefined) {
      response.error.requestId = this.requestId
    }

    return response
  }

  /**
   * Create an AppError from an unknown error
   */
  static fromUnknown(error: unknown, requestId?: string): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (error instanceof Error) {
      return new AppError(
        error.message,
        'INTERNAL_ERROR',
        500,
        undefined,
        requestId
      )
    }

    return new AppError(
      'An unexpected error occurred',
      'INTERNAL_ERROR',
      500,
      undefined,
      requestId
    )
  }
}

/**
 * Common error constructors
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Invalid request', details?: unknown, requestId?: string) {
    super(message, 'INVALID_REQUEST', 400, details, requestId)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', requestId?: string) {
    super(message, 'UNAUTHORIZED', 401, undefined, requestId)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', requestId?: string) {
    super(message, 'FORBIDDEN', 403, undefined, requestId)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource', requestId?: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404, undefined, requestId)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', requestId?: string) {
    super(message, 'SERVICE_UNAVAILABLE', 503, undefined, requestId)
  }
}
