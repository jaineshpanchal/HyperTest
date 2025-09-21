import { test, expect } from '@playwright/test';

test('example.com loads', async ({ page }) => {
  await page.goto(process.env.BASE_URL ?? 'https://example.com');
  await expect(page).toHaveTitle(/example/i);
});
