#!/bin/bash

PROBLEM_DESCRIPTION="$1"
BUILD_ORCHESTRATOR_CONTENT=$(cat build_orchestrator.sh)
BUILD_LOG_CONTENT=""

if [ -f "build.log" ]; then
    BUILD_LOG_CONTENT=$(cat build.log)
fi

echo "Please help fix build_orchestrator.sh."
echo "Here is the problem description: $PROBLEM_DESCRIPTION"
echo ""
echo "--- Content of build_orchestrator.sh ---"
echo "$BUILD_ORCHESTRATOR_CONTENT"
echo "--- End of build_orchestrator.sh content ---"
echo ""

if [ -n "$BUILD_LOG_CONTENT" ]; then
    echo "--- Content of build.log (if available) ---"
    echo "$BUILD_LOG_CONTENT"
    echo "--- End of build.log content ---"
    echo ""
fi

echo "Please analyze the problem and the script, and provide the necessary changes to fix build_orchestrator.sh."
echo "Provide the changes as a series of 'replace' tool calls."