import {test, expect} from '@playwright/test';
import {UploadPage} from '../pages/upload-page';
import {GalleryPage} from '../pages/gallery-page';

test.describe('Upload Page', () => {
  test.beforeEach(async ({page}) => {
    const uploadPage = new UploadPage(page);
    await uploadPage.goto();
  });

  test('should display upload dropzone', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await expect(uploadPage.dropZone).toBeVisible();
  });

  test('should accept valid image file', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(1);
  });

  test('should accept multiple files', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addMultipleFilesToQueue([
      './e2e/fixtures/test-image.png',
      './e2e/fixtures/test-image.jpg',
    ]);

    await page.waitForTimeout(500);

    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(2);
  });

  test('should reject invalid file type', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test.txt');

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('should reject file exceeding size limit', async ({page}) => {
    const uploadPage = new UploadPage(page);

    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'huge-image.png',
      mimeType: 'image/png',
      buffer: oversizedBuffer,
    });

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/file.*too large|exceeds.*10 ?MB|larger than/i);

    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(0);
  });

  test('should show upload progress', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');
    await uploadPage.clickUploadAll();

    await page.waitForTimeout(500);

    const progress = await uploadPage.getUploadProgress(0);
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  test('should show success state after upload completes', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');
    await uploadPage.clickUploadAll();
    await uploadPage.waitForAllUploadsComplete();

    await expect(uploadPage.goToGalleryButton).toBeVisible();
  });

  test('should allow genre selection', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');
    await uploadPage.selectGenreForUpload('Nature', 0);

    const uploadItems = page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(0);
    const select = item.locator('select');
    await expect(select).toHaveValue('Nature');
  });

  test.skip('should handle failure and retry', async () => {});

  test('should allow removing file from queue', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    let uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(1);

    await uploadPage.removeUpload(0);

    await page.waitForTimeout(300);

    uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(0);
  });

  test('should navigate back to gallery', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.navigateToGallery();

    await expect(page).toHaveURL('/');
  });

  test.skip('should upload via drag and drop', async ({page}) => {});

  test('should validate file type client side', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test.txt');

    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();

    const errorText = await errorAlert.textContent();
    expect(errorText).toContain('image/');
  });

  test('should disable upload button when no files', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await expect(uploadPage.uploadAllButton).toBeVisible();
    await expect(uploadPage.uploadAllButton).toBeDisabled();
  });

  test('should display all genre options', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    const uploadItems = page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(0);
    const select = item.locator('select');
    const options = await select.locator('option').allInnerTexts();

    expect(options).toContain('Nature');
    expect(options).toContain('Architecture');
    expect(options).toContain('Portrait');
    expect(options).toContain('Uncategorized');
  });

  test('should show upload queue heading', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await expect(uploadPage.uploadQueueTitle).toBeVisible();
  });

  test('should show file name in queue', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    const filename = await uploadPage.getUploadFilename(0);
    expect(filename).toContain('test-image.png');
  });

  test('should complete full upload flow', async ({page}) => {
    const uploadPage = new UploadPage(page);
    const galleryPage = new GalleryPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');
    await uploadPage.selectGenreForUpload('Nature', 0);
    await uploadPage.clickUploadAll();
    await uploadPage.waitForAllUploadsComplete();

    await expect(uploadPage.goToGalleryButton).toBeVisible();

    await uploadPage.clickGoToGallery();
    await galleryPage.waitForGalleryToLoad();

    const uploadedFileInGallery = await galleryPage.hasImageWithFilename('test-image.png');
    expect(uploadedFileInGallery).toBe(true);
  });

  test('should show upload button text during upload', async ({page}) => {
    const uploadPage = new UploadPage(page);

    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');
    await uploadPage.clickUploadAll();

    await expect(uploadPage.uploadAllButton).toContainText('Uploading');
  });
});
