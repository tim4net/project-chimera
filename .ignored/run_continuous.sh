#!/bin/bash

# -----------------------------------------------------------------------------
# run_continuous.sh - Continuous self-healing build mode
#
# Runs the orchestrator in a loop for autonomous, resilient development
# -----------------------------------------------------------------------------

set -euo pipefail

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Project Chimera - Continuous Build Mode                ║"
echo "║  Dual-AI System: Gemini (planning) + Claude (fixes)     ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
echo "This will run the orchestrator in a self-healing mode until all MVP tasks are complete."
echo "Press Ctrl+C to stop at any time."
echo ""

# Run orchestrator
export LOG_FILE="orchestrator_run_$(date +%Y%m%d_%H%M%S).log" # Export LOG_FILE
echo "Running orchestrator. Output being logged to $LOG_FILE"
if ! ./build_orchestrator.sh; then # Call build_orchestrator.sh directly
    echo "ERROR: Orchestrator failed! Details are in $LOG_FILE. Attempting to fix..."
    ./fix_script.sh "$LOG_FILE"
fi

# The build_orchestrator.sh script itself will now handle the continuous loop and completion.
