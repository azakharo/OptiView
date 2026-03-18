import type {Page, Locator} from '@playwright/test';

/**
 * Page Object Model for the Gallery page.
 * Encapsulates actions that can be performed on the gallery page.
 */
export class GalleryPage {
  readonly page: Page;

  // Main elements
  readonly galleryGrid: Locator;
  readonly emptyState: Locator;
  readonly errorState: Locator;
  readonly loadingSkeleton: Locator;

  // Header elements
  readonly genreFilter: Locator;
  readonly ratingFilter: Locator;
  readonly sortDropdown: Locator;
  readonly resetButton: Locator;

  // Image cards
  readonly imageCards: Locator;

  // FAB (Floating Action Button)
  readonly uploadButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main gallery grid container
    this.galleryGrid = page.locator('[data-testid="gallery-grid"]');

    // Empty state - shown when no images match filters
    this.emptyState = page.getByText('No images found');

    // Error state - shown when API fails
    this.errorState = page.getByText('Error loading images');

    // Loading skeleton - shown while fetching images
    this.loadingSkeleton = page.locator('.animate-pulse');

    // Header filter elements
    this.genreFilter = page.locator('#genre-filter');
    this.ratingFilter = page.locator('#rating-filter');
    this.sortDropdown = page.locator('button:has-text("Sort:")');
    this.resetButton = page.getByRole('button', {name: 'Reset'});

    // Image cards - all images in gallery
    this.imageCards = page.locator('[data-testid^="image-card-"]');

    // FAB for uploading
    this.uploadButton = page.locator('[data-testid="fab-upload"]');
  }

  /**
   * Navigate to the gallery page.
   */
  async goto(): Promise<void> {
    await this.page.goto('/');
    await this.waitForGalleryToLoad();
  }

  /**
   * Wait for the gallery to finish loading.
   * Waits for the gallery grid or empty state to be visible.
   */
  async waitForGalleryToLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
    // Wait for either gallery grid or empty/error state using locator.or()
    await this.galleryGrid
      .or(this.emptyState)
      .or(this.errorState)
      .waitFor({state: 'visible', timeout: 10000});
  }

  /**
   * Get the count of visible images in the gallery.
   */
  async getImageCount(): Promise<number> {
    return this.imageCards.count();
  }

  /**
   * Check if there are any images in the gallery.
   */
  async hasImages(): Promise<boolean> {
    const count = await this.getImageCount();
    return count > 0;
  }

  /**
   * Click an image by its index in the gallery.
   * @param index - Zero-based index of the image to click
   */
  async clickImage(index: number): Promise<void> {
    const card = this.imageCards.nth(index);
    await card.click();
  }

  /**
   * Filter images by genre.
   * @param genre - The genre to filter by
   */
  async selectGenre(genre: string): Promise<void> {
    await this.genreFilter.selectOption(genre);
    await this.waitForGalleryToLoad();
  }

  /**
   * Filter images by minimum rating.
   * @param rating - Minimum rating (3, 4, or 5)
   */
  async selectMinRating(rating: number): Promise<void> {
    await this.ratingFilter.selectOption(rating.toString());
    await this.waitForGalleryToLoad();
  }

  /**
   * Clear all filters by clicking the reset button.
   */
  async clearAllFilters(): Promise<void> {
    await this.resetButton.click();
    await this.waitForGalleryToLoad();
  }

  /**
   * Sort images by a specific field and order.
   * @param field - Sort field (createdAt, rating, filename)
   * @param order - Sort order (ASC or DESC)
   */
  async sortBy(field: 'createdAt' | 'rating' | 'filename', order: 'ASC' | 'DESC'): Promise<void> {
    await this.sortDropdown.click();

    // Map field and order to the dropdown option text
    const sortLabels: Record<string, Record<string, string>> = {
      createdAt: {ASC: 'Oldest First', DESC: 'Newest First'},
      rating: {ASC: 'Lowest Rated', DESC: 'Highest Rated'},
      filename: {ASC: 'Name (A-Z)', DESC: 'Name (Z-A)'},
    };

    const optionLabel = sortLabels[field][order];
    await this.page.getByRole('menuitem', {name: optionLabel}).click();
    await this.waitForGalleryToLoad();
  }

  /**
   * Navigate to the upload page by clicking the FAB.
   */
  async navigateToUpload(): Promise<void> {
    await this.uploadButton.click();
    await this.page.waitForURL('**/upload');
  }

  /**
   * Rate an image from the gallery card.
   * Note: This hovers over the card to reveal the rating stars.
   * @param imageIndex - Zero-based index of the image
   * @param rating - Rating to set (1-5)
   */
  async rateImage(imageIndex: number, rating: number): Promise<void> {
    const card = this.imageCards.nth(imageIndex);

    // Hover to reveal the rating stars
    await card.hover();

    // Find and click the star at the given rating position
    // The rating stars are in a div with class containing rating
    const starButton = card.locator('button').nth(rating - 1);
    await starButton.click();
  }

  /**
   * Get the genres of all currently visible images.
   * Returns an array of genre strings.
   */
  async getVisibleImageGenres(): Promise<string[]> {
    const genres: string[] = [];
    const count = await this.imageCards.count();

    for (let i = 0; i < count; i++) {
      const card = this.imageCards.nth(i);
      // Genre is displayed in a span element
      const genreSpan = card.locator('span').last();
      const genreText = await genreSpan.textContent();
      if (genreText) {
        genres.push(genreText.trim());
      }
    }

    return genres;
  }

  /**
   * Wait for pagination to appear (when there are many images).
   */
  async waitForPagination(): Promise<void> {
    await this.page.locator('.pagination').waitFor({state: 'visible', timeout: 5000});
  }

  /**
   * Click on a specific page in pagination.
   * @param pageNumber - The page number to click
   */
  async goToPage(pageNumber: number): Promise<void> {
    await this.page.getByRole('button', {name: pageNumber.toString()}).click();
    await this.waitForGalleryToLoad();
  }
}
