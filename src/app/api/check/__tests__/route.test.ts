import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

vi.mock('@/services/WebsiteCheckService', () => ({
  checkWebsite: vi.fn(async (url: string) => {
    if (url.includes('blocked-site')) {
      return {
        status: 'blocked',
        isAccessible: false,
        latency: 100,
        target: url,
        error: 'Connection timeout',
        blockReason: 'NETWORK_TIMEOUT',
        retryCount: 0,
        requestId: 'test-request-id',
      }
    }
    return {
      status: 'accessible',
      isAccessible: true,
      code: 200,
      latency: 50,
      target: url,
      retryCount: 0,
      requestId: 'test-request-id',
    }
  }),
}))

const createRequest = (url: string) => new Request(url)

describe('GET /api/check', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 when url is missing', async () => {
    const request = createRequest('http://localhost/api/check')
    const response = await GET(request)
    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.error).toBeDefined()
    expect(data.error.code).toBe('INVALID_REQUEST')
    expect(data.error.message).toBe('URL parameter is required')
  })

  it('returns accessible status for valid URL', async () => {
    const request = createRequest('http://localhost/api/check?url=google.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('accessible')
    expect(data.code).toBe(200)
    expect(data.target).toBe('https://google.com')
  })

  it('returns blocked status on timeout', async () => {
    const request = createRequest('http://localhost/api/check?url=blocked-site.com')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.status).toBe('blocked')
    expect(data.isAccessible).toBeUndefined()
  })

  it('normalizes URL without protocol', async () => {
    const request = createRequest('http://localhost/api/check?url=example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.target).toBe('https://example.com')
  })

  it('includes X-Request-ID header', async () => {
    const request = createRequest('http://localhost/api/check?url=example.com')
    const response = await GET(request)

    expect(response.headers.get('X-Request-ID')).toBe('test-request-id')
  })
})
