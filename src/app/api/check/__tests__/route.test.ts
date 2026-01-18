import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from '../route'

const createRequest = (url: string) => new Request(url)

describe('GET /api/check', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('returns 400 when url is missing', async () => {
    const request = createRequest('http://localhost/api/check')
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns accessible status for valid URL', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(null, { status: 200 }))

    const request = createRequest('http://localhost/api/check?url=google.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.status).toBe('accessible')
    expect(data.code).toBe(200)
  })

  it('returns blocked status on timeout', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('timeout'))

    const request = createRequest('http://localhost/api/check?url=blocked-site.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.status).toBe('blocked')
  })

  it('normalizes URL without protocol', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(new Response(null, { status: 200 }))

    const request = createRequest('http://localhost/api/check?url=example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.target).toBe('https://example.com')
  })
})
