import type {Page, Locator} from '@playwright/test';

/**
 * Page Object Model for the Lightbox modal.
 * Encapsulates actions that can be performed on the lightbox modal.
 */
export class LightboxModal {
  readonly page: Page;

  // Modal container
  readonly modal: Locator;

  // Navigation elements
  readonly closeButton: Locator;
  readonly previousButton: Locator;
  readonly nextButton: Locator;

  // Image display
  readonly image: Locator;

  // Metadata elements
  readonly ratingStars: Locator;
  readonly genreTag: Locator;
  readonly downloadButtons: Locator;

  constructor(page: Page) {
    this.page = page;

    // The lightbox modal - uses fixed positioning and z-index
    this.modal = page.locator('.fixed.inset-0.z-50');

    // Close button - top right corner
    this.closeButton = this.modal.getByRole('button', {name: 'Close'});

    // Navigation buttons
    this.previousButton = this.modal.getByRole('button', {name: 'Previous image'});
    this.nextButton = this.modal.getByRole('button', {name: 'Next image'});

    // Main image in the lightbox
    this.image = this.modal.locator('img').first();

    // Rating stars in footer
    this.ratingStars = this.modal.locator('[class*="bottom-4"]').locator('button');

    // Genre tag
    this.genreTag = this.modal.locator('[class*="bottom-4"]').locator('span').first();

    // Download buttons
    this.downloadButtons = this.modal.locator('a:has-text("Download")');
  }

  /**
   * Check if the lightbox is currently visible.
   */
  async isVisible(): Promise<boolean> {
    return this.modal.isVisible();
  }

  /**
   * Close the lightbox by clicking the close button.
   */
  async close(): Promise<void> {
    await this.closeButton.click();
    // Wait for modal to be removed from DOM
    await this.modal.waitFor({state: 'detached', timeout: 5000});
  }

  /**
   * Close the lightbox by pressing the Escape key.
   */
  async closeWithEscape(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await this.modal.waitFor({state: 'detached', timeout: 5000});
  }

  /**
   * Close the lightbox by clicking outside (on the background).
   */
  async closeByClickingOutside(): Promise<void> {
    // Click on the dark background (not on the image or controls)
    // The background covers the entire viewport
    await this.page.mouse.click(10, 10);
    await this.modal.waitFor({state: 'detached', timeout: 5000});
  }

  /**
   * Navigate to the next image.
   */
  async nextImage(): Promise<void> {
    await this.nextButton.click();
    // Wait for image to potentially change
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate to the previous image.
   */
  async previousImage(): Promise<void> {
    await this.previousButton.click();
    // Wait for image to potentially change
    await this.page.waitForTimeout(300);
  }

  /**
   * Navigate images using keyboard arrows.
   * @param direction - 'prev' or 'next'
   */
  async navigateWithKeyboard(direction: 'prev' | 'next'): Promise<void> {
    const key = direction === 'prev' ? 'ArrowLeft' : 'ArrowRight';
    await this.page.keyboard.press(key);
    await this.page.waitForTimeout(300);
  }

  /**
   * Set a rating for the current image.
   * @param rating - Rating to set (1-5)
   */
  async setRating(rating: number): Promise<void> {
    // Click on the star button at the specified rating position
    const starButton = this.ratingStars.nth(rating - 1);
    await starButton.click();
    await this.page.waitForTimeout(300);
  }

  /**
   * Download an image at a specific size.
   * @param size - Size in pixels (e.g., 640, 1280, or max)
   */
  async downloadImage(size: '640' | '1280' | 'max'): Promise<void> {
    const buttonText = size === 'max' ? 'Download' : `Download ${size}px`;
    const downloadButton = this.modal.getByRole('link', {name: buttonText}).first();

    // Start waiting for download before clicking
    const downloadPromise = this.page.waitForEvent('download', {timeout: 10000});

    await downloadButton.click();

    try {
      const download = await downloadPromise;
      // Cancel the download by rejecting the promise
      // In real tests, you might want to handle the download differently
      await download.cancel();
    } catch {
      // Download might not trigger in headless mode or might be immediate
    }
  }

  /**
   * Get the src of the currently displayed image.
   */
  async getCurrentImageSrc(): Promise<string> {
    const src = await this.image.getAttribute('src');
    return src || '';
  }

  /**
   * Get the genre tag text of the current image.
   */
  async getGenre(): Promise<string> {
    const text = await this.genreTag.textContent();
    return text?.trim() || '';
  }

  /**
   * Get the current rating of the image.
   */
  async getRating(): Promise<number> {
    // Count how many stars are filled (have some specific class or are clicked)
    const stars = this.ratingStars;
    const count = await stars.count();

    let filledCount = 0;
    for (let i = 0; i < count; i++) {
      const star = stars.nth(i);
      const ariaPressed = await star.getAttribute('aria-pressed');
      if (ariaPressed === 'true') {
        filledCount++;
      }
    }

    return filledCount;
  }

  /**
   * Check if the previous button is disabled (at first image).
   */
  async isPreviousDisabled(): Promise<boolean> {
    const disabled = await this.previousButton.getAttribute('disabled');
    return disabled !== null;
  }

  /**
   * Check if the next button is disabled (at last image).
   */
  async isNextDisabled(): Promise<boolean> {
    const disabled = await this.nextButton.getAttribute('disabled');
    return disabled !== null;
  }

  /**
   * Wait for the image to fully load in the lightbox.
   */
  async waitForImageLoad(): Promise<void> {
    await this.image.waitFor({state: 'visible'});
    // Wait for the image to be complete
    await this.page.evaluate(async () => {
      const img = document.querySelector('.fixed.inset-0.z-50 img') as HTMLImageElement;
      if (img && !img.complete) {
        return new Promise(resolve => {
          img.onload = () => resolve(true);
          img.onerror = () => resolve(true);
        });
      }
    });
  }

  /**
   * Get all available download button texts.
   */
  async getDownloadButtonTexts(): Promise<string[]> {
    const buttons = await this.downloadButtons.all();
    const texts: string[] = [];

    for (const button of buttons) {
      const text = await button.textContent();
      if (text) {
        texts.push(text.trim());
      }
    }

    return texts;
  }
}
