import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],                                                  // Для удобства чтения человеком
    ['json', { outputFile: 'test-results/test-results.json' }] // Для глубокого анализа агентом
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },
  ],
  webServer: {
    command: 'npm run e2e-server',
    url: 'http://localhost:4173',
    reuseExistingServer: true, // Критично для VS Code на Windows
    // stdout: 'ignore', // Скроет лишний лог в консоли
  },
  timeout: process.env.CI ? undefined : 5000, // just for easy debugging
});
