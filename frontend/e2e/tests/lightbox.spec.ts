import { test, expect } from '../fixtures/test-helpers';

test.describe('Lightbox Modal', () => {
  test.beforeEach(async ({ galleryPage }) => {
    await galleryPage.goto();
  });

  test('should open lightbox on image click', async ({ galleryPage, lightbox }) => {
    await galleryPage.openLightbox(0);
    await expect(lightbox.overlay).toBeVisible();
    await expect(lightbox.image).toBeVisible();
  });

  test('should close lightbox with close button', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);
    await expect(lightbox.overlay).toBeVisible();

    await lightbox.close();
    await expect(lightbox.overlay).not.toBeVisible();
  });

  test('should close lightbox with ESC key', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);
    await expect(lightbox.overlay).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(lightbox.overlay).not.toBeVisible();
  });

  test('should close lightbox when clicking outside image', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);
    await expect(lightbox.overlay).toBeVisible();

    // Click on overlay background
    await page.mouse.click(10, 10);
    await expect(lightbox.overlay).not.toBeVisible();
  });

  test('should navigate to next image', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);

    const firstImageSrc = await lightbox.image.getAttribute('src');

    await lightbox.navigateNext();
    await page.waitForTimeout(300);

    const secondImageSrc = await lightbox.image.getAttribute('src');
    expect(secondImageSrc).not.toBe(firstImageSrc);
  });

  test('should navigate to previous image', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(1);

    const currentImageSrc = await lightbox.image.getAttribute('src');

    await lightbox.navigatePrev();
    await page.waitForTimeout(300);

    const prevImageSrc = await lightbox.image.getAttribute('src');
    expect(prevImageSrc).not.toBe(currentImageSrc);
  });

  test('should navigate with arrow keys', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);

    const firstImageSrc = await lightbox.image.getAttribute('src');

    // Press right arrow
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    const nextImageSrc = await lightbox.image.getAttribute('src');
    expect(nextImageSrc).not.toBe(firstImageSrc);

    // Press left arrow
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(300);

    const backImageSrc = await lightbox.image.getAttribute('src');
    expect(backImageSrc).toBe(firstImageSrc);
  });

  test('should display download buttons', async ({ galleryPage, lightbox }) => {
    await galleryPage.openLightbox(0);

    const downloadButtons = lightbox.downloadButtons;
    const count = await downloadButtons.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should display genre tag', async ({ galleryPage, lightbox, page }) => {
    await galleryPage.openLightbox(0);

    const genreTag = page.locator('[data-testid="lightbox-genre"]');
    await expect(genreTag).toBeVisible();
  });
});
