/**
 * API-related Type Definitions
 *
 * Standardized types for API requests and responses.
 */

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: unknown
  timestamp: number
}

export interface ApiError {
  code: string
  message: string
  details?: unknown
  requestId?: string
}
