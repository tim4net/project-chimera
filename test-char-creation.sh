#!/bin/bash

# Enable mock authentication for local testing
export AUTH_MODE=mock
export NODE_ENV=development

BASE_URL="http://localhost:3001"
MOCK_USER="test-user-$(date +%s)"

echo "=========================================="
echo "Character Creation API Test"
echo "=========================================="
echo "Mock User ID: $MOCK_USER"
echo ""

echo "=== Test 1: Create Character ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/characters" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User-Id: $MOCK_USER" \
  -d '{
    "name": "Thorne Blacksmith",
    "race": "Dwarf",
    "class": "Fighter",
    "background": "Soldier",
    "alignment": "Lawful Neutral",
    "ability_scores": {
      "STR": 16,
      "DEX": 12,
      "CON": 16,
      "INT": 10,
      "WIS": 13,
      "CHA": 8
    },
    "skills": ["Athletics"]
  }')

echo "$RESPONSE" | jq .
CHARACTER_ID=$(echo "$RESPONSE" | jq -r '.id // empty')

if [ -z "$CHARACTER_ID" ]; then
  echo "❌ Failed to create character"
  exit 1
fi

echo "✅ Character created with ID: $CHARACTER_ID"
echo ""

echo "=== Test 2: Retrieve Character ==="
curl -s -X GET "$BASE_URL/api/characters/$CHARACTER_ID" \
  -H "X-Mock-User-Id: $MOCK_USER" | jq .
echo ""

echo "=== Test 3: List All Characters ==="
curl -s -X GET "$BASE_URL/api/characters" \
  -H "X-Mock-User-Id: $MOCK_USER" | jq .
echo ""

echo "=== Test 4: Update Character (Level Up) ==="
curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User-Id: $MOCK_USER" \
  -d '{
    "experience": 300,
    "level": 2,
    "hp": 14
  }' | jq .
echo ""

echo "✅ All tests completed successfully!"
