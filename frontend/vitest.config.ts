import * as path from 'node:path';
import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig((env) => ({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    mockReset: true,
    include: ['src/**/*.{test,spec}.{js,ts,jsx,tsx}'],
    fileParallelism: false,
  },
}));
