/**
 * Re-exported types from generated schema for convenience.
 * These provide cleaner imports throughout the application.
 */
import type {components} from './schema.gen';

// Entity types
export type Image = components['schemas']['ImageResponseDto'];

// Genre enum - defined inline in schema
export type Genre = 'Nature' | 'Architecture' | 'Portrait' | 'Uncategorized';

// DTO types
export type UpdateRatingDto = components['schemas']['UpdateRatingDto'];
export type RatingUpdateResponseDto =
  components['schemas']['RatingUpdateResponseDto'];
export type LqipResponseDto = components['schemas']['LqipResponseDto'];
export type UploadImageBodyDto = components['schemas']['UploadImageBodyDto'];

// Response types
export type PaginatedResponseDto =
  components['schemas']['PaginatedResponseDto'];
export type PaginationMetaDto = components['schemas']['PaginationMetaDto'];

// Image filter type - derived from listImages operation parameters
export interface ImageFilterDto {
  genre?: Genre;
  rating?: number;
  sort?: 'createdAt' | 'rating' | 'filename';
  sortOrder?: 'ASC' | 'DESC';
  page?: number;
  pageSize?: number;
}

// Create image type - for upload
export interface CreateImageDto {
  file: File;
  genre: Genre;
}

// Pagination metadata extracted from paginated response
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Sort field type
export type SortField = 'createdAt' | 'rating' | 'filename';
export type SortOrder = 'ASC' | 'DESC';

/**
 * API error response structure.
 * Note: Not defined in OpenAPI spec, defined locally for error handling.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
