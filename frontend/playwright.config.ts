import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // true,
  forbidOnly: false, // !!process.env.CI,
  retries: 0, // process.env.CI ? 2 : 0,
  workers: 1, // process.env.CI ? 1 : undefined,
  reporter: [
    ['list'],                                                  // Для удобства чтения человеком
    ['json', { outputFile: 'test-results/test-results.json' }] // Для глубокого анализа агентом
  ],
  use: {
    baseURL: 'http://localhost:4173',
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
    url: 'http://localhost:4173',
    reuseExistingServer: true, // !process.env.CI,
    timeout: 10 * 1000,
  },
  timeout: 5000, // just for easy debugging
});
