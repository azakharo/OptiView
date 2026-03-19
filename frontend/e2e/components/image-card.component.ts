import type {Locator} from '@playwright/test';
import {RatingComponent} from './rating.component';

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
  readonly ratingStars: Locator;
  readonly genreTag: Locator;
  private readonly rating: RatingComponent;

  constructor(root: Locator) {
    this.root = root;

    // Rating overlay - revealed on hover via group-hover:opacity-100
    // Use direct locator for star buttons inside the card
    this.ratingStars = root.locator('button');

    // Genre tag - span element containing genre text
    this.genreTag = root.locator('span').last();

    // Shared rating component
    this.rating = new RatingComponent(root.locator('button'));
  }

  /**
   * Hover over the card to reveal the rating overlay.
   */
  async hover(): Promise<void> {
    await this.root.hover();
  }

  /**
   * Wait for rating stars to be visible/hoverable.
   * The overlay is revealed on hover via CSS opacity transition.
   */
  async waitForRatingOverlayVisible(): Promise<void> {
    // Wait for star buttons to be attached and ready
    await this.ratingStars.first().waitFor();
    // Small delay to allow CSS transition to complete
    await this.root.page().waitForTimeout(100);
  }

  /**
   * Set rating by clicking a star (1-5).
   * Requires the overlay to be visible (call hover() first).
   * @param rating - Rating to set (1-5)
   */
  async setRating(rating: number): Promise<void> {
    await this.waitForRatingOverlayVisible();
    await this.rating.setRating(rating);
  }

  /**
   * Get the current rating by counting filled stars.
   * Requires the overlay to be visible (call hover() first).
   * @returns Current rating (0-5)
   */
  async getRating(): Promise<number> {
    await this.waitForRatingOverlayVisible();
    return this.rating.getRating();
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
