import { expect, test } from '@playwright/test';

test('landing page loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/eventcore/);
  await expect(page.getByRole('heading', { name: /Tucumán/i, level: 1 })).toBeVisible();
});

test('landing renders featured events and event types', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Sin eventos destacados/i)).toHaveCount(0);
  await expect(page.getByText(/Sin tipos de eventos disponibles/i)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Próximos Eventos Destacados/i })).toBeVisible();
  await expect(page.getByRole('heading', { name: /¿Qué estás buscando\?/i })).toBeVisible();
});

test('calendar page loads', async ({ page }) => {
  await page.goto('/calendar');
  await expect(page).toHaveTitle(/Calendario|Eventos/);
});

test('login page loads', async ({ page }) => {
  await page.goto('/login');
  // Heading is always visible regardless of auth loading state
  await expect(page.getByRole('heading', { name: 'eventcore', level: 2 })).toBeVisible();
  // Email input is always present (may be disabled while auth resolves)
  await expect(page.getByRole('textbox', { name: /Correo electrónico/i })).toBeAttached();
});
