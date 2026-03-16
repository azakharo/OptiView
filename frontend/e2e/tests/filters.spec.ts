import { test, expect } from '../fixtures/test-helpers';

test.describe('Gallery Filters', () => {
  test.beforeEach(async ({ galleryPage }) => {
    await galleryPage.goto();
  });

  test('should filter by genre', async ({ galleryPage, page }) => {
    await galleryPage.selectGenre('Nature');

    // URL should update
    expect(page.url()).toContain('genre=Nature');

    // All visible cards should have Nature genre
    const cards = page.locator('[data-testid="image-card"]');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const genreTag = cards.nth(i).locator('[data-testid="genre-tag"]');
      await expect(genreTag).toHaveText('Nature');
    }
  });

  test('should filter by minimum rating', async ({ galleryPage, page }) => {
    await galleryPage.selectMinRating(4);

    // URL should update
    expect(page.url()).toContain('rating=4');

    // All visible cards should have rating >= 4
    const cards = page.locator('[data-testid="image-card"]');
    const count = await cards.count();

    for (let i = 0; i < Math.min(count, 5); i++) {
      const ratingStars = cards.nth(i).locator('[data-testid="rating-stars"]');
      const filledStars = await ratingStars.locator('svg.filled').count();
      expect(filledStars).toBeGreaterThanOrEqual(4);
    }
  });

  test('should sort by rating ascending', async ({ galleryPage, page }) => {
    await page.locator('[data-testid="sort-dropdown"]').click();
    await page.getByRole('option', { name: 'Rating' }).click();
    await page.locator('[data-testid="sort-order-dropdown"]').click();
    await page.getByRole('option', { name: 'Ascending' }).click();

    // Verify sort order
    const cards = page.locator('[data-testid="image-card"]');
    const count = await cards.count();

    if (count > 1) {
      const ratings: number[] = [];
      for (let i = 0; i < Math.min(count, 10); i++) {
        const ratingStars = cards.nth(i).locator('[data-testid="rating-stars"]');
        const filledStars = await ratingStars.locator('svg.filled').count();
        ratings.push(filledStars);
      }

      // Check ascending order
      for (let i = 1; i < ratings.length; i++) {
        expect(ratings[i]).toBeGreaterThanOrEqual(ratings[i - 1]);
      }
    }
  });

  test('should persist filters in URL', async ({ page, galleryPage }) => {
    await galleryPage.selectGenre('Nature');
    await galleryPage.selectMinRating(4);

    // Reload page
    await page.reload();

    // Filters should persist
    expect(page.url()).toContain('genre=Nature');
    expect(page.url()).toContain('rating=4');
  });

  test('should combine multiple filters', async ({ galleryPage, page }) => {
    await galleryPage.selectGenre('Nature');
    await galleryPage.selectMinRating(3);

    // Both filters should be in URL
    expect(page.url()).toContain('genre=Nature');
    expect(page.url()).toContain('rating=3');
  });
});
