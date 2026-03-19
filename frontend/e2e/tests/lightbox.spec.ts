import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';

test.describe('Lightbox Modal', () => {
  test.beforeEach(async ({page}) => {
    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();

    const hasImages = await galleryPage.hasImages();
    if (!hasImages) {
      test.skip();
    }
  });

  test('should open lightbox when clicking an image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();
    await expect(lightbox.image).toBeVisible();
  });

  test('should close lightbox with close button', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();

    await lightbox.close();
    await expect(lightbox.modal).not.toBeVisible();
  });

  test('should close lightbox with ESC key', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();

    await lightbox.closeWithEscape();
    await expect(lightbox.modal).not.toBeVisible();
  });

  test('should navigate to next image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);
    const initialSrc = await lightbox.getCurrentImageSrc();

    await lightbox.nextImage();
    const newSrc = await lightbox.getCurrentImageSrc();

    expect(newSrc).not.toBe(initialSrc);
  });

  test('should navigate to previous image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    await galleryPage.clickImage(1);
    const initialSrc = await lightbox.getCurrentImageSrc();

    await lightbox.previousImage();
    const newSrc = await lightbox.getCurrentImageSrc();

    expect(newSrc).not.toBe(initialSrc);
  });

  test('should navigate with keyboard arrows', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    await galleryPage.clickImage(0);
    const initialSrc = await lightbox.getCurrentImageSrc();

    await lightbox.navigateWithKeyboard('next');
    const newSrc = await lightbox.getCurrentImageSrc();
    expect(newSrc).not.toBe(initialSrc);
  });

  test('should disable previous button at first image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    const isPrevDisabled = await lightbox.isPreviousDisabled();
    expect(isPrevDisabled).toBe(true);
  });

  test('should disable next button at last image', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const imageCount = await galleryPage.getImageCount();
    test.skip(imageCount < 2, 'Need at least 2 images');

    await galleryPage.clickImage(imageCount - 1);

    const isNextDisabled = await lightbox.isNextDisabled();
    expect(isNextDisabled).toBe(true);
  });

  test('should display image metadata', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    const expectedGenre = await galleryPage.getImageGenre(0);
    const expectedRating = await galleryPage.getImageRating(0);

    await galleryPage.clickImage(0);

    await expect(lightbox.genreTag).toBeVisible();
    const actualGenre = await lightbox.getGenre();
    expect(actualGenre).toBe(expectedGenre);

    await expect(lightbox.ratingStars).toBeVisible();
    const actualRating = await lightbox.getRating();
    expect(actualRating).toBe(expectedRating);
  });

  test('should display download buttons', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    const downloadTexts = await lightbox.getDownloadButtonTexts();
    expect(downloadTexts.length).toBeGreaterThan(0);
    expect(downloadTexts.some(t => t.includes('Download'))).toBe(true);
  });

  test('should update rating in lightbox', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    const initialRating = await lightbox.getRating();
    const newRating = initialRating === 0 ? 5 : 1;
    await lightbox.setRating(newRating);

    await page.waitForTimeout(300);

    const updatedRating = await lightbox.getRating();
    expect(updatedRating).toBe(newRating);
  });

  test('should have proper ARIA labels for accessibility', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    await expect(lightbox.closeButton).toHaveAttribute('aria-label', 'Close');
    await expect(lightbox.previousButton).toHaveAttribute('aria-label', 'Previous image');
    await expect(lightbox.nextButton).toHaveAttribute('aria-label', 'Next image');
  });

  test('should display image with correct alt text', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.clickImage(0);

    const altText = await lightbox.image.getAttribute('alt');
    expect(altText).toBeTruthy();
  });

  test.skip('should trap focus when open', async () => {
  });
});
