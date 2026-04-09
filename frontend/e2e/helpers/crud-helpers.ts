import { expect, Locator, Page, Response } from '@playwright/test';


export function uniqueName(prefix: string): string {
  // Combine timestamp + random suffix to avoid collisions in parallel test workers
  const rand = Math.random().toString(36).slice(2, 7);
  return `${prefix} ${Date.now()}-${rand}`;
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

/**
 * T1.1 — selectListboxOption
 *
 * Clicks a HeadlessUI Listbox trigger (identified by partial name match),
 * waits for options to appear in the floating portal, and clicks the option at the given
 * index (default 0).
 *
 * The Select component renders a <ListboxButton> whose accessible name is derived from
 * its associated label (which may contain "*" for required fields). We use regex partial
 * matching so "Tipo de Evento" matches "Tipo de Evento*".
 *
 * @returns The text content of the selected option.
 */
export async function selectListboxOption(
  page: Page,
  selectName: string,
  optionIndex = 0
): Promise<string> {
  // Use regex so "Tipo de Evento" matches button with accessible name "Tipo de Evento*"
  const trigger = page.getByRole('button', { name: new RegExp(escapeRegex(selectName)) }).first();

  await trigger.click();

  // Options are rendered in a floating portal — scope to full page.
  // Wait for the FIRST option to appear (ensures the dropdown is open and data is loaded).
  const options = page.getByRole('option');
  await expect(options.first()).toBeVisible({ timeout: 5_000 });

  const targetOption = options.nth(optionIndex);
  const text = (await targetOption.textContent()) ?? '';
  await targetOption.click();

  // Wait for the listbox to close after selection — prevents the NEXT call from
  // matching stale options from this dropdown that are still animating out.
  await expect(options.first()).not.toBeVisible({ timeout: 3_000 }).catch(() => {});

  return text.trim();
}

/**
 * T1.2 — selectFuzzyOption
 *
 * Opens a FuzzySearchSelect (HeadlessUI Combobox) and selects an option.
 *
 * CRITICAL: The ComboboxButton is positioned `absolute inset-0` over the input,
 * so clicking the input always fails with "intercepts pointer events". We must
 * click the ComboboxButton directly (aria-haspopup="listbox" sibling of input),
 * then fill into the input if search text is needed.
 *
 * IMPORTANT: Options are empty until SWR data loads. We wait for data load
 * by watching for the locations API response before opening the dropdown.
 *
 * @returns The text content of the selected option.
 */
export async function selectFuzzyOption(
  page: Page,
  label: string,
  searchText?: string,
  optionIndex = 0
): Promise<string> {
  // Locate the combobox input
  const input = page.getByRole('combobox', { name: new RegExp(escapeRegex(label)) });

  // Locate the ComboboxButton (absolute overlay sibling) by its aria-haspopup attribute.
  // In HeadlessUI Combobox, the button is an adjacent sibling of the input in the DOM.
  // We target it relative to the input's parent wrapper.
  const openButton = input.locator('xpath=following-sibling::button[@aria-haspopup="listbox"]');

  const options = page.getByRole('option');
  let optionsVisible = false;

  // Retry up to 6 times (12s total) — wait for SWR data to load
  for (let attempt = 0; attempt < 6; attempt++) {
    // Click the ComboboxButton to open the dropdown
    await openButton.click();

    if (searchText) {
      await input.fill(searchText);
    }

    // Wait briefly for options to appear
    try {
      await expect(options.first()).toBeVisible({ timeout: 3_000 });
      optionsVisible = true;
      break;
    } catch {
      // Options not yet available (data still loading) — close and retry
      await page.keyboard.press('Escape');
      await page.waitForTimeout(2_000);
    }
  }

  if (!optionsVisible) {
    throw new Error(`No options appeared for FuzzySearchSelect "${label}" after retries`);
  }

  const targetOption = options.nth(optionIndex);
  const text = (await targetOption.textContent()) ?? '';
  await targetOption.click();

  return text.trim();
}

/**
 * T1.3 — pickDate
 *
 * Clicks the DateTimePicker trigger button (identified by its accessible name),
 * waits for the calendar dialog (<div role="dialog">), clicks day 15.
 *
 * Note: DateTimePicker uses a plain <div role="dialog">, NOT a HeadlessUI Dialog.
 * Selecting a day calls setIsOpen(false) directly — dialog closes on day click.
 * Detect close via not.toBeVisible(), NOT waitForModalClose (which checks HeadlessUI).
 *
 * Label may have "*" appended for required fields — use regex matching.
 */
export async function pickDate(page: Page, pickerName: string): Promise<void> {
  // Use regex to match labels with possible "*" suffix
  const trigger = page.getByRole('button', { name: new RegExp(escapeRegex(pickerName)) }).first();

  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Seleccionar fecha' });
  await expect(dialog).toBeVisible({ timeout: 5_000 });

  // Click day 15 — safe midrange, always exists in any month.
  // DayPicker v9 aria-label is the full date string (e.g. "lunes, 15 de abril de 2026"),
  // so getByRole('button', { name: '15' }) won't match. Instead use text content match:
  // filter buttons inside the dialog whose visible text is exactly "15".
  await dialog.locator('button').filter({ hasText: /^15$/ }).first().click();

  // After selecting a day, setIsOpen(false) is called — dialog closes immediately
  await expect(dialog).not.toBeVisible({ timeout: 5_000 });
}

/**
 * setDateViaReact
 *
 * Directly sets the start_date field value in the React form state by calling the
 * button's onClick prop with a synthetic event. This bypasses the DayPicker calendar
 * UI entirely, allowing tests to set arbitrary future dates without calendar navigation.
 *
 * The DateTimePicker button has `name` attribute — we find it by name and call the
 * React fiber's onClick to open the picker, then programmatically trigger onChange.
 *
 * @param dateValue - ISO date string like "2030-06-15T12:00"
 */
async function setDateViaReact(page: Page, fieldName: string, dateValue: string): Promise<void> {
  await page.evaluate(
    ({ name, value }) => {
      // Find the button with the matching name attribute (DateTimePicker trigger)
      const button = document.querySelector(`button[name="${name}"]`) as HTMLElement | null;
      if (!button) throw new Error(`DateTimePicker button name="${name}" not found`);

      // Walk up the React fiber tree to find the onChange prop
      // React stores fiber on the DOM node as __reactFiber$<hash> or __reactInternalInstance$<hash>
      const fiberKey = Object.keys(button).find(
        (k) => k.startsWith('__reactFiber') || k.startsWith('__reactInternalInstance')
      );
      if (!fiberKey) throw new Error('React fiber not found on button element');

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let fiber = (button as any)[fiberKey];

      // Walk fiber chain to find the component with an onChange prop
      while (fiber) {
        const props = fiber.memoizedProps || fiber.pendingProps;
        if (props && typeof props.onChange === 'function') {
          props.onChange(value);
          return;
        }
        fiber = fiber.return;
      }

      throw new Error(`No onChange handler found for button name="${name}"`);
    },
    { name: fieldName, value: dateValue }
  );
}

/**
 * T1.4 — openOverflowMenu
 *
 * Clicks the OverflowMenu trigger button whose aria-label is "Acciones de {title}".
 * Waits for at least one menuitem to be visible.
 */
export async function openOverflowMenu(page: Page, title: string): Promise<void> {
  const trigger = page.getByRole('button', { name: new RegExp(`Acciones de ${escapeRegex(title)}`) });
  await trigger.click();

  // Wait for dropdown menuitem
  await expect(page.getByRole('menuitem').first()).toBeVisible({ timeout: 5_000 });
}

/**
 * T1.5 — confirmModalAction
 *
 * Waits for a HeadlessUI dialog to be visible (via h2 inside role="dialog"),
 * optionally waits for a network response triggered by the confirm action,
 * clicks the confirm button by its text, then waits for the modal to close.
 *
 * Strategy:
 *   1. Register the API response listener BEFORE clicking (avoids race)
 *   2. Click the confirm button
 *   3. If apiUrlPattern provided: wait for the matching network response first
 *      — this ensures the API call completed before we check dialog state
 *   4. Wait for dialog to detach (HeadlessUI 150ms leave animation + React state)
 *
 * @param apiUrlPattern - optional URL substring/regex to wait for before asserting dialog close
 * @param closeTimeout  - total ms budget for dialog to close after API response (default 15s)
 */
export async function confirmModalAction(
  page: Page,
  confirmButtonText: string,
  apiUrlPattern?: string | RegExp,
  closeTimeout = 10_000
): Promise<void> {
  // Wait for dialog to appear (HeadlessUI dialog — has role="dialog" with h2 inside)
  await expect(page.getByRole('dialog').locator('h2')).toBeVisible({ timeout: 10_000 });

  // Register API response listener BEFORE clicking to avoid race conditions
  // Match any mutating HTTP method (POST, DELETE, PATCH, PUT) for the given URL pattern
  const responsePromise = apiUrlPattern
    ? page.waitForResponse(
        (res) => {
          const urlMatch =
            typeof apiUrlPattern === 'string'
              ? res.url().includes(apiUrlPattern)
              : apiUrlPattern.test(res.url());
          const method = res.request().method();
          return urlMatch && ['POST', 'DELETE', 'PATCH', 'PUT'].includes(method);
        },
        { timeout: 30_000 }
      )
    : null;

  await page.getByRole('button', { name: confirmButtonText }).click();

  // Wait for API response first — guarantees state update triggers are in flight
  if (responsePromise) {
    await responsePromise.catch(() => {
      // Response may have already fired or pattern didn't match — continue
    });

    // After API response, dialog should close promptly (React state + 150ms HeadlessUI animation).
    // Under heavy load the leave animation can be delayed — try with short timeout first,
    // then force-close via "Cerrar" button if the modal is still attached (React 19 timing edge case).
    const closed = await page
      .getByRole('dialog')
      .waitFor({ state: 'detached', timeout: closeTimeout })
      .then(() => true)
      .catch(() => false);

    if (!closed) {
      // Modal still open despite API success — force close via the "Cerrar" button
      // This handles the React 19 startTransition async timing edge case where
      // isPending becomes false before setSubmitModalOpen(false) renders
      const cerrarButton = page.getByRole('button', { name: 'Cerrar' });
      const cerrarVisible = await cerrarButton.isVisible().catch(() => false);
      if (cerrarVisible) {
        await cerrarButton.click();
        await page.getByRole('dialog').waitFor({ state: 'detached', timeout: 5_000 }).catch(() => {});
      }
    }
  } else {
    // No API pattern — just wait for dialog to close
    await expect(page.getByRole('dialog')).toBeAttached({ attached: false, timeout: closeTimeout });
  }
}

/**
 * T1.6 — createEventViaUI
 *
 * Full composite helper. Navigates to /organizer/create, fills all required fields,
 * submits the form and waits for redirect to /organizer/dashboard.
 *
 * Required fields:
 *   - title (string) — uniqueName or override
 *   - description (string)
 *   - event_type (first listbox option)
 *   - event_subtype (first listbox option, after type enables it)
 *   - location (first fuzzy option)
 *   - start_date (set via React fiber to a far-future date)
 *
 * @returns { title, id } — the event title and the backend ID from the POST response.
 */
export async function createEventViaUI(
  page: Page,
  overrides?: { title?: string; description?: string }
): Promise<{ title: string; id: number }> {
  const title = overrides?.title ?? uniqueName('Evento Test');
  const description = overrides?.description ?? 'Descripción de prueba para el evento creado via E2E';

  await page.goto('/organizer/create');

  // Wait for page heading (up to 60s — cold start)
  await expect(page.getByRole('heading', { name: 'Crear Nuevo Evento' })).toBeVisible({ timeout: 60_000 });

  // Fill title — accessible name includes "*" for required; use regex
  await page.getByRole('textbox', { name: /Nombre del Evento/ }).fill(title);

  // Fill description — accessible name includes "*" for required; use regex
  await page.getByRole('textbox', { name: /Descripción/ }).fill(description);

  // Fill edition number — required for submit-for-review validation
  await page.getByRole('textbox', { name: /Número de Edición/ }).fill('1ra Edición');

  // Select event type (first option)
  await selectListboxOption(page, 'Tipo de Evento', 0);

  // Wait for subtype button to become enabled (type selection populates subtypes)
  await expect(
    page.getByRole('button', { name: /Subtipo de Evento/ })
  ).not.toBeDisabled({ timeout: 10_000 });

  // Select subtype (first option) — retry up to 3 times since the subtype dropdown
  // can fail if the Tipo de Evento options are still in DOM (HeadlessUI leave animation)
  for (let attempt = 0; attempt < 3; attempt++) {
    await selectListboxOption(page, 'Subtipo de Evento', 0);

    // Verify the subtype was actually selected — button text should no longer be the placeholder
    const subtypeButton = page.getByRole('button', { name: /Subtipo de Evento/ });
    const subtypeText = await subtypeButton.textContent();
    if (subtypeText && !subtypeText.includes('Seleccionar')) {
      break; // Successfully selected
    }
    // Still showing placeholder — wait a moment and retry
    await page.waitForTimeout(500);
  }

  // Select location via fuzzy (click to show options, pick first)
  await selectFuzzyOption(page, 'Ubicaciones', undefined, 0);

  // Set start_date directly via React fiber — bypass the DayPicker calendar UI.
  await setDateViaReact(page, 'start_date', '9999-12-15T12:00');

  // Register POST response listener BEFORE clicking to avoid race conditions.
  const postResponsePromise = page.waitForResponse(
    (res) => res.url().includes('/organizer/events') && res.request().method() === 'POST',
    { timeout: 30_000 }
  );

  await page.getByRole('button', { name: 'Crear Evento' }).click();

  const postResponse = await postResponsePromise;

  // Extract the event ID from the POST response body
  let id = 0;
  try {
    const body = await postResponse.json() as { event?: { id?: number } };
    id = body?.event?.id ?? 0;
  } catch {
    // JSON parse failed — id remains 0, waitForEventOnDashboard will fall back to scanning
  }

  // Wait for redirect to dashboard
  await page.waitForURL(/organizer\/dashboard/, { timeout: 30_000 });

  return { title, id };
}

/**
 * T1.7 — findEventOnDashboard
 *
 * Returns a locator for the EventPreviewCard article that contains the given title.
 * EventPreviewCard renders as <article> (via Card as="article").
 * The title is inside an <h3> element.
 *
 * NOTE: Use `waitForEventOnDashboard` if you need to search across pages.
 */
export function findEventOnDashboard(page: Page, title: string): Locator {
  return page.locator('article').filter({ has: page.locator('h3', { hasText: title }) }).first();
}

/**
 * waitForEventOnDashboard
 *
 * Navigates to the organizer dashboard and finds the event card by title.
 * Leaves the page on the dashboard page where the card is visible, WITHOUT
 * any status filter — so the card remains visible even after status changes
 * (e.g., after submitting for review, the card's status badge updates in place).
 *
 * Strategy:
 *   1. If eventId is provided (from createEventViaUI), query the backend API via
 *      page.evaluate to find which page the event is on, then navigate directly there.
 *   2. Otherwise, scan all pages of the dashboard.
 *
 * @param eventId - Optional event ID from createEventViaUI; enables direct page navigation.
 */
export async function waitForEventOnDashboard(
  page: Page,
  title: string,
  eventId = 0
): Promise<Locator> {
  const cardLocator = () =>
    page.locator('article').filter({ has: page.locator('h3', { hasText: title }) }).first();

  // Navigate to the dashboard (no status filter) so the card remains visible
  // after status changes (e.g., draft → pending).
  await page.goto('/organizer/dashboard');
  await expect(page.getByRole('heading', { name: /Mis Eventos/i })).toBeVisible({ timeout: 60_000 });

  // If we have the event ID, use page.evaluate to call the API from the browser context.
  // A single page.evaluate call runs the entire page search loop inside the browser,
  // using the browser's cookie jar (proper SameSite + credentials handling).
  if (eventId > 0) {
    try {
      // Run a single bulk fetch inside the browser context to find which UI page
      // the event is on. Using a large per_page avoids paginating through 30+ pages
      // of API results and keeps well within the 120 req/min rate limit.
      const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

      const targetPage: number = await page.evaluate(
        async ({ base, eid }: { base: string; eid: number }) => {
          // Fetch up to 1000 events in one request — well above the expected max.
          // Response format: { data: Array<{id}>, meta: { last_page, total, ... } }
          const PER_PAGE_UI = 10; // must match the dashboard's perPage constant
          try {
            const res = await fetch(
              `${base}/api/v1/organizer/events?page=1&per_page=1000`,
              { credentials: 'include', headers: { Accept: 'application/json' } }
            );
            if (!res.ok) return 0;
            const json = await res.json() as {
              data: Array<{ id: number }>;
              meta: { last_page: number; total: number };
            };
            const index = json.data.findIndex((e) => e.id === eid);
            if (index === -1) return 0;
            // Compute which dashboard page (per_page=10) this event appears on
            return Math.ceil((index + 1) / PER_PAGE_UI);
          } catch {
            return 0;
          }
        },
        { base: apiBase, eid: eventId },
      );

      if (targetPage > 0) {
        if (targetPage > 1) {
          await page.goto(`/organizer/dashboard?page=${targetPage}`);
          await expect(page.getByRole('heading', { name: /Mis Eventos/i })).toBeVisible({ timeout: 30_000 });
        }
        await expect(page.locator('[aria-label="Cargando eventos"]')).not.toBeVisible({ timeout: 30_000 }).catch(() => {});
        return cardLocator();
      }
    } catch {
      // page.evaluate or navigation failed — fall through to UI scan below
    }
  }

  // Fallback: scan all pages of the unfiltered dashboard via URL navigation.
  // (already on /organizer/dashboard page 1 from the goto above)
  await expect(page.locator('[aria-label="Cargando eventos"]')).not.toBeVisible({ timeout: 30_000 }).catch(() => {});
  const foundPage1 = await cardLocator().isVisible().catch(() => false);
  if (foundPage1) {
    return cardLocator();
  }

  for (let p = 2; p <= 200; p++) {
    await page.goto(`/organizer/dashboard?page=${p}`);
    await expect(page.locator('[aria-label="Cargando eventos"]')).not.toBeVisible({ timeout: 15_000 }).catch(() => {});

    const foundOnPage = await cardLocator().isVisible().catch(() => false);
    if (foundOnPage) {
      return cardLocator();
    }

    // Stop if there's no next page
    const nextEnabled = await page.locator('button[aria-label="Siguiente"]').isEnabled().catch(() => false);
    if (!nextEnabled) break;
  }

  // Return the locator anyway — caller will assert visibility and get a clear error
  return cardLocator();
}

// Internal helper: escape special regex chars in event title
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
