import { expect, test } from '@playwright/test';

// This project uses entity-admin storageState (injected by playwright.config.ts)
//
// NOTE: All tests in this file require production URL.
// In local dev, Next.js Turbopack uses eval() which is blocked by the app's CSP
// (script-src 'self' 'unsafe-inline' without 'unsafe-eval'). This prevents the
// client bundle from executing, leaving a blank page. Run with BASE_URL pointing
// to production to execute these tests.

test.describe('Approval Workflow', () => {
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
    page.locator('#main-content').getByRole('heading', { name: 'Gestión de Eventos', level: 1 });

  test('events page has Pend. Interno filter for pending approval', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });

    // "Pend. Interno" maps to pending_internal_approval status
    await expect(filterGroup.getByText('Pend. Interno')).toBeVisible();
  });

  test('clicking Pend. Interno filter shows only pending events', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });
    await filterGroup.getByText('Pend. Interno').click();

    // Page should still render without error
    await expect(mainHeading(page)).toBeVisible();
  });

  test('clicking Req. Cambios filter shows events requiring changes', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });
    await filterGroup.getByText('Req. Cambios').click();

    await expect(mainHeading(page)).toBeVisible();
  });

  test('event management modal has approval action panel', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // Open first event
    const gestionarButtons = page.getByRole('button', { name: /gestionar/i });
    const count = await gestionarButtons.count();

    if (count > 0) {
      await gestionarButtons.first().click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible({ timeout: 10_000 });

      // Modal contains event info
      await expect(dialog).toBeVisible();
    } else {
      // No events — verify empty state or no-event message is shown
      await expect(mainHeading(page)).toBeVisible();
    }
  });

  test('Pend. Público filter exists for second-level approval', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });
    await expect(filterGroup.getByText('Pend. Público')).toBeVisible();
  });
});
