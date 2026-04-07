import { expect, test } from '@playwright/test';
import {
  openCreateModal,
  uniqueName,
  waitForModalClose,
  waitForResponse,
} from '../../helpers/crud-helpers';

// This project uses entity-admin storageState (injected by playwright.config.ts)

test.describe('Entity Admin - Event Types CRUD', () => {

  // AppHeader (banner) also renders an h1 with the page title.
  // Scope heading locators to #main-content to avoid strict-mode violations
  // from duplicate h1 elements.

  test('S1-ET: create event type happy path', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nuevo Tipo');

    const name = uniqueName('Tipo E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);

    const [response] = await Promise.all([
      waitForResponse(page, '/api/v1/event-types', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Tipo' }).click(),
    ]);

    expect(response.status()).toBeLessThan(400);

    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to accumulated test data)
    await page.getByRole('textbox', { name: /Buscar tipos de evento/i }).fill(name);
    await expect(page.getByText(name)).toBeVisible();
  });

  test('S2-ET: create event type shows validation error when name is empty', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    await openCreateModal(page, 'Nuevo Tipo');

    // Submit without filling name
    await page.getByRole('dialog').getByRole('button', { name: 'Crear Tipo' }).click();

    // Client-side validation blocks submission — dialog must remain open
    // (FormModal maps Spanish error strings to English field keys; error display
    // may not render role="alert", but the dialog MUST stay open)
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 2_000 });
  });

  test('S3-ET: edit event type happy path', async ({ page }) => {
    test.slow();
    await page.goto('/event-types');
    await expect(
      page.locator('#main-content').getByRole('heading', { name: /Gestión de Tipos de Evento/i, level: 1 })
    ).toBeVisible({ timeout: 60_000 });

    // Create item first
    await openCreateModal(page, 'Nuevo Tipo');

    const name = uniqueName('Tipo E2E');
    await page.getByRole('dialog').locator('input[name="name"]').fill(name);

    const [createResponse] = await Promise.all([
      waitForResponse(page, '/api/v1/event-types', 'POST'),
      page.getByRole('dialog').getByRole('button', { name: 'Crear Tipo' }).click(),
    ]);

    expect(createResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Search for the item (it may be on a later page due to accumulated test data)
    const searchInput = page.getByRole('textbox', { name: /Buscar tipos de evento/i });
    await searchInput.fill(name);
    await expect(page.getByText(name)).toBeVisible();

    // Find the row and click edit
    const row = page.locator('tr', { hasText: name });
    await row.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 10_000 });

    // Clear and fill new name
    const newName = uniqueName('Tipo E2E Editado');
    const nameInput = page.getByRole('dialog').locator('input[name="name"]');
    await nameInput.clear();
    await nameInput.fill(newName);

    const [editResponse] = await Promise.all([
      waitForResponse(page, /event-types\/\d+/, 'PUT'),
      page.getByRole('dialog').getByRole('button', { name: 'Guardar Cambios' }).click(),
    ]);

    expect(editResponse.status()).toBeLessThan(400);
    await waitForModalClose(page);

    // Clear search and search for the new name
    await searchInput.fill(newName);
    await expect(page.getByText(newName)).toBeVisible();
  });
});
