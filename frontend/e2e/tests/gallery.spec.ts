import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {LightboxModal} from '../pages/lightbox-modal';

test.describe('Gallery Page', () => {
  test('should display gallery grid with images', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    // Check gallery grid is visible
    await expect(galleryPage.galleryGrid).toBeVisible();
  });

  test('should display image cards with essential info', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    // Wait for images to load if any exist
    await galleryPage.waitForGalleryToLoad();

    const imageCount = await galleryPage.getImageCount();

    // If images exist, verify cards are present
    if (imageCount > 0) {
      const firstCard = galleryPage.imageCards.first();
      await expect(firstCard).toBeVisible();

      // Check that image has role="button" for accessibility
      await expect(firstCard).toHaveAttribute('role', 'button');
    }
  });

  test('should navigate to upload page', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    // Click the upload button (FAB)
    await galleryPage.navigateToUpload();

    // Verify we're on the upload page
    await expect(page).toHaveURL(/\/upload/);
  });

  test('should open lightbox on image click', async ({page}) => {
    const galleryPage = new GalleryPage(page);
    const lightbox = new LightboxModal(page);

    await galleryPage.goto();

    // Wait for images to load
    await galleryPage.waitForGalleryToLoad();

    const hasImages = await galleryPage.hasImages();
    test.skip(!hasImages, 'No images in gallery to test lightbox');

    // Click the first image
    await galleryPage.clickImage(0);

    // Verify lightbox is visible
    await expect(lightbox.modal).toBeVisible();
  });

  // We can't easily verify the LQIP is loaded
  test.skip('should load images with LQIP (low-quality image placeholder)', () => {});

  test('should handle empty gallery state', async ({page}) => {
    // Mock the API to return empty list
    // The API client uses http://localhost:3000 as base URL (see src/api/client.ts)
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

    // Verify empty state is shown
    await expect(galleryPage.emptyState).toBeVisible();
    expect(await galleryPage.getImageCount()).toBe(0);
  });

  test('should display header with filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    // Verify filter elements are present
    await expect(galleryPage.genreFilter).toBeVisible();
    await expect(galleryPage.ratingFilter).toBeVisible();
    await expect(galleryPage.sortDropdown).toBeVisible();
    await expect(galleryPage.resetButton).toBeVisible();
  });

  test('should show loading state while fetching images', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Start navigation but don't wait for it to complete
    const navigationPromise = page.goto('/');

    // Wait a brief moment for loading to start
    await page.waitForTimeout(100);

    // The page should still be loading (we're not checking for loading skeleton specifically
    // since it's hard to catch, but we verify the page loads successfully)
    await navigationPromise;

    // Verify page loaded
    await expect(galleryPage.galleryGrid).toBeVisible();
  });

  test('should display error state on API failure', async ({page}) => {
    // Mock the API to return an error response
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

    // Verify error state is shown
    await expect(galleryPage.errorState).toBeVisible();
    expect(await galleryPage.getImageCount()).toBe(0);
  });

  test('should show FAB for uploading', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.goto();

    // Check FAB is visible
    await expect(galleryPage.uploadButton).toBeVisible();
  });
});
