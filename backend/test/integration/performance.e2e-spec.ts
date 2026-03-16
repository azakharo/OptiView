import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import sharp from 'sharp';
import { AppModule } from '../../src/app.module';
import { Image } from '../../src/entities/image.entity';
import { ensureUploadDirectories } from '../../src/utils/storage.util';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

describe('Performance Tests (e2e)', () => {
  let app: INestApplication;
  let imageRepository: any;
  let testImageId: string;

  beforeAll(async () => {
    await ensureUploadDirectories();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    imageRepository = moduleFixture.get(getRepositoryToken(Image));
    await app.init();

    // Create a test image for performance tests
    const testBuffer = await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const response = await request(app.getHttpServer())
      .post('/api/images/upload')
      .attach('file', testBuffer, 'perf-test.jpg')
      .field('genre', 'Nature')
      .expect(201);

    testImageId = response.body.id;
  });

  afterAll(async () => {
    if (testImageId) {
      try {
        await imageRepository.delete(testImageId);
      } catch {
        // Ignore cleanup errors
      }
    }
    await app.close();
  });

  describe('Response Time Tests', () => {
    it('should respond to GET /api/images within 500ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer()).get('/api/images').expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should respond to GET /api/images/:id/metadata within 200ms', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get(`/api/images/${testImageId}/metadata`)
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });

    it('should serve cached processed image within 100ms', async () => {
      // First request to generate cache
      await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 640 })
        .set('Accept', 'image/webp')
        .expect(200);

      // Second request should be cached
      const start = Date.now();
      await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 640 })
        .set('Accept', 'image/webp')
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should respond quickly for paginated requests', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/images')
        .query({ page: 1, pageSize: 10 })
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should respond quickly for filtered requests', async () => {
      const start = Date.now();
      await request(app.getHttpServer())
        .get('/api/images')
        .query({ genre: 'Nature', rating: 3 })
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(500);
    });

    it('should respond quickly for metadata requests with caching', async () => {
      // First request
      await request(app.getHttpServer())
        .get(`/api/images/${testImageId}/metadata`)
        .expect(200);

      // Second request should be faster due to any caching
      const start = Date.now();
      await request(app.getHttpServer())
        .get(`/api/images/${testImageId}/metadata`)
        .expect(200);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(200);
    });
  });

  describe('Cache Headers Tests', () => {
    it('should return correct cache headers for processed images', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 640 })
        .expect(200);

      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
    });

    it('should include cache-control header for different sizes', async () => {
      const sizes = [320, 640, 800, 1280, 1920];

      for (const width of sizes) {
        const response = await request(app.getHttpServer())
          .get(`/api/images/${testImageId}`)
          .query({ width })
          .expect(200);

        expect(response.headers['cache-control']).toBe(
          'public, max-age=31536000',
        );
      }
    });

    it('should include cache-control for AVIF format', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 800 })
        .set('Accept', 'image/avif,image/webp,image/jpeg')
        .expect(200);

      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
    });

    it('should include cache-control for WebP format', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 800 })
        .set('Accept', 'image/webp,image/jpeg')
        .expect(200);

      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
    });

    it('should include cache-control for JPEG format fallback', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${testImageId}`)
        .query({ width: 800 })
        .set('Accept', 'image/jpeg')
        .expect(200);

      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
    });
  });

  describe('Image Processing Performance', () => {
    it('should process and serve large images efficiently', async () => {
      const largeBuffer = await sharp({
        create: {
          width: 3840,
          height: 2160,
          channels: 3,
          background: { r: 50, g: 100, b: 150 },
        },
      })
        .jpeg({ quality: 90 })
        .toBuffer();

      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', largeBuffer, 'large-test.jpg')
        .field('genre', 'Nature')
        .expect(201);

      const largeImageId = uploadResponse.body.id;

      try {
        // Measure time to get processed image
        const start = Date.now();
        await request(app.getHttpServer())
          .get(`/api/images/${largeImageId}`)
          .query({ width: 1920 })
          .expect(200);
        const duration = Date.now() - start;

        // Should still be reasonably fast even for large images
        expect(duration).toBeLessThan(1000);

        // Verify cache headers
        const response = await request(app.getHttpServer())
          .get(`/api/images/${largeImageId}`)
          .query({ width: 1920 })
          .expect(200);

        expect(response.headers['cache-control']).toBe(
          'public, max-age=31536000',
        );
      } finally {
        await imageRepository.delete(largeImageId);
      }
    });

    it('should generate LQIP efficiently', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${testImageId}/lqip`)
        .expect(200);

      expect(response.body).toHaveProperty('lqipBase64');
      expect(response.body.lqipBase64).toMatch(/^data:image\/jpeg;base64,/);
    });
  });

  describe('Concurrent Request Performance', () => {
    it('should handle multiple concurrent list requests', async () => {
      const concurrentRequests = Array(5)
        .fill(null)
        .map(() => request(app.getHttpServer()).get('/api/images'));

      const start = Date.now();
      const responses = await Promise.all(concurrentRequests);
      const duration = Date.now() - start;

      // All requests should complete successfully
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Total time should still be reasonable
      expect(duration).toBeLessThan(1000);
    });

    it('should handle concurrent image processing requests', async () => {
      const imageRequests = [
        request(app.getHttpServer()).get(`/api/images/${testImageId}`),
        request(app.getHttpServer())
          .get(`/api/images/${testImageId}`)
          .query({ width: 320 }),
        request(app.getHttpServer())
          .get(`/api/images/${testImageId}`)
          .query({ width: 640 }),
        request(app.getHttpServer())
          .get(`/api/images/${testImageId}`)
          .query({ width: 1280 }),
      ];

      const start = Date.now();
      const responses = await Promise.all(imageRequests);
      const duration = Date.now() - start;

      // All requests should complete successfully
      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.headers['cache-control']).toBe(
          'public, max-age=31536000',
        );
      });

      // Total time should still be reasonable
      expect(duration).toBeLessThan(2000);
    });
  });
});
