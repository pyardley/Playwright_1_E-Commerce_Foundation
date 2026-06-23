import { test, expect } from '@playwright/test';

test('seed', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
});
