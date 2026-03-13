import { ApiProperty } from '@nestjs/swagger';
import { ImageResponseDto } from './image-response.dto';

/**
 * DTO containing pagination metadata.
 * Provides information about the current page, total items, and available pages.
 */
export class PaginationMetaDto {
  @ApiProperty({
    type: Number,
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    type: Number,
    description: 'Number of items per page',
    example: 10,
  })
  pageSize: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of items across all pages',
    example: 50,
  })
  totalItems: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of pages',
    example: 5,
  })
  totalPages: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether there is a next page available',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    type: Boolean,
    description: 'Whether there is a previous page available',
    example: false,
  })
  hasPrevPage: boolean;
}

/**
 * Generic DTO for paginated responses.
 * Wraps an array of data with pagination metadata.
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Array of data items for the current page',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata for the response',
  })
  pagination: PaginationMetaDto;

  /**
   * Creates a paginated response instance.
   * @param data - Array of data items for the current page
   * @param page - Current page number
   * @param pageSize - Number of items per page
   * @param totalItems - Total number of items across all pages
   * @returns A new PaginatedResponseDto instance
   */
  static create<T>(
    data: T[],
    page: number,
    pageSize: number,
    totalItems: number,
  ): PaginatedResponseDto<T> {
    const totalPages = Math.ceil(totalItems / pageSize);
    const response = new PaginatedResponseDto<T>();
    response.data = data;
    response.pagination = {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return response;
  }
}

/**
 * Concrete paginated response DTO for images.
 * Extends PaginatedResponseDto with ImageResponseDto as the data type.
 * This concrete type is required for proper OpenAPI schema generation,
 * as NestJS Swagger cannot properly serialize generic types.
 */
export class PaginatedImageResponseDto {
  @ApiProperty({
    type: ImageResponseDto,
    description: 'Array of data items for the current page',
    isArray: true,
  })
  data: ImageResponseDto[];

  @ApiProperty({
    type: PaginationMetaDto,
    description: 'Pagination metadata for the response',
  })
  pagination: PaginationMetaDto;

  /**
   * Creates a paginated image response instance.
   */
  static create(
    data: ImageResponseDto[],
    page: number,
    pageSize: number,
    totalItems: number,
  ): PaginatedImageResponseDto {
    const totalPages = Math.ceil(totalItems / pageSize);
    const response = new PaginatedImageResponseDto();
    response.data = data;
    response.pagination = {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
    return response;
  }
}
