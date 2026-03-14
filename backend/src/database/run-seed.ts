import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from '../data-source';
import { Genre } from '../entities/genre.enum';

const API_URL = process.env.API_URL || 'http://localhost:3000';
const TOTAL_IMAGES = 20;
const TEMP_DIR = path.join(__dirname, '..', '..', 'temp-seed-images');

// Genre distribution for variety
const genres = [
  Genre.NATURE,
  Genre.ARCHITECTURE,
  Genre.PORTRAIT,
  Genre.UNCATEGORIZED,
];

/**
 * Downloads an image from a URL to a local file
 */
function downloadImage(url: string, filepath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const file = fs.createWriteStream(filepath);

    protocol
      .get(url, (response) => {
        // Handle redirects
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400 &&
          response.headers.location
        ) {
          downloadImage(response.headers.location, filepath)
            .then(resolve)
            .catch(reject);
          return;
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
          return;
        }

        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      })
      .on('error', (err) => {
        fs.unlink(filepath, () => {}); // Delete partial file
        reject(err);
      });
  });
}

/**
 * Uploads an image file to the backend API
 */
async function uploadImage(filepath: string, genre: Genre): Promise<unknown> {
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  const filename = path.basename(filepath);

  // Read file and create multipart form data manually
  const fileContent = fs.readFileSync(filepath);

  // Build multipart body
  const genrePart = `--${boundary}\r\nContent-Disposition: form-data; name="genre"\r\n\r\n${genre}\r\n`;
  const filePart = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${filename}"\r\nContent-Type: image/jpeg\r\n\r\n`;
  const endBoundary = `\r\n--${boundary}--\r\n`;

  const body = Buffer.concat([
    Buffer.from(genrePart),
    Buffer.from(filePart),
    fileContent,
    Buffer.from(endBoundary),
  ]);

  const url = new URL(`${API_URL}/api/images/upload`);

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
    },
    body,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Upload failed: ${response.status} ${response.statusText} - ${errorText}`,
    );
  }

  return response.json();
}

/**
 * Ensures the temp directory exists
 */
function ensureTempDir(): void {
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }
}

/**
 * Cleans up temp directory
 */
function cleanupTempDir(): void {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Seed script to populate database with initial test images
 */
async function runSeed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();

  try {
    console.log('🌱 Starting seed...');

    // Ensure temp directory exists
    ensureTempDir();

    console.log(
      `📥 Downloading ${TOTAL_IMAGES} test images from picsum.photos...`,
    );

    // Download test images
    const downloadedFiles: string[] = [];
    for (let i = 1; i <= TOTAL_IMAGES; i++) {
      const imageId = 10 + i; // Start from image 11 to get varied images
      const url = `https://picsum.photos/id/${imageId}/1920/1080`;
      const filepath = path.join(TEMP_DIR, `seed-image-${i}.jpg`);

      console.log(`  Downloading image ${i}/${TOTAL_IMAGES}...`);
      await downloadImage(url, filepath);
      downloadedFiles.push(filepath);
    }

    console.log(`✅ Downloaded ${downloadedFiles.length} images`);
    console.log(`📤 Uploading images to API...`);

    // Upload images with varied genres
    let successCount = 0;
    for (let i = 0; i < downloadedFiles.length; i++) {
      const filepath = downloadedFiles[i];
      // Distribute genres evenly
      const genre = genres[i % genres.length];

      console.log(
        `  Uploading image ${i + 1}/${TOTAL_IMAGES} with genre: ${genre}...`,
      );

      try {
        const result = await uploadImage(filepath, genre);
        console.log(
          `    ✓ Uploaded: ${(result as { filename: string }).filename}`,
        );
        successCount++;
      } catch (error) {
        console.error(
          `    ✗ Failed to upload:`,
          error instanceof Error ? error.message : error,
        );
      }
    }

    console.log(
      `\n🎉 Seed completed! Successfully uploaded ${successCount}/${TOTAL_IMAGES} images.`,
    );
  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  } finally {
    // Cleanup temp files
    console.log('🧹 Cleaning up temporary files...');
    cleanupTempDir();

    await dataSource.destroy();
  }
}

// Run the seed
runSeed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  });
