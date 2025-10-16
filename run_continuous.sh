#!/bin/bash

# -----------------------------------------------------------------------------
# run_continuous.sh - Continuous self-healing build mode
#
# Runs the orchestrator in a loop for autonomous, resilient development
# -----------------------------------------------------------------------------

set -euo pipefail

readonly SLEEP_BETWEEN_RUNS=10

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Project Chimera - Continuous Build Mode                ║"
echo "║  Dual-AI System: Gemini (planning) + Claude (fixes)     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "This will run the orchestrator in an infinite self-healing loop."
echo "Press Ctrl+C to stop at any time."
echo ""

iteration=0

while true; do
    iteration=$((iteration + 1))

    echo ""
    echo "╔══════════════════════════════════════════════════════════╗"
    echo "║  Iteration #$iteration"
    echo "╚══════════════════════════════════════════════════════════╝"
    echo ""

    # Run orchestrator
    ./build_orchestrator.sh

    # Check state to see if we're done
    if jq -e '.tasks_completed | length > 27' project_state.json &>/dev/null; then
        echo ""
        echo "╔══════════════════════════════════════════════════════════╗"
        echo "║  🎉 ALL MVP TASKS COMPLETE!                              ║"
        echo "║  The orchestrator will continue monitoring...            ║"
        echo "╚══════════════════════════════════════════════════════════╝"
        echo ""
    fi

    # Brief pause before next iteration
    echo ""
    echo "⏸️  Pausing for $SLEEP_BETWEEN_RUNS seconds before next iteration..."
    sleep $SLEEP_BETWEEN_RUNS
done
