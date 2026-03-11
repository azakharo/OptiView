import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '../../../entities/genre.enum';

/**
 * DTO for validating image upload data.
 * Only genre is settable during upload - other fields like filename,
 * dimensions are extracted from the uploaded file.
 */
export class UploadImageDto {
  @ApiPropertyOptional({
    enum: Genre,
    description: 'The genre/category of the image',
    example: Genre.NATURE,
    default: Genre.UNCATEGORIZED,
  })
  @IsOptional()
  @IsEnum(Genre, { message: 'Genre must be a valid category' })
  genre?: Genre;
}

/**
 * DTO for Swagger UI to display file upload field.
 * This is used only for API documentation purposes.
 */
export class UploadImageBodyDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file to upload (JPEG, PNG, or WebP)',
    required: true,
  })
  file: any;

  @ApiPropertyOptional({
    enum: Genre,
    description: 'The genre/category of the image',
    example: Genre.NATURE,
    default: Genre.UNCATEGORIZED,
  })
  @IsOptional()
  @IsEnum(Genre, { message: 'Genre must be a valid category' })
  genre?: Genre;
}
