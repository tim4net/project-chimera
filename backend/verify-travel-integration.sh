#!/bin/bash
# Verification script for Travel WebSocket Integration

echo "=========================================="
echo "Travel WebSocket Integration Verification"
echo "=========================================="
echo ""

echo "1. Checking TypeScript compilation..."
cd /srv/project-chimera/backend
if npm run build 2>&1 | grep -q "error TS"; then
    echo "❌ TypeScript compilation FAILED"
    exit 1
else
    echo "✅ TypeScript compilation PASSED"
fi

echo ""
echo "2. Checking build outputs..."
if [ -f "dist/routes/travel.js" ]; then
    echo "✅ dist/routes/travel.js exists"
else
    echo "❌ dist/routes/travel.js NOT FOUND"
    exit 1
fi

if [ -f "dist/workers/travelWorker.js" ]; then
    echo "✅ dist/workers/travelWorker.js exists"
else
    echo "❌ dist/workers/travelWorker.js NOT FOUND"
    exit 1
fi

if [ -f "dist/server.js" ]; then
    echo "✅ dist/server.js exists"
else
    echo "❌ dist/server.js NOT FOUND"
    exit 1
fi

echo ""
echo "3. Checking WebSocket event types..."
if grep -q "TRAVEL_SESSION_START" src/types/websocket.ts; then
    echo "✅ TRAVEL_SESSION_START event defined"
else
    echo "❌ TRAVEL_SESSION_START event NOT FOUND"
    exit 1
fi

if grep -q "TRAVEL_PROGRESS" src/types/websocket.ts; then
    echo "✅ TRAVEL_PROGRESS event defined"
else
    echo "❌ TRAVEL_PROGRESS event NOT FOUND"
    exit 1
fi

echo ""
echo "4. Checking travel route integrations..."
if grep -q "broadcastToCharacter" src/routes/travel.ts; then
    echo "✅ WebSocket broadcast function imported"
else
    echo "❌ WebSocket broadcast NOT FOUND in travel routes"
    exit 1
fi

if grep -q "TRAVEL_SESSION_START" src/routes/travel.ts; then
    echo "✅ TRAVEL_SESSION_START emission found"
else
    echo "❌ TRAVEL_SESSION_START emission NOT FOUND"
    exit 1
fi

echo ""
echo "5. Checking server worker integration..."
if grep -q "startTravelWorker" src/server.ts; then
    echo "✅ Travel worker start call found"
else
    echo "❌ Travel worker start call NOT FOUND"
    exit 1
fi

if grep -q "stopTravelWorker" src/server.ts; then
    echo "✅ Travel worker stop call found"
else
    echo "❌ Travel worker stop call NOT FOUND"
    exit 1
fi

echo ""
echo "=========================================="
echo "✅ ALL CHECKS PASSED"
echo "=========================================="
echo ""
echo "Integration complete! Ready for frontend implementation."
echo ""
echo "Next steps:"
echo "1. Start backend: npm start"
echo "2. Connect frontend WebSocket client"
echo "3. Test travel session creation"
echo "4. Monitor browser console for events"
