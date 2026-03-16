import { test, expect } from '../fixtures/test-helpers';

test.describe('Upload Page', () => {
  test.beforeEach(async ({ uploadPage }) => {
    await uploadPage.goto();
  });

  test('should display dropzone', async ({ uploadPage }) => {
    await expect(uploadPage.dropZone).toBeVisible();
  });

  test('should accept valid image file', async ({ uploadPage, page }) => {
    const testImagePath = 'e2e/fixtures/test-image.jpg';

    await uploadPage.uploadFile(testImagePath, 'Nature');

    // File should appear in queue
    await expect(uploadPage.uploadQueue).toBeVisible();
  });

  test('should reject invalid file type', async ({ page }) => {
    const invalidFile = 'e2e/fixtures/test.txt';

    // Try to upload - should show error
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(invalidFile);

    // Should show error message
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should show upload progress', async ({ uploadPage, page }) => {
    const testImagePath = 'e2e/fixtures/test-image.jpg';

    await uploadPage.uploadFile(testImagePath);

    // Progress bar should be visible
    const progressBar = page.locator('[data-testid="upload-progress"]');
    await expect(progressBar).toBeVisible();
  });

  test('should show success state after upload', async ({ uploadPage, page }) => {
    const testImagePath = 'e2e/fixtures/test-image.jpg';

    await uploadPage.uploadFile(testImagePath, 'Nature');
    await uploadPage.waitForUploadComplete();

    // Success indicator should be visible
    const successIndicator = page.locator('[data-testid="upload-status-done"]');
    await expect(successIndicator).toBeVisible();
  });

  test('should allow genre selection per file', async ({ uploadPage, page }) => {
    const testImagePath = 'e2e/fixtures/test-image.jpg';

    await uploadPage.uploadFile(testImagePath);

    // Genre dropdown should be visible
    const genreDropdown = page.locator('[data-testid="genre-select"]').first();
    await expect(genreDropdown).toBeVisible();

    // Select genre
    await genreDropdown.click();
    await page.getByRole('option', { name: 'Architecture' }).click();
  });

  test('should navigate back to gallery', async ({ uploadPage, page }) => {
    await uploadPage.backToGallery.click();
    await expect(page).toHaveURL('/');
  });

  test('should handle multiple file upload', async ({ uploadPage, page }) => {
    const testImagePath = 'e2e/fixtures/test-image.jpg';

    // Upload multiple files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([testImagePath, testImagePath, testImagePath]);

    // Should show 3 items in queue
    const queueItems = page.locator('[data-testid="upload-item"]');
    const count = await queueItems.count();
    expect(count).toBe(3);
  });
});
