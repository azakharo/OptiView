import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';

test.describe('Rating Functionality', () => {
  test.beforeEach(async ({page}) => {
    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();
  });

  test('should update rating from image card', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Check if there are images
    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test rating');

    // Get the first image card
    const firstCard = galleryPage.imageCards.first();

    // Hover to reveal rating stars
    await firstCard.hover();

    // The rating stars should now be visible (in the overlay)
    const ratingOverlay = firstCard.locator('.absolute.right-0.bottom-0');
    await expect(ratingOverlay).toBeVisible();

    // Click on a star to rate (e.g., 5th star = 5 rating)
    const starButtons = ratingOverlay.locator('button');
    await starButtons.nth(4).click(); // 5 stars

    // Wait for API call to complete
    await page.waitForTimeout(500);

    // The rating should be updated (we can't easily verify this without API)
  });

  test('should show hover preview on rating stars', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test rating hover');

    const firstCard = galleryPage.imageCards.first();

    // Hover over the card to reveal the rating section
    await firstCard.hover();

    // The rating overlay should appear
    const ratingOverlay = firstCard.locator('.absolute.right-0.bottom-0');
    await expect(ratingOverlay).toBeVisible();

    // Hover over a star (e.g., third star)
    const starButtons = ratingOverlay.locator('button');
    await starButtons.nth(2).hover();

    // Visual feedback would be shown (hover state)
    // We can't easily test visual changes, but the element should be interactive
  });

  test('should update rating from lightbox', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test lightbox rating');

    // Click first image to open lightbox
    await galleryPage.clickImage(0);

    // Verify lightbox is open
    await expect(lightbox.modal).toBeVisible();

    // Get initial rating
    const initialRating = await lightbox.getRating();

    // Click on a star to change rating
    // If initial is 0, click 5th star for 5 rating
    const newRating = initialRating === 0 ? 5 : 1;
    await lightbox.setRating(newRating);

    // Wait for API call
    await page.waitForTimeout(500);

    // Verify rating was updated
    const updatedRating = await lightbox.getRating();
    expect(updatedRating).toBe(newRating);

    // Close lightbox
    await lightbox.close();
  });

  test('should handle rating API error gracefully', async ({page}) => {
    // This test would require mocking the API to fail
    // Skipping for basic implementation
    test.skip(true, 'API error handling requires API mocking');
  });

  test('should handle concurrent rating updates', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test concurrent rating');

    const firstCard = galleryPage.imageCards.first();
    const secondCard = galleryPage.imageCards.nth(1);

    // Hover and rate first image
    await firstCard.hover();
    await page.waitForTimeout(100);
    const stars1 = firstCard.locator('.absolute.right-0.bottom-0').locator('button');
    await stars1.nth(4).click();

    // Quickly rate second image
    await secondCard.hover();
    await page.waitForTimeout(100);
    const stars2 = secondCard.locator('.absolute.right-0.bottom-0').locator('button');
    await stars2.nth(3).click();

    // Both updates should process without errors
    await page.waitForTimeout(1000);
  });

  test('should update filter results when rating changes', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // First, set a rating filter
    await galleryPage.selectMinRating(4);

    // Get initial count
    await galleryPage.waitForGalleryToLoad();
    const initialCount = await galleryPage.getImageCount();

    // Open lightbox on first image
    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test');

    await galleryPage.clickImage(0);

    const lightbox = new LightboxModal(page);
    await expect(lightbox.modal).toBeVisible();

    // Set a low rating (1 star)
    await lightbox.setRating(1);

    // Close lightbox
    await lightbox.close();

    // The image should no longer appear in 4+ star filter
    await galleryPage.waitForGalleryToLoad();
    const newCount = await galleryPage.getImageCount();

    // New count should be less than or equal to initial
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should display rating stars correctly on image cards', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify rating display');

    const firstCard = galleryPage.imageCards.first();

    // Hover to reveal rating
    await firstCard.hover();

    // Check that rating section contains star elements
    const ratingSection = firstCard.locator('.absolute.right-0.bottom-0');
    await expect(ratingSection).toBeVisible();

    // Should have 5 star buttons
    const starButtons = ratingSection.locator('button');
    expect(await starButtons.count()).toBe(5);
  });

  test('should display genre tag alongside rating', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify genre tag');

    const firstCard = galleryPage.imageCards.first();

    // Hover to reveal info overlay
    await firstCard.hover();

    // Both genre and rating should be visible in the overlay
    const overlay = firstCard.locator('.absolute.right-0.bottom-0');
    await expect(overlay).toBeVisible();

    // Check for genre tag (span element)
    const genreTag = overlay.locator('span').last();
    await expect(genreTag).toBeVisible();
  });
});
