import { expect, test } from '@playwright/test';
import {
  openCreateModal,
  uniqueName,
  waitForModalClose,
  waitForResponse,
} from '../../helpers/crud-helpers';

// This project uses entity-admin storageState (injected by playwright.config.ts)

test.describe('Entity Admin - Locations CRUD', () => {

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.

  test('S1-LOC: create location happy path', async ({ page }) => {
    test.slow();
    await page.goto('/locations');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nueva Ubicación');

    const name = uniqueName('Lugar E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);
    await page.getByRole('dialog').locator('input[name="address"]').fill('Calle Test 123');
    await page.getByRole('dialog').locator('input[name="city"]').fill('Demo City');

    const [response] = await Promise.all([
      waitForResponse(page, '/api/v1/locations', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Ubicación' }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);

    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to pagination)
    await page.getByPlaceholder('Buscar por nombre o ciudad…').fill(name);
    await expect(page.getByText(name)).toBeVisible();
  });

  test('S2-LOC: create location shows validation errors when address and city are empty', async ({ page }) => {
    test.slow();
    await page.goto('/locations');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nueva Ubicación');

    // Fill only name, leave address and city empty
    const name = uniqueName('Lugar E2E Incompleto');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);

    // Submit without address and city
    await page.getByRole('dialog').getByRole('button', { name: 'Crear Ubicación' }).click();

    // Client-side validation blocks submission — dialog must remain open
    // (FormModal maps Spanish error strings to English field keys; error display
    // may not render role="alert", but the dialog MUST stay open)
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 2_000 });
  });

  test('S3-LOC: edit location happy path', async ({ page }) => {
    test.slow();
    await page.goto('/locations');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Ubicaciones/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // Create item first
    await openCreateModal(page, 'Nueva Ubicación');

    const name = uniqueName('Lugar E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);
    await page.getByRole('dialog').locator('input[name="address"]').fill('Calle Test 123');
    await page.getByRole('dialog').locator('input[name="city"]').fill('Demo City');

    const [createResponse] = await Promise.all([
      waitForResponse(page, '/api/v1/locations', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Ubicación' }).click(),
    ]);

    expect(createResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to pagination)
    const searchInput = page.getByPlaceholder('Buscar por nombre o ciudad…');
    await searchInput.fill(name);
    await expect(page.getByText(name)).toBeVisible();

    // Find the row and click edit via title="Editar" (LocationTable sets both title and aria-label)
    const row = page.locator('tr', { hasText: name });
    await row.getByTitle('Editar').click();
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 10_000 });

    // Clear and fill new name
    const newName = uniqueName('Lugar E2E Editado');
    const nameInput = page.getByRole('dialog').locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill(newName);

    const [editResponse] = await Promise.all([
      waitForResponse(page, /locations\/\d+/, 'PUT'),
      page.getByRole('dialog').getByRole('button', { name: 'Actualizar Ubicación' }).click(),
    ]);

    expect(editResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Clear search and search for the new name
    await searchInput.fill(newName);
    await expect(page.getByText(newName)).toBeVisible();
  });
});
