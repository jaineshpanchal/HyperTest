import { defineConfig, devices } from '@playwright/test';

// Optional device emulation via env (e.g. DEVICE="iPhone 14" or "Desktop Chrome")
const DEVICE = process.env.DEVICE || process.env.HYPERTEST_DEVICE;
const selectedDevice = DEVICE ? (devices as Record<string, any>)[DEVICE] : undefined;

export default defineConfig({
  // First-class specs live here (promoted files).
  testDir: 'tests',

  // Give each test enough runway, but keep actions/assertions snappy.
  timeout: 60_000,                 // was 30_000
  expect: { timeout: 3_000 },      // quicker assertion failures

  // CI defaults
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  // Reporters
  reporter: process.env.PW_REPORTER
    ? (process.env.PW_REPORTER as any)
    : (process.env.CI
        ? [['html', { outputFolder: 'playwright-report', open: 'never' }]]
        : 'list'),

  use: {
    // Pick up --base-url / BASE_URL env
    baseURL: process.env.BASE_URL || 'https://example.com',

    // Headless by default; set HEADLESS=false to see the browser
    headless: process.env.HEADLESS === 'false' ? false : true,

    // Fast-fail individual actions; tests won’t hang on missing selectors
    actionTimeout: 2_000,

    ignoreHTTPSErrors: true,

    // Debug artifacts
    trace: (process.env.PW_TRACE as 'on' | 'off' | 'retain-on-failure') || 'retain-on-failure',
    screenshot: (process.env.PW_SCREENSHOT as 'on' | 'off' | 'only-on-failure') || 'only-on-failure',
    video: (process.env.PW_VIDEO as 'on' | 'off' | 'retain-on-failure') || 'off',

    // If a device is selected, merge its settings (viewport, UA, etc.)
    ...(selectedDevice ? selectedDevice : {}),
  },

  // Also expose a named project when DEVICE is set (helpful in CI output)
  projects: selectedDevice
    ? [{ name: DEVICE as string, use: { ...selectedDevice } }]
    : undefined,
});
