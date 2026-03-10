import * as fs from 'fs/promises';
import * as path from 'path';

// Base uploads directory - relative to backend root
const UPLOADS_BASE = path.join(__dirname, '../../uploads');

export const DIRECTORIES = {
  ORIGINALS: path.join(UPLOADS_BASE, 'originals'),
  PROCESSED: path.join(UPLOADS_BASE, 'processed'),
  LQIP: path.join(UPLOADS_BASE, 'lqip'),
} as const;

/**
 * Ensure all required upload directories exist
 */
export async function ensureUploadDirectories(): Promise<void> {
  for (const dir of Object.values(DIRECTORIES)) {
    await fs.mkdir(dir, { recursive: true });
  }
}

/**
 * Get the path for an original image
 */
export function getOriginalPath(uuid: string, extension: string): string {
  return path.join(DIRECTORIES.ORIGINALS, `${uuid}.${extension}`);
}

/**
 * Get the directory for processed images of a specific UUID
 */
export function getProcessedDir(uuid: string): string {
  return path.join(DIRECTORIES.PROCESSED, uuid);
}

/**
 * Get the path for a processed image variant
 */
export function getProcessedPath(
  uuid: string,
  width: number,
  format: string,
): string {
  return path.join(getProcessedDir(uuid), `${width}.${format}`);
}

/**
 * Get the path for an LQIP image
 */
export function getLqipPath(uuid: string): string {
  return path.join(DIRECTORIES.LQIP, `${uuid}.jpg`);
}

/**
 * Check if a file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Ensure a directory exists, create if missing
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}
