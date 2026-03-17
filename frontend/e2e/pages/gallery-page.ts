import { Page, Locator } from '@playwright/test';

export class GalleryPage {
  readonly page: Page;
  readonly header: Locator;
  readonly galleryGrid: Locator;
  readonly imageCards: Locator;
  readonly genreFilter: Locator;
  readonly ratingFilter: Locator;
  readonly sortDropdown: Locator;
  readonly fab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.header = page.locator('header');
    this.galleryGrid = page.locator('[data-testid="gallery-grid"]');
    this.imageCards = page.locator('[data-testid^="image-card-"]');
    this.genreFilter = page.locator('[data-testid="genre-filter"]');
    this.ratingFilter = page.locator('[data-testid="rating-filter"]');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    this.fab = page.locator('[data-testid="fab"]');
  }

  async goto() {
    await this.page.goto('/');
  }

  async selectGenre(genre: string) {
    await this.genreFilter.click();
    await this.page.getByRole('option', { name: genre }).click();
  }

  async selectMinRating(rating: number) {
    await this.ratingFilter.click();
    await this.page.getByRole('option', { name: `${rating}+ stars` }).click();
  }

  async openLightbox(imageIndex: number) {
    await this.imageCards.nth(imageIndex).click();
  }

  async navigateToUpload() {
    await this.fab.click();
  }
}
