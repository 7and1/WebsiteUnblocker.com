import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('should display hero section with diagnosis tool', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    await expect(page.getByLabel('Website URL to check')).toBeVisible()
    await expect(page.getByRole('button', { name: /check/i })).toBeVisible()
  })

  test('should have proper meta tags for SEO', async ({ page }) => {
    await page.goto('/')

    const title = await page.title()
    expect(title).toContain('Website Unblocker')

    const metaDescription = await page.locator('meta[name="description"]').getAttribute('content')
    expect(metaDescription).toBeTruthy()
    expect(metaDescription!.length).toBeGreaterThan(50)

    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content')
    expect(ogTitle).toBeTruthy()

    const ogDescription = await page
      .locator('meta[property="og:description"]')
      .getAttribute('content')
    expect(ogDescription).toBeTruthy()

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href')
    expect(canonical).toBeTruthy()
  })

  test('should have accessible navigation', async ({ page }) => {
    await page.goto('/')

    const header = page.getByRole('banner')
    await expect(header).toBeVisible()

    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
  })
})

test.describe('Diagnosis Tool', () => {
  test('should keep button disabled for empty input', async ({ page }) => {
    await page.goto('/')

    const checkButton = page.getByRole('button', { name: /^check$/i })
    await expect(checkButton).toBeDisabled()
  })

  test('should handle blocked website response', async ({ page }) => {
    await page.route('**/api/check*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'blocked',
          code: 403,
          latency: 120,
          target: 'https://blocked-site.com',
          blockReason: 'FIREWALL',
        }),
      })
    })

    await page.goto('/')

    const input = page.getByLabel('Website URL to check')
    await input.fill('blocked-site.com')
    await page.getByRole('button', { name: /^check$/i }).click()

    await expect(page.getByText(/access restricted/i)).toBeVisible({ timeout: 10000 })
  })

  test('should handle error response', async ({ page }) => {
    await page.route('**/api/check*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'error',
          code: 500,
          latency: 0,
          target: 'https://error-site.com',
          error: 'Internal server error',
        }),
      })
    })

    await page.goto('/')

    const input = page.getByLabel('Website URL to check')
    await input.fill('error-site.com')
    await page.getByRole('button', { name: /^check$/i }).click()

    await expect(page.getByText(/access error/i)).toBeVisible({ timeout: 10000 })
  })

  test('should show loading state during check', async ({ page }) => {
    await page.route('**/api/check*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: 'accessible',
          code: 200,
          latency: 100,
          target: 'https://example.com',
        }),
      })
    })

    await page.goto('/')

    const input = page.getByLabel('Website URL to check')
    await input.fill('example.com')
    await page.getByRole('button', { name: /^check$/i }).click()

    await expect(page.getByRole('button', { name: /checking/i })).toBeVisible()
    await expect(page.getByText(/website accessible/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Navigation', () => {
  test('should navigate to compare page', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /main navigation/i })
    const compareLink = nav.getByRole('link', { name: /^compare$/i })

    await Promise.all([
      page.waitForURL(/\/compare/, { timeout: 15000 }),
      compareLink.click(),
    ])

    await expect(page).toHaveURL(/\/compare/)
  })

  test('should navigate to Tools page', async ({ page }) => {
    await page.goto('/')

    const nav = page.getByRole('navigation', { name: /main navigation/i })
    const toolsLink = nav.getByRole('link', { name: /^tools$/i })

    await Promise.all([
      page.waitForURL(/\/tools/, { timeout: 15000 }),
      toolsLink.click(),
    ])

    await expect(page).toHaveURL(/\/tools/)
  })
})

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()

    const h1Count = await page.getByRole('heading', { level: 1 }).count()
    expect(h1Count).toBe(1)
  })

  test('should have accessible form labels', async ({ page }) => {
    await page.goto('/')

    const input = page.getByLabel('Website URL to check')
    await expect(input).toBeVisible()
  })

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/')

    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.type('example.com')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
  })
})

test.describe('Performance', () => {
  test('should render primary heading in reasonable time', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible({ timeout: 20000 })
  })

  test('should have preconnect hints', async ({ page }) => {
    await page.goto('/')

    const preconnects = await page.locator('link[rel="preconnect"]').count()
    expect(preconnects).toBeGreaterThanOrEqual(1)
  })
})
