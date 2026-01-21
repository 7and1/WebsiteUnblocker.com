/**
 * Retry Logic with Exponential Backoff
 *
 * Provides configurable retry behavior for transient failures.
 */

export interface RetryOptions {
  maxAttempts: number
  initialDelayMs: number
  maxDelayMs: number
  multiplier: number
  jitter: boolean
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10_000,
  multiplier: 2,
  jitter: true,
}

export interface RetryResult<T> {
  value: T
  attempts: number
  totalDelayMs: number
}

export type RetryableError = Error & { retryable?: boolean; retryAfter?: number }

/**
 * Calculate delay with exponential backoff and optional jitter
 */
function calculateDelay(attempt: number, options: RetryOptions): number {
  const baseDelay = Math.min(
    options.initialDelayMs * Math.pow(options.multiplier, attempt),
    options.maxDelayMs
  )

  if (options.jitter) {
    return baseDelay * (0.5 + Math.random() * 0.5)
  }

  return baseDelay
}

/**
 * Check if an error is retryable
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const retryable = (error as RetryableError).retryable
    if (typeof retryable === 'boolean') {
      return retryable
    }

    const message = error.message.toLowerCase()

    const retryablePatterns = [
      'timeout',
      'timed out',
      'econnrefused',
      'econnreset',
      'etimedout',
      'network',
      'fetch failed',
      'temporary',
      'try again',
      'rate limit',
      'too many requests',
    ]

    const nonRetryablePatterns = [
      'unauthorized',
      'forbidden',
      'not found',
      '404',
      '401',
      '403',
      'validation',
      'invalid',
      'ssl',
      'certificate',
    ]

    if (nonRetryablePatterns.some(p => message.includes(p))) {
      return false
    }

    return retryablePatterns.some(p => message.includes(p))
  }

  return false
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  let lastError: Error | undefined
  let totalDelay = 0

  for (let attempt = 0; attempt < opts.maxAttempts; attempt++) {
    try {
      const value = await fn()
      return {
        value,
        attempts: attempt + 1,
        totalDelayMs: totalDelay,
      }
    } catch (error) {
      lastError = error as Error

      if (attempt === opts.maxAttempts - 1) {
        break
      }

      if (!isRetryableError(error)) {
        break
      }

      const delay = calculateDelay(attempt, opts)
      totalDelay += delay

      await sleep(delay)
    }
  }

  throw lastError || new Error('Retry failed with unknown error')
}

/**
 * Create a retryable error
 */
export function createRetryableError(message: string): Error {
  const error = new Error(message) as RetryableError
  error.retryable = true
  return error
}

/**
 * Create a non-retryable error
 */
export function createNonRetryableError(message: string): Error {
  const error = new Error(message) as RetryableError
  error.retryable = false
  return error
}
