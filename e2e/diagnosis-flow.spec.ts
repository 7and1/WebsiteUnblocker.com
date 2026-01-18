import { test, expect } from '@playwright/test'

test('diagnosis tool flow', async ({ page }) => {
  await page.route('**/api/check*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: 'accessible',
        code: 200,
        latency: 120,
        target: 'https://example.com',
      }),
    })
  })

  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Check if Websites are/i })).toBeVisible()

  const input = page.getByRole('searchbox')
  await input.fill('example.com')

  await page.getByRole('button', { name: /check/i }).click()

  await expect(page.getByText(/Website Accessible/i)).toBeVisible()
})
