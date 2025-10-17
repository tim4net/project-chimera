# Nuaibria World-Building Database Schema

## Overview
Comprehensive schema for storing the lore, history, and persistent world state of Nuaibria.

## Core World Tables

### 1. `world_lore`
Foundational stories and myths of Nuaibria
- `id` (uuid, PK)
- `category` (text) - 'creation_myth', 'historical_event', 'legend', 'prophecy'
- `title` (text)
- `content` (text) - The story/lore entry
- `era` (text) - 'ancient', 'old_empire', 'fall', 'current'
- `importance` (int) - 1-10, affects how often it's referenced
- `generated_by` (text) - 'gemini_pro', 'local_llm', 'human_authored'
- `created_at` (timestamptz)

### 2. `deities`
Gods and divine entities
- `id` (uuid, PK)
- `name` (text, unique)
- `title` (text) - "The Chronicler", "Lord of Shadows"
- `domain` (text[]) - ['knowledge', 'death', 'war']
- `alignment` (text) - 'lawful_good', 'chaotic_evil', etc.
- `description` (text) - Lore and personality
- `symbol` (text) - Description of holy symbol
- `followers` (text) - Who worships them
- `tenets` (text[]) - Core beliefs
- `is_active` (boolean) - Still has active followers
- `created_at` (timestamptz)

### 3. `races_lore`
Extended lore for each playable race
- `id` (uuid, PK)
- `race_name` (text, unique) - 'Elf', 'Dwarf', etc.
- `origin_story` (text) - Where they came from
- `culture` (text) - Customs, values, traditions
- `relations` (jsonb) - Relationships with other races
- `notable_figures` (text[]) - Historical heroes/villains
- `homeland` (text) - Geographic origin
- `lifespan` (text) - "~300 years"
- `physical_traits` (text)
- `created_at` (timestamptz)

### 4. `locations`
Persistent world locations (towns, dungeons, landmarks)
- `id` (uuid, PK)
- `name` (text)
- `location_type` (text) - 'town', 'dungeon', 'ruins', 'landmark', 'wilderness'
- `position_x` (int)
- `position_y` (int)
- `biome` (text) - 'forest', 'mountains', 'desert', etc.
- `description` (text) - AI-generated flavor text
- `history` (text) - Backstory of the location
- `size` (text) - 'small', 'medium', 'large', 'vast'
- `danger_level` (int) - 1-20
- `population` (int) - For towns/cities
- `notable_npcs` (uuid[]) - References to NPCs table
- `available_services` (text[]) - 'inn', 'blacksmith', 'temple'
- `discovered_by` (uuid[]) - Character IDs who've found it
- `campaign_seed` (text) - Which campaign this belongs to
- `metadata` (jsonb) - Flexible additional data
- `created_at` (timestamptz)

### 5. `npcs`
Non-player characters
- `id` (uuid, PK)
- `name` (text)
- `race` (text)
- `occupation` (text) - 'merchant', 'guard', 'wizard'
- `personality` (text) - AI-generated personality traits
- `backstory` (text) - Their history
- `location_id` (uuid) - FK to locations
- `disposition` (text) - 'friendly', 'neutral', 'hostile'
- `quest_giver` (boolean) - Can give quests
- `merchant` (boolean) - Sells items
- `dialogue_snippets` (text[]) - Cached AI dialogue
- `importance` (int) - 1-10, major NPCs vs background
- `is_alive` (boolean)
- `campaign_seed` (text)
- `metadata` (jsonb)
- `created_at` (timestamptz)

### 6. `factions`
Rival houses, guilds, organizations
- `id` (uuid, PK)
- `name` (text, unique)
- `faction_type` (text) - 'noble_house', 'guild', 'cult', 'military'
- `description` (text)
- `goals` (text[]) - Their objectives
- `history` (text) - Formation and past events
- `leader` (uuid) - FK to NPCs
- `headquarters_location` (uuid) - FK to locations
- `power_level` (int) - 1-10
- `resources` (text[]) - 'gold', 'armies', 'magic'
- `relations` (jsonb) - Relations with other factions
- `is_active` (boolean)
- `campaign_seed` (text)
- `created_at` (timestamptz)

### 7. `historical_events`
Major events that shaped Nuaibria
- `id` (uuid, PK)
- `name` (text)
- `event_type` (text) - 'war', 'cataclysm', 'discovery', 'founding'
- `era` (text) - When it happened
- `description` (text) - What happened
- `participants` (text[]) - Key figures/factions
- `consequences` (text) - Lasting impact
- `related_locations` (uuid[]) - FK to locations
- `related_factions` (uuid[]) - FK to factions
- `year` (int) - In-world chronology
- `is_known_to_public` (boolean) - Common knowledge vs secret
- `created_at` (timestamptz)

### 8. `quests`
Active and completed quests
- `id` (uuid, PK)
- `character_id` (uuid) - FK to characters
- `title` (text)
- `description` (text)
- `quest_type` (text) - 'radiant', 'faction', 'story_arc'
- `quest_giver` (uuid) - FK to NPCs (nullable for radiant)
- `objectives` (jsonb) - [{description, completed}]
- `rewards` (jsonb) - {xp, gold, items}
- `status` (text) - 'active', 'completed', 'failed', 'abandoned'
- `difficulty` (int) - 1-20
- `location_id` (uuid) - FK to locations
- `narrative_arc` (text) - Story connection
- `started_at` (timestamptz)
- `completed_at` (timestamptz)
- `metadata` (jsonb)

### 9. `world_regions`
Large geographic areas with distinct characteristics
- `id` (uuid, PK)
- `name` (text)
- `biome_primary` (text) - Main terrain type
- `description` (text) - AI-generated overview
- `bounds` (jsonb) - {minX, maxX, minY, maxY}
- `climate` (text) - 'temperate', 'frozen', 'desert'
- `danger_level` (int) - Average danger
- `controlling_faction` (uuid) - FK to factions (nullable)
- `notable_features` (text[]) - Unique landmarks
- `campaign_seed` (text)
- `created_at` (timestamptz)

### 10. `encounters`
Combat encounters library (reusable templates)
- `id` (uuid, PK)
- `name` (text)
- `encounter_type` (text) - 'random', 'scripted', 'boss'
- `biome` (text) - Where it can occur
- `enemies` (jsonb) - [{name, count, stats}]
- `difficulty_rating` (int) - CR equivalent
- `loot_table` (jsonb) - Possible rewards
- `description` (text) - AI-generated intro
- `tactics` (text) - How enemies behave
- `is_unique` (boolean) - Can only happen once
- `campaign_seed` (text)
- `created_at` (timestamptz)

## MCP Server Functions

### Proposed `@nuaibria/world-mcp-server` tools:

1. **`get_deity`** - Fetch deity information
2. **`list_deities`** - All deities with filtering
3. **`get_race_lore`** - Extended lore for a race
4. **`get_location`** - Location details
5. **`list_locations_nearby`** - Locations within radius
6. **`get_npc`** - NPC details with personality
7. **`generate_npc`** - Create new NPC with AI
8. **`get_faction`** - Faction information
9. **`list_historical_events`** - History timeline
10. **`get_world_lore`** - Fetch lore entries by category
11. **`generate_location`** - Procedurally create new location
12. **`get_quest`** - Quest details
13. **`generate_quest`** - AI-generated quest

### Benefits of MCP Server:
- Centralized world-building API
- Reusable across Discord bot, web app, future clients
- AI generation hooks built-in
- Caching and consistency
- Version control for lore
