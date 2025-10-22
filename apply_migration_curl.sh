#!/bin/bash
################################################################################
# Apply POI Type Migration Using Supabase PostgREST API
################################################################################

set -e

# Load environment variables
source /srv/project-chimera/.env

echo "=================================================================================="
echo "POI Type Enum Migration - Automated Application"
echo "=================================================================================="
echo ""

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo "ERROR: Missing SUPABASE_URL or SUPABASE_SERVICE_KEY in .env"
  exit 1
fi

echo "Target: $SUPABASE_URL"
echo ""

# Read migration SQL
MIGRATION_SQL=$(cat /srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql)

# Try using PostgREST rpc endpoint (if custom function exists)
echo "Attempting to apply migration via Supabase API..."
echo ""

# Note: This requires a custom RPC function to be created in Supabase
# If this fails, you must use the web console method

RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_raw_sql" \
  -H "apikey: ${SUPABASE_SERVICE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"sql\": $(echo "$MIGRATION_SQL" | jq -Rs .)}" )

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 200 ]; then
  echo "✓ Migration applied successfully!"
  echo "Response: $BODY"
  echo ""
  echo "Next steps:"
  echo "  1. Restart backend: podman compose restart backend"
  echo "  2. Monitor logs: podman compose logs -f backend"
  exit 0
elif [ "$HTTP_CODE" -eq 404 ]; then
  echo "⚠ RPC function 'exec_raw_sql' not found (this is expected)"
  echo ""
  echo "The Supabase REST API does not support direct SQL execution."
  echo "You must use the Supabase Web Console SQL Editor instead."
  echo ""
  echo "INSTRUCTIONS:"
  echo "============="
  echo ""
  echo "1. Open the Supabase SQL Editor:"
  echo "   https://supabase.com/dashboard/project/muhlitkerrjparpcuwmc/sql/new"
  echo ""
  echo "2. Copy the migration SQL from:"
  echo "   /srv/project-chimera/backend/migrations/20251021_ensure_world_pois_text_type.sql"
  echo ""
  echo "3. Or read the file with:"
  echo "   cat /srv/project-chimera/APPLY_MIGRATION_INSTRUCTIONS.txt"
  echo ""
  echo "4. Paste the SQL into the editor and click 'Run'"
  echo ""
  echo "5. Restart backend:"
  echo "   podman compose restart backend"
  echo ""
  exit 1
else
  echo "✗ Unexpected response (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
  echo ""
  echo "Please use the manual web console method:"
  echo "  cat /srv/project-chimera/APPLY_MIGRATION_INSTRUCTIONS.txt"
  exit 1
fi
