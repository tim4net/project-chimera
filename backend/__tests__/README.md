# Backend Test Directory

This directory contains all backend tests using **Jest**.

## Structure

```
__tests__/
├── unit/          # Unit tests for individual services, utilities, and functions
└── integration/   # Integration tests for API endpoints and database operations
```

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- path/to/test.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Test Configuration

Tests are configured in the backend's Jest configuration:
- Environment: Node.js
- Test pattern: `**/__tests__/**/*.test.ts`
- Uses `ts-jest` for TypeScript support

## Writing Tests

Example unit test:

```typescript
import { describe, it, expect } from '@jest/globals';
import { myFunction } from '../../src/myModule';

describe('myFunction', () => {
  it('should return expected result', () => {
    const result = myFunction(42);
    expect(result).toBe(84);
  });
});
```

Example integration test with Supertest:

```typescript
import request from 'supertest';
import app from '../../src/app';

describe('GET /api/characters', () => {
  it('should return 200', async () => {
    const response = await request(app).get('/api/characters');
    expect(response.status).toBe(200);
  });
});
```

## Environment Variables

Tests use `.env.test` for test-specific configuration. Sensitive values are loaded from `../.env`.
