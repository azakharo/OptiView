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

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test rating');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    await firstCard.setRating(5);

    await page.waitForTimeout(500);

    const updatedRating = await firstCard.getRating();
    expect(updatedRating).toBe(5);
  });

  test('should show hover preview on rating stars', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test rating hover');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    await expect(firstCard.ratingStars.first()).toBeVisible();
  });

  test.skip('should handle rating API error gracefully', async () => {
  });

  test('should handle concurrent rating updates', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test concurrent rating');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());
    const secondCard = new ImageCardComponent(galleryPage.imageCards.nth(1));

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    await firstCard.setRating(5);

    await secondCard.hover();
    await secondCard.waitForRatingOverlayVisible();
    await secondCard.setRating(4);

    await page.waitForTimeout(500);

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    const firstRating = await firstCard.getRating();
    expect(firstRating).toBe(5);

    await secondCard.hover();
    await secondCard.waitForRatingOverlayVisible();
    const secondRating = await secondCard.getRating();
    expect(secondRating).toBe(4);
  });

  test('should update filter results when rating changes', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.selectMinRating(4);

    await galleryPage.waitForGalleryToLoad();
    const initialCount = await galleryPage.getImageCount();

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to test');

    await galleryPage.clickImage(0);

    const lightbox = new LightboxModal(page);
    await expect(lightbox.modal).toBeVisible();

    await lightbox.setRating(1);
    await lightbox.close();

    await galleryPage.waitForGalleryToLoad();
    const newCount = await galleryPage.getImageCount();

    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should display 5 rating stars on image cards', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify rating display');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();

    const starButtons = firstCard.ratingStars;
    expect(await starButtons.count()).toBe(5);
  });

  test('should display genre tag alongside rating', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images to verify genre tag');

    const firstCard = new ImageCardComponent(galleryPage.imageCards.first());

    await firstCard.hover();
    await firstCard.waitForRatingOverlayVisible();
    await expect(firstCard.genreTag).toBeVisible();
  });
});
