#!/bin/bash
# Automated test runner for TUI
# CI/CD and agent-friendly testing

set -e

echo "======================================"
echo "Nuaibria TUI - Test Runner"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if in headless mode
if [ "$HEADLESS" = "true" ] || [ "$CI" = "true" ]; then
    echo -e "${YELLOW}Running in HEADLESS mode (CI/CD)${NC}"
    export BLESSED_HEADLESS=true
    export NODE_ENV=test
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Build TypeScript if needed
if [ ! -d "dist" ] || [ "$FORCE_BUILD" = "true" ]; then
    echo "Building TypeScript..."
    npm run build
fi

# Run tests based on arguments
case "${1:-all}" in
    "all")
        echo -e "${GREEN}Running all tests...${NC}"
        npm test
        ;;
    "watch")
        echo -e "${GREEN}Running tests in watch mode...${NC}"
        npm run test:watch
        ;;
    "coverage")
        echo -e "${GREEN}Running tests with coverage...${NC}"
        npm run test:coverage
        ;;
    "unit")
        echo -e "${GREEN}Running unit tests...${NC}"
        npm test -- --testPathPattern="__tests__/(ui|api)"
        ;;
    "integration")
        echo -e "${GREEN}Running integration tests...${NC}"
        npm test -- --testPathPattern="integration.test"
        ;;
    *)
        echo -e "${RED}Unknown test type: $1${NC}"
        echo "Usage: ./test-runner.sh [all|watch|coverage|unit|integration]"
        exit 1
        ;;
esac

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}✗ Tests failed!${NC}"
    exit 1
fi
