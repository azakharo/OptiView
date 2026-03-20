/**
 * API client configuration for backend communication.
 * Uses openapi-fetch for type-safe HTTP requests.
 */
import createFetchClient, {type Middleware} from 'openapi-fetch';
import type {paths} from './schema.gen';
import type {ApiErrorResponse} from './types';

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_BASE_URL as string) || '';

/**
 * Middleware to handle HTTP errors globally.
 * Throws ApiError for non-2xx responses instead of returning error object.
 */
const errorMiddleware: Middleware = {
  async onResponse({response}) {
    if (!response.ok) {
      const clonedResponse = response.clone();
      let errorDetails: ApiErrorResponse | undefined;

      try {
        errorDetails = (await clonedResponse.json()) as ApiErrorResponse;
      } catch {
        // Response body is not JSON
      }

      throw new ApiError(
        response.status,
        errorDetails?.message ?? response.statusText,
        errorDetails,
      );
    }
  },
};

/**
 * Type-safe openapi-fetch client.
 * Provides autocomplete for all API endpoints and full type inference.
 */
export const client = createFetchClient<paths>({
  baseUrl: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register error-handling middleware
client.use(errorMiddleware);

/**
 * Custom error class for API errors.
 * Includes the HTTP status code and any error details from the server.
 */
export class ApiError extends Error {
  public statusCode: number;
  public details?: ApiErrorResponse;

  constructor(statusCode: number, message: string, details?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Type guard to check if an error response is an ApiErrorResponse.
 */
function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error
  );
}

/**
 * Helper to throw ApiError from openapi-fetch error response.
 */
export function throwApiError(error: unknown): never {
  if (isApiErrorResponse(error)) {
    throw new ApiError(error.statusCode, error.message, error);
  }
  throw new ApiError(500, 'An unexpected error occurred');
}

/**
 * Helper to get image URL for src attribute.
 * The browser's Accept header determines the format (AVIF/WebP/JPEG).
 */
export function getImageUrl(id: string, width: number): string {
  return `${API_BASE_URL}/api/images/${id}?width=${width}`;
}

/**
 * Helper to get LQIP placeholder URL.
 */
export function getLqipUrl(id: string): string {
  return `${API_BASE_URL}/api/images/${id}/lqip`;
}
