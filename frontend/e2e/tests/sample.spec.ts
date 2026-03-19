import { test, expect } from '@playwright/test';

test('sample test - gallery page loads', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const body = page.locator('body');
  await expect(body).toBeVisible();
});
