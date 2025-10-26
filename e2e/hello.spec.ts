import { test, expect } from '@playwright/test';

test.describe('Hello World - Playwright E2E Test', () => {
  test('homepage loads successfully', async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Basic check that the page loaded
    await expect(page).toHaveTitle(/Nuaibria/i);
  });

  test('performs basic interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // This is a placeholder test - will be replaced with actual character creation tests
    const body = await page.locator('body');
    await expect(body).toBeVisible();
  });
});
