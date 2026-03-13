import { ApiProperty } from '@nestjs/swagger';
import { Genre } from '../../../entities/genre.enum';

/**
 * DTO for image response containing all image entity fields.
 * Used when returning image data in API responses.
 */
export class ImageResponseDto {
  @ApiProperty({
    type: String,
    description: 'Unique identifier for the image (UUID v4)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  id: string;

  @ApiProperty({
    type: String,
    description: 'Original filename of the image',
    example: 'landscape-photo.jpg',
  })
  filename: string;

  @ApiProperty({
    enum: Genre,
    description: 'Genre/category classification of the image',
    example: Genre.NATURE,
  })
  genre: Genre;

  @ApiProperty({
    type: Number,
    description: 'User rating for the image (1-5 scale)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  rating: number;

  @ApiProperty({
    type: Number,
    description: 'Aspect ratio of the image (width / height)',
    example: 1.5,
  })
  aspectRatio: number;

  @ApiProperty({
    type: String,
    description: 'Dominant color of the image in hexadecimal format',
    example: '#FF5733',
  })
  dominantColor: string;

  @ApiProperty({
    type: String,
    description: 'Low-quality image placeholder as base64-encoded string',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
    required: false,
    nullable: true,
  })
  lqipBase64: string | null;

  @ApiProperty({
    type: Number,
    description: 'Width of the image in pixels',
    example: 1920,
  })
  width: number;

  @ApiProperty({
    type: Number,
    description: 'Height of the image in pixels',
    example: 1080,
  })
  height: number;

  @ApiProperty({
    type: Date,
    description: 'Timestamp when the image was created',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date;
}
