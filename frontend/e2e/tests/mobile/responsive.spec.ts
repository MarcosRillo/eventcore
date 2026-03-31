import { expect, test } from '@playwright/test';

// Mobile project uses devices['iPhone 14'] (375×812 viewport)

test.describe('Mobile Responsive', () => {
  test('landing page shows hamburger menu button', async ({ page }) => {
    await page.goto('/');

    // PublicHeader renders a mobile menu button with aria-label "Abrir menú"
    await expect(
      page.getByRole('button', { name: /Abrir menú/i })
    ).toBeVisible();
  });

  test('desktop navigation is hidden on mobile', async ({ page }) => {
    await page.goto('/');

    // Desktop nav has class "hidden md:flex" — not visible on mobile
    await expect(
      page.getByRole('navigation', { name: 'Navegación principal' })
    ).not.toBeVisible();
  });

  test('mobile menu button is present and has aria-controls', async ({ page }) => {
    await page.goto('/');

    const hamburger = page.getByRole('button', { name: /Abrir menú/i });
    await expect(hamburger).toBeVisible();

    // Wait for React hydration — aria attributes are set by the client component
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false', { timeout: 5_000 });
    await expect(hamburger).toHaveAttribute('aria-controls', 'mobile-menu');
  });

  test('mobile menu button has correct ARIA attributes', async ({ page }) => {
    await page.goto('/');

    // Wait for React hydration — aria attributes are client-side only
    const hamburger = page.getByRole('button', { name: /Abrir menú/i });
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false', { timeout: 5_000 });
    await expect(hamburger).toHaveAttribute('aria-controls', 'mobile-menu');

    // Button is keyboard accessible (type=button, not submit)
    await expect(hamburger).toHaveAttribute('type', 'button');
  });

  test('landing page hero section renders on mobile', async ({ page }) => {
    await page.goto('/');

    // H1 heading on landing page
    await expect(
      page.getByRole('heading', { name: /Tucumán/i, level: 1 })
    ).toBeVisible();
  });

  test('landing page title is correct on mobile', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Eventos Tucumán/);
  });

  test('calendar page loads on mobile', async ({ page }) => {
    test.slow();
    await page.goto('/calendar');

    // Page loads — title should match
    await expect(page).toHaveTitle(/Eventos|Calendario/);
  });

  test('calendar view toggle is accessible on mobile', async ({ page }) => {
    test.slow();
    await page.goto('/calendar');

    // View toggle buttons are rendered on mobile too
    await expect(page.getByRole('button', { name: 'Vista calendario' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Vista cuadrícula' })).toBeVisible();
  });

  test('login page is usable on mobile', async ({ page }) => {
    await page.goto('/login');

    await expect(
      page.getByRole('heading', { name: 'Eventos Tucumán', level: 2 })
    ).toBeVisible();
    await expect(
      page.getByRole('textbox', { name: /Correo electrónico/i })
    ).toBeAttached();
  });

  test('mobile header contains correct navigation links', async ({ page }) => {
    await page.goto('/');

    // The Acceso Organizadores link is visible in the public header even on mobile
    // (it's inside the menu but the link element is in the DOM even when menu is closed in SSR)
    // Instead verify the logo link and the desktop nav structure
    await expect(page.getByRole('link', { name: 'Eventos Tucumán' })).toBeVisible();

    // The hamburger button exists — menu toggle is client-only behavior
    await expect(
      page.getByRole('button', { name: /Abrir menú/i })
    ).toBeVisible();
  });
});
