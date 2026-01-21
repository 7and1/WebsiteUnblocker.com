import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'
import { getProxyHealthSnapshot } from '@/services/ProxyHealthService'

vi.mock('@/services/ProxyHealthService', () => ({
  getProxyHealthSnapshot: vi.fn(async (limit = 10) => ({
    checkedAt: '2026-01-19T00:00:00.000Z',
    ttl: 120,
    routes: [
      {
        id: 'croxyproxy',
        name: 'CroxyProxy',
        url: 'https://croxyproxy.com',
        region: 'Global',
        status: 'online',
        latency: 120,
        checked: true,
      },
    ],
  })),
}))

vi.mock('@/lib/cache/kvCache', () => ({
  kvCache: (options: { fetchFn: () => Promise<unknown> }) => options.fetchFn(),
}))

const createRequest = (url: string) => new Request(url)

describe('GET /api/proxies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns proxy health snapshot', async () => {
    const request = createRequest('http://localhost/api/proxies')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.routes).toBeDefined()
    expect(Array.isArray(data.routes)).toBe(true)
  })

  it('passes limit parameter to service', async () => {
    const request = createRequest('http://localhost/api/proxies?limit=5')
    await GET(request)

    expect(getProxyHealthSnapshot).toHaveBeenCalledWith(5)
  })
})
