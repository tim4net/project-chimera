# Frontend Test Directory

This directory contains all frontend tests using **Vitest** and **Testing Library**.

## Structure

```
__tests__/
├── unit/          # Unit tests for individual components and utilities
└── integration/   # Integration tests for component interactions
```

## Running Tests

```bash
# Run tests in watch mode
npm test

# Run tests once (CI mode)
npm test -- --run

# Open Vitest UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Configuration

Tests are configured in `/srv/project-chimera/frontend/vitest.config.ts`:
- Environment: jsdom (simulates browser)
- Setup file: `src/test/setup.ts` (includes Testing Library matchers)
- Coverage: v8 provider with HTML/JSON reports

## Writing Tests

Example unit test:

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

## Available Matchers

All jest-dom matchers are available:
- `toBeInTheDocument()`
- `toHaveTextContent()`
- `toBeVisible()`
- And many more...

See: https://github.com/testing-library/jest-dom
