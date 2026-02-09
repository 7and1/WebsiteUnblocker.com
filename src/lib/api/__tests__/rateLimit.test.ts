/**
 * Rate Limiting Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { rateLimit, rateLimitHeaders } from '../rateLimit'

// Mock KV store
const mockKV = {
  get: vi.fn(),
  put: vi.fn(),
}

// Mock global for Cloudflare KV
vi.stubGlobal('process', {
  ...process,
  env: {
    ...process.env,
    KV: mockKV,
  },
})

describe('rateLimit', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should allow requests under the limit', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
      },
    })

    const result = await rateLimit({
      request,
      limit: 100,
      windowMs: 60000,
      keyPrefix: 'test',
    })

    expect(result.allowed).toBe(true)
    expect(result.remaining).toBeLessThanOrEqual(100)
  })

  it('should return correct rate limit info', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: {
        'x-forwarded-for': '1.2.3.4',
      },
    })

    const result = await rateLimit({
      request,
      limit: 100,
      windowMs: 60000,
      keyPrefix: 'test',
    })

    expect(result).toHaveProperty('allowed')
    expect(result).toHaveProperty('limit')
    expect(result).toHaveProperty('remaining')
    expect(result).toHaveProperty('reset')
    expect(result.limit).toBe(100)
  })

  it('should use IP from x-forwarded-for header', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: {
        'x-forwarded-for': '5.6.7.8, 1.2.3.4',
      },
    })

    const result = await rateLimit({
      request,
      limit: 100,
      windowMs: 60000,
      keyPrefix: 'test',
    })

    expect(result.allowed).toBe(true)
  })

  it('should use IP from cf-connecting-ip header', async () => {
    const request = new Request('http://localhost/api/test', {
      headers: {
        'cf-connecting-ip': '9.10.11.12',
      },
    })

    const result = await rateLimit({
      request,
      limit: 100,
      windowMs: 60000,
      keyPrefix: 'test',
    })

    expect(result.allowed).toBe(true)
  })

  it('should handle missing IP gracefully', async () => {
    const request = new Request('http://localhost/api/test')

    const result = await rateLimit({
      request,
      limit: 100,
      windowMs: 60000,
      keyPrefix: 'test',
    })

    // Should still work with fallback IP
    expect(result.allowed).toBe(true)
  })
})

describe('rateLimitHeaders', () => {
  it('should return correct headers for allowed request', () => {
    const rateInfo = {
      allowed: true,
      limit: 100,
      remaining: 99,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }

    const headers = rateLimitHeaders(rateInfo) as Record<string, string>

    expect(headers['X-RateLimit-Limit']).toBe('100')
    expect(headers['X-RateLimit-Remaining']).toBe('99')
    expect(headers['X-RateLimit-Reset']).toBeDefined()
  })

  it('should include Retry-After for blocked request', () => {
    const rateInfo = {
      allowed: false,
      limit: 100,
      remaining: 0,
      reset: Date.now() + 60000,
      retryAfter: 60,
    }

    const headers = rateLimitHeaders(rateInfo) as Record<string, string>

    expect(headers['Retry-After']).toBe('60')
  })

  it('should include Retry-After header (always present)', () => {
    const rateInfo = {
      allowed: true,
      limit: 100,
      remaining: 50,
      reset: Date.now() + 60000,
      retryAfter: 0,
    }

    const headers = rateLimitHeaders(rateInfo) as Record<string, string>

    // Retry-After is always included in the implementation
    expect(headers['Retry-After']).toBeDefined()
  })
})
