#!/bin/bash
# Test script for travel API endpoints

BASE_URL="http://localhost:3000/api/travel"

echo "=== Testing Travel API Integration ==="
echo ""

# Test 1: GET /api/travel/status with a fake session ID
echo "Test 1: GET /status/:sessionId (should return 404 for non-existent session)"
curl -s -X GET "${BASE_URL}/status/fake-session-id-12345" \
  -H "Content-Type: application/json" | jq '.'
echo ""
echo "---"
echo ""

# Test 2: POST /api/travel/start with invalid data
echo "Test 2: POST /start (should return 400 for missing fields)"
curl -s -X POST "${BASE_URL}/start" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo ""
echo "---"
echo ""

# Test 3: POST /api/travel/choose with invalid data
echo "Test 3: POST /choose (should return 400 for missing fields)"
curl -s -X POST "${BASE_URL}/choose" \
  -H "Content-Type: application/json" \
  -d '{}' | jq '.'
echo ""
echo "---"
echo ""

echo "=== Basic API Tests Complete ==="
echo ""
echo "NOTE: These are negative tests to verify error handling."
echo "For full integration tests, you would need:"
echo "  1. A valid character_id from the database"
echo "  2. A valid destination_id (POI or coordinates)"
echo "  3. An active travel session ID"
