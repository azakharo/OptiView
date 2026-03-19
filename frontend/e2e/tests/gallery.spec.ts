import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';

test.describe('Gallery Page', () => {
  test('should display gallery grid with images', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await expect(galleryPage.galleryGrid).toBeVisible();
  });

  test('should display image cards with essential info', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();

    const imageCount = await galleryPage.getImageCount();
    if (imageCount > 0) {
      const firstCard = galleryPage.imageCards.first();
      await expect(firstCard).toBeVisible();
      await expect(firstCard).toHaveAttribute('role', 'button');
    }
  });

  test('should navigate to upload page', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await galleryPage.navigateToUpload();

    await expect(page).toHaveURL(/\/upload/);
  });

  test('should open lightbox on image click', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images in gallery to test lightbox');

    await galleryPage.clickImage(0);
    await expect(lightbox.modal).toBeVisible();
  });

  test.skip('should load images with LQIP (low-quality image placeholder)', () => {});

  test('should handle empty gallery state', async ({page}) => {
    await page.route('**/localhost:3000/api/images*', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            pageSize: 20,
          },
        }),
      });
    });

    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();

    await expect(galleryPage.emptyState).toBeVisible();
    expect(await galleryPage.getImageCount()).toBe(0);
  });

  test('should display header with filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    await expect(galleryPage.genreFilter).toBeVisible();
    await expect(galleryPage.ratingFilter).toBeVisible();
    await expect(galleryPage.sortDropdown).toBeVisible();
    await expect(galleryPage.resetButton).toBeVisible();
  });

  test('should show loading state while fetching images', async ({page}) => {
    await page.route('**/localhost:3000/api/images*', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: {
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            pageSize: 20,
          },
        }),
      });
    });

    const galleryPage = new GalleryPage(page);
    await page.goto('/');

    await expect(galleryPage.loadingSkeleton.first()).toBeVisible();
  });

  test('should display error state on API failure', async ({page}) => {
    await page.route('**/localhost:3000/api/images*', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 500,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      });
    });

    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();

    await expect(galleryPage.errorState).toBeVisible();
    expect(await galleryPage.getImageCount()).toBe(0);
  });

  test('should show FAB for uploading', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();
    await expect(galleryPage.uploadButton).toBeVisible();
  });
});
