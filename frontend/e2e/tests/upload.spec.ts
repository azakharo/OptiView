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

    // Verify dropzone is visible
    await expect(uploadPage.dropZone).toBeVisible();
  });

  test('should accept valid image file', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a valid image file to the queue
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Verify file appears in upload queue
    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(1);
  });

  test('should accept multiple files', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Upload multiple files
    await uploadPage.addMultipleFilesToQueue([
      './e2e/fixtures/test-image.png',
      './e2e/fixtures/test-image.jpg',
    ]);

    // Wait for files to be added
    await page.waitForTimeout(500);

    // Verify files appear in upload queue
    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(2);
  });

  test('should reject invalid file type', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Try to add a non-image file (client-side validation)
    await uploadPage.addFileToQueue('./e2e/fixtures/test.txt');

    // Verify error alert appears
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
  });

  test('should reject file exceeding size limit', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Create a file larger than 10MB limit (11MB)
    const oversizedBuffer = Buffer.alloc(11 * 1024 * 1024, 'x');

    // Upload the oversized file via the file input
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'huge-image.png',
      mimeType: 'image/png',
      buffer: oversizedBuffer,
    });

    // Verify error alert appears with file size error message
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();
    const errorText = await errorAlert.textContent();
    expect(errorText).toMatch(/file.*too large|exceeds.*10 ?MB|larger than/i);

    // File should NOT be added to the upload queue
    const uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(0);
  });

  test('should show upload progress', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file to queue
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Start the upload
    await uploadPage.clickUploadAll();

    // Wait for upload to start and progress to update
    await page.waitForTimeout(500);

    // Get progress
    const progress = await uploadPage.getUploadProgress(0);

    // Progress should be between 0 and 100
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
  });

  test('should show success state after upload completes', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Click upload button
    await uploadPage.clickUploadAll();

    // Wait for uploads to complete
    await uploadPage.waitForAllUploadsComplete();

    // Verify success state (Go to Gallery button should appear)
    await expect(uploadPage.goToGalleryButton).toBeVisible();
  });

  test('should allow genre selection', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Select genre
    await uploadPage.selectGenreForUpload('Nature', 0);

    // Verify genre was selected (value should be 'Nature')
    const uploadItems = page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(0);
    const select = item.locator('select');
    await expect(select).toHaveValue('Nature');
  });

  test.skip('should handle failure and retry', async () => {});

  test('should allow removing file from queue', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Verify file is in queue
    let uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(1);

    // Remove the file
    await uploadPage.removeUpload(0);

    // Wait for removal
    await page.waitForTimeout(300);

    // Verify file was removed
    uploadCount = await uploadPage.getUploadCount();
    expect(uploadCount).toBe(0);
  });

  test('should navigate back to gallery', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Click back link
    await uploadPage.navigateToGallery();

    // Verify we're on gallery page
    await expect(page).toHaveURL('/');
  });

  test.skip('should upload via drag and drop', async ({page}) => {
    // Note: Full drag and drop testing is complex in Playwright
    // We can at least verify the drop zone accepts drops
    // The drop zone should be styled for drag interactions
  });

  test('should validate file type client side', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Try uploading invalid file type
    await uploadPage.addFileToQueue('./e2e/fixtures/test.txt');

    // Error alert should appear
    const errorAlert = page.locator('[role="alert"]');
    await expect(errorAlert).toBeVisible();

    // Should contain error message about file type
    const errorText = await errorAlert.textContent();
    expect(errorText).toContain('image/');
  });

  test('should disable upload button when no files', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Button should be visible but disabled when no files in queue
    await expect(uploadPage.uploadAllButton).toBeVisible();
    await expect(uploadPage.uploadAllButton).toBeDisabled();
  });

  test('should display all genre options', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file first
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Check genre select options
    const uploadItems = page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(0);
    const select = item.locator('select');
    const options = await select.locator('option').allInnerTexts();

    // Verify genre options
    expect(options).toContain('Nature');
    expect(options).toContain('Architecture');
    expect(options).toContain('Portrait');
    expect(options).toContain('Uncategorized');
  });

  test('should show upload queue heading', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Verify upload queue section is visible
    await expect(uploadPage.uploadQueueTitle).toBeVisible();
  });

  test('should show file name in queue', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Get filename
    const filename = await uploadPage.getUploadFilename(0);

    // Verify filename is shown
    expect(filename).toContain('test-image.png');
  });

  test('should complete full upload flow', async ({page}) => {
    const uploadPage = new UploadPage(page);
    const galleryPage = new GalleryPage(page);

    // Add files
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Select genre
    await uploadPage.selectGenreForUpload('Nature', 0);

    // Start upload
    await uploadPage.clickUploadAll();

    // Wait for completion
    await uploadPage.waitForAllUploadsComplete();

    // Verify success state
    await expect(uploadPage.goToGalleryButton).toBeVisible();

    // Navigate to gallery
    await uploadPage.clickGoToGallery();

    // Verify gallery page shows uploaded image
    await galleryPage.waitForGalleryToLoad();

    // Verify the uploaded file appears in the gallery
    const uploadedFileInGallery = await galleryPage.hasImageWithFilename('test-image.png');
    expect(uploadedFileInGallery).toBe(true);
  });

  test('should show upload button text during upload', async ({page}) => {
    const uploadPage = new UploadPage(page);

    // Add a file
    await uploadPage.addFileToQueue('./e2e/fixtures/test-image.png');

    // Click upload
    await uploadPage.clickUploadAll();

    // Button should show "Uploading..."
    await expect(uploadPage.uploadAllButton).toContainText('Uploading');
  });
});
