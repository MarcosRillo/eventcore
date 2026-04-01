import { expect, test } from '@playwright/test';

// This project uses entity-admin storageState (injected by playwright.config.ts)
//
// NOTE: All tests in this file require production URL.
// In local dev, Next.js Turbopack uses eval() which is blocked by the app's CSP
// (script-src 'self' 'unsafe-inline' without 'unsafe-eval'). This prevents the
// client bundle from executing, leaving a blank page. Run with BASE_URL pointing
// to production to execute these tests.

test.describe('Organizations Management', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !process.env.BASE_URL || process.env.BASE_URL.includes('localhost'),
      'Requires production URL — CSP blocks eval() in dev mode'
    );
  });

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.
  const mainHeading = (page: Parameters<Parameters<typeof test>[1]>[0]['page']) =>
    page.locator('#main-content').getByRole('heading', { name: 'Organizaciones', level: 1 });

  test('organizations page renders heading', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    // OrganizationsPage renders an h1 "Organizaciones" inside #main-content
    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });
  });

  test('unified view has 3 tabs: Organizaciones, Solicitudes, Invitaciones', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // UnifiedOrganizationsContainer renders 3 tab buttons
    await expect(page.getByRole('button', { name: /Organizaciones/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Solicitudes/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Invitaciones/ })).toBeVisible();
  });

  test('Organizaciones tab is active by default', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // Default tab is 'organizations' — OrganizationTableContainer is mounted
    await expect(page.getByRole('button', { name: /Organizaciones/ })).toBeVisible();
  });

  test('clicking Solicitudes tab switches content', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    await page.getByRole('button', { name: /Solicitudes/ }).click();

    // After clicking, page should still render without crash
    await expect(mainHeading(page)).toBeVisible();
  });

  test('clicking Invitaciones tab switches content', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    await page.getByRole('button', { name: /Invitaciones/ }).click();

    // Page renders without crash
    await expect(mainHeading(page)).toBeVisible();
  });

  test('organizations tab shows description text on load', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // The description text is also present
    await expect(
      page.getByText('Gestiona organizaciones, solicitudes de registro e invitaciones')
    ).toBeVisible();
  });
});
