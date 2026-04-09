import { expect, test } from '@playwright/test';

import {
  createEventViaUI,
  pickDate,
  selectListboxOption,
  uniqueName,
  waitForEventOnDashboard,
} from '../../helpers/crud-helpers';

// All tests use organizer storageState (injected by playwright.config.ts project: "organizer")

test.describe('Organizer Event Create', () => {

  /**
   * S1-EC: Happy path — creates a full event and asserts success toast
   */
  test('S1-EC: creates event via happy path and shows success toast', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    // Success toast should be visible after redirect
    await expect(page.getByText('Evento creado correctamente como borrador.')).toBeVisible({
      timeout: 10_000,
    });

    // Event should appear on dashboard (search across pages)
    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });
  });

  /**
   * S2-EC: Custom location — toggles custom location checkbox and fills custom_location_name
   */
  test('S2-EC: creates event with custom location', async ({ page }) => {
    test.slow();

    const title = uniqueName('Evento Ubicacion Custom');

    await page.goto('/organizer/create');
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Evento' })).toBeVisible({
      timeout: 60_000,
    });

    // Fill title and description (use regex — labels include "*" for required fields)
    await page.getByRole('textbox', { name: /Nombre del Evento/ }).fill(title);
    await page.getByRole('textbox', { name: /Descripción/ }).fill('Descripción con ubicación personalizada');

    // Select event type
    await selectListboxOption(page, 'Tipo de Evento', 0);

    // Wait for subtype button to become enabled
    await expect(
      page.getByRole('button', { name: /Subtipo de Evento/ })
    ).not.toBeDisabled({ timeout: 10_000 });

    // Select subtype
    await selectListboxOption(page, 'Subtipo de Evento', 0);

    // Toggle custom location checkbox
    await page.getByRole('checkbox', { name: /Agregar ubicación personalizada/i }).check();

    // Fill custom location name (label may have "*" — use regex)
    await page.getByRole('textbox', { name: /Nombre del Lugar/ }).fill('Salón de Eventos El Test');

    // Pick start date
    await pickDate(page, 'Fecha Inicio');

    // Submit and wait for API + redirect
    const responsePromise = page.waitForResponse(
      (res) => res.url().includes('/organizer/events') && res.request().method() === 'POST',
      { timeout: 30_000 }
    );

    await page.getByRole('button', { name: 'Crear Evento' }).click();
    await responsePromise;

    // Assert redirect to dashboard
    await page.waitForURL(/organizer\/dashboard/, { timeout: 30_000 });
    await expect(page).toHaveURL(/organizer\/dashboard/);
  });

  /**
   * S3-EC: Empty submit — immediately click submit, assert URL unchanged and errors visible
   */
  test('S3-EC: empty submit shows validation errors and stays on page', async ({ page }) => {
    test.slow();

    await page.goto('/organizer/create');
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Evento' })).toBeVisible({
      timeout: 60_000,
    });

    // Click submit without filling any field
    await page.getByRole('button', { name: 'Crear Evento' }).click();

    // URL should remain on create page
    await expect(page).toHaveURL(/organizer\/create/, { timeout: 5_000 });

    // Validation error for title should be visible
    await expect(page.getByText('El título es requerido')).toBeVisible({ timeout: 5_000 });
  });

  /**
   * S4-EC: Partial fields — fill only title+description, submit, assert errors visible
   */
  test('S4-EC: partial fields submit shows remaining validation errors', async ({ page }) => {
    test.slow();

    await page.goto('/organizer/create');
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Evento' })).toBeVisible({
      timeout: 60_000,
    });

    // Fill only title and description (use regex for required-field label matching)
    await page.getByRole('textbox', { name: /Nombre del Evento/ }).fill('Evento Parcial Test');
    await page.getByRole('textbox', { name: /Descripción/ }).fill('Solo descripción sin otros campos');

    // Click submit
    await page.getByRole('button', { name: 'Crear Evento' }).click();

    // URL should remain on create page
    await expect(page).toHaveURL(/organizer\/create/, { timeout: 5_000 });

    // Should show error for missing event type
    await expect(
      page.getByText('El tipo de evento es requerido')
    ).toBeVisible({ timeout: 5_000 });
  });

  /**
   * S5-EC: Draft on dashboard — create event and verify it appears as "Borrador" on dashboard
   */
  test('S5-EC: newly created event appears as Borrador on dashboard', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    // Find the card on the dashboard (search across pages)
    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });

    // Status badge should show "Borrador"
    await expect(card.getByText('Borrador')).toBeVisible({ timeout: 5_000 });
  });
});
