#!/bin/bash

# Test orchestrator idempotency

echo "Testing idempotency of task completion..."
echo ""

# Create test state
cat > test_state.json <<EOF
{
  "tasks_completed": ["INFRA-001", "INFRA-002"],
  "tasks_in_progress": []
}
EOF

echo "Initial state:"
cat test_state.json
echo ""

# Try adding DB-001 twice (simulating crash and retry)
echo "Adding DB-001 first time:"
jq '.tasks_completed += ["DB-001"] | .tasks_completed |= unique' test_state.json > test_state.json.tmp && mv test_state.json.tmp test_state.json
cat test_state.json
echo ""

echo "Adding DB-001 second time (simulating retry):"
jq '.tasks_completed += ["DB-001"] | .tasks_completed |= unique' test_state.json > test_state.json.tmp && mv test_state.json.tmp test_state.json
cat test_state.json
echo ""

# Verify no duplicates
duplicate_count=$(jq '.tasks_completed | group_by(.) | map(select(length > 1)) | length' test_state.json)
if [ "$duplicate_count" -eq 0 ]; then
    echo "✅ IDEMPOTENT: No duplicates after retry"
else
    echo "❌ NOT IDEMPOTENT: Found $duplicate_count duplicates"
fi

rm test_state.json test_state.json.tmp
