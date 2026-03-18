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

    // Get initial image count
    const initialCount = await galleryPage.getImageCount();

    // Skip if no images to filter
    test.skip(initialCount === 0, 'No images to test filtering');

    // Select a genre filter
    await galleryPage.selectGenre('Nature');

    // Verify URL was updated with genre parameter (URL-encoded)
    await expect(page).toHaveURL(urlMatcher({genre: 'Nature'}));

    // Verify filtered results
    const genres = await galleryPage.getVisibleImageGenres();

    // If images are shown, they should all be Nature (or empty if none match)
    if (genres.length > 0) {
      const allNature = genres.every(g => g === 'Nature');
      expect(allNature || genres.length === 0).toBe(true);
    }
  });

  test('should filter by minimum rating', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Get initial image count
    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test rating filter');

    // Select minimum rating filter
    await galleryPage.selectMinRating(4);

    // Verify URL was updated with rating parameter (URL-encoded)
    await expect(page).toHaveURL(urlMatcher({rating: 4}));

    // Verify filtered results have rating >= 4
    // (This would require more complex DOM inspection or API testing)
    // TODO check the displayed cards for proper rating
  });

  test('should combine multiple filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Get initial count
    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test combined filters');

    // Apply genre filter
    await galleryPage.selectGenre('Nature');

    // Apply rating filter
    await galleryPage.selectMinRating(3);

    // Verify both filters are in URL (URL-encoded)
    await expect(page).toHaveURL(urlMatcher({genre: 'Nature'}));
    await expect(page).toHaveURL(urlMatcher({rating: 3}));
    // TODO check the displayed cards for proper filters
  });

  test('should persist filters on page reload', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Apply a filter
    await galleryPage.selectGenre('Architecture');

    // Get the current URL
    const urlWithFilter = page.url();

    // Reload the page
    await page.reload();
    await galleryPage.waitForGalleryToLoad();

    // Verify the URL still has the filter
    await expect(page).toHaveURL(urlWithFilter);
  });

  test('should clear all filters', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Apply filters
    await galleryPage.selectGenre('Nature');
    await galleryPage.selectMinRating(4);

    // Clear all filters
    await galleryPage.clearAllFilters();

    // Verify URL no longer has filter parameters
    await expect(page).toHaveURL(url => {
      const urlObj = new URL(url);
      return !urlObj.searchParams.has('genre') && !urlObj.searchParams.has('rating');
    });
  });

  test('should sort images', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Get initial image count
    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test sorting');

    // Sort by oldest first (non-default: ASC instead of DESC)
    // Note: 'createdAt' is default sort field, so only sortOrder appears in URL
    await galleryPage.sortBy('createdAt', 'ASC');

    // Verify URL was updated with non-default sortOrder (URL-encoded)
    await expect(page).toHaveURL(urlMatcher({sortOrder: 'ASC'}));

    // Sort by rating highest (non-default sort field)
    await galleryPage.sortBy('rating', 'DESC');

    // Verify URL was updated with non-default sort field (URL-encoded)
    await expect(page).toHaveURL(urlMatcher({sort: 'rating'}));
    // TODO need to check the displayed results (cards), not the URL
  });

  test('should update result count after filtering', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Get initial count
    const initialCount = await galleryPage.getImageCount();
    test.skip(initialCount === 0, 'No images to test result count');

    // Apply filter
    await galleryPage.selectGenre('Nature');

    // Wait for gallery to update
    await galleryPage.waitForGalleryToLoad();

    // Get new count
    const newCount = await galleryPage.getImageCount();

    // The count should be <= initial count (filtered results)
    expect(newCount).toBeLessThanOrEqual(initialCount);
    // TODO need to check that the results have been changed not their count
  });

  test('should have genre filter with all genre options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Check genre filter options
    const genreOptions = await galleryPage.genreFilter.locator('option').allInnerTexts();

    // Verify expected genres are present
    expect(genreOptions).toContain('All Genres');
    expect(genreOptions).toContain('Nature');
    expect(genreOptions).toContain('Architecture');
    expect(genreOptions).toContain('Portrait');
  });

  test('should have rating filter with all rating options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Check rating filter options
    const ratingOptions = await galleryPage.ratingFilter.locator('option').allInnerTexts();

    // Verify expected options are present
    expect(ratingOptions).toContain('Any Rating');
    expect(ratingOptions).toContain('5 Stars');
    expect(ratingOptions).toContain('4+ Stars');
    expect(ratingOptions).toContain('3+ Stars');
  });

  test('should have sort dropdown with all sort options', async ({page}) => {
    const galleryPage = new GalleryPage(page);

    // Click sort dropdown to open menu
    await galleryPage.sortDropdown.click();

    // Check sort options are visible
    const sortOptions = page.getByRole('menuitem');
    await expect(sortOptions.getByText('Newest First')).toBeVisible();
    await expect(sortOptions.getByText('Oldest First')).toBeVisible();
    await expect(sortOptions.getByText('Highest Rated')).toBeVisible();
    await expect(sortOptions.getByText('Lowest Rated')).toBeVisible();
    await expect(sortOptions.getByText('Name (A-Z)')).toBeVisible();
    await expect(sortOptions.getByText('Name (Z-A)')).toBeVisible();

    // Close dropdown by pressing Escape
    await page.keyboard.press('Escape');
  });
});
