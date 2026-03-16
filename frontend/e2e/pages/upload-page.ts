import { Page, Locator, FileChooser } from '@playwright/test';

export class UploadPage {
  readonly page: Page;
  readonly dropZone: Locator;
  readonly fileInput: Locator;
  readonly uploadQueue: Locator;
  readonly backToGallery: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dropZone = page.locator('[data-testid="dropzone"]');
    this.fileInput = page.locator('input[type="file"]');
    this.uploadQueue = page.locator('[data-testid="upload-queue"]');
    this.backToGallery = page.locator('[data-testid="back-to-gallery"]');
  }

  async goto() {
    await this.page.goto('/upload');
  }

  async uploadFile(filePath: string, genre?: string) {
    await this.fileInput.setInputFiles(filePath);
    if (genre) {
      // Select genre for the uploaded file
    }
  }

  async waitForUploadComplete(timeout = 30000) {
    await this.page.locator('[data-testid="upload-status-done"]').waitFor({
      state: 'visible',
      timeout,
    });
  }
}
