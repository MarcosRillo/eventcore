import { expect, test } from '@playwright/test';

// This project uses organizer storageState (injected by playwright.config.ts)
//
// NOTE: All tests in this file require production URL.
// In local dev, Next.js Turbopack uses eval() which is blocked by the app's CSP
// (script-src 'self' 'unsafe-inline' without 'unsafe-eval'). This prevents the
// client bundle from executing, leaving a blank page. Run with BASE_URL pointing
// to production to execute these tests.

test.describe('Organizer Dashboard', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !process.env.BASE_URL || process.env.BASE_URL.includes('localhost'),
      'Requires production URL — CSP blocks eval() in dev mode'
    );
  });

  test('dashboard loads with Mis Eventos heading', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/dashboard');

    // OrganizerDashboard renders "Mis Eventos" heading
    await expect(
      page.getByRole('heading', { name: 'Mis Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('dashboard shows stats bar', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Mis Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // StatsBar renders with aria-label
    await expect(
      page.getByRole('region', { name: 'Resumen de estadisticas' })
    ).toBeVisible();
  });

  test('can navigate to create event page', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Mis Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // "+ Crear Evento" link points to /organizer/create
    await page.getByRole('link', { name: /Crear Evento/i }).first().click();
    await expect(page).toHaveURL(/organizer\/create/, { timeout: 15_000 });
  });

  test('dashboard has event filter pills', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Mis Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // OrganizerEventFilters renders status filter controls
    // Verify time scope toggle exists (Próximos/Pasados)
    await expect(page.getByRole('group', { name: 'Filtrar por periodo' })).toBeVisible();
  });

  test('organizer cannot access admin /events route', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    // Middleware redirects organizer away from /events to /organizer/dashboard
    await expect(page).toHaveURL(/organizer\/dashboard/, { timeout: 15_000 });
  });

  test('organizer cannot access /organizations route', async ({ page }) => {
    test.slow();
    await page.goto('/organizations');

    // Middleware redirects organizer to organizer dashboard
    await expect(page).toHaveURL(/organizer\/dashboard/, { timeout: 15_000 });
  });

  test('organizer can access /organizer/events page', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/events');

    // Should not redirect to login — organizer has access
    await expect(page).not.toHaveURL(/login/, { timeout: 15_000 });
  });

  test('dashboard subtitle is visible', async ({ page }) => {
    test.slow();
    await page.goto('/organizer/dashboard');

    await expect(
      page.getByRole('heading', { name: 'Mis Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(
      page.getByText('Gestiona tus eventos y su proceso de aprobacion')
    ).toBeVisible();
  });
});
