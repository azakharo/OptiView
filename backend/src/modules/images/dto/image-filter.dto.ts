import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Genre } from '../../../entities/genre.enum';

/**
 * Enum for sorting fields in image queries.
 */
export enum SortField {
  CREATED_AT = 'createdAt',
  RATING = 'rating',
  FILENAME = 'filename',
}

/**
 * Enum for sort order direction.
 */
export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * DTO for filtering and paginating image queries.
 * Supports filtering by genre and rating, with sorting and pagination options.
 */
export class ImageFilterDto {
  @ApiPropertyOptional({
    enum: Genre,
    description: 'Filter images by genre/category',
    example: Genre.NATURE,
  })
  @IsOptional()
  @IsEnum(Genre, { message: 'Genre must be a valid category' })
  genre?: Genre;

  @ApiPropertyOptional({
    type: Number,
    description: 'Filter images by minimum rating (1-5 scale)',
    example: 4,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt({ message: 'Rating must be an integer' })
  @Min(1, { message: 'Rating must be at least 1' })
  @Max(5, { message: 'Rating must be at most 5' })
  @Type(() => Number)
  rating?: number;

  @ApiPropertyOptional({
    enum: SortField,
    description: 'Field to sort images by',
    default: SortField.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(SortField, { message: 'Sort field must be a valid field' })
  sort?: SortField = SortField.CREATED_AT;

  @ApiPropertyOptional({
    enum: SortOrder,
    description: 'Sort order direction',
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder, { message: 'Sort order must be ASC or DESC' })
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (minimum 1)',
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page (1-100)',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt({ message: 'Page size must be an integer' })
  @Min(1, { message: 'Page size must be at least 1' })
  @Max(100, { message: 'Page size must be at most 100' })
  @Type(() => Number)
  pageSize?: number = 10;
}
