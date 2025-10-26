#!/bin/bash
# Design System Verification Script
# Verifies that all design system files are present and correctly configured

echo "=========================================="
echo "Nuaibria Design System Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check if file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} $2"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $2 (Missing: $1)"
    ((FAILED++))
  fi
}

# Function to check if string exists in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} $3"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} $3 (Not found in $1)"
    ((FAILED++))
  fi
}

echo "Checking Documentation..."
echo "----------------------------------------"
check_file "/srv/project-chimera/DESIGN_SYSTEM.md" "Complete design system specification"
check_file "/srv/project-chimera/frontend/src/design/USAGE_EXAMPLES.md" "Usage examples documentation"
check_file "/srv/project-chimera/frontend/src/design/QUICK_REFERENCE.md" "Quick reference guide"
check_file "/srv/project-chimera/frontend/src/design/README.md" "Design system README"
echo ""

echo "Checking Color Tokens..."
echo "----------------------------------------"
check_file "/srv/project-chimera/frontend/src/design/colors.ts" "Color tokens file"
check_content "/srv/project-chimera/frontend/src/design/colors.ts" "purple:" "Purple color palette defined"
check_content "/srv/project-chimera/frontend/src/design/colors.ts" "gold:" "Gold accent colors defined"
check_content "/srv/project-chimera/frontend/src/design/colors.ts" "hexToRgba" "Color helper functions"
echo ""

echo "Checking Styles..."
echo "----------------------------------------"
check_file "/srv/project-chimera/frontend/src/styles/global.css" "Global styles file"
check_file "/srv/project-chimera/frontend/src/styles/animations.css" "Animation styles file"
check_content "/srv/project-chimera/frontend/src/styles/global.css" "input\[type='range'\]" "Slider styles defined"
check_content "/srv/project-chimera/frontend/src/styles/animations.css" "@keyframes fadeIn" "Fade animation defined"
check_content "/srv/project-chimera/frontend/src/styles/animations.css" "@keyframes shimmer" "Shimmer animation defined"
echo ""

echo "Checking Tailwind Configuration..."
echo "----------------------------------------"
check_file "/srv/project-chimera/frontend/tailwind.config.js" "Tailwind config file"
check_content "/srv/project-chimera/frontend/tailwind.config.js" "purple:" "Purple colors in Tailwind"
check_content "/srv/project-chimera/frontend/tailwind.config.js" "gold:" "Gold colors in Tailwind"
check_content "/srv/project-chimera/frontend/tailwind.config.js" "shimmer:" "Shimmer animation in Tailwind"
echo ""

echo "Checking Shared Components..."
echo "----------------------------------------"
check_file "/srv/project-chimera/frontend/src/components/shared/Card.tsx" "Card component"
check_file "/srv/project-chimera/frontend/src/components/shared/Button.tsx" "Button component"
check_file "/srv/project-chimera/frontend/src/components/shared/Slider.tsx" "Slider component"
check_file "/srv/project-chimera/frontend/src/components/shared/index.ts" "Component exports"
check_content "/srv/project-chimera/frontend/src/components/shared/Card.tsx" "export const Card" "Card component exported"
check_content "/srv/project-chimera/frontend/src/components/shared/Button.tsx" "export const Button" "Button component exported"
check_content "/srv/project-chimera/frontend/src/components/shared/Slider.tsx" "export const Slider" "Slider component exported"
echo ""

echo "Checking Dependencies..."
echo "----------------------------------------"
if grep -q "lucide-react" "/srv/project-chimera/frontend/package.json"; then
  echo -e "${GREEN}✓${NC} Lucide React installed"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Lucide React not found in package.json"
  ((FAILED++))
fi

if grep -q "tailwindcss" "/srv/project-chimera/frontend/package.json"; then
  echo -e "${GREEN}✓${NC} Tailwind CSS installed"
  ((PASSED++))
else
  echo -e "${RED}✗${NC} Tailwind CSS not found in package.json"
  ((FAILED++))
fi
echo ""

echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo -e "Passed: ${GREEN}${PASSED}${NC}"
echo -e "Failed: ${RED}${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ Design System is complete and ready for use!${NC}"
  echo ""
  echo "Next steps:"
  echo "1. Read documentation: /srv/project-chimera/DESIGN_SYSTEM.md"
  echo "2. Review examples: frontend/src/design/USAGE_EXAMPLES.md"
  echo "3. Import components: import { Card, Button, Slider } from '@/components/shared';"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Design System verification failed!${NC}"
  echo "Please review the missing files/content above."
  echo ""
  exit 1
fi
