import { test, expect } from '@playwright/test';

test('sample test - gallery page loads', async ({ page }) => {
  await page.goto('/');
  // Wait for the page to load
  await page.waitForLoadState('networkidle');
  // Check if the page has loaded - we look for any element in the body
  const body = page.locator('body');
  await expect(body).toBeVisible();
});
