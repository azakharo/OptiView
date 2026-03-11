import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import sharp, { Sharp } from 'sharp';
import * as fs from 'fs/promises';
import { randomUUID } from 'crypto';
import {
  getOriginalPath,
  getProcessedPath,
  getProcessedDir,
  getLqipPath,
  fileExists,
  ensureDir,
  DIRECTORIES,
} from '../../utils/storage.util';
import { roundToBreakpoint } from '../../utils/breakpoint.util';
import { Image } from '../../entities/image.entity';
import { Genre } from '../../entities/genre.enum';
import { ImageFilterDto, SortField, SortOrder } from './dto/image-filter.dto';
import { BadRequestException } from '@nestjs/common';

/**
 * Interface representing a Multer uploaded file
 */
interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ImageMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  format: string;
}

export type ImageFormat = 'avif' | 'webp' | 'jpeg';

export interface ProcessedImage {
  buffer: Buffer;
  format: ImageFormat;
  width: number;
  contentType: string;
}

const CONTENT_TYPES: Record<ImageFormat, string> = {
  avif: 'image/avif',
  webp: 'image/webp',
  jpeg: 'image/jpeg',
};

@Injectable()
export class ImageService {
  private readonly logger = new Logger(ImageService.name);

  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
  ) {}

  /**
   * Extract metadata from an image buffer or file path
   */
  async extractMetadata(input: Buffer | string): Promise<ImageMetadata> {
    const image = sharp(input);
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new Error('Unable to extract image dimensions');
    }

    return {
      width: metadata.width,
      height: metadata.height,
      aspectRatio: parseFloat((metadata.width / metadata.height).toFixed(4)),
      format: metadata.format || 'unknown',
    };
  }

  /**
   * Validate that the image format is supported
   */
  isFormatSupported(format: string): boolean {
    const supportedFormats = ['jpeg', 'jpg', 'png', 'webp'];
    return supportedFormats.includes(format.toLowerCase());
  }

  /**
   * Validate image meets requirements
   */
  async validateImage(
    input: Buffer | string,
  ): Promise<{ valid: boolean; error?: string }> {
    try {
      const metadata = await this.extractMetadata(input);

      if (!this.isFormatSupported(metadata.format)) {
        return {
          valid: false,
          error: `Unsupported format: ${metadata.format}. Supported: JPEG, PNG, WebP`,
        };
      }

      // Check reasonable dimensions
      if (metadata.width > 10000 || metadata.height > 10000) {
        return {
          valid: false,
          error: 'Image dimensions too large. Maximum: 10000x10000 pixels',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: `Invalid image file: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Extract dominant color from an image using Sharp's statistics
   * @param input - Buffer or file path
   * @returns Hex color string e.g. #FF5733
   */
  async extractDominantColor(input: Buffer | string): Promise<string> {
    const image = sharp(input);
    const stats = await image.stats();

    let r = 0,
      g = 0,
      b = 0;

    // Find channels by index (0=red, 1=green, 2=blue)
    stats.channels.forEach((channel, index) => {
      switch (index) {
        case 0: // Red
          r = Math.round(channel.mean);
          break;
        case 1: // Green
          g = Math.round(channel.mean);
          break;
        case 2: // Blue
          b = Math.round(channel.mean);
          break;
      }
    });

    // Convert to hex with proper padding
    const toHex = (n: number): string => n.toString(16).padStart(2, '0');

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
  }

  /**
   * Generate Low Quality Image Placeholder (LQIP)
   * Per ADR-005: 20px width, JPEG format, 20% quality
   * @param input - Buffer or file path
   * @returns Base64-encoded data URI string
   */
  async generateLqip(input: Buffer | string): Promise<string> {
    const image = sharp(input);

    // Generate tiny JPEG preview
    const lqipBuffer = await image
      .clone()
      .resize(20, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: 20,
        mozjpeg: true,
      })
      .toBuffer();

    // Convert to base64 data URI
    const base64 = lqipBuffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  }

  /**
   * Generate LQIP and save to disk
   * @param input - Buffer or file path
   * @param uuid - Image UUID for filename
   * @returns Base64-encoded data URI string
   */
  async generateAndSaveLqip(
    input: Buffer | string,
    uuid: string,
  ): Promise<string> {
    const lqipBase64 = await this.generateLqip(input);

    // Extract the base64 data (without data URI prefix)
    const base64Data = lqipBase64.replace(/^data:image\/jpeg;base64,/, '');

    // Save to disk
    const lqipPath = getLqipPath(uuid);
    await fs.writeFile(lqipPath, base64Data, 'base64');

    return lqipBase64;
  }

  /**
   * Parse Accept header to determine best format
   * @param acceptHeader - HTTP Accept header value
   * @returns Best supported format
   */
  negotiateFormat(acceptHeader: string = ''): ImageFormat {
    const accept = acceptHeader.toLowerCase();

    if (accept.includes('image/avif')) {
      return 'avif';
    }
    if (accept.includes('image/webp')) {
      return 'webp';
    }

    // Default fallback
    return 'jpeg';
  }

  /**
   * Process an image to a specific width and format
   * @param input - Original image buffer or path
   * @param width - Target width (will be rounded to breakpoint)
   * @param format - Output format
   * @returns Processed image buffer with metadata
   */
  async processImage(
    input: Buffer | string,
    width: number,
    format: ImageFormat,
  ): Promise<ProcessedImage> {
    const breakpoint = roundToBreakpoint(width);
    const image = sharp(input);

    let processed: Sharp;

    // Common resize options
    processed = image.clone().resize(breakpoint, null, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Format-specific options
    switch (format) {
      case 'avif':
        processed = processed.avif({
          quality: 80,
          effort: 4,
        });
        break;
      case 'webp':
        processed = processed.webp({
          quality: 80,
          effort: 4,
        });
        break;
      case 'jpeg':
      default:
        processed = processed.jpeg({
          quality: 85,
          mozjpeg: true,
        });
        break;
    }

    const buffer = await processed.toBuffer();

    return {
      buffer,
      format,
      width: breakpoint,
      contentType: CONTENT_TYPES[format],
    };
  }

  /**
   * Get a processed image, using cache if available
   * @param uuid - Image UUID
   * @param width - Requested width
   * @param format - Requested format (or omit to use Accept header negotiation)
   * @param acceptHeader - HTTP Accept header for format negotiation
   * @returns Processed image with metadata
   */
  async getProcessedImage(
    uuid: string,
    width: number,
    format?: ImageFormat,
    acceptHeader?: string,
  ): Promise<ProcessedImage> {
    const targetFormat =
      format || (acceptHeader ? this.negotiateFormat(acceptHeader) : 'jpeg');
    const breakpoint = roundToBreakpoint(width);

    // Check cache
    const cachedPath = getProcessedPath(uuid, breakpoint, targetFormat);
    if (await fileExists(cachedPath)) {
      this.logger.debug(`Cache hit: ${cachedPath}`);
      const buffer = await fs.readFile(cachedPath);
      return {
        buffer,
        format: targetFormat,
        width: breakpoint,
        contentType: CONTENT_TYPES[targetFormat],
      };
    }

    // Cache miss - generate new
    this.logger.debug(`Cache miss: ${cachedPath}`);

    // Try to get image from database first
    let originalPath: string | null = null;
    const image = await this.imageRepository.findOne({ where: { id: uuid } });
    if (image && image.originalPath) {
      originalPath = image.originalPath;
    }

    // If no database record or path, try to find by UUID (for backwards compatibility)
    if (!originalPath) {
      originalPath = await this.findOriginalPath(uuid);
    }

    if (!originalPath) {
      throw new Error(`Original image not found: ${uuid}`);
    }

    // Process
    const processed = await this.processImage(
      originalPath,
      breakpoint,
      targetFormat,
    );

    // Save to cache
    await ensureDir(getProcessedDir(uuid));
    await fs.writeFile(cachedPath, processed.buffer);

    return processed;
  }

  /**
   * Find original image path by UUID
   */
  private async findOriginalPath(uuid: string): Promise<string | null> {
    const extensions = ['jpg', 'jpeg', 'png', 'webp'];

    for (const ext of extensions) {
      const path = getOriginalPath(uuid, ext);
      if (await fileExists(path)) {
        return path;
      }
    }

    return null;
  }

  /**
   * Find all images with filtering, sorting, and pagination
   * @param filters - ImageFilterDto with genre, rating, sort, pagination options
   * @returns Object with data array and total count
   */
  async findAll(
    filters: ImageFilterDto,
  ): Promise<{ data: Image[]; total: number }> {
    const queryBuilder = this.imageRepository.createQueryBuilder('image');

    // Apply filtering by genre
    if (filters.genre) {
      queryBuilder.andWhere('image.genre = :genre', { genre: filters.genre });
    }

    // Apply filtering by rating
    if (filters.rating !== undefined) {
      queryBuilder.andWhere('image.rating >= :rating', {
        rating: filters.rating,
      });
    }

    // Apply sorting
    const sortField = filters.sort || SortField.CREATED_AT;
    const sortOrder = filters.sortOrder || SortOrder.DESC;
    queryBuilder.orderBy(`image.${sortField}`, sortOrder);

    // Apply pagination
    const page = filters.page || 1;
    const pageSize = filters.pageSize || 10;
    const skip = (page - 1) * pageSize;
    queryBuilder.skip(skip).take(pageSize);

    // Get total count without pagination
    const total = await queryBuilder.getCount();

    // Get paginated data
    const data = await queryBuilder.getMany();

    return { data, total };
  }

  /**
   * Find image by ID
   * @param id - Image UUID
   * @returns Image or null if not found
   */
  async findById(id: string): Promise<Image | null> {
    return this.imageRepository.findOne({ where: { id } });
  }

  /**
   * Create a new image record
   * @param imageData - Partial image data
   * @returns Created image
   */
  async create(imageData: Partial<Image>): Promise<Image> {
    const image = this.imageRepository.create(imageData);
    return this.imageRepository.save(image);
  }

  /**
   * Update image rating
   * @param id - Image UUID
   * @param rating - New rating value (1-5)
   * @returns Updated image or null if not found
   */
  async updateRating(id: string, rating: number): Promise<Image | null> {
    const image = await this.findById(id);
    if (!image) {
      return null;
    }

    image.rating = rating;
    return this.imageRepository.save(image);
  }

  /**
   * Process complete image upload
   * @param file - Multer uploaded file
   * @param genre - Optional genre classification
   * @returns Created image record
   */
  async processUpload(file: UploadedFile, genre?: Genre): Promise<Image> {
    // Generate UUID
    const uuid = randomUUID();

    // Get file extension
    const originalName = file.originalname;
    const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';

    // Validate image
    const validation = await this.validateImage(file.buffer);
    if (!validation.valid) {
      throw new BadRequestException(validation.error);
    }

    // Extract metadata
    const metadata = await this.extractMetadata(file.buffer);

    // Extract dominant color
    const dominantColor = await this.extractDominantColor(file.buffer);

    // Generate LQIP
    const lqipBase64 = await this.generateAndSaveLqip(file.buffer, uuid);

    // Save original file
    const originalPath = getOriginalPath(uuid, extension);
    await ensureDir(DIRECTORIES.ORIGINALS);
    await fs.writeFile(originalPath, file.buffer);

    // Create database record
    const image = await this.create({
      filename: originalName,
      originalPath,
      genre: genre || Genre.UNCATEGORIZED,
      rating: 3,
      aspectRatio: metadata.aspectRatio,
      dominantColor,
      lqipBase64,
      width: metadata.width,
      height: metadata.height,
    });

    return image;
  }
}
