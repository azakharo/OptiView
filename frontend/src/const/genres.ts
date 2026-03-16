import type {Genre} from '../api/types';

/**
 * Predefined genre options for the application.
 * Used across multiple components (Header, UploadItem, etc.)
 */
export const GENRE_OPTIONS: Genre[] = [
  'Nature',
  'Architecture',
  'Portrait',
  'Uncategorized',
];

/**
 * Color mapping for genre tags.
 * Maps each genre to a specific color variant for visual representation.
 */
export const GENRE_COLORS: Record<Genre, string> = {
  Nature: 'success',
  Architecture: 'info',
  Portrait: 'pink',
  Uncategorized: 'gray',
};
