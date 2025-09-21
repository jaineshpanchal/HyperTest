import { test, expect } from '@playwright/test';
test('hypertest verify: smoke', async ({ page }) => {
  await page.goto(process.env.BASE_URL || 'https://example.com');
  await expect(page).toHaveTitle(/example/i);
});