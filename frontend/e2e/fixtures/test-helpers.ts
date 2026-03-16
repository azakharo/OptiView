import { test as base, Page } from '@playwright/test';
import { GalleryPage } from '../pages/gallery-page';
import { UploadPage } from '../pages/upload-page';
import { LightboxModal } from '../pages/lightbox-modal';

// Declare the types of fixtures
type MyFixtures = {
  galleryPage: GalleryPage;
  uploadPage: UploadPage;
  lightbox: LightboxModal;
};

// Extend base test with custom fixtures
export const test = base.extend<MyFixtures>({
  galleryPage: async ({ page }, use) => {
    await use(new GalleryPage(page));
  },
  uploadPage: async ({ page }, use) => {
    await use(new UploadPage(page));
  },
  lightbox: async ({ page }, use) => {
    await use(new LightboxModal(page));
  },
});

export { expect } from '@playwright/test';
