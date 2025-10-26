# Testing Infrastructure Guide

This document describes the complete testing infrastructure for the Nuaibria project.

## Overview

The project uses a multi-layered testing strategy:

1. **Frontend Unit/Integration Tests**: Vitest + Testing Library
2. **Backend Unit/Integration Tests**: Jest
3. **End-to-End Tests**: Playwright

## Quick Start

```bash
# Frontend tests (Vitest)
cd frontend && npm test

# Backend tests (Jest)
cd backend && npm test

# E2E tests (Playwright) - from project root
npm run e2e
```

## Frontend Testing (Vitest)

### Configuration
- Config file: `/srv/project-chimera/frontend/vitest.config.ts`
- Setup file: `/srv/project-chimera/frontend/src/test/setup.ts`
- Test directory: `/srv/project-chimera/frontend/__tests__/`

### Available Commands
```bash
cd frontend

# Run tests in watch mode (default)
npm test

# Run tests once (CI mode)
npm test -- --run

# Open Vitest UI for interactive testing
npm run test:ui

# Generate coverage report
npm run test:coverage
```

### Test Structure
```
frontend/__tests__/
├── unit/              # Component and utility tests
│   └── hello.test.tsx # Example test
└── integration/       # Multi-component integration tests
```

### Example Test
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);

    expect(screen.getByText('Clicked!')).toBeInTheDocument();
  });
});
```

### Testing Library Matchers
All jest-dom matchers are available:
- `toBeInTheDocument()`
- `toHaveTextContent(text)`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveClass(className)`
- And many more...

## Backend Testing (Jest)

### Configuration
- Uses existing Jest configuration in backend
- Test pattern: `**/__tests__/**/*.test.ts`
- Supports TypeScript via ts-jest

### Available Commands
```bash
cd backend

# Run all tests
npm test

# Run specific test file
npm test -- __tests__/unit/myTest.test.ts

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

### Test Structure
```
backend/__tests__/
├── unit/              # Service and utility tests
│   └── hello.test.ts  # Example test
└── integration/       # API endpoint tests
```

### Example Test
```typescript
import { describe, it, expect } from '@jest/globals';
import { calculateDamage } from '../../src/services/combat';

describe('Combat Service', () => {
  it('calculates damage correctly', () => {
    const damage = calculateDamage({
      baseDamage: 10,
      modifier: 3,
      criticalHit: false
    });

    expect(damage).toBe(13);
  });
});
```

### API Testing with Supertest
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Character API', () => {
  it('creates a new character', async () => {
    const response = await request(app)
      .post('/api/characters')
      .send({
        name: 'Test Hero',
        race: 'Human',
        class: 'Fighter'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
  });
});
```

## End-to-End Testing (Playwright)

### Configuration
- Config file: `/srv/project-chimera/playwright.config.ts`
- Test directory: `/srv/project-chimera/e2e/`
- Auto-starts frontend dev server on `http://localhost:5173`

### Available Commands
```bash
# Run from project root

# Run all E2E tests (headless)
npm run e2e

# Run tests in headed mode (visible browser)
npm run e2e:headed

# Open Playwright UI for debugging
npm run e2e:ui

# View HTML report of last test run
npm run e2e:report
```

### Test Structure
```
e2e/
├── hello.spec.ts      # Example E2E test
└── pages/             # Page Object Models (optional)
```

### Example Test
```typescript
import { test, expect } from '@playwright/test';

test.describe('Character Creation Wizard', () => {
  test('completes full character creation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Start character creation
    await page.click('[data-testid="create-character-btn"]');

    // Fill character details
    await page.fill('input[name="name"]', 'Aragorn');
    await page.selectOption('select[name="race"]', 'Human');
    await page.selectOption('select[name="class"]', 'Ranger');

    // Verify character was created
    await expect(page.locator('text=Aragorn')).toBeVisible();
  });
});
```

### Browser Coverage
Tests run against:
- Chromium (Chrome/Edge)
- Firefox
- WebKit (Safari)

### Debugging E2E Tests

1. **Run in headed mode**:
   ```bash
   npm run e2e:headed -- --project=chromium
   ```

2. **Use debug mode**:
   ```bash
   npm run e2e:headed -- --debug
   ```

3. **View trace viewer**:
   ```bash
   npm run e2e:report
   ```

4. **Use Playwright Inspector**:
   ```bash
   npm run e2e:ui
   ```

## Testing Strategy for Character Creation Wizard

### Unit Tests (Frontend)
Test individual wizard components:
- Race selection component
- Class selection component
- Ability score allocation
- Equipment selection
- Spell selection

### Integration Tests (Frontend)
Test component interactions:
- Wizard state management (Zustand store)
- Form validation across steps
- Data flow between wizard steps

### Integration Tests (Backend)
Test API endpoints:
- Character validation
- Database persistence
- Ability score calculations
- Starting equipment generation

### E2E Tests
Test complete user flows:
- Full character creation wizard flow
- Error handling and validation
- Navigation between wizard steps
- Final character submission

## Best Practices

### General
1. **Write tests first** (TDD approach)
2. **Test behavior, not implementation**
3. **Keep tests focused and atomic**
4. **Use descriptive test names**
5. **Mock external dependencies**

### Frontend
1. **Use semantic queries**: `getByRole()`, `getByLabelText()` over `getByTestId()`
2. **Test accessibility**: Use roles and ARIA attributes
3. **Avoid testing implementation details**: Don't test internal state
4. **Use userEvent over fireEvent**: More realistic user interactions

### Backend
1. **Mock database calls** in unit tests
2. **Use test database** for integration tests
3. **Clean up after tests**: Reset database state
4. **Test error cases**: Not just happy paths

### E2E
1. **Use data-testid for reliable selectors**
2. **Wait for network idle** after navigation
3. **Group related tests** with describe blocks
4. **Use page objects** for complex interactions

## Continuous Integration

### GitHub Actions Example
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # Frontend tests
      - name: Frontend Tests
        run: |
          cd frontend
          npm ci
          npm test -- --run

      # Backend tests
      - name: Backend Tests
        run: |
          cd backend
          npm ci
          npm test

      # E2E tests
      - name: E2E Tests
        run: |
          npx playwright install --with-deps
          npm run e2e
```

## Troubleshooting

### Vitest Issues
- **Tests not found**: Check `vitest.config.ts` test pattern
- **Module not found**: Verify path aliases in config
- **jsdom errors**: Ensure setup file is configured

### Jest Issues
- **TypeScript errors**: Check ts-jest configuration
- **Environment variables**: Verify `.env.test` exists
- **Database connection**: Check Supabase credentials

### Playwright Issues
- **Browser not found**: Run `npx playwright install`
- **Connection refused**: Ensure dev server is running
- **Timeout errors**: Increase timeout in config
- **Missing dependencies**: Run `npx playwright install --with-deps`

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Playwright Documentation](https://playwright.dev/)

## Test Coverage Goals

- **Unit Tests**: > 80% coverage for business logic
- **Integration Tests**: All critical API endpoints
- **E2E Tests**: All user-facing features and workflows

## Running All Tests

To run the complete test suite:

```bash
# Terminal 1: Frontend tests
cd frontend && npm test -- --run

# Terminal 2: Backend tests
cd backend && npm test

# Terminal 3: E2E tests (from root)
npm run e2e
```

Or create a script to run all sequentially:

```bash
#!/bin/bash
echo "Running Frontend Tests..."
cd frontend && npm test -- --run

echo "Running Backend Tests..."
cd ../backend && npm test

echo "Running E2E Tests..."
cd .. && npm run e2e
```
