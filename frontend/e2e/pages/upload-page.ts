import type {Page, Locator} from '@playwright/test';

/**
 * Page Object Model for the Upload page.
 * Encapsulates actions that can be performed on the upload page.
 */
export class UploadPage {
  readonly page: Page;

  // Page elements
  readonly backLink: Locator;
  readonly pageTitle: Locator;
  readonly dropZone: Locator;
  readonly dropZoneInput: Locator;

  // Upload queue
  readonly uploadQueue: Locator;
  readonly uploadQueueTitle: Locator;

  // Action buttons
  readonly uploadAllButton: Locator;
  readonly uploadMoreButton: Locator;
  readonly goToGalleryButton: Locator;

  // Available genres for selection
  readonly genreOptions: string[] = ['Nature', 'Architecture', 'Portrait', 'Uncategorized'];

  constructor(page: Page) {
    this.page = page;

    // Back navigation link
    this.backLink = page.getByRole('link', {name: 'Back to Gallery'});

    // Page title
    this.pageTitle = page.getByRole('heading', {name: 'Upload Images'});

    // Drop zone - the main upload area
    this.dropZone = page.locator('[class*="border-dashed"]').first();
    this.dropZoneInput = page.locator('input[type="file"]');

    // Upload queue section
    this.uploadQueue = page.locator('[data-testid="upload-queue"]');
    this.uploadQueueTitle = page.getByRole('heading', {name: 'Upload Queue'});

    // Action buttons
    this.uploadAllButton = page.getByRole('button', {name: /Upload All|Uploading/});
    this.uploadMoreButton = page.getByRole('button', {name: 'Upload More'});
    this.goToGalleryButton = page.getByRole('button', {name: 'Go to Gallery'});
  }

