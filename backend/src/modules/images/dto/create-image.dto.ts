import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '../../../entities/genre.enum';

/**
 * DTO for creating a new image.
 * Only genre is settable during upload - other fields like filename,
 * dimensions are extracted from the uploaded file.
 */
export class CreateImageDto {
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
