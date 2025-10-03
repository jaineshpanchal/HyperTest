import { test, expect, selector } from '@hypertest/runner-web';

test("recorded: 2025-10-03T05-35-29-665Z", async ({ page }) => {
  await page.goto("https://example.com");
  const s = selector(page);
  await s.by({"role":"link","name":"More information..."}).click();
});
