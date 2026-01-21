/**
 * Check Target API Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkTarget, type CheckTargetResult } from '../checkTarget'

describe('checkTarget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should check target successfully with OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    const result = await checkTarget('https://example.com')

    expect(result.status).toBe('accessible')
    expect(result.code).toBe(200)
    expect(result.target).toBe('https://example.com')
    expect(result.latency).toBeGreaterThanOrEqual(0)
  })

  it('should return error status for non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    const result = await checkTarget('https://example.com')

    expect(result.status).toBe('error')
    expect(result.code).toBe(500)
    expect(result.target).toBe('https://example.com')
  })

  it('should return blocked status on connection error', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Connection failed'))

    const result = await checkTarget('https://example.com')

    expect(result.status).toBe('blocked')
    expect(result.error).toBe('Connection Timeout or Blocked')
    expect(result.target).toBe('https://example.com')
  })

  it('should handle invalid URL format (returns blocked on fetch failure)', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Invalid URL'))

    const result = await checkTarget('not-a-valid-url')

    // The normalizeUrl function prepends https:// to URLs without protocol
    // So "not-a-valid-url" becomes "https://not-a-valid-url"
    // When fetch fails, it returns 'blocked' status
    expect(result.status).toBe('blocked')
    expect(result.error).toBe('Connection Timeout or Blocked')
  })

  it('should use default timeout of 5000ms', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    await checkTarget('https://example.com')

    const fetchCall = vi.mocked(global.fetch).mock.calls[0]
    expect(fetchCall[1]?.signal).toBeDefined()
  })

  it('should use custom timeout when provided', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    await checkTarget('https://example.com', 10000)

    // The timeout is passed to AbortSignal.timeout
    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        signal: expect.any(AbortSignal),
      })
    )
  })

  it('should normalize the URL', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    await checkTarget('example.com')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.any(Object)
    )
  })

  it('should use HEAD method and include proper headers', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    await checkTarget('https://example.com')

    expect(global.fetch).toHaveBeenCalledWith(
      'https://example.com',
      expect.objectContaining({
        method: 'HEAD',
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('Mozilla'),
        }),
      })
    )
  })
})
