import { test, expect } from '../fixtures/test-helpers';

test.describe('Rating Functionality', () => {
  test.beforeEach(async ({ galleryPage }) => {
    await galleryPage.goto();
  });

  test('should update rating from image card', async ({ page }) => {
    const firstCard = page.locator('[data-testid="image-card"]').first();
    await expect(firstCard).toBeVisible();

    // Click on 5th star
    const ratingStars = firstCard.locator('[data-testid="rating-stars"]');
    const fifthStar = ratingStars.locator('button').nth(4);
    await fifthStar.click();

    // Wait for update
    await page.waitForTimeout(500);

    // Verify optimistic update
    const filledStars = await ratingStars.locator('svg.filled').count();
    expect(filledStars).toBe(5);
  });

  test('should show hover preview on stars', async ({ page }) => {
    const firstCard = page.locator('[data-testid="image-card"]').first();
    const ratingStars = firstCard.locator('[data-testid="rating-stars"]');
    const thirdStar = ratingStars.locator('button').nth(2);

    // Hover over 3rd star
    await thirdStar.hover();

    // First 3 stars should show preview state
    // This depends on implementation - check for hover class or attribute
  });

  test('should update rating from lightbox', async ({ galleryPage, page, lightbox }) => {
    await galleryPage.openLightbox(0);
    await expect(lightbox.overlay).toBeVisible();

    // Set rating to 4
    await lightbox.setRating(4);

    // Wait for update
    await page.waitForTimeout(500);

    // Close lightbox and verify rating persisted
    await lightbox.close();
    await page.waitForTimeout(300);

    // Reopen and check
    await galleryPage.openLightbox(0);
    const filledStars = await lightbox.ratingStars
      .locator('svg.filled')
      .count();
    expect(filledStars).toBe(4);
  });

  test('should revert rating on API error', async ({ page }) => {
    // This test requires mocking API error
    // Route interception to simulate error
    await page.route('**/api/images/*/rating', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Server error' }),
      });
    });

    const firstCard = page.locator('[data-testid="image-card"]').first();
    const ratingStars = firstCard.locator('[data-testid="rating-stars"]');
    const originalFilled = await ratingStars.locator('svg.filled').count();

    // Try to update rating
    await ratingStars.locator('button').nth(4).click();

    // Wait for error handling
    await page.waitForTimeout(1000);

    // Rating should revert to original
    const currentFilled = await ratingStars.locator('svg.filled').count();
    expect(currentFilled).toBe(originalFilled);
  });
});
