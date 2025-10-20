# TUI Testing Guide for AI Agents

## Overview

This guide provides comprehensive instructions for AI agents to test the Nuaibria Terminal UI during development, debugging, and CI/CD processes.

## Quick Start

```bash
# From project root
cd /srv/nuaibria/cli

# Install dependencies (first time only)
npm install

# Run all tests
npm test

# Visual test
npm start
```

## Testing Infrastructure

### Automated Testing Stack

- **Jest**: Test framework with TypeScript support
- **blessed-mock**: Headless terminal simulation
- **ESM modules**: Modern JavaScript imports
- **Coverage reporting**: Istanbul/NYC integration

### Test Types

1. **Unit Tests**: Individual component validation
2. **Integration Tests**: Component interaction validation
3. **Visual Tests**: Manual UI verification
4. **CI Tests**: Headless automated validation

## Running Tests

### 1. Unit Tests

Test individual components in isolation:

```bash
# All unit tests
npm test

# Specific component
npm test -- --testPathPattern="theme.test"
npm test -- --testPathPattern="client.test"

# With coverage
npm run test:coverage
```

### 2. Integration Tests

Test component interactions:

```bash
npm test -- --testPathPattern="integration.test"
```

### 3. Visual Tests

Manual verification of UI:

```bash
# Build and start
npm run build
npm start

# Or use convenience script
cd ..
./start-tui.sh
```

### 4. CI/CD Tests

Headless testing for automation:

```bash
# Set environment
export CI=true
export HEADLESS=true

# Run test suite
./test-runner.sh all

# Or specific types
./test-runner.sh unit
./test-runner.sh integration
./test-runner.sh coverage
```

## Test Structure

### Directory Layout

```
cli/
├── src/
│   ├── __tests__/
│   │   ├── ui/
│   │   │   └── theme.test.ts
│   │   ├── api/
│   │   │   └── client.test.ts
│   │   └── integration.test.ts
│   ├── ui/
│   ├── api/
│   └── types/
├── jest.config.js
├── jest.setup.js
└── test-runner.sh
```

### Writing New Tests

**Example Unit Test:**

```typescript
import { describe, test, expect } from '@jest/globals';
import { myFunction } from '../myModule.js';

describe('MyModule', () => {
  test('should do something', () => {
    const result = myFunction('input');
    expect(result).toBe('expected');
  });
});
```

**Example Integration Test:**

```typescript
import { describe, test, expect } from '@jest/globals';
import type { GameState } from '../types/index.js';

describe('Game State Integration', () => {
  test('should maintain state consistency', () => {
    const state: GameState = {
      character: null,
      worldMap: null,
      chatHistory: [],
      isLoading: false,
    };

    expect(state.isLoading).toBe(false);
  });
});
```

## Agent Testing Workflow

### For Component Changes

```bash
# 1. Make changes
vim src/ui/characterPanel.ts

# 2. Run affected tests
npm test -- --testPathPattern="character"

# 3. Build TypeScript
npm run build

# 4. Visual verification
npm start
# (Check character panel renders correctly)

# 5. Full test suite
npm test
```

### For API Changes

```bash
# 1. Edit API client
vim src/api/client.ts

# 2. Run API tests
npm test -- --testPathPattern="client"

# 3. Test with live backend
# Ensure backend is running:
cd /srv/nuaibria
podman compose ps | grep backend

# Start TUI
cd cli
BACKEND_URL=http://localhost:3000 npm start

# 4. Verify connectivity
# Check chat interface connects
# Verify data loads
```

### For Theme Changes

```bash
# 1. Edit theme
vim src/ui/theme.ts

# 2. Test theme functions
npm test -- --testPathPattern="theme"

# 3. Visual check
npm run build && npm start

# 4. Verify:
#    - Colors render correctly
#    - Symbols display properly
#    - Bars generate at correct widths
```

## Validation Checklist

### Before Committing Changes

- [ ] `npm test` passes all tests
- [ ] `npm run build` compiles without errors
- [ ] `npm start` launches without crashes
- [ ] Visual inspection shows correct rendering
- [ ] Tab key cycles focus properly
- [ ] Input accepts text correctly
- [ ] Quit commands work (Escape/q/Ctrl+C)
- [ ] No console errors or warnings

### For Backend Integration

- [ ] Backend service is running
- [ ] Health check endpoint responds
- [ ] Character data loads correctly
- [ ] Map data fetches successfully
- [ ] Chat messages send/receive
- [ ] Error handling graceful (backend down)

### For UI Components

