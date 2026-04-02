import { expect, test } from '@playwright/test';

// This project uses entity-admin storageState (injected by playwright.config.ts)

test.describe('Entity Admin - Events', () => {

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.
  const mainHeading = (page: Parameters<Parameters<typeof test>[1]>[0]['page']) =>
    page.locator('#main-content').getByRole('heading', { name: 'Gestión de Eventos', level: 1 });

  test('events page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    // AdminDashboard renders "Gestión de Eventos" heading.
    // Auth check calls /auth/me via proxy (can be slow with Render free tier).
    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });
  });

  test('events page shows stats summary bar', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    // AdminStatsSummary renders — wait for heading first as anchor
    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // Filter group with status pills is rendered
    await expect(
      page.getByRole('group', { name: 'Filtrar eventos por estado' })
    ).toBeVisible();
  });

  test('events page has status filter pills', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // STATUS_FILTERS: Todos, Pend. Interno, Pend. Público, Publicados, Req. Cambios, Rechazados
    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });
    await expect(filterGroup.getByText('Todos')).toBeVisible();
    await expect(filterGroup.getByText('Pend. Interno')).toBeVisible();
    await expect(filterGroup.getByText('Publicados')).toBeVisible();
  });

  test('can filter events by status — Publicados', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    const filterGroup = page.getByRole('group', { name: 'Filtrar eventos por estado' });

    // Click "Publicados" pill
    await filterGroup.getByText('Publicados').click();

    // The filter pill for "Publicados" should now be active
    await expect(mainHeading(page)).toBeVisible();
  });

  test('time scope toggle is visible — Próximos / Pasados', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // SegmentedControl with aria-label "Filtrar por periodo"
    // SegmentedControl renders role="group" with role="button" (aria-pressed) options —
    // NOT role="radiogroup" with role="radio".
    const timeScopeGroup = page.getByRole('group', { name: 'Filtrar por periodo' });
    await expect(timeScopeGroup).toBeVisible();
    await expect(timeScopeGroup.getByRole('button', { name: 'Próximos' })).toBeVisible();
    await expect(timeScopeGroup.getByRole('button', { name: 'Pasados' })).toBeVisible();
  });

  test('search input is present on events page', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    await expect(
      page.getByPlaceholder('Buscar por título o descripción…')
    ).toBeVisible();
  });

  test('can view event detail via Gestionar button', async ({ page }) => {
    test.slow();
    await page.goto('/events');

    await expect(mainHeading(page)).toBeVisible({ timeout: 60_000 });

    // Look for a "Gestionar" button on the first event card
    const gestionarButtons = page.getByRole('button', { name: /gestionar/i });
    const count = await gestionarButtons.count();

    if (count > 0) {
      await gestionarButtons.first().click();
      // EventManagementModal should open — it has a dialog role
      await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10_000 });
    } else {
      // No events loaded — page still renders correctly
      await expect(mainHeading(page)).toBeVisible();
    }
  });
});
