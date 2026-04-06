import { expect, test as setup } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Entity Admin authentication setup.
 *
 * Uses browser UI login instead of direct API calls to avoid token expiration
 * issues (API tokens expire in 15 min; tests take ~11 min). The frontend
 * handles token refresh automatically, and storageState is saved only after
 * the page confirms the authenticated redirect — ensuring cookies are valid
 * and the auth check has resolved before tests begin.
 */
setup('authenticate as entity admin', async ({ page }) => {
  await page.context().clearCookies();
  await page.goto(`${BASE_URL}/login`);

  // Wait for the login form to be ready (backend cold start can delay /auth/me)
  const emailInput = page.locator('input[name="email"]');
  await expect(emailInput).toBeEnabled({ timeout: 90_000 });

  await emailInput.fill('ana.garcia@enteturismo.gov.ar');

  // Password field uses a separate PasswordInput component — use name selector
  // to avoid timing issues with getByLabel after email fill triggers re-render
  const passwordInput = page.locator('input[name="password"]');
  await expect(passwordInput).toBeVisible({ timeout: 10_000 });
  await passwordInput.fill('password123');

  const loginButton = page.getByRole('button', { name: /iniciar sesión/i });
  await expect(loginButton).toBeEnabled({ timeout: 10_000 });
  await loginButton.click();

  // Wait for redirect to the authenticated area — entity-admin lands on internal calendar
  await page.waitForURL(/internal-calendar|events|organizations/, { timeout: 90_000 });

  await page.context().storageState({ path: 'e2e/.auth/entity-admin.json' });
});
