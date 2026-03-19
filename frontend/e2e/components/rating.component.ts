import type {Locator, Page} from '@playwright/test';

/**
 * Reusable component for interacting with star rating controls.
 * Encapsulates common rating logic used across multiple page objects.
 *
 */
export class RatingComponent {
  readonly starsLocator: Locator;
  readonly page: Page;

  constructor(starsLocator: Locator) {
    this.starsLocator = starsLocator;
    this.page = starsLocator.page();
  }

  /**
   * Get the current rating by counting filled stars.
   * @returns Current rating (0-5)
   */
  async getRating(): Promise<number> {
    const count = await this.starsLocator.count();

    let filledCount = 0;
    for (let i = 0; i < count; i++) {
      const star = this.starsLocator.nth(i);
      const ariaPressed = await star.getAttribute('aria-pressed');
      if (ariaPressed === 'true') {
        filledCount++;
      }
    }

    return filledCount;
  }

  /**
   * Set rating by clicking a star using its index (0-based).
   * @param rating - Rating to set (1-5)
   */
  async setRating(rating: number): Promise<void> {
    // Click the button at the rating position (0-indexed)
    const starButton = this.starsLocator.nth(rating - 1);
    await starButton.click();
    await this.page.waitForTimeout(300);
  }
}
