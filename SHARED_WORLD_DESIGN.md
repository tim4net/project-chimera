# Shared Persistent World - Design

## The Vision

**One living, breathing world where all characters exist together:**
- Everyone explores the same procedurally generated world
- Famous characters become known to others
- Players can group up for adventures
- NPC interactions affect the whole world
- World evolves based on collective player actions

---

## Implementation Plan

### Phase 1: Single Shared Campaign Seed

**Change:** All characters use the same `campaign_seed`

```sql
-- Instead of unique seeds per character:
-- Old: campaign_seed = "c13fae45-677d-4351..."
-- New: campaign_seed = "nuaibria_world_01"

-- All characters:
campaign_seed = 'nuaibria_world_01'
```

**Impact:**
- Same chunks generate for everyone
- chunk(0,0) is the same village for all
- chunk(5,3) is the same forest for everyone
- Deterministic = consistent shared world

### Phase 2: Character Positions in Shared World

**Each character tracks:**
```typescript
{
  chunk_x: number,      // Which chunk they're in
  chunk_y: number,
  position_x: number,   // Local position in chunk
  position_y: number,
  campaign_seed: 'nuaibria_world_01'  // SAME for all
}
```

**Characters can be:**
- In same chunk (nearby, can meet)
- In different chunks (far apart)
- Moving toward each other

---

## World Structure

### Shared Regions

```
         Unexplored
              |
    Forest  Village  Plains
      |       |        |
  Mountains Center  Desert
      |       |        |
    Ocean   Swamp   Badlands
              |
         Unexplored
```

**Known Locations (shared by all):**
- **Wayward Hamlet** - chunk(0,0) - Starting village
- **Dark Forest** - chunk(0,1) - North of village
- **Trading Post** - chunk(2,0) - Eastern settlement
- **Ancient Ruins** - chunk(-1,2) - Northwest mysteries
- **Dragon's Teeth Mountains** - chunk(3,3) - Dangerous peaks

**Everyone sees the same world!**

---

## Fame & Renown System

### Character Achievements Broadcast

**When a character does something notable:**

```typescript
// Character slays dragon in chunk(5,5)
await recordAchievement({
  characterId: 'char_123',
  type: 'dragon_slain',
  location: { chunk_x: 5, chunk_y: 5 },
  timestamp: now,
});

// Other characters hear about it:
The Chronicler: "Word reaches you of a brave warrior who
                 slew the dragon in the eastern peaks..."
```

**Renown table:**
```sql
CREATE TABLE character_renown (
  character_id UUID,
  achievement_type TEXT,
  location_chunk_x INTEGER,
  location_chunk_y INTEGER,
  fame_level INTEGER,  -- 0-100
  known_by TEXT[],     -- Array of character IDs who heard of this
  created_at TIMESTAMP
);
```

**NPCs react:**
```
Innkeeper: "Ah, you're friends with [Famous Character]!
            The one who cleared the goblin caves?"
```

---

## Grouping / Parties

### Party System

```sql
CREATE TABLE parties (
  id UUID PRIMARY KEY,
  name TEXT,
  leader_id UUID REFERENCES characters(id),
  campaign_seed TEXT,
  created_at TIMESTAMP
);

CREATE TABLE party_members (
  party_id UUID REFERENCES parties(id),
  character_id UUID REFERENCES characters(id),
  joined_at TIMESTAMP,
  PRIMARY KEY (party_id, character_id)
);
```

**Party Gameplay:**
- Share same chunk location
- Take turns in conversation with DM
- Combat together (Active Phase)
- Share quest progress
- Split loot and XP

**Chat Interface:**
```
The Chronicler (to party):
"What would you like to do?"

[Player 1]: "I scout ahead"
[Player 2]: "I'll guard the rear"

The Chronicler: "As the party moves forward..."
```

---

## NPC & World State Sharing

### Persistent World Changes

**Quest completion affects world:**
```typescript
// Character A completes "Clear Goblin Cave"
await updateWorldState({
  chunk_x: 3,
  chunk_y: 2,
  change: 'goblin_cave_cleared',
  by_character: 'char_A'
});

// Character B visits same chunk later:
The Chronicler: "The cave entrance is quiet now.
                 Someone has cleared out the goblins."
```

**NPC state shared:**
```sql
CREATE TABLE npc_state (
  npc_id UUID,
  campaign_seed TEXT,
  current_chunk_x INTEGER,
  current_chunk_y INTEGER,
  disposition TEXT,  -- friendly, hostile, dead
  quest_given_to UUID[],  -- Which characters have this quest
  last_updated TIMESTAMP
);
```

**Merchant inventory shared:**
- One merchant, one inventory
- If Character A buys rare sword, Character B can't buy it
- Merchant restock timer shared across all

---

## World Size & Density

### Massive Shared World

**Scale to support many characters:**
- **100×100 chunks** = 10,000 explorable areas
- Each chunk = 152m × 122m
- Total world = **15.2 km × 12.2 km**
- Easily supports 1000+ players

**Character density:**
- With 100 characters, average < 1 character per chunk
- Plenty of unexplored space
- Can spread out or cluster in popular areas

**Discovery:**
- Character A explores chunk(10,5) - finds ancient temple
- Tells Character B about it
- Character B travels there
- They explore together

---

## Implementation Changes Needed

### 1. Shared Campaign Seed (Immediate)

```typescript
// backend/src/routes/characters.ts
// When creating character:
const sharedCampaignSeed = 'nuaibria_world_01'; // SAME for everyone

await supabaseServiceClient
  .from('characters')
  .insert({
    ...characterData,
    campaign_seed: sharedCampaignSeed,  // Not unique!
  });
```

### 2. Update Character Creation

```typescript
// All new characters get:
campaign_seed: process.env.WORLD_SEED || 'nuaibria_world_01'

// In .env:
WORLD_SEED=nuaibria_world_01
```

### 3. Migration for Existing Characters

```sql
-- Move all existing characters to shared world
UPDATE characters
SET campaign_seed = 'nuaibria_world_01'
WHERE campaign_seed IS NULL
   OR campaign_seed NOT LIKE 'nuaibria_world_%';
```

---

## Benefits of Shared World

### Emergent Gameplay:
- "Have you been to the ruins in the north?"
- "Watch out for the bandit camp at chunk(4,-2)"
- "Join me, I'm forming a party to raid the dungeon!"

### Living World:
- NPC merchants have shared inventory
- Quest completion affects everyone
- World events (dragon attack, festival)
- Faction reputation is global

### Social Features:
- See other characters' markers on map (if nearby)
- Leave messages/signs
- Trading between characters
- Guild halls in specific chunks

### Competition & Cooperation:
- "First to slay the dragon" quests
- Shared world bosses
- Territory control (guild vs guild)
- Help each other or compete

---

## Recommendation

**Switch to shared world immediately:**
1. Set all characters to `campaign_seed = 'nuaibria_world_01'`
2. Everyone explores same chunks
3. Add party system later
4. Add renown/fame system later

**This aligns perfectly with your vision!**

---

Want me to:
1. Implement shared campaign seed now?
2. Migrate existing characters to shared world?
3. Both?

This will make the game much more social and emergent!
