# Nuaibria World-Building MCP Server

## Overview
A dedicated Model Context Protocol (MCP) server that provides tools for querying and managing Nuaibria's world-building content: lore, deities, NPCs, factions, locations, and quests.

## Server Name
`@nuaibria/world-mcp-server`

## Purpose
- Centralized world-building API accessible to any MCP client
- AI-powered content generation with caching
- Consistent lore across web app, Discord bot, and future clients
- Version-controlled world state

## Tools to Implement

### Lore & History (5 tools)
1. **`get_world_lore`** - Fetch lore entries by category/era
2. **`get_deity`** - Deity details with domains and tenets
3. **`list_deities`** - All deities with filtering
4. **`get_race_lore`** - Cultural and historical lore for a race
5. **`get_historical_timeline`** - Chronological events by era

### Geography (4 tools)
6. **`get_location`** - Location details with NPCs and services
7. **`list_locations_nearby`** - Locations within radius of coordinates
8. **`get_region`** - Region information with bounds
9. **`generate_location`** - AI-generate new location (procedural)

### Characters & Factions (5 tools)
10. **`get_npc`** - NPC with personality, dialogue, quest status
11. **`list_npcs_at_location`** - All NPCs at a location
12. **`generate_npc`** - AI-create NPC with personality
13. **`get_faction`** - Faction details with relations
14. **`list_factions`** - All factions with filtering

### Quests & Encounters (4 tools)
15. **`get_quest`** - Quest details with objectives
16. **`list_character_quests`** - All quests for a character
17. **`generate_quest`** - AI-create quest from template
18. **`get_encounter`** - Encounter template by biome/difficulty

## Technical Architecture

### Stack
- **Language**: TypeScript/Node.js
- **Framework**: MCP SDK (@modelcontextprotocol/sdk)
- **Database**: Supabase (via @supabase/supabase-js)
- **AI Integration**: Gemini Pro for high-quality, Local LLM for routine

### File Structure
```
/mcp-server-nuaibria/
  /src/
    index.ts           # MCP server entry point
    /tools/
      lore.ts          # Lore & history tools
      geography.ts     # Locations & regions
      npcs.ts          # NPC management
      factions.ts      # Faction tools
      quests.ts        # Quest management
    /services/
      supabase.ts      # Database client
      ai-generator.ts  # AI content generation
      cache.ts         # Result caching
    /types/
      world.ts         # TypeScript interfaces
  package.json
  tsconfig.json
  README.md
```

### Key Features

#### 1. AI-Powered Generation
```typescript
// Example: Generate NPC on-the-fly
generateNpc({
  location: "Shadowkeep Tavern",
  occupation: "innkeeper",
  importance: 5
})
// → Uses Gemini to create personality, backstory, dialogue
// → Caches in database for consistency
```

#### 2. Smart Caching
- Check database first
- Generate only if missing
- Store with generation metadata
- Reuse across all clients

#### 3. Campaign Isolation
- Each campaign has unique seed
- Content can be campaign-specific or shared
- Prevents cross-contamination

#### 4. Lore Consistency
- Query existing lore before generating new content
- AI generation includes world context
- Version control for retcons

## Integration Examples

### From Web App (React)
```typescript
// Fetch deity for temple
const deity = await mcpClient.callTool('get_deity', {
  name: 'The Chronicler'
});

// Generate quest at location
const quest = await mcpClient.callTool('generate_quest', {
  characterId: user.characterId,
  location: 'Ancient Ruins',
  difficulty: 8
});
```

### From Discord Bot
```typescript
// Show nearby locations
const locations = await mcpClient.callTool('list_locations_nearby', {
  x: character.position_x,
  y: character.position_y,
  radius: 5
});
```

### From Claude Code (you!)
```typescript
// Query lore while designing
const lore = await mcpClient.callTool('get_world_lore', {
  category: 'creation_myth'
});
```

## Benefits

1. **Consistency**: Same lore across all clients
2. **Performance**: Cached AI generations
3. **Extensibility**: Easy to add new tools
4. **AI-Powered**: Generate content on-demand
5. **Version Control**: Track world state changes
6. **Separation of Concerns**: World logic separate from game logic

## Next Steps
1. Initialize MCP server project
2. Set up Supabase connection
3. Implement core tools (lore, deities, locations)
4. Add AI generation pipeline
5. Test with Claude Code MCP client
6. Deploy as npm package

## Estimated Implementation Time
- Setup & scaffolding: 1 hour
- Core tools (10): 3 hours
- AI generation: 2 hours
- Testing & docs: 1 hour
**Total: ~7 hours**
