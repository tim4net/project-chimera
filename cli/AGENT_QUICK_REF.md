# TUI Agent Quick Reference Card

## Essential Commands

```bash
cd /srv/nuaibria/cli    # Navigate to TUI
npm test                       # Run all tests (21 tests)
npm run build                  # Build TypeScript
npm start                      # Launch TUI visually
./test-runner.sh all          # Full test suite
```

## Testing Modes

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests (headless) |
| `npm run test:watch` | Watch mode for development |
| `npm run test:coverage` | Generate coverage report |
| `./test-runner.sh unit` | Unit tests only |
| `./test-runner.sh integration` | Integration tests only |

## Before Committing

```bash
npm test && npm run build && echo "✅ Ready to commit"
```

## Visual Testing

```bash
npm start
# Check: 3 columns, colors, symbols, input
# Quit: Press 'q' or Escape or Ctrl+C
```

## Backend Integration

```bash
# Check backend is running
podman compose ps | grep backend

# Test with backend
BACKEND_URL=http://localhost:3000 npm start
```

## Test Results

**Expected:** `Test Suites: 3 passed, Tests: 21 passed, Time: ~1s`

## Documentation

- `.claude/skills/tui-testing.md` - Full skill guide
- `TESTING.md` - Complete testing guide
- `README.md` - Usage instructions
- `DEMO.md` - Visual examples

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Tests fail | `npm install && npm test` |
| Build errors | `rm -rf dist/ && npm run build` |
| Symbols broken | Check UTF-8: `locale \| grep UTF-8` |
| Backend down | `podman compose up -d` |

## Success Checklist

- [ ] `npm test` passes (21/21)
- [ ] `npm run build` succeeds
- [ ] `npm start` launches
- [ ] Visual check looks correct
- [ ] No console errors

## CI/CD

```bash
export CI=true HEADLESS=true
npm install
./test-runner.sh all
```

---

**For full details, read:** `.claude/skills/tui-testing.md`
