# Testing Strategy

## WebsiteUnblocker.com - Quality Assurance Plan

---

## Testing Philosophy

**Principle:** Test the critical path exhaustively, skip trivial coverage.

```
Core Tool (DiagnosisTool) → 100% coverage
API Endpoints → 100% coverage
UI Components → 80% coverage (skip trivial)
Utility Functions → 90% coverage
```

---

## Test Stack

```json
{
  "unit": "vitest",
  "component": "@testing-library/react",
  "e2e": "playwright",
  "api": "vitest + msw",
  "visual": "playwright screenshots",
  "performance": "lighthouse CI"
}
```

---

## 1. Unit Tests

### 1.1 API Route Tests

```typescript
// src/app/api/check/__tests__/route.test.ts

import { describe, it, expect, vi } from 'vitest'
import { GET } from '../route'

describe('GET /api/check', () => {
  it('returns 400 when url is missing', async () => {
    const request = new Request('http://localhost/api/check')
    const response = await GET(request)
    expect(response.status).toBe(400)
  })

  it('returns accessible status for valid URL', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 })
    )

    const request = new Request('http://localhost/api/check?url=google.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.status).toBe('accessible')
    expect(data.code).toBe(200)
  })

  it('returns blocked status on timeout', async () => {
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('timeout'))

    const request = new Request('http://localhost/api/check?url=blocked-site.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.status).toBe('blocked')
  })

  it('normalizes URL without protocol', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(null, { status: 200 })
    )

    const request = new Request('http://localhost/api/check?url=example.com')
    const response = await GET(request)
    const data = await response.json()

    expect(data.target).toBe('https://example.com')
  })
})
```

### 1.2 Utility Function Tests

```typescript
// src/lib/__tests__/url-utils.test.ts

import { describe, it, expect } from 'vitest'
import { normalizeUrl, extractDomain, isValidUrl } from '../url-utils'

describe('normalizeUrl', () => {
  it('adds https:// to bare domain', () => {
    expect(normalizeUrl('example.com')).toBe('https://example.com')
  })

  it('preserves existing http://', () => {
    expect(normalizeUrl('http://example.com')).toBe('http://example.com')
  })

  it('preserves existing https://', () => {
    expect(normalizeUrl('https://example.com')).toBe('https://example.com')
  })
})

describe('extractDomain', () => {
  it('extracts domain from full URL', () => {
    expect(extractDomain('https://www.example.com/path')).toBe('example.com')
  })
})

describe('isValidUrl', () => {
  it('returns true for valid domains', () => {
    expect(isValidUrl('google.com')).toBe(true)
    expect(isValidUrl('sub.domain.co.uk')).toBe(true)
  })

  it('returns false for invalid input', () => {
    expect(isValidUrl('')).toBe(false)
    expect(isValidUrl('not a url')).toBe(false)
    expect(isValidUrl('javascript:alert(1)')).toBe(false)
  })
})
```

---

## 2. Component Tests

### 2.1 DiagnosisTool Tests

```typescript
// src/components/__tests__/DiagnosisTool.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DiagnosisTool } from '../DiagnosisTool'

describe('DiagnosisTool', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('renders input and button', () => {
    render(<DiagnosisTool />)

    expect(screen.getByPlaceholderText(/youtube.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument()
  })

  it('disables button when input is empty', () => {
    render(<DiagnosisTool />)

    const button = screen.getByRole('button', { name: /check/i })
    expect(button).toBeDisabled()
  })

  it('enables button when input has value', async () => {
    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await userEvent.type(input, 'google.com')

    const button = screen.getByRole('button', { name: /check/i })
    expect(button).not.toBeDisabled()
  })

  it('shows loading state during check', async () => {
    vi.spyOn(global, 'fetch').mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    )

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await userEvent.type(input, 'google.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    expect(screen.getByText(/checking/i)).toBeInTheDocument()
  })

  it('shows accessible result for successful check', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({
        status: 'accessible',
        code: 200,
        latency: 150,
        target: 'https://google.com'
      }))
    )

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await userEvent.type(input, 'google.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/website accessible/i)).toBeInTheDocument()
    })
  })

  it('shows blocked result with VPN recommendation', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({
        status: 'blocked',
        latency: 5000,
        target: 'https://blocked.com',
        error: 'Connection Timeout'
      }))
    )

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await userEvent.type(input, 'blocked.com')

    const button = screen.getByRole('button', { name: /check/i })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/access restricted/i)).toBeInTheDocument()
      expect(screen.getByText(/nordvpn/i)).toBeInTheDocument()
    })
  })

  it('submits on Enter key', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ status: 'accessible', code: 200, latency: 100, target: 'https://test.com' }))
    )

    render(<DiagnosisTool />)

    const input = screen.getByPlaceholderText(/youtube.com/i)
    await userEvent.type(input, 'test.com{enter}')

    expect(fetchSpy).toHaveBeenCalled()
  })
})
```

---

## 3. E2E Tests (Playwright)

### 3.1 Critical User Journeys

