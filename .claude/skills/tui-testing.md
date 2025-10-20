# TUI Testing Skill

## Purpose
This skill teaches AI agents how to test and validate the Nuaibria Terminal UI during development.

## When to Use This Skill
- When making changes to TUI components
- Before committing UI changes
- When debugging visual issues
- When validating backend integration
- During CI/CD pipeline execution

## TUI Architecture Overview

### Components
```
cli/
├── src/
│   ├── ui/
│   │   ├── layout.ts         # Main 3-column layout manager
│   │   ├── characterPanel.ts # Character stats (left column)
│   │   ├── mapPanel.ts       # World map (center column)
│   │   ├── chatPanel.ts      # AI chat (right column)
│   │   └── theme.ts          # Colors & Unicode symbols
│   ├── api/
│   │   └── client.ts         # Backend API integration
│   └── types/
│       └── index.ts          # TypeScript interfaces
```

## Testing Methods

### 1. Automated Unit Tests

Run automated tests in headless mode:

```bash
cd cli

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch

# Use test runner script
./test-runner.sh all
./test-runner.sh unit
./test-runner.sh integration
```

### 2. Manual Visual Testing

Launch TUI with demo data:

```bash
# From project root
./start-tui.sh

# Or from cli directory
cd cli
npm run build
npm start
```

**What to Check:**
- ✓ 3 columns display correctly
- ✓ Character stats render with colors
- ✓ HP/XP bars show correct percentages
- ✓ Map displays biome symbols (🌊🌲🏔️🏜️🏰)
- ✓ Chat input accepts text
- ✓ Tab key cycles focus
- ✓ Colors are vibrant and readable
- ✓ Unicode symbols display properly

### 3. Backend Integration Testing

Test API connectivity:

```bash
# Ensure backend is running
podman compose ps

# Start backend if needed
podman compose up -d

# Test TUI connection
cd cli
BACKEND_URL=http://localhost:3000 npm start
```

**Integration Checklist:**
- ✓ Health check endpoint responds
- ✓ Character data loads
- ✓ Map data fetches
- ✓ Chat messages send/receive
- ✓ Streaming responses work (if implemented)

### 4. CI/CD Headless Testing

For automated pipelines:

```bash
# Set environment variables
export CI=true
export HEADLESS=true
export NODE_ENV=test

# Run tests
cd cli
./test-runner.sh all
```

## Common Testing Scenarios

### Scenario 1: Testing Theme Changes

**Objective:** Validate color and symbol changes

```bash
# 1. Edit theme file
vim cli/src/ui/theme.ts

# 2. Run theme tests
cd cli
npm test -- --testPathPattern="theme.test"

# 3. Visual verification
npm run build && npm start

# 4. Check:
#    - Colors render correctly
#    - Symbols display properly
#    - Bars generate at correct widths
```

### Scenario 2: Testing New API Endpoints

**Objective:** Validate backend integration

```bash
# 1. Edit API client
vim cli/src/api/client.ts

# 2. Run API tests
npm test -- --testPathPattern="client.test"

# 3. Integration test with live backend
BACKEND_URL=http://localhost:3000 npm start

# 4. Verify:
#    - Requests succeed
#    - Data formats correctly
#    - Error handling works
```

### Scenario 3: Testing UI Component Changes

**Objective:** Ensure component modifications don't break layout

```bash
# 1. Make changes to component
vim cli/src/ui/characterPanel.ts

# 2. Build TypeScript
npm run build

# 3. Run integration tests
npm test -- --testPathPattern="integration.test"

# 4. Visual test
npm start

# 5. Verify:
#    - Layout remains intact
#    - Data displays correctly
#    - Focus management works
```

## Test Data

### Demo Character
```typescript
{
  id: 'demo-1',
  name: 'Aric the Wanderer',
  class: 'Wizard',
  level: 3,
  hp: 18,
  maxHp: 24,
  xp: 250,
  xpToNextLevel: 1000,
  position: { x: 12, y: 8 },
  abilities: {
    strength: 10,
    dexterity: 14,
    constitution: 12,
    intelligence: 16,
    wisdom: 13,
    charisma: 8,
  },
}
```

