# Testing Quick Reference

## Run Tests

### Frontend (Vitest)
```bash
cd frontend

npm test                     # Watch mode
npm test -- --run            # Run once
npm run test:ui              # Interactive UI
npm run test:coverage        # Coverage report
```

### Backend (Jest)
```bash
cd backend

npm test                     # All tests
npm test -- [file]           # Specific file
npm test -- --watch          # Watch mode
npm test -- --coverage       # Coverage
```

### E2E (Playwright)
```bash
# From project root

npm run e2e                  # Headless
npm run e2e:headed           # Visible browser
npm run e2e:ui               # Interactive UI
npm run e2e:report           # View report
```

## Test Locations

```
frontend/__tests__/unit/          # Frontend unit tests
frontend/__tests__/integration/   # Frontend integration tests
backend/__tests__/unit/           # Backend unit tests
backend/__tests__/integration/    # Backend integration tests
e2e/                              # End-to-end tests
```

## Write a Test

### Frontend Unit Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Backend Unit Test
```typescript
import { describe, it, expect } from '@jest/globals';

describe('myFunction', () => {
  it('works correctly', () => {
    expect(myFunction(2)).toBe(4);
  });
});
```

### E2E Test
```typescript
import { test, expect } from '@playwright/test';

test('user flow', async ({ page }) => {
  await page.goto('/');
  await page.click('button');
  await expect(page.locator('text=Success')).toBeVisible();
});
```

## Common Matchers

### Testing Library
```typescript
toBeInTheDocument()
toHaveTextContent('text')
toBeVisible()
toBeDisabled()
toHaveClass('className')
```

### Jest/Vitest
```typescript
toBe(value)
toEqual(object)
toContain(item)
toHaveLength(number)
toHaveProperty('key', value)
toBeTruthy()
toBeFalsy()
```

### Playwright
```typescript
toBeVisible()
toHaveText('text')
toHaveURL(/pattern/)
toBeEnabled()
toBeChecked()
```

## Documentation

- **Full Guide**: `/srv/project-chimera/TESTING.md`
- **Setup Verification**: `/srv/project-chimera/TEST_SETUP_VERIFICATION.md`
- **Frontend Tests**: `/srv/project-chimera/frontend/__tests__/README.md`
- **Backend Tests**: `/srv/project-chimera/backend/__tests__/README.md`
- **E2E Tests**: `/srv/project-chimera/e2e/README.md`
