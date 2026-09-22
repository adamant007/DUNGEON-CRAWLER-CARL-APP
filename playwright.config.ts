import { defineConfig, devices } from '@playwright/test';

const live = Boolean(process.env.E2E_BASE_URL);
const legacy = process.env.E2E_LEGACY === '1';

export default defineConfig({
  // The old injected-runtime suite predates the current React/Base44 product.
  // Keep it available for archaeology, but run only the current product suite
  // by default so CI reports real regressions instead of known legacy drift.
  testDir: legacy ? './e2e' : './e2e/current',
  testIgnore: legacy ? '**/current/**' : undefined,
  timeout: 30_000,
  expect: { timeout: 7_500 },
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['list']] : 'list',
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: live ? undefined : {
    command: 'npm run build && npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'android-phone', use: { ...devices['Pixel 7'] } },
    { name: 'tablet', use: { ...devices['iPad Pro 11'] } }
  ]
});
