import type {Locator, Page} from '@playwright/test';

/**
 * Reusable component for interacting with star rating controls.
 * Encapsulates common rating logic used across multiple page objects.
 *
 * The rating component uses semantic aria-labels in the format "Rate N star(s)"
 * which is consistent across all usages in the application.
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
   * Set rating by clicking a star using its aria-label.
   * Uses semantic aria-label: "Rate N star" or "Rate N stars"
   * @param rating - Rating to set (1-5)
   */
  async setRating(rating: number): Promise<void> {
    const label = `Rate ${rating} star${rating > 1 ? 's' : ''}`;
    const starButton = this.starsLocator.getByRole('button', {name: label});
    await starButton.click();
    await this.page.waitForTimeout(300);
  }
}
