# Character Creation API Tests

## Setup for Local Testing

To test character creation endpoints locally without Supabase authentication, you need to enable mock authentication mode:

### Enable Mock Auth Mode
```bash
# Set environment variables in .env (or export in shell)
export AUTH_MODE=mock
export NODE_ENV=development

# Then restart backend
podman compose restart backend
```

Once enabled, all protected endpoints will accept requests with the `X-Mock-User-Id` header instead of requiring a valid JWT token.

## Test Endpoints

### 1. Test Mock Authentication (Verify Mode is Enabled)

```bash
curl -X GET "http://localhost:3001/health" \
  -H "X-Mock-User-Id: test-user-123"
```

Expected Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-10-22T20:23:03.327Z",
  "service": "nuaibria-backend"
}
```

### 2. Create Character - Full Example

```bash
curl -X POST "http://localhost:3001/api/characters" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User-Id: test-user-123" \
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
    "skills": ["Athletics", "Intimidation"],
    "spells": [],
    "portrait_url": "https://api.dicebear.com/7.x/adventurer/svg?seed=Thorne"
  }'
```

Expected Response (201 Created):
```json
{
  "id": "uuid-here",
  "user_id": "test-user-123",
  "name": "Thorne Blacksmith",
  "race": "Dwarf",
  "class": "Fighter",
  "background": "Soldier",
  "alignment": "Lawful Neutral",
  "level": 1,
  "experience": 0,
  "hp": 12,
  "armor_class": 18,
  "created_at": "2025-10-22T20:23:03.327Z"
}
```

### 3. Create Character - Minimal Required Fields

```bash
curl -X POST "http://localhost:3001/api/characters" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User-Id: test-user-456" \
  -d '{
    "name": "Elara Moonwhisper",
    "race": "Elf",
    "class": "Wizard",
    "background": "Sage",
    "alignment": "Neutral Good"
  }'
```

### 4. Get All Characters for User

```bash
curl -X GET "http://localhost:3001/api/characters" \
  -H "X-Mock-User-Id: test-user-123"
```

Expected Response:
```json
{
  "characters": [
    {
      "id": "uuid-1",
      "name": "Thorne Blacksmith",
      "race": "Dwarf",
      "class": "Fighter",
      "level": 1,
      "hp": 12
    }
  ]
}
```

### 5. Get Specific Character

```bash
curl -X GET "http://localhost:3001/api/characters/{character-id}" \
  -H "X-Mock-User-Id: test-user-123"
```

### 6. Update Character

```bash
curl -X PUT "http://localhost:3001/api/characters/{character-id}" \
  -H "Content-Type: application/json" \
  -H "X-Mock-User-Id: test-user-123" \
  -d '{
    "hp": 11,
    "experience": 250,
    "level": 2
  }'
```

### 7. Delete Character

```bash
curl -X DELETE "http://localhost:3001/api/characters/{character-id}" \
  -H "X-Mock-User-Id: test-user-123"
```

Expected Response (204 No Content)

## Test Suite - All Tests in Sequence

Run this complete test suite to verify character creation flow:

```bash
#!/bin/bash

# Enable mock mode
export AUTH_MODE=mock
export NODE_ENV=development

BASE_URL="http://localhost:3001"
MOCK_USER="test-user-$(date +%s)"
MOCK_HEADER="X-Mock-User-Id: $MOCK_USER"

echo "=== Test 1: Create Character ==="
RESPONSE=$(curl -s -X POST "$BASE_URL/api/characters" \
  -H "Content-Type: application/json" \
  -H "$MOCK_HEADER" \
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
    "skills": ["Athletics"],
    "portrait_url": "https://api.dicebear.com/7.x/adventurer/svg?seed=Thorne"
  }')

echo "$RESPONSE" | jq .
CHARACTER_ID=$(echo "$RESPONSE" | jq -r '.id')
echo "Created character: $CHARACTER_ID"

echo -e "\n=== Test 2: Retrieve Character ==="
curl -s -X GET "$BASE_URL/api/characters/$CHARACTER_ID" \
  -H "$MOCK_HEADER" | jq .

echo -e "\n=== Test 3: List Characters ==="
curl -s -X GET "$BASE_URL/api/characters" \
  -H "$MOCK_HEADER" | jq .

echo -e "\n=== Test 4: Update Character ==="
curl -s -X PUT "$BASE_URL/api/characters/$CHARACTER_ID" \
  -H "Content-Type: application/json" \
  -H "$MOCK_HEADER" \
  -d '{
    "hp": 10,
    "experience": 100,
    "level": 2
  }' | jq .

echo -e "\n=== Test 5: Delete Character ==="
curl -s -X DELETE "$BASE_URL/api/characters/$CHARACTER_ID" \
  -H "$MOCK_HEADER"

echo -e "\n=== Test Complete ==="
```

Save this as `test-character-api.sh`, make it executable with `chmod +x`, and run it:

```bash
./test-character-api.sh
```

## Environment Configuration

### Local Development (.env)
```
AUTH_MODE=mock
NODE_ENV=development
```

### Production (.env.production)
```
AUTH_MODE=strict
NODE_ENV=production
```

## Troubleshooting

### Getting "Unauthorized" Errors
- Verify `AUTH_MODE=mock` is set and backend is restarted
- Check that you're including the `X-Mock-User-Id` header
- Ensure you're NOT in production mode

### Getting "Invalid Schema" Errors
- Check all required fields are present (name, race, class, background, alignment)
- Verify ability scores are all numbers
- Check that stats are within valid D&D 5e ranges (3-18 after modifiers)

### Getting "Database Connection" Errors
- Verify Supabase credentials are configured in `.env`
- Ensure database migrations are applied (`/api/admin/migrations/status`)
- Check that the character table exists in Supabase

## Performance Notes

- Character creation typically completes in 100-300ms
- Name generation adds 200-500ms if LLM is enabled
- Mock mode bypasses all auth overhead (~50ms savings)

## Notes for Production

When deploying to production:
- ALWAYS set `AUTH_MODE=strict` to enforce JWT validation
- NEVER enable mock auth in production
- ALWAYS set `NODE_ENV=production`
- Use real Supabase JWT tokens for authentication
