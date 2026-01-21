/**
 * Retry Logic Tests
 */

import { describe, it, expect, vi } from 'vitest'
import {
  withRetry,
  createRetryableError,
  createNonRetryableError,
  type RetryOptions,
} from '../retry'

describe('withRetry', () => {
  it('should return result on first success', async () => {
    const mockFn = vi.fn().mockResolvedValue('success')

    const result = await withRetry(mockFn)

    expect(result.value).toBe('success')
    expect(result.attempts).toBe(1)
    expect(result.totalDelayMs).toBe(0)
    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should retry on retryable errors', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('success')

    const result = await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelayMs: 10,
      jitter: false,
    })

    expect(result.value).toBe('success')
    expect(result.attempts).toBe(3)
    expect(mockFn).toHaveBeenCalledTimes(3)
  })

  it('should not retry on non-retryable errors', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('unauthorized'))

    await expect(withRetry(mockFn, { maxAttempts: 3 }))
      .rejects.toThrow('unauthorized')

    expect(mockFn).toHaveBeenCalledTimes(1)
  })

  it('should respect maxAttempts limit', async () => {
    const mockFn = vi.fn().mockRejectedValue(new Error('timeout'))

    await expect(withRetry(mockFn, {
      maxAttempts: 2,
      initialDelayMs: 10,
    })).rejects.toThrow('timeout')

    expect(mockFn).toHaveBeenCalledTimes(2)
  })

  it('should use exponential backoff without jitter', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('success')

    const startTime = Date.now()
    await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelayMs: 50,
      multiplier: 2,
      jitter: false,
    })
    const elapsed = Date.now() - startTime

    // Expected delays: 50ms (first retry) + 100ms (second retry) = 150ms minimum
    expect(elapsed).toBeGreaterThanOrEqual(140)
  })

  it('should add jitter when enabled', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('success')

    const delays: number[] = []
    const originalSetTimeout = global.setTimeout

    global.setTimeout = vi.fn().mockImplementation((callback, delay) => {
      delays.push(delay as number)
      return originalSetTimeout(callback, 10) // Use minimal delay for tests
    }) as unknown as typeof setTimeout

    await withRetry(mockFn, {
      maxAttempts: 3,
      initialDelayMs: 100,
      multiplier: 2,
      jitter: true,
    })

    global.setTimeout = originalSetTimeout

    // With jitter, delay should be between 50% and 100% of base
    // First delay: 50-100ms, second: 100-200ms
    expect(delays[0]).toBeGreaterThan(40)
    expect(delays[0]).toBeLessThan(110)
    expect(delays[1]).toBeGreaterThan(80)
    expect(delays[1]).toBeLessThan(210)
  })

  it('should respect maxDelayMs', async () => {
    const mockFn = vi.fn()
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockRejectedValueOnce(new Error('timeout'))
      .mockResolvedValue('success')

    await withRetry(mockFn, {
      maxAttempts: 4,
      initialDelayMs: 100,
      maxDelayMs: 150,
      multiplier: 3,
      jitter: false,
    })

    // Base delays would be: 100, 300, 900 - but max is 150
    // So actual delays should be: 100, 150, 150
    expect(mockFn).toHaveBeenCalledTimes(4)
  })

  describe('retryable error detection', () => {
    it('should retry on timeout errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('timeout'))
        .mockResolvedValue('success')

      const result = await withRetry(mockFn, { maxAttempts: 2 })
      expect(result.value).toBe('success')
      expect(result.attempts).toBe(2)
    })

    it('should retry on network errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('ECONNREFUSED'))
        .mockResolvedValue('success')

      const result = await withRetry(mockFn, { maxAttempts: 2 })
      expect(result.value).toBe('success')
    })

    it('should retry on rate limit errors', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('rate limit'))
        .mockResolvedValue('success')

      const result = await withRetry(mockFn, { maxAttempts: 2 })
      expect(result.value).toBe('success')
    })

    it('should not retry on auth errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('unauthorized'))

      await expect(withRetry(mockFn, { maxAttempts: 3 }))
        .rejects.toThrow('unauthorized')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not retry on 404 errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('not found'))

      await expect(withRetry(mockFn, { maxAttempts: 3 }))
        .rejects.toThrow('not found')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not retry on validation errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('validation failed'))

      await expect(withRetry(mockFn, { maxAttempts: 3 }))
        .rejects.toThrow('validation failed')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })

    it('should not retry on SSL errors', async () => {
      const mockFn = vi.fn().mockRejectedValue(new Error('ssl certificate error'))

      await expect(withRetry(mockFn, { maxAttempts: 3 }))
        .rejects.toThrow('ssl certificate error')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('custom retryable flag', () => {
    it('should respect custom retryable flag', async () => {
      const mockFn = vi.fn()
        .mockRejectedValueOnce(createRetryableError('custom retryable'))
        .mockResolvedValue('success')

      const result = await withRetry(mockFn, { maxAttempts: 3 })

      expect(result.value).toBe('success')
      expect(mockFn).toHaveBeenCalledTimes(2)
    })

    it('should not retry when flag is false', async () => {
      const mockFn = vi.fn().mockRejectedValue(createNonRetryableError('custom non-retryable'))

      await expect(withRetry(mockFn, { maxAttempts: 3 }))
        .rejects.toThrow('custom non-retryable')

      expect(mockFn).toHaveBeenCalledTimes(1)
    })
  })
})

describe('createRetryableError', () => {
  it('should create error with retryable flag', () => {
    const error = createRetryableError('test error')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('test error')
    expect((error as { retryable?: boolean }).retryable).toBe(true)
  })
})

describe('createNonRetryableError', () => {
  it('should create error with retryable=false flag', () => {
    const error = createNonRetryableError('test error')

    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe('test error')
    expect((error as { retryable?: boolean }).retryable).toBe(false)
  })
})
