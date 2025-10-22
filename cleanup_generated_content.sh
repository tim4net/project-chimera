#!/bin/bash

# Script to clear generated content from Supabase
# This allows testing of new LLM prompts with fresh generation

set -e

# Load environment variables
if [ ! -f .env ]; then
  echo "❌ .env file not found"
  exit 1
fi

# Extract Supabase credentials
export SUPABASE_URL=$(grep "SUPABASE_URL=" .env | cut -d '=' -f2 | tr -d '"')
export SUPABASE_ANON_KEY=$(grep "SUPABASE_ANON_KEY=" .env | cut -d '=' -f2 | tr -d '"')

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
  echo "❌ Supabase credentials not found in .env"
  exit 1
fi

echo "🧹 Clearing generated content from Supabase..."
echo "📍 URL: $SUPABASE_URL"

# Helper function to execute SQL delete via REST API
delete_table() {
  local table=$1
  local filter=$2

  echo "  Deleting from $table..."

  # Use RPC or direct table deletion
  if [ -z "$filter" ]; then
    # Delete all rows
    curl -s -X DELETE \
      "$SUPABASE_URL/rest/v1/$table" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      > /dev/null 2>&1
  else
    # Delete with filter
    curl -s -X DELETE \
      "$SUPABASE_URL/rest/v1/$table?$filter" \
      -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
      -H "Content-Type: application/json" \
      -H "Prefer: return=minimal" \
      > /dev/null 2>&1
  fi

  echo "    ✅ Cleared $table"
}

# Count function
count_rows() {
  local table=$1

  local result=$(curl -s \
    "$SUPABASE_URL/rest/v1/$table?select=count()" \
    -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
    -H "Content-Type: application/json" \
    2>/dev/null || echo "[]")

  echo "$result" | grep -oP '"count":\s*\K\d+' | head -1 || echo "0"
}

echo ""
echo "📊 Before cleanup:"
echo "  asset_requests: $(count_rows 'asset_requests') rows"
echo "  generated_images: $(count_rows 'generated_images') rows"
echo "  quest_templates: $(count_rows 'quest_templates') rows"
echo ""

echo "🗑️ Deleting rows..."
delete_table "asset_requests"
delete_table "generated_images"
delete_table "quest_templates"

# Note: Can't easily delete only descriptions from world_pois via REST without WHERE clause
# Will skip for safety - POI descriptions can be regenerated on demand

echo ""
echo "📊 After cleanup:"
echo "  asset_requests: $(count_rows 'asset_requests') rows"
echo "  generated_images: $(count_rows 'generated_images') rows"
echo "  quest_templates: $(count_rows 'quest_templates') rows"
echo ""

echo "✅ Cleanup complete!"
echo ""
echo "📌 Next steps:"
echo "  1. Restart backend: podman compose down && podman compose up -d"
echo "  2. Wait 10 seconds for backend to start"
echo "  3. Monitor logs: podman compose logs -f backend | grep -E '(✅|⚠)'"
echo "  4. Create a new character to test: http://localhost:5173/create-character"
