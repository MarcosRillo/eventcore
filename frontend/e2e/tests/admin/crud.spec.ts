import { expect, test } from '@playwright/test';

// This project uses entity-admin storageState (injected by playwright.config.ts)

test.describe('Admin CRUD Pages', () => {

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.

  test('event types page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');

    // EventTypesPageContainer renders "Gestión de Tipos de Evento"
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('event types page has search input', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByPlaceholder('Buscar por nombre...')).toBeVisible();
  });

  test('event types page has Nuevo Tipo button', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByRole('button', { name: /Nuevo Tipo/i })).toBeVisible();
  });

  test('locations page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/locations');

    // LocationsPageContainer renders "Gestión de Ubicaciones"
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('locations page has search input', async ({ page }) => {
    test.slow();
    await page.goto('/locations');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByPlaceholder('Buscar por nombre o ciudad…')).toBeVisible();
  });

  test('locations page has Nueva Ubicación button', async ({ page }) => {
    test.slow();
    await page.goto('/locations');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByRole('button', { name: /Nueva Ubicación/i })).toBeVisible();
  });

  test('sectors page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/sectors');

    // SectorsPageContainer renders "Gestión de Sectores"
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Sectores/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('sectors page has Nuevo Sector button', async ({ page }) => {
    test.slow();
    await page.goto('/sectors');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Sectores/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByRole('button', { name: /Nuevo Sector/i })).toBeVisible();
  });

  test('users page loads with heading', async ({ page }) => {
    test.slow();
    await page.goto('/users');

    // UsersPageContainer renders "Usuarios del Equipo"
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Usuarios del Equipo/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });
  });

  test('users page has Invitar Usuario button', async ({ page }) => {
    test.slow();
    await page.goto('/users');

    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Usuarios del Equipo/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await expect(page.getByRole('link', { name: /Invitar Usuario/i })).toBeVisible();
  });

  test('internal calendar page loads', async ({ page }) => {
    test.slow();
    await page.goto('/internal-calendar');

    // Should load without redirecting to login
    await expect(page).toHaveURL(/internal-calendar/, { timeout: 60_000 });
  });
});
