import type {Locator} from '@playwright/test';

/**
 * Page Object Model for an individual Image Card component.
 * Encapsulates interactions with a single image card in the gallery,
 * including the hover-revealed rating overlay.
 *
 * Usage:
 * ```typescript
 * const card = new ImageCardComponent(galleryPage.imageCards.nth(0));
 * await card.hover();
 * await card.setRating(5);
 * ```
 */
export class ImageCardComponent {
  readonly root: Locator;
  readonly ratingOverlay: Locator;
  readonly ratingStars: Locator;
  readonly genreTag: Locator;

  constructor(root: Locator) {
    this.root = root;

    // Rating overlay - revealed on hover via group-hover:opacity-100
    // Uses semantic structure: div with RatingStars and GenreTag
    this.ratingOverlay = root.locator('div').filter({has: root.getByRole('group', {name: 'Rating'})});

    // Rating stars - buttons with aria-label like "Rate 1 star"
    this.ratingStars = root.getByRole('group', {name: 'Rating'}).getByRole('button');

    // Genre tag - span element containing genre text
    this.genreTag = root.locator('span').last();
  }

  /**
   * Hover over the card to reveal the rating overlay.
   */
  async hover(): Promise<void> {
    await this.root.hover();
  }

  /**
   * Check if the rating overlay is visible.
   * The overlay is revealed on hover via opacity transition.
   */
  async waitForRatingOverlayVisible(): Promise<void> {
    await this.ratingOverlay.waitFor({state: 'visible'});
  }

  /**
   * Set rating by clicking a star (1-5).
   * Requires the overlay to be visible (call hover() first).
   * @param rating - Rating to set (1-5)
   */
  async setRating(rating: number): Promise<void> {
    // Ensure overlay is visible before interacting
    await this.waitForRatingOverlayVisible();

    // Click the star button at the given position
    // aria-label is "Rate {n} stars"
    const starButton = this.root.getByRole('button', {name: `Rate ${rating} star${rating > 1 ? 's' : ''}`});
    await starButton.click();
  }

  /**
   * Get the current rating by counting filled stars.
   * Requires the overlay to be visible (call hover() first).
   * @returns Current rating (0-5)
   */
  async getRating(): Promise<number> {
    await this.waitForRatingOverlayVisible();

    const buttons = this.ratingStars;
    const count = await buttons.count();

    let filledCount = 0;
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const ariaPressed = await button.getAttribute('aria-pressed');
      if (ariaPressed === 'true') {
        filledCount++;
      }
    }

    return filledCount;
  }

  /**
   * Get the genre tag text.
   * @returns Genre string
   */
  async getGenre(): Promise<string> {
    const text = await this.genreTag.textContent();
    return text?.trim() || '';
  }

  /**
   * Click on the card to open the lightbox.
   */
  async click(): Promise<void> {
    await this.root.click();
  }
}
