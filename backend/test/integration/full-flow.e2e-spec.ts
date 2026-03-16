import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import sharp from 'sharp';
import { AppModule } from '../../src/app.module';
import { Image } from '../../src/entities/image.entity';
import { Genre } from '../../src/entities/genre.enum';
import { ensureUploadDirectories } from '../../src/utils/storage.util';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

describe('Full Integration Flow (e2e)', () => {
  let app: INestApplication;
  let imageRepository: any;
  const testImageIds: string[] = [];

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
  });

  afterAll(async () => {
    // Clean up all test images
    for (const id of testImageIds) {
      try {
        await imageRepository.delete(id);
      } catch {
        // Ignore cleanup errors
      }
    }
    await app.close();
  });

  describe('Complete Upload to Gallery Flow', () => {
    it('should upload, retrieve, rate, and process image in sequence', async () => {
      // Create test image
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

      // Step 1: Upload
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'integration-test.jpg')
        .field('genre', 'Nature')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      expect(uploadResponse.body).toHaveProperty('id');
      expect(uploadResponse.body.genre).toBe(Genre.NATURE);

      // Step 2: Verify in list
      const listResponse = await request(app.getHttpServer())
        .get('/api/images')
        .query({ genre: 'Nature' })
        .expect(200);

      const foundInList = listResponse.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundInList).toBeDefined();

      // Step 3: Get metadata
      const metadataResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}/metadata`)
        .expect(200);

      expect(metadataResponse.body.id).toBe(imageId);
      expect(metadataResponse.body.width).toBe(1920);
      expect(metadataResponse.body.height).toBe(1080);

      // Step 4: Update rating
      const ratingResponse = await request(app.getHttpServer())
        .patch(`/api/images/${imageId}/rating`)
        .send({ rating: 5 })
        .expect(200);

      expect(ratingResponse.body.rating).toBe(5);

      // Step 5: Verify rating filter works
      const updatedListResponse = await request(app.getHttpServer())
        .get('/api/images')
        .query({ rating: 5 })
        .expect(200);

      const foundWithRating = updatedListResponse.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundWithRating).toBeDefined();
      expect(foundWithRating.rating).toBe(5);

      // Step 6: Get processed image with format negotiation
      const imageResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}`)
        .query({ width: 640 })
        .set('Accept', 'image/webp')
        .expect(200);

      expect(imageResponse.headers['content-type']).toMatch(/image\/webp/);
      expect(Buffer.isBuffer(imageResponse.body)).toBe(true);
      expect(imageResponse.body.length).toBeGreaterThan(0);
    });

    it('should handle AVIF format negotiation correctly', async () => {
      // Create test image
      const testBuffer = await sharp({
        create: {
          width: 1600,
          height: 900,
          channels: 3,
          background: { r: 200, g: 100, b: 150 },
        },
      })
        .jpeg({ quality: 85 })
        .toBuffer();

      // Upload image
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'avif-test.jpg')
        .field('genre', 'Architecture')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      // Request with AVIF support
      const avifResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}`)
        .query({ width: 800 })
        .set('Accept', 'image/avif,image/webp,image/jpeg')
        .expect(200);

      // Should return AVIF if supported, otherwise WebP or JPEG
      expect(avifResponse.headers['content-type']).toMatch(
        /image\/(avif|webp|jpeg)/,
      );

      // Verify cache headers
      expect(avifResponse.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
    });

    it('should verify rating filter excludes lower rated images', async () => {
      // Create test image with default rating (3)
      const testBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 75, g: 125, b: 175 },
        },
      })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Upload image - default rating is 3
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'rating-filter-test.jpg')
        .field('genre', 'Nature')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      // Verify it appears with rating 3
      const defaultRatingResponse = await request(app.getHttpServer())
        .get('/api/images')
        .query({ rating: 3 })
        .expect(200);

      const foundWithRating3 = defaultRatingResponse.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundWithRating3).toBeDefined();
      expect(foundWithRating3.rating).toBe(3);

      // Update to rating 4
      await request(app.getHttpServer())
        .patch(`/api/images/${imageId}/rating`)
        .send({ rating: 4 })
        .expect(200);

      // Should now appear in rating 4+ filter
      const rating4Response = await request(app.getHttpServer())
        .get('/api/images')
        .query({ rating: 4 })
        .expect(200);

      const foundWithRating4 = rating4Response.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundWithRating4).toBeDefined();
      expect(foundWithRating4.rating).toBe(4);

      // Should NOT appear in rating 5 filter
      const rating5Response = await request(app.getHttpServer())
        .get('/api/images')
        .query({ rating: 5 })
        .expect(200);

      const foundWithRating5 = rating5Response.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundWithRating5).toBeUndefined();
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should handle concurrent rating updates gracefully', async () => {
      // Create test image
      const testBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 50, g: 100, b: 150 },
        },
      })
        .jpeg()
        .toBuffer();

      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'concurrent-test.jpg')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      // Simulate concurrent updates
      const updates = await Promise.all([
        request(app.getHttpServer())
          .patch(`/api/images/${imageId}/rating`)
          .send({ rating: 3 }),
        request(app.getHttpServer())
          .patch(`/api/images/${imageId}/rating`)
          .send({ rating: 4 }),
        request(app.getHttpServer())
          .patch(`/api/images/${imageId}/rating`)
          .send({ rating: 5 }),
      ]);

      // All should succeed
      updates.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Final value should be one of the updates
      const finalResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}/metadata`)
        .expect(200);

      expect([3, 4, 5]).toContain(finalResponse.body.rating);
    });

    it('should handle multiple rapid sequential rating updates', async () => {
      // Create test image
      const testBuffer = await sharp({
        create: {
          width: 640,
          height: 480,
          channels: 3,
          background: { r: 120, g: 80, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'sequential-test.jpg')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      // Rapid sequential updates
      for (let rating = 1; rating <= 5; rating++) {
        const response = await request(app.getHttpServer())
          .patch(`/api/images/${imageId}/rating`)
          .send({ rating })
          .expect(200);

        expect(response.body.rating).toBe(rating);
      }

      // Final value should be 5
      const finalResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}/metadata`)
        .expect(200);

      expect(finalResponse.body.rating).toBe(5);
    });

    it('should maintain data consistency after multiple operations', async () => {
      // Create test image
      const testBuffer = await sharp({
        create: {
          width: 1024,
          height: 768,
          channels: 3,
          background: { r: 100, g: 200, b: 100 },
        },
      })
        .jpeg({ quality: 95 })
        .toBuffer();

      // Upload
      const uploadResponse = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'consistency-test.jpg')
        .field('genre', 'Nature')
        .expect(201);

      const imageId = uploadResponse.body.id;
      testImageIds.push(imageId);

      // Update rating
      await request(app.getHttpServer())
        .patch(`/api/images/${imageId}/rating`)
        .send({ rating: 4 })
        .expect(200);

      // Get metadata
      const metadataResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}/metadata`)
        .expect(200);

      // Get list
      const listResponse = await request(app.getHttpServer())
        .get('/api/images')
        .query({ genre: 'Nature' })
        .expect(200);

      // Get processed image
      const imageResponse = await request(app.getHttpServer())
        .get(`/api/images/${imageId}`)
        .query({ width: 400 })
        .expect(200);

      // All should reference the same data
      expect(metadataResponse.body.id).toBe(imageId);
      expect(metadataResponse.body.rating).toBe(4);

      const foundInList = listResponse.body.data.find(
        (img: any) => img.id === imageId,
      );
      expect(foundInList).toBeDefined();
      expect(foundInList.rating).toBe(4);

      expect(Buffer.isBuffer(imageResponse.body)).toBe(true);
      expect(imageResponse.body.length).toBeGreaterThan(0);
    });
  });
});
