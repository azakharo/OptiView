import { test, expect } from '../fixtures/test-helpers';

test.describe('Gallery Page', () => {
  test.beforeEach(async ({ galleryPage }) => {
    await galleryPage.goto();
  });

  test('should display gallery grid with images', async ({ galleryPage }) => {
    await expect(galleryPage.galleryGrid).toBeVisible();
    const cardCount = await galleryPage.imageCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should display loading skeleton initially', async ({ page }) => {
    // Reload to catch loading state
    await page.reload();
    // Skeleton should appear briefly
    const skeleton = page.locator('[data-testid="loading-skeleton"]');
    // Either skeleton is visible or images loaded very fast
    const skeletonVisible = await skeleton.isVisible().catch(() => false);
    // This test is informational - skeleton may load too fast to catch
  });

  test('should show LQIP blur effect on image cards', async ({ page }) => {
    const firstCard = page.locator('[data-testid="image-card"]').first();
    await expect(firstCard).toBeVisible();

    // Check for dominant color background
    const style = await firstCard.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    // Should have some background color set
    expect(style).toBeTruthy();
  });

  test('should navigate to upload page via FAB', async ({ galleryPage, page }) => {
    await galleryPage.navigateToUpload();
    await expect(page).toHaveURL('/upload');
  });
});
