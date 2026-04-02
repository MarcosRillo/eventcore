import { expect, test } from '@playwright/test'

test.use({ storageState: 'e2e/.auth/entity-admin.json' })

test('token refresh works transparently', async ({ page }) => {
  await page.goto('/internal-calendar')

  // The page should load successfully even if the access_token from
  // storageState has expired — the refresh interceptor handles it
  await expect(page.locator('h1, [data-testid="calendar"]')).toBeVisible({
    timeout: 30_000,
  })

  // Verify we're still authenticated (not redirected to login)
  await expect(page).not.toHaveURL(/login/)
})
