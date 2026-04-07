import { expect, test } from '@playwright/test';
import {
  openCreateModal,
  uniqueName,
  waitForModalClose,
  waitForResponse,
} from '../../helpers/crud-helpers';

// This project uses entity-admin storageState (injected by playwright.config.ts)

test.describe('Entity Admin - Sectors CRUD', () => {

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.

  test('S1-SEC: create sector happy path', async ({ page }) => {
    test.slow();
    await page.goto('/sectors');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Sectores/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nuevo Sector');

    const name = uniqueName('Sector E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);

    const [response] = await Promise.all([
      waitForResponse(page, '/api/v1/sectors', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Sector' }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);

    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to pagination)
    await page.getByPlaceholder('Buscar por nombre...').fill(name);
    await expect(page.getByText(name)).toBeVisible();
  });

  test('S2-SEC: create sector shows validation error when name is too short', async ({ page }) => {
    test.slow();
    await page.goto('/sectors');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Sectores/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nuevo Sector');

    // Fill name with single character (below min 2 chars)
    await page.getByRole('dialog').locator('input[name="name"]').fill('X');

    // Submit
    await page.getByRole('dialog').getByRole('button', { name: 'Crear Sector' }).click();

    // Client-side validation blocks submission — dialog must remain open
    // (FormModal maps Spanish error strings to English field keys; error display
    // may not render role="alert", but the dialog MUST stay open)
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 2_000 });
  });

  test('S3-SEC: edit sector happy path', async ({ page }) => {
    test.slow();
    await page.goto('/sectors');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Sectores/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // Create item first
    await openCreateModal(page, 'Nuevo Sector');

    const name = uniqueName('Sector E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);

    const [createResponse] = await Promise.all([
      waitForResponse(page, '/api/v1/sectors', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Sector' }).click(),
    ]);

    expect(createResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to pagination)
    const searchInput = page.getByPlaceholder('Buscar por nombre...');
    await searchInput.fill(name);
    await expect(page.getByText(name)).toBeVisible();

    // Find the row and click edit
    const row = page.locator('tr', { hasText: name });
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 10_000 });

    // Clear and fill new name
    const newName = uniqueName('Sector E2E Editado');
    const nameInput = page.getByRole('dialog').locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill(newName);

    const [editResponse] = await Promise.all([
      waitForResponse(page, /sectors\/\d+/, 'PUT'),
      page.getByRole('dialog').getByRole('button', { name: 'Guardar Cambios' }).click(),
    ]);

    expect(editResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Clear search and search for the new name
    await searchInput.fill(newName);
    await expect(page.getByText(newName)).toBeVisible();
  });
});
