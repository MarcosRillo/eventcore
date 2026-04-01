import { expect, test as setup } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://plataforma-calendario-monorepo.onrender.com';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Organizer authentication setup.
 * See entity-admin.setup.ts for implementation notes.
 */
setup('authenticate as organizer', async ({ request, browser }) => {
  const response = await request.post(`${API_URL}/api/v1/auth/login`, {
    data: {
      email: 'maria.rodriguez@sheraton.com',
      password: 'password123',
    },
  });

  expect(response.ok()).toBeTruthy();
  const body = await response.json();
  expect(body.success).toBe(true);

  // Extract cookies from the API response
  const responseCookies = await request.storageState();

  // Create a browser context to inject cookies for the frontend domain
  const context = await browser.newContext();

  // Re-map cookies to the frontend domain so the middleware can read them
  const frontendUrl = new URL(BASE_URL);
  const mappedCookies = responseCookies.cookies.map((cookie) => ({
    ...cookie,
    domain: frontendUrl.hostname,
    secure: frontendUrl.protocol === 'https:',
    sameSite: 'Lax' as const,
    httpOnly: cookie.httpOnly,
  }));

  // Inject the non-httpOnly 'user' cookie used by the middleware for role routing
  if (body.data?.user) {
    mappedCookies.push({
      name: 'user',
      value: encodeURIComponent(JSON.stringify(body.data.user)),
      domain: frontendUrl.hostname,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: frontendUrl.protocol === 'https:',
      sameSite: 'Lax' as const,
    });
  }
  if (body.data?.expires_at) {
    mappedCookies.push({
      name: 'token_expires_at',
      value: encodeURIComponent(body.data.expires_at),
      domain: frontendUrl.hostname,
      path: '/',
      expires: -1,
      httpOnly: false,
      secure: frontendUrl.protocol === 'https:',
      sameSite: 'Lax' as const,
    });
  }

  await context.addCookies(mappedCookies);
  await context.storageState({ path: 'e2e/.auth/organizer.json' });
  await context.close();
});
