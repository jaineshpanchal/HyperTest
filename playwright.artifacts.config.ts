import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'artifacts',
  timeout: 30_000,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    headless: true,
    trace: 'retain-on-failure',
    screenshot: 'off',
    video: 'off'
  }
});