- [ ] 3-column layout intact
- [ ] Borders and colors correct
- [ ] Unicode symbols display
- [ ] Content updates dynamically
- [ ] Scrolling works (chat panel)
- [ ] Focus indicators visible

## Debugging Failed Tests

### Test Failures

```bash
# Run with verbose output
npm test -- --verbose

# Run single test file
npm test -- theme.test.ts

# Enable debug mode
DEBUG_TESTS=true npm test
```

### Build Failures

```bash
# Clean build
rm -rf dist/
npm run build

# Check TypeScript errors
npx tsc --noEmit
```

### Runtime Errors

```bash
# Check logs
npm start 2>&1 | tee tui.log

# Test with backend logging
BACKEND_URL=http://localhost:3000 DEBUG=true npm start
```

## Common Issues and Solutions

### Issue: "Cannot find module" Errors

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules/ package-lock.json
npm install
```

### Issue: Tests Timeout

**Solution:**
```bash
# Increase timeout in jest.config.js
# testTimeout: 10000 -> 30000

# Or for specific test:
test('slow test', async () => {
  // ...
}, 30000); // 30 second timeout
```

### Issue: Unicode Symbols Show as �

**Solution:**
```bash
# Check UTF-8 support
locale | grep UTF-8

# Set UTF-8
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

# Test again
npm start
```

### Issue: Colors Not Displaying

**Solution:**
```bash
# Check terminal color support
echo $TERM
# Should be: xterm-256color or similar

# Test colors
npm test -- --testPathPattern="theme"
```

### Issue: Backend Connection Refused

**Solution:**
```bash
# Check backend status
curl http://localhost:3000/health

# Start backend
cd /srv/nuaibria
podman compose up -d backend

# Wait and retry
sleep 5
curl http://localhost:3000/health
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: TUI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - name: Install dependencies
        working-directory: cli
        run: npm install
      - name: Run tests
        working-directory: cli
        env:
          CI: true
          HEADLESS: true
        run: ./test-runner.sh all
```

### GitLab CI Example

```yaml
tui-test:
  stage: test
  image: node:20
  script:
    - cd cli
    - npm install
    - export CI=true
    - export HEADLESS=true
    - ./test-runner.sh all
  artifacts:
    reports:
      coverage_report:
        coverage_format: cobertura
        path: cli/coverage/cobertura-coverage.xml
```

## Performance Testing

### Resource Monitoring

```bash
# Start TUI
npm start &
TUI_PID=$!

# Monitor resources
top -p $TUI_PID

# Target metrics:
# - Memory: <50MB
# - CPU: <5% idle
# - Render: <16ms (60 FPS)
```

### Load Testing

```bash
# Rapid message simulation
for i in {1..100}; do
  echo "Message $i"
  sleep 0.1
done | npm start
```

## Coverage Goals

### Minimum Coverage Targets

- **Unit Tests**: 80% line coverage
- **Integration Tests**: 70% line coverage
- **Overall**: 75% line coverage

### Checking Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html

# View console summary
npm test -- --coverage --coverageReporters=text
```

## Test Maintenance

### Adding New Tests

```bash
# 1. Create test file
touch src/__tests__/ui/newComponent.test.ts

# 2. Write tests
vim src/__tests__/ui/newComponent.test.ts

# 3. Run new tests
npm test -- --testPathPattern="newComponent"

# 4. Verify coverage
npm run test:coverage
```

### Updating Existing Tests

```bash
# 1. Edit test file
vim src/__tests__/ui/theme.test.ts

# 2. Run specific test
npm test -- --testPathPattern="theme"

# 3. Verify all tests still pass
npm test
```

## Best Practices

### DO

✓ Run tests before committing
✓ Use headless mode for automation
✓ Write tests for new features
✓ Maintain coverage >75%
✓ Test error scenarios
✓ Verify visual changes manually
✓ Use meaningful test descriptions
✓ Mock external dependencies

### DON'T

✗ Skip tests to save time
✗ Commit failing tests
✗ Ignore coverage drops
✗ Test in production
✗ Hard-code test data
✗ Forget edge cases
✗ Leave console.log in tests

## Summary

Testing the TUI is straightforward:

1. **Quick Test**: `npm test`
2. **Visual Test**: `npm start`
3. **Full Validation**: `./test-runner.sh all`

For any issues, refer to the troubleshooting section or the Anthropic skill at `.claude/skills/tui-testing.md`.

---

**For more information:**
- README.md - Usage guide
- DEMO.md - Visual preview
- .claude/skills/tui-testing.md - Agent skill reference
