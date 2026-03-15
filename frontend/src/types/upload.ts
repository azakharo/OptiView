/**
 * Type definitions for the upload feature
 */

import type {Genre, Image} from '@/api/types';

/**
 * Upload status for tracking file upload progress
 */
export type UploadStatus =
  | 'waiting' // In queue, waiting to start
  | 'uploading' // Currently uploading with progress
  | 'processing' // Upload complete, server processing
  | 'done' // Successfully completed
  | 'error'; // Failed with error

/**
 * State for a single upload item in the queue
 */
export interface UploadItemState {
  /** Unique identifier for queue management */
  id: string;
  /** The file being uploaded */
  file: File;
  /** Selected genre category */
  genre: Genre;
  /** Custom genre name if genre is custom */
  customGenre?: string;
  /** Current upload status */
  status: UploadStatus;
  /** Upload progress percentage (0-100) */
  progress: number;
  /** Error message if status is 'error' */
  error?: string;
  /** Server response on successful upload */
  result?: Image;
}

/**
 * Props for DropZone component
 */
export interface DropZoneProps {
  /** Callback when valid files are selected */
  onFilesSelected: (files: File[]) => void;
  /** Disable dropzone during uploads */
  disabled?: boolean;
}

/**
 * Props for UploadItem component
 */
export interface UploadItemProps {
  /** Upload item state */
  item: UploadItemState;
  /** Genre change callback */
  onGenreChange: (id: string, genre: Genre) => void;
  /** Custom genre input callback */
  onCustomGenreChange: (id: string, customGenre: string) => void;
  /** Retry upload callback */
  onRetry: (id: string) => void;
  /** Remove from queue callback */
  onRemove: (id: string) => void;
}

/**
 * Props for UploadQueue component
 */
export interface UploadQueueProps {
  /** List of upload items */
  items: UploadItemState[];
  /** Genre change callback */
  onGenreChange: (id: string, genre: Genre) => void;
  /** Custom genre input callback */
  onCustomGenreChange: (id: string, customGenre: string) => void;
  /** Retry callback */
  onRetry: (id: string) => void;
  /** Remove callback */
  onRemove: (id: string) => void;
}
