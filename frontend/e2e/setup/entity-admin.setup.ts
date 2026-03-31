import { expect, test as setup } from '@playwright/test';

const API_URL = process.env.API_URL || 'https://plataforma-calendario-monorepo.onrender.com';
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

/**
 * Entity Admin authentication setup.
 *
 * Calls the backend API directly to get auth tokens, then injects the resulting
 * cookies into both the API origin and the frontend origin (BASE_URL) so that
 * Playwright's storageState works whether we run against localhost or production.
 *
 * The middleware reads `access_token` from the browser cookie jar on the
 * frontend domain. The Next.js rewrite proxy forwards API calls with credentials,
 * but browser cookies are domain-scoped, so we must set them for localhost too.
 */
setup('authenticate as entity admin', async ({ request, browser }) => {
  const response = await request.post(`${API_URL}/api/v1/auth/login`, {
    data: {
      email: 'ana.garcia@enteturismo.gov.ar',
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
    // For localhost, secure must be false and sameSite Lax
    secure: frontendUrl.protocol === 'https:',
    sameSite: 'Lax' as const,
    httpOnly: cookie.httpOnly,
  }));

  // Also inject the non-httpOnly 'user' cookie that the middleware uses
  // for role-based routing. Extract from the login response body.
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

  await context.addCookies(mappedCookies);
  await context.storageState({ path: 'e2e/.auth/entity-admin.json' });
  await context.close();
});
