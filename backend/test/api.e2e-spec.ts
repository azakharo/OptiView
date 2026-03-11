import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';
import sharp from 'sharp';
import { AppModule } from '../src/app.module';
import { Image } from '../src/entities/image.entity';
import { Genre } from '../src/entities/genre.enum';
import { ImageModule } from '../src/modules/images/image.module';
import { ensureUploadDirectories } from '../src/utils/storage.util';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

describe('Images API (e2e)', () => {
  let app: INestApplication;
  let imageRepository: any;
  let uploadedImageId: string;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    await ensureUploadDirectories();

    testImageBuffer = await sharp({
      create: {
        width: 1920,
        height: 1080,
        channels: 3,
        background: { r: 100, g: 150, b: 200 },
      },
    })
      .jpeg({ quality: 90 })
      .toBuffer();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ImageModule],
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

    imageRepository = moduleFixture.get<any>(getRepositoryToken(Image));
    await app.init();
  });

  afterAll(async () => {
    if (uploadedImageId) {
      try {
        await imageRepository.delete(uploadedImageId);
      } catch (err) {
        console.error('Failed to delete test image:', err);
      }
    }
    await app.close();
  });

  describe('POST /api/images/upload', () => {
    it('should upload an image successfully (201)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testImageBuffer, 'test-image.jpg')
        .field('genre', 'Nature')
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('filename');
      expect(response.body.genre).toBe(Genre.NATURE);
      expect(response.body.rating).toBe(3);
      expect(response.body).toHaveProperty('width');
      expect(response.body).toHaveProperty('height');
      expect(response.body).toHaveProperty('aspectRatio');
      expect(response.body).toHaveProperty('dominantColor');
      expect(response.body).toHaveProperty('lqipBase64');
      expect(response.body).toHaveProperty('createdAt');

      uploadedImageId = response.body.id;
    });

    it('should reject unsupported file types (400)', async () => {
      const textBuffer = Buffer.from('not an image');
      const response = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', textBuffer, 'test.txt')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing file (400)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/images/upload')
        .field('genre', 'Nature')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should accept upload without genre (defaults to Uncategorized)', async () => {
      const testBuffer = await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 50, g: 100, b: 150 },
        },
      })
        .jpeg({ quality: 80 })
        .toBuffer();

      const response = await request(app.getHttpServer())
        .post('/api/images/upload')
        .attach('file', testBuffer, 'test-no-genre.jpg')
        .expect(201);

      expect(response.body.genre).toBe(Genre.UNCATEGORIZED);

      await imageRepository.delete(response.body.id);
    });
  });

  describe('GET /api/images', () => {
    it('should return paginated list of images (200)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images')
        .expect(200);

      expect(response.body).toHaveProperty('items');
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('page');
      expect(response.body).toHaveProperty('pageSize');
      expect(response.body).toHaveProperty('totalPages');
      expect(Array.isArray(response.body.items)).toBe(true);
    });

    it('should filter by genre', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?genre=Nature')
        .expect(200);

      expect(
        response.body.items.every((img: any) => img.genre === 'Nature'),
      ).toBe(true);
    });

    it('should filter by minimum rating', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?rating=4')
        .expect(200);

      expect(response.body.items.every((img: any) => img.rating >= 4)).toBe(
        true,
      );
    });

    it('should sort by rating ascending', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?sort=rating&sortOrder=ASC')
        .expect(200);

      const items = response.body.items;
      for (let i = 1; i < items.length; i++) {
        expect(items[i].rating).toBeGreaterThanOrEqual(items[i - 1].rating);
      }
    });

    it('should paginate correctly', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?page=1&pageSize=2')
        .expect(200);

      expect(response.body.items.length).toBeLessThanOrEqual(2);
      expect(response.body.page).toBe(1);
      expect(response.body.pageSize).toBe(2);
    });

    it('should reject invalid page number (400)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?page=0')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid genre (400)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images?genre=InvalidGenre')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/images/:id/metadata', () => {
    it('should return image metadata (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}/metadata`)
        .expect(200);

      expect(response.body.id).toBe(uploadedImageId);
      expect(response.body).toHaveProperty('filename');
      expect(response.body).toHaveProperty('genre');
      expect(response.body).toHaveProperty('rating');
      expect(response.body).toHaveProperty('width');
      expect(response.body).toHaveProperty('height');
      expect(response.body).toHaveProperty('aspectRatio');
      expect(response.body).toHaveProperty('dominantColor');
      expect(response.body).toHaveProperty('lqipBase64');
    });

    it('should return 404 for non-existent image', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/images/${fakeId}/metadata`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject invalid UUID format (400)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/images/not-a-uuid/metadata')
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/images/:id (processed image)', () => {
    it('should return processed image with default width', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(
        /^image\/(jpeg|webp|avif)/,
      );
      expect(response.headers['cache-control']).toBe(
        'public, max-age=31536000',
      );
      expect(Buffer.isBuffer(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return processed image with specified width', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}?width=640`)
        .expect(200);

      expect(response.headers['content-type']).toMatch(
        /^image\/(jpeg|webp|avif)/,
      );
      expect(Buffer.isBuffer(response.body)).toBe(true);
    });

    it('should negotiate AVIF format from Accept header', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}?width=800`)
        .set('Accept', 'image/avif,image/webp,image/jpeg')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/avif');
    });

    it('should fallback to JPEG when no modern formats accepted', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}?width=800`)
        .set('Accept', 'image/jpeg')
        .expect(200);

      expect(response.headers['content-type']).toBe('image/jpeg');
    });

    it('should return 404 for non-existent image', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/images/${fakeId}`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/images/:id/lqip', () => {
    it('should return LQIP base64 data (200)', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/images/${uploadedImageId}/lqip`)
        .expect(200);

      expect(response.body).toHaveProperty('lqipBase64');
      expect(response.body.lqipBase64).toMatch(/^data:image\/jpeg;base64,/);
    });

    it('should return 404 for non-existent image', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .get(`/api/images/${fakeId}/lqip`)
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PATCH /api/images/:id/rating', () => {
    it('should update rating successfully (200)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${uploadedImageId}/rating`)
        .send({ rating: 5 })
        .expect(200);

      expect(response.body.id).toBe(uploadedImageId);
      expect(response.body.rating).toBe(5);
    });

    it('should reject rating below 1 (400)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${uploadedImageId}/rating`)
        .send({ rating: 0 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject rating above 5 (400)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${uploadedImageId}/rating`)
        .send({ rating: 6 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject non-integer rating (400)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${uploadedImageId}/rating`)
        .send({ rating: 4.5 })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should reject missing rating (400)', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${uploadedImageId}/rating`)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 for non-existent image', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app.getHttpServer())
        .patch(`/api/images/${fakeId}/rating`)
        .send({ rating: 4 })
        .expect(404);

      expect(response.body).toHaveProperty('message');
    });
  });
});
