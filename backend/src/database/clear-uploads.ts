import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Clear upload folders - removes all files from uploads directories
 * Usage: npm run clear:uploads
 */

const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
const FOLDERS_TO_CLEAR = ['originals', 'lqip', 'processed'];

async function clearFolder(folderPath: string): Promise<number> {
  let deletedCount = 0;

  try {
    const entries = await fs.readdir(folderPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(folderPath, entry.name);

      // Skip .gitkeep files
      if (entry.name === '.gitkeep') {
        console.log(`  ✓ Skipped: ${entry.name}`);
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively delete subdirectories
        await fs.rm(fullPath, { recursive: true, force: true });
        deletedCount++;
        console.log(`  ✓ Deleted directory: ${entry.name}`);
      } else if (entry.isFile()) {
        await fs.unlink(fullPath);
        deletedCount++;
        console.log(`  ✓ Deleted file: ${entry.name}`);
      }
    }
  } catch {
    // Folder might be empty or not exist
    console.log(`  ℹ️ No files in ${path.basename(folderPath)}`);
  }

  return deletedCount;
}

async function clearUploads() {
  console.log('🧹 Clearing upload folders...\n');

  let totalDeleted = 0;

  for (const folder of FOLDERS_TO_CLEAR) {
    const folderPath = path.join(UPLOADS_DIR, folder);
    console.log(`📁 Processing ${folder}/...`);

    const count = await clearFolder(folderPath);
    totalDeleted += count;
    console.log(`  ✓ Cleared ${count} items from ${folder}/\n`);
  }

  console.log(`✅ Total items deleted: ${totalDeleted}`);
}

// Run the script
void clearUploads();
