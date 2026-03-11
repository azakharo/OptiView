import { ApiProperty } from '@nestjs/swagger';

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
