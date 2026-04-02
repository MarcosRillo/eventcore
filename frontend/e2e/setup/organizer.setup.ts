import { expect, test as setup } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Organizer authentication setup.
 * See entity-admin.setup.ts for implementation notes.
 */
setup('authenticate as organizer', async ({ page }) => {
  await page.goto(`${BASE_URL}/login`);

  // Wait for the login form to be ready (backend cold start can delay /auth/me)
  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeEnabled({ timeout: 90_000 });

  await emailInput.fill('maria.rodriguez@sheraton.com');

  // Password field uses a separate PasswordInput component — use name selector
  // to avoid timing issues with getByLabel after email fill triggers re-render
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10_000 });
  await passwordInput.fill('password123');

  const loginButton = page.getByRole('button', { name: /iniciar sesión/i });
  await expect(loginButton).toBeEnabled({ timeout: 10_000 });
  await loginButton.click();

  // Wait for redirect to the authenticated area — organizer lands on /organizer/dashboard
  await page.waitForURL(/organizer/, { timeout: 90_000 });

  await page.context().storageState({ path: 'e2e/.auth/organizer.json' });
});
