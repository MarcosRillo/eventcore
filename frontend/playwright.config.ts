import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 90_000,  // 90s — Render free tier cold starts
  expect: { timeout: 10_000 },
  fullyParallel: false,  // Sequential for Render stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },
  globalSetup: './e2e/global-setup.ts',
  projects: [
    // Auth setup — runs first, saves storageState
    // testDir is overridden per-project so the setup files in e2e/setup/ are found
    { name: 'setup-entity-admin', testDir: './e2e/setup', testMatch: '**/entity-admin.setup.ts' },
    { name: 'setup-organizer', testDir: './e2e/setup', testMatch: '**/organizer.setup.ts' },

    // Tests per role
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: '**/public/**',
    },
    {
      name: 'entity-admin',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/entity-admin.json',
      },
      dependencies: ['setup-entity-admin'],
      testMatch: '**/admin/**',
    },
    {
      name: 'organizer',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/organizer.json',
      },
      dependencies: ['setup-organizer'],
      testMatch: '**/organizer/**',
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
      testMatch: '**/mobile/**',
    },
  ],
  webServer: process.env.CI ? undefined : {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    timeout: 120_000,
    reuseExistingServer: true,
  },
});
