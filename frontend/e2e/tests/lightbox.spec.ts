import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';

test.describe('Lightbox Modal', () => {
  test.beforeEach(async ({page}) => {
    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();

    // Check if we have images to test with
    const hasImages = await galleryPage.hasImages();
    if (!hasImages) {
      test.skip();
    }
  });

  test('should open lightbox when clicking an image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Click the first image
    await galleryPage.clickImage(0);

    // Verify lightbox is visible
    await expect(lightbox.modal).toBeVisible();
    await expect(lightbox.image).toBeVisible();
  });

  test('should close lightbox with close button', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Open lightbox
    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();

    // Close with button
    await lightbox.close();

    // Verify modal is closed
    await expect(lightbox.modal).not.toBeVisible();
  });

  test('should close lightbox with ESC key', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Open lightbox
    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();

    // Close with ESC
    await lightbox.closeWithEscape();

    // Verify modal is closed
    await expect(lightbox.modal).not.toBeVisible();
  });

  test('should navigate to next image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Open lightbox on first image
    await galleryPage.clickImage(0);

    // Get initial image src
    const initialSrc = await lightbox.getCurrentImageSrc();

    // Navigate to next
    await lightbox.nextImage();

    // Get new image src
    const newSrc = await lightbox.getCurrentImageSrc();

    // Verify image changed
    expect(newSrc).not.toBe(initialSrc);
  });

  test('should navigate to previous image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Open lightbox on second image (need at least 2)
    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    await galleryPage.clickImage(1);

    // Get initial image src
    const initialSrc = await lightbox.getCurrentImageSrc();

    // Navigate to previous
    await lightbox.previousImage();

    // Get new image src
    const newSrc = await lightbox.getCurrentImageSrc();

    // Verify image changed
    expect(newSrc).not.toBe(initialSrc);
  });

  test('should navigate with keyboard arrows', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    await galleryPage.clickImage(0);
    const initialSrc = await lightbox.getCurrentImageSrc();

    // Navigate with keyboard
    await lightbox.navigateWithKeyboard('next');

    const newSrc = await lightbox.getCurrentImageSrc();
    expect(newSrc).not.toBe(initialSrc);
  });

  test('should disable previous button at first image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Previous should be disabled at first image
    const isPrevDisabled = await lightbox.isPreviousDisabled();
    expect(isPrevDisabled).toBe(true);
  });

  test('should disable next button at last image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    // Open on last image
    await galleryPage.clickImage(imageCount - 1);

    // Next should be disabled at last image
    const isNextDisabled = await lightbox.isNextDisabled();
    expect(isNextDisabled).toBe(true);
  });

  test('should display image metadata', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    // Get expected metadata from gallery before clicking
    const expectedGenre = await galleryPage.getImageGenre(0);
    const expectedRating = await galleryPage.getImageRating(0);

    await galleryPage.clickImage(0);

    // Check genre tag is visible and contains correct genre
    await expect(lightbox.genreTag).toBeVisible();
    const actualGenre = await lightbox.getGenre();
    expect(actualGenre).toBe(expectedGenre);

    // Check rating is visible and contains correct rating
    await expect(lightbox.ratingStars).toBeVisible();
    const actualRating = await lightbox.getRating();
    expect(actualRating).toBe(expectedRating);
  });

  test('should display download buttons', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Check download buttons are visible
    const downloadTexts = await lightbox.getDownloadButtonTexts();

    // Should have download buttons for different sizes
    expect(downloadTexts.length).toBeGreaterThan(0);
    expect(downloadTexts.some(t => t.includes('Download'))).toBe(true);
  });

  test('should update rating in lightbox', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Get current rating
    const initialRating = await lightbox.getRating();

    // Set new rating
    const newRating = initialRating === 0 ? 5 : 1;
    await lightbox.setRating(newRating);

    // Wait for update
    await page.waitForTimeout(300);

    // Verify rating changed
    const updatedRating = await lightbox.getRating();
    expect(updatedRating).toBe(newRating);
  });

  test('should have proper ARIA labels for accessibility', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Check close button has aria-label
    await expect(lightbox.closeButton).toHaveAttribute('aria-label', 'Close');

    // Check navigation buttons have aria-labels
    await expect(lightbox.previousButton).toHaveAttribute('aria-label', 'Previous image');
    await expect(lightbox.nextButton).toHaveAttribute('aria-label', 'Next image');
  });

  test('should display image with correct alt text', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Check image has alt text
    const altText = await lightbox.image.getAttribute('alt');
    expect(altText).toBeTruthy();
  });

  test('should trap focus when open', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    // Focus should be on close button (first focusable element)
    const closeFocused = await page.evaluate(() => {
      const active = document.activeElement;
      return active?.getAttribute('aria-label') === 'Close';
    });

    expect(closeFocused).toBe(true);
  });
});
