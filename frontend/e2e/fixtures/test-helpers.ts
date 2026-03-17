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
 * Export expect for use in test files.
 */
export {expect, type Page};
