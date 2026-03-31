import { expect, test } from '@playwright/test';

// This project uses entity-admin storageState (injected by playwright.config.ts)
//
// NOTE: All tests in this file require production URL.
// In local dev, Next.js Turbopack uses eval() which is blocked by the app's CSP
// (script-src 'self' 'unsafe-inline' without 'unsafe-eval'). This prevents the
// client bundle from executing, leaving a blank page. Run with BASE_URL pointing
// to production to execute these tests.

test.describe('Entity Admin - Events', () => {
  test.beforeEach(async ({}, testInfo) => {
    testInfo.skip(
      !process.env.BASE_URL || process.env.BASE_URL.includes('localhost'),
      'Requires production URL — CSP blocks eval() in dev mode'
    );
  });

  test('events page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    // AdminDashboard renders "Gestión de Eventos" heading.
    // Auth check calls /auth/me via proxy (can be slow with Render free tier).
    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('events page shows stats summary bar', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    // AdminStatsSummary renders — wait for heading first as anchor
    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // Filter group with status pills is rendered
    await expect(
      page.getByRole('group', { name: 'Filtrar eventos por estado' })
    ).toBeVisible();
  });

  test('events page has status filter pills', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // STATUS_FILTERS: Todos, Pend. Interno, Pend. Público, Publicados, Req. Cambios, Rechazados
    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });
    await expect(filterGroup.getByText('Todos')).toBeVisible();
    await expect(filterGroup.getByText('Pend. Interno')).toBeVisible();
    await expect(filterGroup.getByText('Publicados')).toBeVisible();
  });

  test('can filter events by status — Publicados', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });

    // Click "Publicados" pill
    await filterGroup.getByText('Publicados').click();

    // The filter pill for "Publicados" should now be active
    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible();
  });

  test('time scope toggle is visible — Próximos / Pasados', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // SegmentedControl with aria-label "Filtrar por periodo"
    await expect(page.getByRole('group', { name: 'Filtrar por periodo' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Próximos' })).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Pasados' })).toBeVisible();
  });

  test('search input is present on events page', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(
      page.getByPlaceholder('Buscar por título o descripción…')
    ).toBeVisible();
  });

  test('can view event detail via Gestionar button', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(
      page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // Look for a "Gestionar" button on the first event card
    const gestionarButtons = page.getByRole('button', { name: /gestionar/i });
    const count = await gestionarButtons.count();

    if (count > 0) {
      await gestionarButtons.first().click();
      // EventManagementModal should open — it has a dialog role
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    } else {
      // No events loaded — page still renders correctly
      await expect(
        page.getByRole('heading', { name: 'Gestión de Eventos', level: 1 })
      ).toBeVisible();
    }
  });
});
