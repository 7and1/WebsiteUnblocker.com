/**
 * Proxy API Client Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { fetchProxyRoutes, type ProxyRouteResponse } from '../proxies'

describe('fetchProxyRoutes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch proxy routes successfully', async () => {
    const mockResponse: ProxyRouteResponse = {
      checkedAt: '2024-01-15T10:30:00Z',
      ttl: 120,
      routes: [
        {
          id: 'test-proxy-1',
          name: 'Test Proxy 1',
          url: 'https://test1.com',
          region: 'US',
          status: 'online',
          latency: 50,
          checked: true,
        },
        {
          id: 'test-proxy-2',
          name: 'Test Proxy 2',
          url: 'https://test2.com',
          region: 'EU',
          status: 'offline',
          latency: null,
          code: 500,
          checked: true,
        },
      ],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    const result = await fetchProxyRoutes(10)

    expect(result).toEqual(mockResponse)
    expect(global.fetch).toHaveBeenCalledWith('/api/proxies?limit=10')
  })

  it('should use default limit when not provided', async () => {
    const mockResponse: ProxyRouteResponse = {
      checkedAt: '2024-01-15T10:30:00Z',
      ttl: 120,
      routes: [],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    await fetchProxyRoutes()

    expect(global.fetch).toHaveBeenCalledWith('/api/proxies?limit=10')
  })

  it('should throw error on non-OK response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: { message: 'Internal server error' } }),
    } as Response)

    await expect(fetchProxyRoutes()).rejects.toThrow('Internal server error')
  })

  it('should throw error with error message from response', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Bad request' } }),
    } as Response)

    await expect(fetchProxyRoutes()).rejects.toThrow('Bad request')
  })

  it('should throw default error when JSON parsing fails', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error('Invalid JSON')
      },
    } as unknown as Response)

    await expect(fetchProxyRoutes()).rejects.toThrow('Unable to load proxy routes')
  })

  it('should pass limit parameter correctly', async () => {
    const mockResponse: ProxyRouteResponse = {
      checkedAt: '2024-01-15T10:30:00Z',
      ttl: 120,
      routes: [],
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response)

    await fetchProxyRoutes(5)

    expect(global.fetch).toHaveBeenCalledWith('/api/proxies?limit=5')
  })
})
