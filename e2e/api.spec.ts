import { test, expect } from '@playwright/test'

test.describe('API Endpoints', () => {
  test.describe('GET /api/check', () => {
    test('should return 400 for missing URL parameter', async ({ request }) => {
      const response = await request.get('/api/check')
      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body.error).toBeDefined()
      expect(body.error.code).toBe('INVALID_REQUEST')
    })

    test('should return 400 for invalid URL format', async ({ request }) => {
      const response = await request.get('/api/check?url=not-a-valid-url!!!')
      expect(response.status()).toBe(400)

      const body = await response.json()
      expect(body.error).toBeDefined()
    })

    test('should return 400 for internal IP addresses (SSRF protection)', async ({ request }) => {
      const internalUrls = [
        'http://localhost',
        'http://127.0.0.1',
        'http://10.0.0.1',
        'http://192.168.1.1',
        'http://169.254.169.254',
      ]

      for (const url of internalUrls) {
        const response = await request.get(`/api/check?url=${encodeURIComponent(url)}`)
        expect(response.status()).toBe(400)

        const body = await response.json()
        expect(body.error.code).toBe('INVALID_REQUEST')
      }
    })

    test('should include X-Request-ID header in response', async ({ request }) => {
      const response = await request.get('/api/check?url=example.com')
      const requestId = response.headers()['x-request-id']
      expect(requestId).toBeDefined()
      expect(requestId.length).toBeGreaterThan(0)
    })

    test('should include rate limit headers', async ({ request }) => {
      const response = await request.get('/api/check?url=example.com')
      const headers = response.headers()

      expect(headers['x-ratelimit-limit']).toBeDefined()
      expect(headers['x-ratelimit-remaining']).toBeDefined()
      expect(headers['x-ratelimit-reset']).toBeDefined()
    })

    test('should include cache control headers', async ({ request }) => {
      const response = await request.get('/api/check?url=example.com')
      const cacheControl = response.headers()['cache-control']
      expect(cacheControl).toContain('max-age')
    })

    test('should handle URL with path correctly', async ({ request }) => {
      const response = await request.get('/api/check?url=example.com/path/to/page')
      expect(response.status()).not.toBe(400)
    })

    test('should handle URL with query string correctly', async ({ request }) => {
      const response = await request.get(`/api/check?url=${encodeURIComponent('example.com?foo=bar')}`)
      expect(response.status()).not.toBe(400)
    })
  })

  test.describe('GET /api/health', () => {
    test('should return 200 OK', async ({ request }) => {
      const response = await request.get('/api/health')
      expect(response.status()).toBe(200)

      const body = await response.json()
      expect(['healthy', 'degraded', 'ok']).toContain(body.status)
    })

    test('should include timestamp', async ({ request }) => {
      const response = await request.get('/api/health')
      const body = await response.json()

      expect(body.timestamp).toBeDefined()
      expect(new Date(body.timestamp).getTime()).not.toBeNaN()
    })
  })

  test.describe('GET /api/sitemap', () => {
    test('should return valid XML sitemap index', async ({ request }) => {
      const response = await request.get('/api/sitemap')
      expect(response.status()).toBe(200)

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('xml')

      const body = await response.text()
      expect(body).toContain('<?xml')
      expect(body).toContain('<sitemapindex')
      expect(body).toContain('websiteunblocker.com')
    })
  })

  test.describe('GET /api/robots', () => {
    test('should return valid robots.txt', async ({ request }) => {
      const response = await request.get('/api/robots')
      expect(response.status()).toBe(200)

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('text/plain')

      const body = await response.text()
      expect(body).toContain('User-agent')
      expect(body).toContain('Sitemap')
      expect(body).toContain('/feed.xml')
    })
  })

  test.describe('Feeds', () => {
    test('should return RSS feed XML', async ({ request }) => {
      const response = await request.get('/feed.xml')
      expect(response.status()).toBe(200)

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('xml')

      const body = await response.text()
      expect(body).toContain('<rss')
      expect(body).toContain('<channel>')
    })

    test('should return Atom feed XML', async ({ request }) => {
      const response = await request.get('/feed.atom')
      expect(response.status()).toBe(200)

      const contentType = response.headers()['content-type']
      expect(contentType).toContain('atom+xml')

      const body = await response.text()
      expect(body).toContain('<feed')
      expect(body).toContain('http://www.w3.org/2005/Atom')
    })

    test('should return 404 for unknown tag feed', async ({ request }) => {
      const response = await request.get('/tag/non-existent-tag/feed.xml')
      expect(response.status()).toBe(404)
    })
  })
})

test.describe('Error Handling', () => {
  test('should return 404 for non-existent API routes', async ({ request }) => {
    const response = await request.get('/api/non-existent-endpoint')
    expect(response.status()).toBe(404)
  })

  test('should handle malformed JSON gracefully', async ({ request }) => {
    const response = await request.post('/api/contact', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: 'not valid json{{{',
    })

    expect([400, 404, 500]).toContain(response.status())
  })
})

test.describe('Security Headers', () => {
  test('should include frame protection header', async ({ request }) => {
    const response = await request.get('/api/health')
    const headers = response.headers()

    expect(headers['x-frame-options']).toBe('DENY')
  })
})
