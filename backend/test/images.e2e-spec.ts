import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import sharp from 'sharp';
import { ImageService, ImageFormat } from '../src/modules/images/image.service';
import {
  ensureUploadDirectories,
  DIRECTORIES,
  getProcessedPath,
  getLqipPath,
} from '../src/utils/storage.util';

describe('Image Processing (e2e)', () => {
  let app: INestApplication;
  let imageService: ImageService;
  const testUuid = 'test-e2e-image-001';
  const testImagePath = path.join(DIRECTORIES.ORIGINALS, `${testUuid}.jpg`);

  beforeAll(async () => {
    // Ensure directories exist
    await ensureUploadDirectories();

    // Create a test image for E2E tests
    const testImageBuffer = await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    await fs.writeFile(testImagePath, testImageBuffer);

    // Setup minimal NestJS app with ImageService
    const moduleFixture: TestingModule = await Test.createTestingModule({
      providers: [ImageService],
    }).compile();

    app = moduleFixture.createNestApplication();
    imageService = moduleFixture.get<ImageService>(ImageService);
    await app.init();
  });

  afterAll(async () => {
    // Cleanup test files
    try {
      await fs.unlink(testImagePath);
    } catch (err) {
      console.error(err);
    }

    // Cleanup processed directory
    const processedDir = path.join(DIRECTORIES.PROCESSED, testUuid);
    try {
      await fs.rm(processedDir, { recursive: true, force: true });
    } catch (err) {
      console.error(err);
    }

    // Cleanup LQIP
    try {
      await fs.unlink(getLqipPath(testUuid));
    } catch (err) {
      console.error(err);
    }

    await app.close();
  });

  describe('Metadata Extraction Pipeline', () => {
    it('should extract complete metadata from uploaded image', async () => {
      const metadata = await imageService.extractMetadata(testImagePath);

      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);
      expect(metadata.aspectRatio).toBeCloseTo(1.7778, 3);
      expect(metadata.format).toBe('jpeg');
    });

    it('should extract dominant color from image', async () => {
      const color = await imageService.extractDominantColor(testImagePath);

      expect(color).toMatch(/^#[0-9A-F]{6}$/);
      // Should be in the blue range (original was r:100, g:150, b:200)
      expect(color).toBeTruthy();
    });
  });

  describe('LQIP Generation Pipeline', () => {
    it('should generate LQIP with correct specifications', async () => {
      const lqip = await imageService.generateAndSaveLqip(
        testImagePath,
        testUuid,
      );

      // Check data URI format
      expect(lqip).toMatch(/^data:image\/jpeg;base64,/);

      // Check size is under 500 bytes
      const base64Data = lqip.replace(/^data:image\/jpeg;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      expect(buffer.length).toBeLessThan(500);

      // Check LQIP file exists on disk
      const lqipPath = getLqipPath(testUuid);
      const exists = await fs
        .access(lqipPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });
  });

  describe('Image Processing Pipeline', () => {
    it('should process image to JPEG format', async () => {
      const result = await imageService.processImage(
        testImagePath,
        640,
        'jpeg',
      );

      expect(result.format).toBe('jpeg');
      expect(result.width).toBe(640);
      expect(result.contentType).toBe('image/jpeg');
      expect(result.buffer.length).toBeGreaterThan(0);

      // Verify output dimensions
      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.width).toBe(640);
    });

    it('should process image to WebP format', async () => {
      const result = await imageService.processImage(
        testImagePath,
        1024,
        'webp',
      );

      expect(result.format).toBe('webp');
      expect(result.width).toBe(1024);
      expect(result.contentType).toBe('image/webp');

      const metadata = await sharp(result.buffer).metadata();
      expect(metadata.format).toBe('webp');
    });

    it('should process image to AVIF format', async () => {
      const result = await imageService.processImage(
        testImagePath,
        1280,
        'avif',
      );

      expect(result.format).toBe('avif');
      expect(result.width).toBe(1280);
      expect(result.contentType).toBe('image/avif');

      const metadata = await sharp(result.buffer).metadata();
      // Sharp may return 'heif' as format for AVIF images
      expect(metadata.format).toMatch(/^(avif|heif)$/);
    });
  });

  describe('Caching Pipeline', () => {
    it('should cache processed images', async () => {
      // First call - should generate and cache
      const result1 = await imageService.getProcessedImage(
        testUuid,
        768,
        'jpeg',
      );

      expect(result1.format).toBe('jpeg');
      expect(result1.width).toBe(768);

      // Check file was cached
      const cachedPath = getProcessedPath(testUuid, 768, 'jpeg');
      const exists = await fs
        .access(cachedPath)
        .then(() => true)
        .catch(() => false);
      expect(exists).toBe(true);
    });

    it('should serve from cache on second request', async () => {
      // First call caches the image
      await imageService.getProcessedImage(testUuid, 320, 'webp');

      // Second call should use cache (no file read error)
      const result2 = await imageService.getProcessedImage(
        testUuid,
        320,
        'webp',
      );

      expect(result2.format).toBe('webp');
      expect(result2.width).toBe(320);
    });
  });

  describe('Format Negotiation', () => {
    it('should negotiate AVIF format from Accept header', () => {
      expect(imageService.negotiateFormat('image/avif,image/webp')).toBe(
        'avif',
      );
    });

    it('should negotiate WebP format when AVIF not available', () => {
      expect(imageService.negotiateFormat('image/webp,image/jpeg')).toBe(
        'webp',
      );
    });

    it('should fallback to JPEG when no modern formats', () => {
      expect(imageService.negotiateFormat('image/jpeg')).toBe('jpeg');
      expect(imageService.negotiateFormat('')).toBe('jpeg');
    });
  });

  describe('Complete Upload Processing Flow', () => {
    it('should simulate complete image processing flow', async () => {
      // 1. Validate image
      const validation = await imageService.validateImage(testImagePath);
      expect(validation.valid).toBe(true);

      // 2. Extract metadata
      const metadata = await imageService.extractMetadata(testImagePath);
      expect(metadata.width).toBe(1920);
      expect(metadata.height).toBe(1080);

      // 3. Extract dominant color
      const dominantColor =
        await imageService.extractDominantColor(testImagePath);
      expect(dominantColor).toMatch(/^#[0-9A-F]{6}$/);

      // 4. Generate LQIP
      const lqip = await imageService.generateLqip(testImagePath);
      expect(lqip).toMatch(/^data:image\/jpeg;base64,/);

      // 5. Process to different sizes and formats
      const sizes = [320, 640, 1024];
      const formats: ImageFormat[] = ['jpeg', 'webp', 'avif'];

      for (const size of sizes) {
        for (const format of formats) {
          const processed = await imageService.processImage(
            testImagePath,
            size,
            format,
          );
          expect(processed.width).toBe(size);
          expect(processed.format).toBe(format);
        }
      }
    });
  });
});
