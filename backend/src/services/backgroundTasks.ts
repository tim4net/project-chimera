/**
 * @file Background Tasks Service
 *
 * Uses Local LLM (GTX 1080) for ASYNC operations where latency doesn't matter
 * - Quest template generation (overnight batch processing)
 * - POI description pre-generation
 * - Journal summarization (after session ends)
 * - NPC personality generation (background pool)
 *
 * ⚠️ CRITICAL: These tasks run asynchronously and do NOT block player interactions
 * The 4-8 second generation time of the GTX 1080 is acceptable because players aren't waiting
 */

import { generateWithLocalLLM } from './narratorLLM';
import { supabaseServiceClient } from './supabaseClient';
import { parseJsonFromResponse, validateJsonStructure } from './jsonParser';

// ============================================================================
// QUEST TEMPLATE GENERATION
// ============================================================================

export interface QuestTemplate {
  title: string;
  description: string;
  objectives: Array<{ type: string; target: string; count: number }>;
  rewards: { xp: number; gold: number };
}

/**
 * Generate quest templates using Local LLM (runs overnight)
 * Pre-generates quests to reduce API costs during gameplay
 */
export async function generateQuestTemplatesBackground(
  count: number = 20,
  levelRange: [number, number] = [1, 5]
): Promise<QuestTemplate[]> {
  console.log(`[BackgroundTasks] Generating ${count} quest templates (Local LLM)...`);
  const startTime = Date.now();

  const templates: QuestTemplate[] = [];

  for (let i = 0; i < count; i++) {
    const level = Math.floor(Math.random() * (levelRange[1] - levelRange[0] + 1)) + levelRange[0];

    const xpReward = Math.round(level * 100);
    const goldReward = Math.round(level * 50 + Math.random() * 100);

    const prompt = `You are a D&D 5e quest generator. Generate a UNIQUE quest template for level ${level} characters.

CRITICAL: YOU MUST OUTPUT EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"title":"QUEST_TITLE","description":"DESCRIPTION","objectives":[{"type":"TYPE","target":"TARGET","count":COUNT}],"rewards":{"xp":${xpReward},"gold":${goldReward}}}

REQUIREMENTS FOR EACH FIELD:
- title (string): A creative, specific quest name (10-50 chars). NOT generic. Vary the style: some action-based like "Recover the Amulet", some location-based like "The Haunted Manor", some character-based like "Save the Merchant's Daughter", some mystery-based like "Investigate the Murders". NOT all "The [Adjective] [Noun]" - mix it up!
- description (string): Exactly 1-2 sentences explaining the quest hook (50-150 chars). NO markdown, NO special chars except apostrophes.
- objectives (array): Exactly 1-3 objectives. Each must have type, target, count.
  * type (string): MUST be exactly one of: "kill_enemies", "reach_location", "collect_items", "escort_npc", "investigate"
  * target (string): Specific enemy/location/item name (10-40 chars)
  * count (number): How many (integer 1-50)
- rewards: xp = ${xpReward}, gold = ${goldReward} (MUST match these exact values)

INVALID OUTPUT EXAMPLES (DO NOT DO THESE):
- {"title":"A Generic Quest"...} - WRONG: Generic title
- {"description":"Kill 10 rats in the cellar. Then...", ...} - WRONG: More than 2 sentences
- {"objectives":[{"type":"kill","target":"rats"...}]} - WRONG: type must be "kill_enemies" exactly
- \`\`\`json {...}\`\`\` - WRONG: Don't use code blocks
- {"title":"Quest's Name"...} - WRONG: Quotes inside strings not escaped

VALID OUTPUT EXAMPLES (show variety in title styles):
1. {"title":"The Shadow in Millhaven Woods","description":"Strange tracks near the mill suggest a predator stalking livestock. The fearful farmers offer gold for answers.","objectives":[{"type":"investigate","target":"Millhaven Woods","count":1},{"type":"kill_enemies","target":"Shadow Beast","count":1}],"rewards":{"xp":${xpReward},"gold":${goldReward}}}
2. {"title":"Rescue the Merchant's Daughter","description":"A merchant's daughter was kidnapped by bandits fleeing toward the old ruins. The family will reward brave heroes.","objectives":[{"type":"reach_location","target":"Bandit Hideout","count":1},{"type":"escort_npc","target":"Merchant's Daughter","count":1}],"rewards":{"xp":${xpReward},"gold":${goldReward}}}

Generate ONE UNIQUE quest. Make the title DIFFERENT from these examples. Output ONLY the JSON on a single line, nothing else:`;

    try {
      const response = await generateWithLocalLLM(prompt, { temperature: 1.0, maxTokens: 300 });

      // Use centralized JSON parser with automatic cleanup
      const parseResult = parseJsonFromResponse<QuestTemplate>(response, {
        fixCommonErrors: true,
      });

      if (!parseResult.success) {
        console.warn(`[BackgroundTasks] ⚠ Quest ${i + 1} parse failed: ${parseResult.error}`);
        continue;
      }

      const template = parseResult.data!;

      // Validate schema
      if (
        !validateJsonStructure(template, [
          'title',
          'description',
          'objectives',
          'rewards',
        ]) ||
        !template.title ||
        typeof template.title !== 'string' ||
        !template.description ||
        typeof template.description !== 'string' ||
        !Array.isArray(template.objectives) ||
        template.objectives.length === 0 ||
        !template.rewards ||
        typeof template.rewards.xp !== 'number' ||
        typeof template.rewards.gold !== 'number'
      ) {
        console.warn(`[BackgroundTasks] ⚠ Quest ${i + 1} schema validation failed`);
        continue;
      }

      templates.push(template);
      console.log(`[BackgroundTasks] ✅ Generated quest: "${template.title}"`);
    } catch (error) {
      console.error(`[BackgroundTasks] Failed to generate quest ${i + 1}:`, error);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[BackgroundTasks] Generated ${templates.length}/${count} quests in ${duration}s`);

  return templates;
}

// ============================================================================
// POI DESCRIPTION PRE-GENERATION
// ============================================================================

export interface POIDescription {
  type: string;
  name: string;
  description: string;
  encounter_chance: number;
}

/**
 * Pre-generate POI descriptions for common location types
 * Stores in database for instant retrieval during gameplay
 */
export async function generatePOIDescriptionsBackground(
  campaign_seed: string,
  count: number = 50
): Promise<POIDescription[]> {
  console.log(`[BackgroundTasks] Generating ${count} POI descriptions (Local LLM)...`);
  const startTime = Date.now();

  const poiTypes = ['village', 'ruin', 'cave', 'shrine', 'camp', 'tower', 'grove', 'bridge'];
  const descriptions: POIDescription[] = [];

  for (let i = 0; i < count; i++) {
    const poiType = poiTypes[Math.floor(Math.random() * poiTypes.length)];

    const prompt = `You are a D&D 5e location descriptor. Create a mysterious ${poiType} point of interest.

CRITICAL: YOU MUST OUTPUT EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"type":"${poiType}","name":"THE_NAME","description":"DESCRIPTION","encounter_chance":0.3}

REQUIREMENTS FOR EACH FIELD:
- type (string): MUST be exactly "${poiType}"
- name (string): A mystical location name (5-40 chars). Format: "The [Adjective] [Noun]" or "[Name] of [Place]". Examples: "The Shattered Tower", "The Moonlit Grove", "Raven's Crypt", "The Bone Merchant's Stall". NO generic names like "The Place" or "Unknown Location".
- description (string): Exactly 2-3 sentences of atmospheric description (80-200 chars). Evoke mood, not mechanics. NO stats or rules. NO markdown formatting.
- encounter_chance (number): MUST be 0.3 (exactly)

INVALID OUTPUT EXAMPLES (DO NOT DO THESE):
- {"type":"ruins"...} - WRONG: Wrong type value
- {"description":"A place. It has things. You enter."...} - WRONG: Less than 2 sentences
- {"name":"The Long Description Of A Place With Many Words"...} - WRONG: Name too long
- \`\`\`json {...}\`\`\` - WRONG: Don't use code blocks
- {"description":"2 sentences. More stuff. And more stuff."...} - WRONG: More than 3 sentences

VALID OUTPUT EXAMPLE:
{"type":"${poiType}","name":"The Widow's Lantern","description":"An ancient stone structure stands weathered and defiant against constant wind. Strange lights flicker within at dusk, though no living soul dwells here. Local herders fear its curse.","encounter_chance":0.3}

Generate ONE unique ${poiType} now. Output ONLY the JSON on a single line, nothing else:`;

    try {
      const response = await generateWithLocalLLM(prompt, { temperature: 0.9, maxTokens: 200 });

      // Use centralized JSON parser
      const parseResult = parseJsonFromResponse<POIDescription>(response, {
        fixCommonErrors: true,
      });

      if (!parseResult.success) {
        console.warn(`[BackgroundTasks] ⚠ POI ${i + 1} parse failed: ${parseResult.error}`);
        continue;
      }

      const poi = parseResult.data!;

      // Validate schema
      if (
        !validateJsonStructure(poi, [
          'type',
          'name',
          'description',
          'encounter_chance',
        ]) ||
        poi.type !== poiType ||
        !poi.name ||
        !poi.description ||
        typeof poi.encounter_chance !== 'number'
      ) {
        console.warn(`[BackgroundTasks] ⚠ POI ${i + 1} schema validation failed`);
        continue;
      }

      descriptions.push(poi);

      // Store in database
      await supabaseServiceClient.from('world_pois').insert({
        campaign_seed,
        name: poi.name,
        type: poi.type,
        description: poi.description,
        position: { x: 0, y: 0 }, // Will be placed by world generator
        discovered: false,
      });

      console.log(`[BackgroundTasks] ✅ Generated POI: "${poi.name}"`);
    } catch (error) {
      console.error(`[BackgroundTasks] Failed to generate POI ${i + 1}:`, error);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[BackgroundTasks] Generated ${descriptions.length}/${count} POIs in ${duration}s`);

  return descriptions;
}

// ============================================================================
// JOURNAL SUMMARIZATION
// ============================================================================

/**
 * Summarize a player session into a journal entry (runs after logout)
 * Players see the summary next time they log in
 */
export async function summarizeSessionBackground(
  characterId: string,
  messageCount: number = 20
): Promise<string | null> {
  console.log(`[BackgroundTasks] Summarizing session for ${characterId} (Local LLM)...`);

  try {
    // Fetch recent conversation
    const { data: messages, error } = await supabaseServiceClient
      .from('dm_conversations')
      .select('role, content')
      .eq('character_id', characterId)
      .order('created_at', { ascending: false })
      .limit(messageCount);

    if (error || !messages || messages.length === 0) {
      console.log('[BackgroundTasks] No messages to summarize');
      return null;
    }

    const conversation = messages
      .reverse()
      .map(m => `${m.role === 'dm' ? 'Chronicler' : 'Player'}: ${m.content}`)
      .join('\n\n');

    const prompt = `Summarize this D&D session into a brief journal entry (3-4 sentences).
Focus on key events, discoveries, and outcomes. Write in past tense, first person.

${conversation}

Journal Entry:`;

    const summary = await generateWithLocalLLM(prompt, { temperature: 0.7, maxTokens: 200 });

    // Store journal entry
    await supabaseServiceClient.from('journal_entries').insert({
      character_id: characterId,
      entry_type: 'session_summary',
      content: summary,
      metadata: { generated_by: 'background_task', message_count: messages.length },
    });

    console.log(`[BackgroundTasks] Session summary created for ${characterId}`);
    return summary;
  } catch (error) {
    console.error('[BackgroundTasks] Failed to summarize session:', error);
    return null;
  }
}

// ============================================================================
// NPC PERSONALITY GENERATION
// ============================================================================

export interface NPCPersonality {
  name: string;
  race: string;
  occupation: string;
  personality: string;
  quirk: string;
  secret: string;
}

/**
 * Generate NPC personalities in advance (background pool)
 * DM can pull from this pool instantly during gameplay
 */
export async function generateNPCPersonalitiesBackground(
  count: number = 30
): Promise<NPCPersonality[]> {
  console.log(`[BackgroundTasks] Generating ${count} NPC personalities (Local LLM)...`);
  const startTime = Date.now();

  const personalities: NPCPersonality[] = [];

  for (let i = 0; i < count; i++) {
    const prompt = `Generate a UNIQUE D&D NPC personality with a DISTINCT name from what you've generated before.

Choose a race FIRST to guide naming conventions:
- Human names: Aelric Dawnward, Vesper Thornfield, Rowan Stormreach
- Elf names: Elara Moonwhisper, Xanthis Silverglen, Nimue Starfall
- Dwarf names: Thorin Ironforge, Greta Stoneshaper, Brakkir Deepdelve
- Halfling names: Pip Goodbarrel, Rosie Thistlebottom, Milo Brownstone
- Tiefling names: Zara Emberfall, Kalix Nightbringer, Ashara Fadewhisper
- Orc names: Drogga Skullcleaver, Murgha Earthshaker, Gruk Bonecrusher

Return ONLY a JSON object:
{
  "name": "First Last",
  "race": "human/elf/dwarf/halfling/tiefling/orc",
  "occupation": "merchant/guard/farmer/healer/bard/sage/scout",
  "personality": "1 sentence describing demeanor",
  "quirk": "1 memorable trait or habit (must be unique and interesting)",
  "secret": "1 sentence secret or background detail"
}

Make names DIVERSE and UNIQUE. Each NPC should feel completely different.`;

    try {
      const response = await generateWithLocalLLM(prompt, { temperature: 0.95, maxTokens: 250 });

      // Extract JSON more robustly - find the first { and last }
      const openBrace = response.indexOf('{');
      const closeBrace = response.lastIndexOf('}');

      if (openBrace !== -1 && closeBrace !== -1 && closeBrace > openBrace) {
        let jsonStr = response.substring(openBrace, closeBrace + 1);

        // Try to clean up common issues with LLM output
        // Replace common problematic patterns
        jsonStr = jsonStr
          .replace(/[\u4e00-\u9fa5]/g, '') // Remove Chinese characters
          .replace(/[""]/g, '"') // Fix smart quotes
          .replace(/[\r\n]/g, ' '); // Remove newlines within JSON

        try {
          const npc = JSON.parse(jsonStr) as NPCPersonality;

          try {
            // Validate schema before using
            if (!npc.name || typeof npc.name !== 'string' ||
                !npc.occupation || typeof npc.occupation !== 'string' ||
                !npc.personality || typeof npc.personality !== 'string') {
              throw new Error('Invalid NPC schema: missing or wrong type fields');
            }

            personalities.push(npc);
            console.log(`[BackgroundTasks] Generated NPC: ${npc.name} (${npc.occupation})`);
          } catch (validateErr) {
            console.error(`[BackgroundTasks] NPC ${i + 1} schema validation failed:`, (validateErr as Error).message);
          }
        } catch (parseErr) {
          console.warn(`[BackgroundTasks] ⚠ NPC ${i + 1}: LLM returned invalid JSON (skipping, will retry) - ${(parseErr as Error).message.substring(0, 60)}`);
        }
      }
    } catch (error) {
      console.warn(`[BackgroundTasks] ⚠ NPC ${i + 1}: Generation failed (skipping, will retry) - ${error instanceof Error ? error.message.substring(0, 60) : String(error).substring(0, 60)}`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[BackgroundTasks] Generated ${personalities.length}/${count} NPCs in ${duration}s`);

  return personalities;
}

// ============================================================================
// ENCOUNTER GENERATION (Combat-ready adversary groups)
// ============================================================================

export interface CombatEncounter {
  name: string;
  description: string;
  challenge_rating: number;
  enemies: Array<{
    name: string;
    type: string; // goblin, bandit, wolf, etc
    hp: number;
    ac: number;
    attack_bonus: number;
    damage_dice: string; // e.g. "1d6+2"
    special_abilities?: string;
  }>;
  loot_tier: string; // minimal, standard, rich
  location_type: string; // forest, dungeon, cave, ruins
}

/**
 * Generate combat encounters with full stat blocks
 * Pre-generates encounters for quick spawning during gameplay
 */
export async function generateCombatEncountersBackground(
  count: number = 20,
  crRange: [number, number] = [1, 5]
): Promise<CombatEncounter[]> {
  console.log(`[BackgroundTasks] Generating ${count} combat encounters (CR ${crRange[0]}-${crRange[1]})...`);
  const startTime = Date.now();

  const encounters: CombatEncounter[] = [];
  const locationTypes = ['forest', 'cave', 'ruins', 'dungeon', 'road', 'swamp'];
  const encounterTypes = [
    { type: 'goblin', cr: 0.25, hp: 7, ac: 15, attack: 4, damage: '1d6+2' },
    { type: 'bandit', cr: 0.125, hp: 11, ac: 12, attack: 3, damage: '1d6+1' },
    { type: 'wolf', cr: 0.25, hp: 11, ac: 13, attack: 4, damage: '2d4+2' },
    { type: 'skeleton', cr: 0.25, hp: 13, ac: 13, attack: 4, damage: '1d6+2' },
    { type: 'zombie', cr: 0.25, hp: 22, ac: 8, attack: 3, damage: '1d6+1' },
    { type: 'orc', cr: 0.5, hp: 15, ac: 13, attack: 5, damage: '1d12+3' },
    { type: 'gnoll', cr: 0.5, hp: 22, ac: 15, attack: 4, damage: '1d8+2' },
  ];

  for (let i = 0; i < count; i++) {
    const cr = Math.random() * (crRange[1] - crRange[0]) + crRange[0];
    const locationType = locationTypes[Math.floor(Math.random() * locationTypes.length)];

    // Pick appropriate enemy types for CR
    const suitableEnemies = encounterTypes.filter(e => e.cr <= cr);
    const primaryEnemy = suitableEnemies[Math.floor(Math.random() * suitableEnemies.length)];

    // Determine group size based on CR
    const groupSize = Math.max(1, Math.floor(cr / primaryEnemy.cr));

    const prompt = `Generate a UNIQUE D&D 5e combat encounter description.

CRITICAL: Output EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"name":"ENCOUNTER_NAME","description":"DESCRIPTION","enemies":[{"name":"NAME","type":"${primaryEnemy.type}","hp":${primaryEnemy.hp},"ac":${primaryEnemy.ac},"attack_bonus":${primaryEnemy.attack},"damage_dice":"${primaryEnemy.damage}","special_abilities":"ABILITY"}],"loot_tier":"minimal/standard/rich"}

ENCOUNTER NAMING - CREATE VARIETY (NOT all "The X"):
Mix these naming styles:
- Tactical: "Goblin Ambush at Dead Oak", "Bandit Trap on King's Road", "Skeleton Guard Post"
- Location-based: "Wolves in Thornwood Pass", "Orc War Party at River Ford", "Undead in the Crypt"
- Tactical descriptive: "Coordinated Flanking Attack", "Ambush from Concealment", "Frontal Siege Formation"
- Enemy-focused: "Berserker's Last Stand", "Lich's Undead Guardians", "Cult Assassins in Darkness"
- Mysterious: "The Darkwood Threat", "Shadows on the Trail", "Curse of the Lost Temple"

REQUIREMENTS:
- name (string): Creative, specific encounter name (15-50 chars). NOT all "X Encounter" - vary the style!
- description (string): 2-3 sentences with terrain, atmosphere, and tactical positioning
- enemies (array): Exactly ${groupSize} enemy objects with name, type, hp, ac, attack_bonus, damage_dice, special_abilities
- Each enemy must have a DISTINCT memorable name (not generic)
- loot_tier: "minimal", "standard", or "rich"

Location: ${locationType}
Enemy Type: ${groupSize}x ${primaryEnemy.type}
Challenge Rating: ${cr.toFixed(1)}

VALID EXAMPLES (show variety):
1. {"name":"Goblin Ambush at Dead Oak","description":"...","enemies":[...],"loot_tier":"minimal"}
2. {"name":"Wolves in Thornwood Pass","description":"...","enemies":[...],"loot_tier":"standard"}
3. {"name":"The Darkwood Threat","description":"...","enemies":[...],"loot_tier":"standard"}

Generate ONE UNIQUE encounter. Output ONLY JSON on a single line, nothing else:`;

    try {
      const response = await generateWithLocalLLM(prompt, { temperature: 1.0, maxTokens: 400 });

      // Use centralized parser with improved quote handling and brace-aware extraction
      const parseResult = parseJsonFromResponse<CombatEncounter>(response, {
        fixCommonErrors: true,
        debug: false,
      });

      if (!parseResult.success) {
        console.warn(`[BackgroundTasks] ⚠ Encounter ${i + 1}: Parse failed: ${parseResult.error}`);
        continue;
      }

      const parsed = parseResult.data!;

      try {
        // Validate schema before using
        if (!parsed.name || typeof parsed.name !== 'string' ||
            !parsed.description || typeof parsed.description !== 'string' ||
            !Array.isArray(parsed.enemies) || parsed.enemies.length === 0) {
          throw new Error('Invalid encounter schema: missing name, description, or enemies array');
        }

        // Validate enemies have required fields
        for (const enemy of parsed.enemies) {
          if (!enemy || typeof enemy !== 'object' || !enemy.name || !enemy.type || typeof enemy.hp !== 'number') {
            throw new Error('Invalid enemy in encounter: missing name, type, or hp');
          }
        }

        // Build full encounter with proper typing
        const encounter: CombatEncounter = {
          name: parsed.name,
          description: parsed.description,
          challenge_rating: cr,
          enemies: parsed.enemies,
          loot_tier: parsed.loot_tier || 'standard',
          location_type: locationType,
        };

        encounters.push(encounter);
        console.log(`[BackgroundTasks] Generated encounter: "${encounter.name}" (${encounter.enemies.length} enemies, CR ${cr.toFixed(1)})`);
      } catch (validateErr: any) {
        console.error(`[BackgroundTasks] Encounter ${i + 1} schema validation failed: ${validateErr.message}`);
      }
    } catch (error) {
      console.warn(`[BackgroundTasks] ⚠ Encounter ${i + 1}: Generation failed (skipping, will retry)`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[BackgroundTasks] Generated ${encounters.length}/${count} encounters in ${duration}s`);

  return encounters;
}

/**
 * Generate dungeon/lair content with rooms and encounters
 * Pre-generates mini-dungeons for exploration content
 */
export async function generateDungeonContentBackground(
  count: number = 5
): Promise<Array<{ name: string; description: string; rooms: number }>> {
  console.log(`[BackgroundTasks] Generating ${count} dungeon layouts...`);
  const startTime = Date.now();

  const dungeons: Array<{ name: string; description: string; rooms: number }> = [];

  for (let i = 0; i < count; i++) {
    const roomCount = Math.floor(Math.random() * 3) + 3; // 3-5 rooms

    const prompt = `Generate a small D&D dungeon/lair layout with ${roomCount} rooms.

CRITICAL: You MUST output EXACTLY this JSON format with NO markdown, NO code blocks, NO extra text:
{"name":"DUNGEON_NAME","description":"DESCRIPTION","rooms":[{"room_number":1,"description":"ROOM_DESC","encounter":"ENCOUNTER","loot":"LOOT"}]}

DUNGEON NAMING - CREATE VARIETY (NOT all "The X"):
Mix these naming styles:
- Location-based: "The Forgotten Crypt", "Caverns of the Lost King", "Sunken Vault"
- Descriptor-based: "Whispered Keep", "Silent Tombs", "Cursed Halls"
- Owner/function: "Lich's Tower", "Assassin's Nest", "Treasure Vault"
- Mysterious: "The Deep Below", "Shattered Spire", "Broken Citadel"

REQUIREMENTS:
- name (string): Creative, specific dungeon name (10-40 chars). NOT all "The [Adjective] [Noun]" - vary the style!
- description (string): 2-3 sentences about history/appearance (60-150 chars). NO markdown.
- rooms (array): Exactly ${roomCount} room objects with room_number, description, encounter, loot

INVALID EXAMPLES (DO NOT):
- {"name":"The Whispering Cave"} - WRONG: If last dungeon used similar "The X" pattern
- {"name":"A Dungeon"} - WRONG: Too generic
- \`\`\`json {...}\`\`\` - WRONG: Don't use code blocks

VALID EXAMPLES (show variety):
1. {"name":"Lich's Tower","description":"...","rooms":[...]}
2. {"name":"Sunken Vault","description":"...","rooms":[...]}
3. {"name":"The Lost Temple","description":"...","rooms":[...]}

Generate ONE UNIQUE dungeon. Output ONLY JSON on a single line, nothing else:`;

    try {
      const response = await generateWithLocalLLM(prompt, { temperature: 1.0, maxTokens: 600 });

      // Use centralized parser with improved quote handling and brace-aware extraction
      const parseResult = parseJsonFromResponse<any>(response, {
        fixCommonErrors: true,
        debug: false,
      });

      if (!parseResult.success) {
        console.warn(`[BackgroundTasks] ⚠ Dungeon ${i + 1}: Parse failed: ${parseResult.error}`);
        continue;
      }

      const dungeon = parseResult.data!;

      try {
        // Validate schema before using
        if (!dungeon.name || typeof dungeon.name !== 'string' ||
            !dungeon.description || typeof dungeon.description !== 'string' ||
            !Array.isArray(dungeon.rooms) || dungeon.rooms.length === 0) {
          throw new Error('Invalid dungeon schema: missing name, description, or rooms array');
        }

        dungeons.push({
          name: dungeon.name,
          description: dungeon.description,
          rooms: dungeon.rooms.length,
        });

        console.log(`[BackgroundTasks] Generated dungeon: "${dungeon.name}" (${dungeon.rooms.length} rooms)`);
      } catch (validateErr) {
        console.error(`[BackgroundTasks] Dungeon ${i + 1} schema validation failed:`, (validateErr as Error).message);
      }
    } catch (error) {
      console.warn(`[BackgroundTasks] ⚠ Dungeon ${i + 1}: Generation failed (skipping, will retry)`);
    }
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[BackgroundTasks] Generated ${dungeons.length}/${count} dungeons in ${duration}s`);

  return dungeons;
}

// ============================================================================
// BATCH PROCESSING SCHEDULER
// ============================================================================

/**
 * Run all background tasks (designed to run at 2-3am when server is idle)
 */
export async function runNightlyBackgroundTasks(): Promise<void> {
  console.log('[BackgroundTasks] ========================================');
  console.log('[BackgroundTasks] Starting nightly background task batch');
  console.log('[BackgroundTasks] Time:', new Date().toISOString());
  console.log('[BackgroundTasks] ========================================');

  const startTime = Date.now();

  try {
    // Generate quest templates
    await generateQuestTemplatesBackground(50, [1, 10]);

    // Generate NPC personalities
    await generateNPCPersonalitiesBackground(50);

    // Generate POI descriptions for active campaigns
    const { data: campaigns } = await supabaseServiceClient
      .from('characters')
      .select('campaign_seed')
      .limit(10);

    if (campaigns) {
      for (const campaign of campaigns) {
        if (campaign.campaign_seed) {
          await generatePOIDescriptionsBackground(campaign.campaign_seed, 20);
        }
      }
    }

    const duration = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
    console.log(`[BackgroundTasks] ========================================`);
    console.log(`[BackgroundTasks] Nightly tasks completed in ${duration} minutes`);
    console.log(`[BackgroundTasks] ========================================`);
  } catch (error) {
    console.error('[BackgroundTasks] Error during nightly batch:', error);
  }
}
