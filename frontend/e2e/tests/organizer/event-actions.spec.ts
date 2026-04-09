import { expect, test } from '@playwright/test';

import {
  confirmModalAction,
  createEventViaUI,
  openOverflowMenu,
  waitForEventOnDashboard,
} from '../../helpers/crud-helpers';

// All tests use organizer storageState (injected by playwright.config.ts project: "organizer")

test.describe('Organizer Event Actions', () => {

  /**
   * S1-EA: Submit for review — create event, open overflow menu, send for review,
   * confirm via modal, assert status changes from "Borrador"
   */
  test('S1-EA: can submit event for review via overflow menu', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    // Locate card (search across pages if needed)
    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });

    await openOverflowMenu(page, title);

    // Click "Enviar a revisión" menu item
    await page.getByRole('menuitem', { name: 'Enviar a revisión' }).click();

    // Confirm in modal — pass submit URL so we wait for API before checking dialog close
    await confirmModalAction(page, 'Enviar', /organizer\/events\/\d+\/submit/);

    // Card should now show a different status (not "Borrador")
    // After submit for review, status becomes "pending_internal_approval" = "Pendiente revision"
    await expect(card.getByText('Pendiente revision')).toBeVisible({ timeout: 15_000 });
  });

  /**
   * S2-EA: Delete draft — create event, open overflow menu, delete, confirm,
   * assert card is gone from dashboard
   */
  test('S2-EA: can delete a draft event via overflow menu', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });

    await openOverflowMenu(page, title);

    // Click "Eliminar" menu item
    await page.getByRole('menuitem', { name: 'Eliminar' }).click();

    // Confirm deletion in modal — pass delete URL so we wait for API before checking dialog close
    // DELETE /organizer/events/{id} — match URL containing events/NNN with no path suffix
    await confirmModalAction(page, 'Eliminar', /organizer\/events\/\d+([?#]|$)/);

    // Card should no longer be on the dashboard — wait for it to disappear
    await expect(
      page.locator('article').filter({ has: page.locator('h3', { hasText: title }) }).first()
    ).not.toBeVisible({ timeout: 15_000 });
  });

  /**
   * S3-EA: No overflow after submit — after event is submitted for review,
   * the overflow menu button should not be attached (OverflowMenu returns null with empty items)
   */
  test('S3-EA: overflow menu button absent after event is submitted for review', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });

    await openOverflowMenu(page, title);

    await page.getByRole('menuitem', { name: 'Enviar a revisión' }).click();
    await confirmModalAction(page, 'Enviar', /organizer\/events\/\d+\/submit/);

    // Wait for the status to update (submit API completes)
    await expect(card.getByText('Pendiente revision')).toBeVisible({ timeout: 15_000 });

    // After review submission, canSubmit=false and canDelete=false → items=[] → OverflowMenu returns null
    // The MenuButton should no longer be in the DOM
    const overflowButton = page.getByRole('button', {
      name: new RegExp(`Acciones de ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`),
    });
    await expect(overflowButton).not.toBeAttached({ timeout: 10_000 });
  });

  /**
   * S4-EA: Navigate to detail — create event, click "Ver" button,
   * assert URL matches /organizer/\d+
   */
  test('S4-EA: clicking Ver button navigates to event detail page', async ({ page }) => {
    test.slow();

    const { title, id } = await createEventViaUI(page);

    const card = await waitForEventOnDashboard(page, title, id);
    await expect(card).toBeVisible({ timeout: 5_000 });

    // Click "Ver" button (aria-label: "Ver {title}")
    await card.getByRole('button', { name: new RegExp(`Ver ${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`) }).click();

    // URL should match /organizer/<number>
    await page.waitForURL(/\/organizer\/\d+/, { timeout: 15_000 });
    await expect(page).toHaveURL(/\/organizer\/\d+/);
  });
});
