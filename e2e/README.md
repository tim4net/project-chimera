# End-to-End (E2E) Test Directory

This directory contains all end-to-end tests using **Playwright**.

## Structure

```
e2e/
├── *.spec.ts      # E2E test specifications
└── fixtures/      # Test fixtures (optional, for reusable test data)
```

## Running Tests

From the project root:

```bash
# Run all E2E tests (headless)
npm run e2e

# Run tests in headed mode (see browser)
npm run e2e:headed

# Open Playwright UI for interactive testing
npm run e2e:ui

# View last test report
npm run e2e:report
```

## Test Configuration

Tests are configured in `/srv/project-chimera/playwright.config.ts`:
- Base URL: `http://localhost:5173` (frontend dev server)
- Auto-starts frontend dev server before tests
- Tests run against Chromium, Firefox, and WebKit
- Traces captured on first retry

## Writing E2E Tests

Example test:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Character Creation', () => {
  test('should complete character creation flow', async ({ page }) => {
    await page.goto('/');

    // Click "Create Character" button
    await page.click('text=Create Character');

    // Fill character name
    await page.fill('input[name="characterName"]', 'Test Hero');

    // Select race
    await page.selectOption('select[name="race"]', 'Human');

    // Verify character was created
    await expect(page.locator('text=Test Hero')).toBeVisible();
  });
});
```

## Best Practices

1. **Use data-testid attributes** for reliable selectors:
   ```typescript
   await page.click('[data-testid="create-character-btn"]');
   ```

2. **Wait for network idle** after navigation:
   ```typescript
   await page.goto('/');
   await page.waitForLoadState('networkidle');
   ```

3. **Group related tests** in describe blocks

4. **Use page object patterns** for complex flows (place in `e2e/pages/`)

## Debugging

To debug failing tests:

```bash
# Run in headed mode with slowMo
npm run e2e:headed -- --project=chromium --debug

# View trace of failed test
npm run e2e:report
```

See: https://playwright.dev/docs/intro
