import { Page, Locator } from '@playwright/test';

export class LightboxModal {
  readonly page: Page;
  readonly overlay: Locator;
  readonly closeButton: Locator;
  readonly prevButton: Locator;
  readonly nextButton: Locator;
  readonly image: Locator;
  readonly ratingStars: Locator;
  readonly downloadButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overlay = page.locator('[data-testid="lightbox-overlay"]');
    this.closeButton = page.locator('[data-testid="lightbox-close"]');
    this.prevButton = page.locator('[data-testid="lightbox-prev"]');
    this.nextButton = page.locator('[data-testid="lightbox-next"]');
    this.image = page.locator('[data-testid="lightbox-image"]');
    this.ratingStars = page.locator('[data-testid="lightbox-rating"]');
    this.downloadButtons = page.locator('[data-testid="download-button"]');
  }

  async close() {
    await this.closeButton.click();
  }

  async navigateNext() {
    await this.nextButton.click();
  }

  async navigatePrev() {
    await this.prevButton.click();
  }

  async setRating(rating: number) {
    await this.ratingStars.locator(`button:nth-child(${rating})`).click();
  }

  async download(size: string) {
    await this.page.getByRole('button', { name: `Download ${size}` }).click();
  }
}
