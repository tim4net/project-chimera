#!/bin/bash
# Nuaibria - TUI Startup Script
# Ensures backend is running and launches the Terminal UI

set -e

BACKEND_URL="${BACKEND_URL:-http://localhost:3001}"

echo "==================================="
echo "Nuaibria - Terminal UI"
echo "==================================="
echo ""

echo "Checking production backend status..."
echo "Backend URL: $BACKEND_URL"
echo ""

# Check if backend is accessible
if ! curl -f -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
  echo "❌ ERROR: Cannot connect to backend at $BACKEND_URL"
  echo ""
  echo "Please ensure the production instance is running:"
  echo "  podman compose up -d"
  echo ""
  echo "Then check status:"
  echo "  podman compose ps"
  echo ""
  echo "Expected backend container should be running on port 3001"
  exit 1
fi

echo "✅ Backend connection successful"
echo ""
echo "Launching Terminal UI..."
echo "==================================="
echo ""

# Navigate to CLI directory and start
cd cli
BACKEND_URL="$BACKEND_URL" npm start
