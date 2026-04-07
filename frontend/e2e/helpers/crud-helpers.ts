import { expect, Page, Response } from '@playwright/test';

export function uniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}

export async function openCreateModal(page: Page, buttonText: string): Promise<void> {
  await page.getByRole('button', { name: buttonText }).click();
  // HeadlessUI Dialog renders role="dialog" on the outer wrapper which can appear hidden
  // during CSS transitions. Wait for the Dialog.Panel content instead (h2 heading).
  await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 10_000 });
}

export async function waitForModalClose(page: Page): Promise<void> {
  await expect(page.getByRole('dialog')).toBeAttached({ attached: false, timeout: 15_000 });
}

export async function waitForResponse(
  page: Page,
  urlPattern: string | RegExp,
  method: string
): Promise<Response> {
  const response = await page.waitForResponse(
    (res) => {
      const urlMatch = typeof urlPattern === 'string'
        ? res.url().includes(urlPattern)
        : urlPattern.test(res.url());
      return urlMatch && res.request().method() === method;
    },
    { timeout: 10_000 }
  );
  expect(response.status()).toBeLessThan(400);
  return response;
}
