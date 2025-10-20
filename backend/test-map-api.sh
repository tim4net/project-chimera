#!/bin/bash
echo "Testing Map API Endpoints..."
echo ""

echo "1. Creating test map..."
RESPONSE=$(curl -s -X POST http://localhost:3001/api/maps \
  -H "Content-Type: application/json" \
  -d '{
    "campaignSeed": "test-001",
    "zoneId": "starter-plains",
    "zoneType": "plains",
    "width": 10,
    "height": 10,
    "tiles": [[{"x":0,"y":0,"biome":"plains","traversable":true}]],
    "spawnPoint": {"x": 5, "y": 5},
    "seed": 99999
  }')

if echo "$RESPONSE" | grep -q '"id"'; then
  echo "✓ Map created successfully"
  MAP_ID=$(echo "$RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  echo "  Map ID: $MAP_ID"
else
  echo "✗ Failed to create map"
  echo "$RESPONSE"
fi

echo ""
echo "2. Loading map..."
curl -s http://localhost:3001/api/maps/test-001/starter-plains | head -20
echo ""

echo ""
echo "3. Listing campaign maps..."
curl -s http://localhost:3001/api/maps/campaign/test-001 | head -10
