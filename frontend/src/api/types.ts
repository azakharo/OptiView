/**
 * Re-exported types from generated schema for convenience.
 * These provide cleaner imports throughout the application.
 */
import type {components, operations} from './schema.gen';

// Entity types - make lqipBase64 optional as not all images may have it
export type Image = Omit<
  components['schemas']['ImageResponseDto'],
  'lqipBase64'
> & {
  lqipBase64?: string;
};

// Genre enum - re-exported from schema
export type Genre = components['schemas']['ImageResponseDto']['genre'];

// DTO types
export type UpdateRatingDto = components['schemas']['UpdateRatingDto'];
export type RatingUpdateResponseDto =
  components['schemas']['RatingUpdateResponseDto'];
export type LqipResponseDto = components['schemas']['LqipResponseDto'];
export type UploadImageBodyDto = components['schemas']['UploadImageBodyDto'];

// Response types
export type PaginatedResponseDto =
  components['schemas']['PaginatedImageResponseDto'];
export type PaginationMetaDto = components['schemas']['PaginationMetaDto'];

// Image filter type - derived from listImages operation parameters
export interface ImageFilterDto {
  genre?: Genre;
  rating?: number;
  sort?: SortField;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

// Create image type - for upload
export interface CreateImageDto {
  file: File;
  genre: Genre;
}

export type SortField = NonNullable<
  operations['ImagesController_listImages']['parameters']['query']
>['sort'];
export type SortOrder = NonNullable<
  operations['ImagesController_listImages']['parameters']['query']
>['sortOrder'];

/**
 * API error response structure.
 * Note: Not defined in OpenAPI spec, defined locally for error handling.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error: string;
}
