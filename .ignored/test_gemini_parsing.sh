#!/bin/bash

# Test the Gemini output parsing

cat > test_gemini_output.txt <<'EOF'
Loaded cached credentials.
mkdir -p backend/src backend/tests
mkdir -p frontend/src frontend/public
mkdir -p shared
mkdir -p docs
test -f backend/package.json || echo '{"name": "backend", "version": "0.1.0"}' > backend/package.json
test -f frontend/package.json || echo '{"name": "frontend", "version": "0.1.0"}' > frontend/package.json
EOF

echo "Original Gemini output:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
cat test_gemini_output.txt
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

echo "After parsing (filtering out status messages):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
grep -v "^Loaded\|^Initializing\|^Connecting\|^Using model" test_gemini_output.txt | \
    grep -v "^$" | \
    grep -E "^(mkdir|echo|cp|npm|pnpm|git|jq|test|sed|podman)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rm test_gemini_output.txt
