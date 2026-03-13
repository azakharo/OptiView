import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { Genre } from './genre.enum';

/**
 * Image entity representing photos in the OptiView image delivery system.
 * Stores metadata about images including classification, ratings, and technical details.
 */
@Entity('images')
export class Image {
  /**
   * Unique identifier for the image (UUID v4).
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Original filename of the uploaded image.
   */
  @Column({ length: 255 })
  filename: string;

  /**
   * Full path to the original image file in storage.
   */
  @Column({ length: 500 })
  originalPath: string;

  /**
   * Genre/category classification of the image.
   * Defaults to Uncategorized for new uploads.
   */
  @Column({
    type: 'enum',
    enum: Genre,
    default: Genre.UNCATEGORIZED,
  })
  genre: Genre;

  /**
   * User rating of the image (1-5 scale).
   * Defaults to 3 (neutral rating).
   */
  @Column({
    type: 'int',
    default: 3,
  })
  rating: number;

  /**
   * Aspect ratio of the image (width / height).
   */
  @Column({ type: 'float' })
  aspectRatio: number;

  /**
   * Dominant color of the image in hexadecimal format (e.g., '#FF5733').
   */
  @Column({ length: 7 })
  dominantColor: string;

  /**
   * Low-quality image placeholder (LQIP) as base64-encoded string.
   * Used for blur-up loading effect.
   * Can be null if LQIP generation failed or hasn't been processed yet.
   */
  @Column({ type: 'text', nullable: true })
  lqipBase64: string | null;

  /**
   * Width of the image in pixels.
   */
  @Column({ type: 'int' })
  width: number;

  /**
   * Height of the image in pixels.
   */
  @Column({ type: 'int' })
  height: number;

  /**
   * Timestamp when the image record was created.
   * Automatically set to current timestamp on creation.
   */
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