```typescript
// e2e/diagnosis-flow.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Website Diagnosis Flow', () => {
  test('user can check a website and see result', async ({ page }) => {
    await page.goto('/')

    // Enter URL
    await page.fill('input[placeholder*="youtube"]', 'google.com')

    // Click check
    await page.click('button:has-text("Check")')

    // Wait for result
    await expect(page.locator('text=/accessible|blocked/i')).toBeVisible({
      timeout: 10000
    })
  })

  test('blocked site shows VPN recommendation', async ({ page }) => {
    // Mock API to return blocked
    await page.route('/api/check*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'blocked',
          latency: 5000,
          target: 'https://blocked-site.com',
          error: 'Timeout'
        })
      })
    })

    await page.goto('/')
    await page.fill('input[placeholder*="youtube"]', 'blocked-site.com')
    await page.click('button:has-text("Check")')

    // Verify VPN CTA appears
    await expect(page.locator('text=NordVPN')).toBeVisible()
    await expect(page.locator('a[href*="nordvpn"]')).toBeVisible()
  })

  test('VPN affiliate link opens in new tab', async ({ page, context }) => {
    // Setup blocked response
    await page.route('/api/check*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'blocked',
          latency: 5000,
          target: 'https://test.com'
        })
      })
    })

    await page.goto('/')
    await page.fill('input[placeholder*="youtube"]', 'test.com')
    await page.click('button:has-text("Check")')

    // Wait for result
    await expect(page.locator('text=NordVPN')).toBeVisible()

    // Click affiliate link
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.click('a[href*="nordvpn"]')
    ])

    expect(newPage.url()).toContain('nordvpn')
  })
})

test.describe('Blog Navigation', () => {
  test('user can navigate to blog and read article', async ({ page }) => {
    await page.goto('/')

    // Click blog link
    await page.click('a[href="/blog"]')
    await expect(page).toHaveURL('/blog')

    // Click first article (if exists)
    const firstArticle = page.locator('a[href^="/blog/"]').first()
    if (await firstArticle.isVisible()) {
      await firstArticle.click()
      await expect(page.locator('h1')).toBeVisible()
    }
  })
})

test.describe('Admin Access', () => {
  test('admin panel is accessible', async ({ page }) => {
    await page.goto('/admin')

    // Should show login or dashboard
    await expect(page.locator('text=/login|dashboard/i')).toBeVisible({
      timeout: 10000
    })
  })
})
```

### 3.2 Visual Regression Tests

```typescript
// e2e/visual.spec.ts

import { test, expect } from '@playwright/test'

test.describe('Visual Regression', () => {
  test('homepage matches snapshot', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100
    })
  })

  test('diagnosis tool states', async ({ page }) => {
    await page.goto('/')

    // Empty state
    await expect(page.locator('[data-testid="diagnosis-tool"]')).toHaveScreenshot('tool-empty.png')

    // With input
    await page.fill('input[placeholder*="youtube"]', 'google.com')
    await expect(page.locator('[data-testid="diagnosis-tool"]')).toHaveScreenshot('tool-with-input.png')
  })

  test('mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')

    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true
    })
  })
})
```

---

## 4. Performance Tests

### 4.1 Lighthouse CI Config

```javascript
// lighthouserc.js

module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/blog',
      ],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1500 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['error', { maxNumericValue: 200 }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}
```

### 4.2 API Performance Tests

```typescript
// tests/performance/api.test.ts

import { describe, it, expect } from 'vitest'

describe('API Performance', () => {
  it('/api/check responds within 5 seconds', async () => {
    const start = Date.now()

    const response = await fetch('http://localhost:3000/api/check?url=google.com')

    const duration = Date.now() - start
    expect(duration).toBeLessThan(5000)
    expect(response.ok).toBe(true)
  })

  it('handles concurrent requests', async () => {
    const requests = Array(10).fill(null).map(() =>
      fetch('http://localhost:3000/api/check?url=google.com')
    )

    const responses = await Promise.all(requests)
    const allOk = responses.every(r => r.ok)

    expect(allOk).toBe(true)
  })
})
```

---

## 5. Test Data

### 5.1 Fixtures

```typescript
// tests/fixtures/posts.ts

export const mockPosts = [
  {
    id: '1',
    title: 'How to Unblock YouTube in 2026',
    slug: 'how-to-unblock-youtube-2026',
    content: { /* Lexical content */ },
    published_date: '2026-01-15',
    tags: ['VPN Guide', 'Streaming Access'],
    meta_title: 'How to Unblock YouTube - Complete Guide 2026',
    meta_description: 'Learn the best methods to unblock YouTube...',
  },
  {
    id: '2',
    title: 'Best VPNs for Streaming',
    slug: 'best-vpns-streaming',
    content: { /* Lexical content */ },
    published_date: '2026-01-10',
    tags: ['VPN Guide', 'Tool Reviews'],
    meta_title: 'Best VPNs for Streaming in 2026',
    meta_description: 'Compare the top VPNs for streaming Netflix...',
  },
]

export const mockCheckResults = {
  accessible: {
    status: 'accessible' as const,
    code: 200,
    latency: 150,
    target: 'https://google.com',
  },
  blocked: {
    status: 'blocked' as const,
    latency: 5000,
    target: 'https://blocked-site.com',
    error: 'Connection Timeout or Blocked',
  },
  error: {
    status: 'error' as const,
    code: 403,
    latency: 200,
    target: 'https://forbidden-site.com',
  },
}
```

---

## 6. CI Integration

### 6.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run test:unit

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: npx playwright install --with-deps
      - run: pnpm run build
      - run: pnpm run test:e2e

  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm run build
      - run: pnpm run start &
      - run: npx lhci autorun
```

---

## 7. Test Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:lighthouse": "lhci autorun"
  }
}
```

---

## 8. Test Coverage Targets

| Module | Target | Priority |
|--------|--------|----------|
| `/api/check` | 100% | P0 |
| `DiagnosisTool` | 100% | P0 |
| `url-utils` | 90% | P1 |
| `BlogCard` | 80% | P2 |
| `Header/Footer` | 60% | P3 |

---

## 9. Testing Checklist

Before each release:

- [ ] All unit tests pass
- [ ] All E2E tests pass
- [ ] Lighthouse scores meet thresholds
- [ ] Visual regression approved
- [ ] Manual smoke test on production
- [ ] Mobile responsiveness verified
- [ ] Affiliate links working
