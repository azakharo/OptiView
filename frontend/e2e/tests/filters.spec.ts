import {test, expect} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {urlMatcher} from '../fixtures/test-helpers';

test.describe('Filter Functionality', () => {
  test.beforeEach(async ({page}) => {
    const galleryPage = new GalleryPage(page);
    await galleryPage.goto();
    await galleryPage.waitForGalleryToLoad();
  });

  test('should filter by genre and update URL', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test filtering');

    await galleryPage.selectGenre('Nature');
    await expect(page).toHaveURL(urlMatcher({genre: 'Nature'}));

    const genres = await galleryPage.getVisibleImageGenres();
    if (genres.length > 0) {
      const allNature = genres.every(g => g === 'Nature');
      expect(allNature || genres.length === 0).toBe(true);
    }
  });

  test('should filter by minimum rating', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test rating filter');

    await galleryPage.selectMinRating(4);
    await expect(page).toHaveURL(urlMatcher({rating: 4}));
  });

  test('should combine multiple filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test combined filters');

    await galleryPage.selectGenre('Nature');
    await galleryPage.selectMinRating(3);

    await expect(page).toHaveURL(urlMatcher({genre: 'Nature'}));
    await expect(page).toHaveURL(urlMatcher({rating: 3}));
  });

  test('should persist filters on page reload', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.selectGenre('Architecture');
    const urlWithFilter = page.url();

    await page.reload();
    await galleryPage.waitForGalleryToLoad();

    await expect(page).toHaveURL(urlWithFilter);
  });

  test('should clear all filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.selectGenre('Nature');
    await galleryPage.selectMinRating(4);
    await galleryPage.clearAllFilters();

    await expect(page).toHaveURL(url => {
      const urlObj = new URL(url);
      return !urlObj.searchParams.has('genre') && !urlObj.searchParams.has('rating');
    });
  });

  test('should sort images', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test sorting');

    await galleryPage.sortBy('createdAt', 'ASC');
    await expect(page).toHaveURL(urlMatcher({sortOrder: 'ASC'}));

    await galleryPage.sortBy('rating', 'DESC');
    await expect(page).toHaveURL(urlMatcher({sort: 'rating'}));
  });

  test('should update result count after filtering', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test result count');

    await galleryPage.selectGenre('Nature');
    await galleryPage.waitForGalleryToLoad();

    const newCount = await galleryPage.getImageCount();
    expect(newCount).toBeLessThanOrEqual(initialCount);
  });

  test('should have genre filter with all genre options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const genreOptions = await galleryPage.genreFilter.locator('option').allInnerTexts();
    expect(genreOptions).toContain('All Genres');
    expect(genreOptions).toContain('Nature');
    expect(genreOptions).toContain('Architecture');
    expect(genreOptions).toContain('Portrait');
  });

  test('should have rating filter with all rating options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    const ratingOptions = await galleryPage.ratingFilter.locator('option').allInnerTexts();
    expect(ratingOptions).toContain('Any Rating');
    expect(ratingOptions).toContain('5 Stars');
    expect(ratingOptions).toContain('4+ Stars');
    expect(ratingOptions).toContain('3+ Stars');
  });

  test('should have sort dropdown with all sort options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    await galleryPage.sortDropdown.click();

    const sortOptions = page.getByRole('menuitem');
    await expect(sortOptions.getByText('Newest First')).toBeVisible();
    await expect(sortOptions.getByText('Oldest First')).toBeVisible();
    await expect(sortOptions.getByText('Highest Rated')).toBeVisible();
    await expect(sortOptions.getByText('Lowest Rated')).toBeVisible();
    await expect(sortOptions.getByText('Name (A-Z)')).toBeVisible();
    await expect(sortOptions.getByText('Name (Z-A)')).toBeVisible();

    await page.keyboard.press('Escape');
  });
});