  /**
   * Navigate to the upload page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/upload');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the upload page to load.
   */
  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    await this.pageTitle.waitFor({state: 'visible'});
  }

  /**
   * Add a file to the upload queue (without starting upload).
   * @param filePath - Absolute or relative path to the file
   */
  async addFileToQueue(filePath: string): Promise<void> {
    await this.dropZoneInput.setInputFiles(filePath);
    // Wait for React to process the file and add to queue
    await this.page.waitForTimeout(300);
  }

  /**
   * Upload a single file and wait for completion.
   * This adds the file to queue and starts the upload process.
   * @param filePath - Absolute or relative path to the file
   */
  async uploadFile(filePath: string): Promise<void> {
    await this.dropZoneInput.setInputFiles(filePath);
    // Click Upload All to start the upload
    await this.clickUploadAll();
    await this.waitForUploadComplete(0);
  }

  /**
   * Upload multiple files.
   * @param filePaths - Array of file paths
   */
  async uploadMultipleFiles(filePaths: string[]): Promise<void> {
    await this.dropZoneInput.setInputFiles(filePaths);
  }

  /**
   * Select a genre for a specific upload item.
   * @param genre - Genre to select
   * @param index - Index of the upload item (zero-based)
   */
  async selectGenreForUpload(genre: string, index: number): Promise<void> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Find the select element within this item
    const select = item.locator('select');
    await select.selectOption(genre);
  }

  /**
   * Wait for an upload to complete.
   * @param index - Index of the upload item (zero-based)
   * @param timeout - Maximum wait time in milliseconds (default: 30000)
   */
  async waitForUploadComplete(index: number, timeout = 30000): Promise<void> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Wait for the status to be "done" (success) or "error" (failure)
    await item
      .locator('[class*="text-green-500"], [class*="text-red-500"]')
      .waitFor({state: 'visible', timeout});
  }

  /**
   * Retry a failed upload.
   * @param index - Index of the upload item (zero-based)
   */
  async retryFailedUpload(index: number): Promise<void> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Click the retry button
    const retryButton = item.getByRole('button', {name: 'Retry'});
    await retryButton.click();
  }

  /**
   * Remove an upload from the queue.
   * @param index - Index of the upload item (zero-based)
   */
  async removeUpload(index: number): Promise<void> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Click the remove button
    const removeButton = item.getByRole('button', {name: 'Remove'});
    await removeButton.click();
  }

  /**
   * Navigate back to the gallery.
   */
  async navigateToGallery(): Promise<void> {
    await this.backLink.click();
    await this.page.waitForURL('**/');
  }

  /**
   * Get the count of items in the upload queue.
   */
  async getUploadCount(): Promise<number> {
    // Wait for upload items to appear in the DOM
    await this.page.waitForSelector('button:has-text("Remove")', {state: 'visible'}).catch(() => {});
    // Use a more reliable selector - find buttons with "Remove" text
    // Each upload item has a Remove button
    const removeButtons = this.page.locator('button:has-text("Remove")');
    return removeButtons.count();
  }

  /**
   * Check if a specific upload has an error.
   * @param index - Index of the upload item (zero-based)
   */
  async hasUploadError(index: number): Promise<boolean> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Check for error icon (red X mark icon)
    const errorIcon = item.locator('[class*="text-red-500"]').first();
    return errorIcon.isVisible();
  }

  /**
   * Get the error message for a failed upload.
   * @param index - Index of the upload item (zero-based)
   */
  async getUploadErrorMessage(index: number): Promise<string> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    // Look for error message text
    const errorText = item.locator('[class*="text-red-500"]').last();
    const text = await errorText.textContent();
    return text?.trim() || '';
  }

  /**
   * Click the Upload All button to start uploading.
   */
  async clickUploadAll(): Promise<void> {
    await this.uploadAllButton.click();
  }

  /**
   * Wait for all uploads to complete.
   */
  async waitForAllUploadsComplete(): Promise<void> {
    await this.page.waitForFunction(() => {
      const buttons = document.querySelectorAll('button');
      const uploadButton = Array.from(buttons).find(
        b => b.textContent === 'Upload All' || b.textContent === 'Uploading...',
      );
      return uploadButton === undefined;
    });
  }

  /**
   * Check if the upload button is disabled.
   */
  async isUploadButtonDisabled(): Promise<boolean> {
    const button = this.uploadAllButton;
    const isDisabled = await button.isDisabled();
    return isDisabled;
  }

  /**
   * Get the filename of an upload item.
   * @param index - Index of the upload item (zero-based)
   */
  async getUploadFilename(index: number): Promise<string> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    const filenameSpan = item.locator('[class*="font-medium"]').first();
    const text = await filenameSpan.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the progress percentage of an upload.
   * @param index - Index of the upload item (zero-based)
   */
  async getUploadProgress(index: number): Promise<number> {
    const uploadItems = this.page.locator('[data-testid^="upload-item-"]');
    const item = uploadItems.nth(index);

    const progressText = item.locator('[class*="text-gray-500"]').last();
    const text = await progressText.textContent();
    const match = text?.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Perform drag and drop upload.
   * @param filePath - Path to the file to drop
   */
  async dragAndDropFile(filePath: string): Promise<void> {
    await this.dropZone.dispatchEvent('drop', {
      dataTransfer: {
        files: [filePath],
      },
    });
  }

  /**
   * Check if the drop zone is visible.
   */
  async isDropZoneVisible(): Promise<boolean> {
    return this.dropZone.isVisible();
  }

  /**
   * Check if the upload queue is visible.
   */
  async isUploadQueueVisible(): Promise<boolean> {
    return this.uploadQueueTitle.isVisible();
  }

  /**
   * Click "Upload More" to add more files after successful uploads.
   */
  async clickUploadMore(): Promise<void> {
    await this.uploadMoreButton.click();
  }

  /**
   * Click "Go to Gallery" button to navigate to gallery.
   */
  async clickGoToGallery(): Promise<void> {
    await this.goToGalleryButton.click();
    await this.page.waitForURL('**/');
  }
}
