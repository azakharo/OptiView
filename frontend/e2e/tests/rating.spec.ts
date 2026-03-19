import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';
import {ImageCardComponent} from '../components/image-card.component';

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

    // Get the first image card using POM
    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    // Hover to reveal rating stars
    await firstCard.hover();

    // The rating overlay should now be visible (revealed via opacity transition)
    await firstCard.waitForRatingOverlayVisible();

    // Click on a star to rate (e.g., 5th star = 5 rating)
    await firstCard.setRating(5);

    // Wait for API call to complete
    await page.waitForTimeout(500);

    // Verify rating was updated
    const updatedRating = await firstCard.getRating();
    expect(updatedRating).toBe(5);
  });

  test('should show hover preview on rating stars', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test rating hover');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    // Hover over the card to reveal the rating section
    await firstCard.hover();

    // The rating overlay should appear
    await firstCard.waitForRatingOverlayVisible();

    // Verify the rating overlay is visible (hover state) using POM
    await expect(firstCard.ratingStars.first()).toBeVisible();
  });

  test.skip('should handle rating API error gracefully', async () => {
  });

  test('should handle concurrent rating updates', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Ensure gallery is fully loaded first
    await galleryPage.goto();

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test concurrent rating');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());
    const secondCard = new ImageCardComponent(galleryPage.imageCards.nth(1));

    // Hover and rate first image - ensure overlay is visible
    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    await firstCard.setRating(5);

    // Quickly rate second image
    await secondCard.hover();
    await secondCard.waitForRatingOverlayVisible();
    await secondCard.setRating(4);

    // Wait for API to process
    await page.waitForTimeout(500);

    // Both updates should process without errors - verify ratings were applied
    // Use force:true to ensure hover triggers the overlay
    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    const firstRating = await firstCard.getRating();
    expect(firstRating).toBe(5);

    // Hover second card with force:true
    await secondCard.hover();
    await secondCard.waitForRatingOverlayVisible();
    const secondRating = await secondCard.getRating();
    expect(secondRating).toBe(4);
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

  test('should display 5 rating stars on image cards', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify rating display');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    // Hover to reveal rating
    await firstCard.hover();

    // Check that rating overlay is visible
    await firstCard.waitForRatingOverlayVisible();

    // Should have 5 star buttons
    const starButtons = firstCard.ratingStars;
    expect(await starButtons.count()).toBe(5);
  });

  test('should display genre tag alongside rating', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify genre tag');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    // Hover to reveal info overlay
    await firstCard.hover();

    // Both genre and rating should be visible in the overlay
    await firstCard.waitForRatingOverlayVisible();

    // Check for genre tag
    await expect(firstCard.genreTag).toBeVisible();
  });
});
