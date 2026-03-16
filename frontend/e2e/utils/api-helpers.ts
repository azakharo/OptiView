// API helper utilities for E2E tests
// This file can be extended with common API functions for testing

/**
 * Helper to wait for API to be ready
 */
export async function waitForApi(baseUrl: string, timeout = 30000): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(`${baseUrl}/api/images`);
      if (response.ok || response.status === 401) {
        return true;
      }
    } catch {
      // API not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  return false;
}

/**
 * Helper to clear test data
 */
export async function clearTestData(baseUrl: string): Promise<void> {
  // Add cleanup logic as needed
}
