/**
 * Unified API Response Wrapper
 *
 * Provides consistent response format for all API endpoints
 */

import { NextResponse } from 'next/server'
import { AppError } from '@/errors/AppError'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: unknown
  timestamp: number
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
    requestId?: string
  }
  timestamp: number
}

/**
 * Create a standardized success response
 */
export function apiSuccess<T>(
  data: T,
  meta?: unknown,
  headers?: HeadersInit
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: Date.now(),
    },
    { headers }
  )
}

/**
 * Create a standardized error response from AppError
 */
export function apiError(
  error: AppError,
  headers?: HeadersInit
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details !== undefined && { details: error.details }),
        ...(error.requestId !== undefined && { requestId: error.requestId }),
      },
      timestamp: Date.now(),
    },
    { status: error.statusCode, headers }
  )
}

/**
 * Create a standardized error response from unknown error
 */
export function apiErrorFromUnknown(
  err: unknown,
  requestId?: string,
  headers?: HeadersInit
): NextResponse<ApiErrorResponse> {
  const appError = AppError.fromUnknown(err, requestId)
  return apiError(appError, headers)
}
