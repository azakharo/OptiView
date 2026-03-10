import * as fs from 'fs/promises';
import * as path from 'path';
import {
  DIRECTORIES,
  ensureUploadDirectories,
  getOriginalPath,
  getProcessedDir,
  getProcessedPath,
  getLqipPath,
  fileExists,
  ensureDir,
} from './storage.util';

describe('StorageUtil', () => {
  const testUuid = '550e8400-e29b-41d4-a716-446655440000';

  describe('DIRECTORIES', () => {
    it('should define all required directories', () => {
      expect(DIRECTORIES.ORIGINALS).toBeDefined();
      expect(DIRECTORIES.PROCESSED).toBeDefined();
      expect(DIRECTORIES.LQIP).toBeDefined();
    });

    it('should point to correct paths', () => {
      expect(DIRECTORIES.ORIGINALS).toContain('originals');
      expect(DIRECTORIES.PROCESSED).toContain('processed');
      expect(DIRECTORIES.LQIP).toContain('lqip');
    });
  });

  describe('getOriginalPath', () => {
    it('should return correct path for original image', () => {
      const result = getOriginalPath(testUuid, 'jpg');
      expect(result).toBe(path.join(DIRECTORIES.ORIGINALS, `${testUuid}.jpg`));
    });

    it('should handle different extensions', () => {
      expect(getOriginalPath(testUuid, 'png')).toContain('.png');
      expect(getOriginalPath(testUuid, 'webp')).toContain('.webp');
    });
  });

  describe('getProcessedDir', () => {
    it('should return correct processed directory path', () => {
      const result = getProcessedDir(testUuid);
      expect(result).toBe(path.join(DIRECTORIES.PROCESSED, testUuid));
    });
  });

  describe('getProcessedPath', () => {
    it('should return correct path for processed variant', () => {
      const result = getProcessedPath(testUuid, 640, 'webp');
      expect(result).toBe(
        path.join(DIRECTORIES.PROCESSED, testUuid, '640.webp'),
      );
    });

    it('should handle different widths and formats', () => {
      expect(getProcessedPath(testUuid, 320, 'avif')).toContain('320.avif');
      expect(getProcessedPath(testUuid, 1920, 'jpeg')).toContain('1920.jpeg');
    });
  });

  describe('getLqipPath', () => {
    it('should return correct LQIP path', () => {
      const result = getLqipPath(testUuid);
      expect(result).toBe(path.join(DIRECTORIES.LQIP, `${testUuid}.jpg`));
    });
  });

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      // Test with a file that should exist (this test file itself)
      const result = await fileExists(__filename);
      expect(result).toBe(true);
    });

    it('should return false for non-existing file', async () => {
      const result = await fileExists('/non/existing/path/to/file.txt');
      expect(result).toBe(false);
    });
  });

  describe('ensureDir', () => {
    const testDir = path.join(__dirname, 'test-temp-dir');

    afterEach(async () => {
      try {
        await fs.rmdir(testDir, { recursive: true });
      } catch {
        // Ignore cleanup errors
      }
    });

    it('should create directory if it does not exist', async () => {
      await ensureDir(testDir);
      const exists = await fileExists(testDir);
      expect(exists).toBe(true);
    });

    it('should not throw if directory already exists', async () => {
      await ensureDir(testDir);
      await expect(ensureDir(testDir)).resolves.not.toThrow();
    });
  });

  describe('ensureUploadDirectories', () => {
    it('should create all required directories', async () => {
      await ensureUploadDirectories();

      for (const dir of Object.values(DIRECTORIES)) {
        const exists = await fileExists(dir);
        expect(exists).toBe(true);
      }
    });
  });
});
