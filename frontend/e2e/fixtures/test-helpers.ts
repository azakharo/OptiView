import {test as base, expect, type Page} from '@playwright/test';
import {GalleryPage} from '../pages/gallery-page';
import {UploadPage} from '../pages/upload-page';
import {LightboxModal} from '../pages/lightbox-modal';

/**
 * Custom test fixtures for the OptiView E2E tests.
 * Extends Playwright's base test with page object models.
 */
interface TestFixtures {
  galleryPage: GalleryPage;
  uploadPage: UploadPage;
  lightbox: LightboxModal;
  seededImages: {
    ids: string[];
    cleanup: () => Promise<void>;
  };
}

/**
 * Extended test function with custom fixtures.
 * Use this in test files instead of importing test directly from Playwright.
 */
export const test = base.extend<TestFixtures>({
  // Gallery Page fixture - created on-demand
  galleryPage: async ({page}, use) => {
    const galleryPage = new GalleryPage(page);
    await use(galleryPage);
  },

  // Upload Page fixture - created on-demand
  uploadPage: async ({page}, use) => {
    const uploadPage = new UploadPage(page);
    await use(uploadPage);
  },

  // Lightbox Modal fixture - created on-demand
  lightbox: async ({page}, use) => {
    const lightbox = new LightboxModal(page);
    await use(lightbox);
  },

  // Seeded images fixture - provides test images and auto-cleanup
  seededImages: async ({page}, use) => {
    const ids: string[] = [];

    // Simple cleanup function
    const cleanup = async () => {
      for (const id of ids) {
        try {
          await page.request.delete(`/api/images/${id}`);
        } catch {
          // Ignore cleanup errors
        }
      }
    };

    await use({ids, cleanup});
  },
});

/**
 * Custom matchers for URL parameter testing.
 * Handles URL-encoded values from state-in-url library.
 *
 * Usage:
 *   await expect(page).toHaveURL(urlMatcher({ genre: 'Nature' }));
 *   await expect(page).toHaveURL(urlMatcher({ rating: 4, sort: 'createdAt' }));
 */
export function urlMatcher(params: Record<string, string | number | undefined>): RegExp {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) {
      // The state-in-url library wraps string values in quotes (e.g., 'Nature')
      // This is then URL-encoded (%27Nature%27)
      // We need to match the encoded version
      if (typeof value === 'string') {
        // Encode the quoted string: 'Nature' -> '%27Nature%27'
        searchParams.append(key, `'${value}'`);
      } else {
        // Numbers are not quoted in JSON, so no encoding needed
        searchParams.append(key, value.toString());
      }
    }
  }

  // Build a regex that matches the URL with these encoded parameters
  const queryString = searchParams.toString();
  if (!queryString) {
    return /./; // Match anything if no params
  }

  // Escape special regex characters in the query string
  const escapedParams = queryString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escapedParams);
}

/**
 * Export expect for use in test files.
 */
export {expect, type Page};
