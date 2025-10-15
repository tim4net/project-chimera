#!/bin/bash

# Quick test of the orchestrator without actually running containers
set -euo pipefail

echo "Testing orchestrator plan generation..."
echo '{}' > project_state.json

# Source the orchestrator functions
source build_orchestrator.sh

# Generate a plan
call_ai "ai_prompt.txt" "test_output.txt"

echo ""
echo "Generated plan:"
echo "=============================================="
cat test_output.txt
echo "=============================================="
echo ""

# Check if socket fix is in the plan
if grep -q "XDG_RUNTIME_DIR" test_output.txt; then
    echo "✓ Socket location fix is included in the plan"
else
    echo "⚠ Socket location fix is NOT in the plan"
fi

# Check if registry fixes are included
if grep -q "docker.io" test_output.txt; then
    echo "✓ Registry fixes are included in the plan"
else
    echo "⚠ Registry fixes are NOT in the plan"
fi

rm -f test_output.txt
