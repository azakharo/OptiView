/**
 * Custom image upload function with progress tracking.
 * Uses axios for upload progress tracking with cleaner API than raw XMLHttpRequest.
 */
import axios from 'axios';
import {API_BASE_URL} from './client';
import type {Image, Genre} from './types';

/**
 * Upload endpoint path.
 */
const UPLOAD_ENDPOINT = '/api/images/upload';

/**
 * Uploads a new image with genre selection.
 * Supports progress tracking via callback using axios onUploadProgress.
 *
 * @param file - The image file to upload
 * @param genre - The genre category for the image
 * @param onProgress - Optional callback for upload progress (0-100)
 * @returns Promise resolving to the created Image entity
 */
export async function uploadImage(
  file: File,
  genre: Genre,
  onProgress?: (progress: number) => void,
): Promise<Image> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('genre', genre);

  const {data} = await axios.post<Image>(
    `${API_BASE_URL}${UPLOAD_ENDPOINT}`,
    formData,
    {
      headers: {'Content-Type': 'multipart/form-data'},
      onUploadProgress: progressEvent => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round(
            (progressEvent.loaded / progressEvent.total) * 100,
          );
          onProgress(progress);
        }
      },
    },
  );

  return data;
}