### Demo Map
- Size: 30x20 grid
- Player at: (12, 8)
- Biomes: water (north), forest (center), mountains (sides), desert (south)
- Town at: (12, 10)

## Troubleshooting

### Issue: Tests Fail in Headless Mode

**Solution:**
```bash
# Check environment variables
echo $BLESSED_HEADLESS  # Should be 'true'
echo $NODE_ENV          # Should be 'test'

# Set if missing
export BLESSED_HEADLESS=true
export NODE_ENV=test
```

### Issue: Unicode Symbols Not Displaying

**Solution:**
```bash
# Check terminal UTF-8 support
locale | grep UTF-8

# Set UTF-8 if needed
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
```

### Issue: Backend Connection Failed

**Solution:**
```bash
# Check backend status
curl http://localhost:3000/health

# Start backend if down
cd /srv/nuaibria
podman compose up -d

# Wait for startup
sleep 5
curl http://localhost:3000/health
```

### Issue: Build Errors

**Solution:**
```bash
cd cli

# Clean build
rm -rf dist/

# Reinstall dependencies
rm -rf node_modules/
npm install

# Rebuild
npm run build
```

## Best Practices for Agents

### 1. Always Test Before Committing

```bash
# Quick pre-commit check
cd cli
npm test
npm run build
```

### 2. Use Headless Mode for Automation

```bash
# In scripts/CI pipelines
export HEADLESS=true
./cli/test-runner.sh all
```

### 3. Verify Visual Changes Manually

```bash
# After UI changes, always do visual test
npm start
# Check colors, layout, symbols
```

### 4. Test Error Scenarios

```bash
# Test with backend down
podman compose down
npm start
# Should show connection error gracefully

# Restart backend
podman compose up -d
```

### 5. Check Coverage

```bash
# Ensure new code is tested
npm run test:coverage
# Target: >80% coverage
```

## Quick Reference Commands

```bash
# Navigate to TUI directory
cd /srv/nuaibria/cli

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run all tests (headless)
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch

# Start TUI (visual)
npm start

# Start with custom backend
BACKEND_URL=http://custom:3000 npm start

# Test runner (all modes)
./test-runner.sh [all|unit|integration|coverage|watch]

# Full integration test from root
cd /srv/nuaibria
./start-tui.sh
```

## Success Criteria

A successful TUI test should verify:

- ✓ All unit tests pass
- ✓ Integration tests pass
- ✓ TypeScript compiles without errors
- ✓ No runtime exceptions
- ✓ Visual layout renders correctly
- ✓ Colors are vibrant and readable
- ✓ Unicode symbols display properly
- ✓ Backend connectivity works
- ✓ User input accepted
- ✓ Focus management functional
- ✓ Quit commands work (Escape/q/Ctrl+C)

## Integration with Development Workflow

### Pre-Commit Checklist
```bash
cd cli
npm test                    # Run tests
npm run build              # Build TypeScript
npm start                  # Quick visual check
# Press 'q' to quit after verification
```

### CI/CD Pipeline
```bash
export CI=true
export HEADLESS=true
cd cli
npm install
./test-runner.sh all
```

### Manual QA Session
```bash
./start-tui.sh
# Test interactions:
# - Type chat messages
# - Press Tab to cycle focus
# - Verify character stats update
# - Check map rendering
# - Test quit (Escape/q/Ctrl+C)
```

## Advanced Testing

### Performance Testing
```bash
# Monitor resource usage
cd cli
npm start &
TUI_PID=$!
top -p $TUI_PID

# Check memory and CPU
# Target: <50MB RAM, <5% CPU idle
```

### Stress Testing
```bash
# Rapid input simulation
# (Requires custom test script)
./cli/stress-test.sh
```

### Accessibility Testing
```bash
# Test screen reader compatibility
orca  # Start screen reader
npm start
# Verify text is readable
```

## Skill Completion Checklist

When using this skill, ensure:

- [ ] Tests run successfully in headless mode
- [ ] Visual verification completed
- [ ] Backend integration validated
- [ ] Documentation updated if needed
- [ ] No regressions introduced
- [ ] Coverage maintained/improved
- [ ] Error handling tested

---

**Last Updated:** 2025-10-20
**Skill Version:** 1.0
**Compatible with:** Nuaibria TUI v1.0
