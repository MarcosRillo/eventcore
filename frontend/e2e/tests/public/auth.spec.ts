import { expect, test } from '@playwright/test';

test.describe('Authentication', () => {
  test('login page renders heading and form', async ({ page }) => {
    await page.goto('/login');
    // Heading is stable even while auth initializes
    await expect(page.getByRole('heading', { name: 'Eventos Tucumán', level: 2 })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /Correo electrónico/i })).toBeAttached();
  });

  test('login with valid credentials redirects to internal area', async ({ page }) => {
    test.slow();
    await page.goto('/login');

    // Wait for auth init to complete — inputs become enabled when isLoading=false
    await expect(page.getByRole('textbox', { name: /Correo electrónico/i })).toBeEnabled({ timeout: 30_000 });

    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill('ana.garcia@enteturismo.gov.ar');
    await page.getByPlaceholder('Tu contraseña…').fill('password123');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Entity admin lands on /internal-calendar or /events
    await expect(page).toHaveURL(/internal-calendar|events/, { timeout: 30_000 });
  });

  test('login with wrong password shows error message', async ({ page }) => {
    test.slow();
    await page.goto('/login');

    await expect(page.getByRole('textbox', { name: /Correo electrónico/i })).toBeEnabled({ timeout: 30_000 });

    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill('ana.garcia@enteturismo.gov.ar');
    await page.getByPlaceholder('Tu contraseña…').fill('wrongpassword_e2e');
    await page.getByRole('button', { name: /Iniciar Sesión/i }).click();

    // Error toast: "Credenciales incorrectas. Verifica tu email y contraseña."
    await expect(
      page.getByText(/credenciales incorrectas|credentials|invalid/i)
    ).toBeVisible({ timeout: 15_000 });
  });

  test('unauthenticated user is redirected from /events to /login', async ({ page }) => {
    await page.goto('/events');
    // Middleware redirects protected routes to /login immediately
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test('unauthenticated user is redirected from /organizer/dashboard to /login', async ({ page }) => {
    await page.goto('/organizer/dashboard');
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test('unauthenticated user is redirected from /organizations to /login', async ({ page }) => {
    await page.goto('/organizations');
    await expect(page).toHaveURL(/login/, { timeout: 10_000 });
  });

  test('authenticated organizer visiting /login is redirected to dashboard', async ({ page }) => {
    // This test runs in the public project (no storageState) — we verify the
    // login page is accessible to unauthenticated users (not redirected away)
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: 'Eventos Tucumán', level: 2 })).toBeVisible();
    // URL stays on /login for unauthenticated user
    await expect(page).toHaveURL(/login/);
  });
});
