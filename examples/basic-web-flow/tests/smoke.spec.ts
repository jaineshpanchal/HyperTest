import { test, expect, selector } from '@hypertest/runner-web';

test('example.com loads and has title', async ({ page }) => {
  await page.goto('https://example.com');
  await expect(page).toHaveTitle(/Example Domain/);

  // Try the selector engine:
  const s = selector(page, { prefer: ['text','roleName','dataTest'] });

  // text
  await expect(s.by({ text: 'Example Domain' })).toBeVisible();

  // role/name heuristic (button with name) — on example.com there isn’t a button,
  // so we’ll just assert the "More information..." link via text for now:
  await expect(s.by('More information...')).toBeVisible();
});
