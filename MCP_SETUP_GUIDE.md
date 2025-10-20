# MCP Server Setup Guide

## Available MCP Servers

### 1. Official Supabase MCP Server
**Package:** `@supabase/mcp-server-supabase`
**Purpose:** Database operations, migrations, table management, SQL queries
**Version:** 0.5.6 (latest)

**Tools Available:**
- `list_tables` - List all database tables
- `execute_sql` - Run SQL queries
- `apply_migration` - Create database migrations
- `list_migrations` - View migration history
- `get_logs` - Fetch service logs
- `generate_typescript_types` - Generate TypeScript types from schema
- `list_edge_functions`, `deploy_edge_function` - Manage Edge Functions

### 2. Nuaibria World MCP Server (Custom)
**Package:** `@nuaibria/world-mcp-server` (local)
**Purpose:** World-building queries for lore, deities, NPCs, locations
**Version:** 1.0.0

**Tools Available:**
- `get_world_lore` - Fetch myths, legends, prophecies
- `get_deity` - Deity information
- `list_deities` - All deities with filtering
- `get_race_lore` - Cultural history
- `get_historical_timeline` - Chronological events
- `get_location` - Location details
- `list_locations_nearby` - Geography queries
- `get_region` - World region info

---

## Configuration for Claude Code

**Location:** `/srv/nuaibria/.mcp.json`

Already configured! Both servers are active in Claude Code.

---

## Configuration for Gemini

### Option 1: Gemini Desktop App
1. Open Gemini Desktop
2. Settings → MCP Servers
3. Click "Add Server"
4. Copy config from `/srv/nuaibria/mcp-config-shared.json`

### Option 2: Gemini CLI
**Location:** `~/.config/gemini-cli/mcp-servers.json`

```bash
# Create config directory
mkdir -p ~/.config/gemini-cli

# Copy shared config
cp /srv/nuaibria/mcp-config-shared.json ~/.config/gemini-cli/mcp-servers.json
```

### Option 3: Project-Specific Gemini Config
Create `.gemini-mcp.json` in project root:

```bash
cd /srv/nuaibria
ln -s mcp-config-shared.json .gemini-mcp.json
```

---

## Testing MCP Servers

### Test Supabase MCP
```bash
npx -y @supabase/mcp-server-supabase \
  --project-ref muhlitkerrjparpcuwmc \
  --access-token sbp_f9581598addda227e03f078cdabb83035b3d4fa3
```

### Test Nuaibria World MCP
```bash
cd /srv/nuaibria/mcp-server-nuaibria
node dist/index.js
```

Both should output: `[Server Name] running on stdio`

---

## Example Usage

### From Claude Code (Already Working!)
```
User: "List all tables in Nuaibria database"
Claude: *Uses mcp__supabase__list_tables*

User: "Tell me about The Chronicler deity"
Claude: *Uses nuaibria-world get_deity tool*
```

### From Gemini (After Configuration)
```
User: "Query the world_lore table for creation myths"
Gemini: *Uses Supabase MCP to execute SQL*

User: "What races exist in Nuaibria?"
Gemini: *Uses Nuaibria World MCP to list race lore*
```

---

## Troubleshooting

### MCP Server Not Showing Up
1. Check config file location (varies by client)
2. Verify Node.js is installed
3. Test server manually (see Testing section)
4. Check client logs for MCP initialization errors

### Permission Errors
- Ensure MCP server files are executable
- Check SUPABASE_SERVICE_KEY is set correctly
- Verify network access to Supabase

### Nuaibria World MCP Not Found
```bash
# Rebuild if needed
cd /srv/nuaibria/mcp-server-nuaibria
npm run build
```

---

## Security Notes

⚠️ **IMPORTANT:**
- The shared config contains service keys - keep it secure
- Never commit mcp-config-shared.json to public repos
- Service key has full database access
- Access token can manage Supabase project

Add to `.gitignore`:
```
mcp-config-shared.json
.gemini-mcp.json
```
