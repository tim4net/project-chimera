/**
 * POI Discovery Service (ADR-015)
 * Generates AI-powered content for Points of Interest on first discovery
 */

import type { CharacterRecord } from '../types';
import { supabaseServiceClient } from './supabaseClient';
import { getModel } from './gemini';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export interface POIContent {
  description: string;
  atmosphere: string;
  inhabitants: POINpc[];
  creatures: POICreature[];
  quests: POIQuest[];
  secrets: string[];
  treasures: string[];
}

export interface POINpc {
  name: string;
  role: string; // 'merchant', 'quest_giver', 'guard', etc.
  disposition: 'friendly' | 'neutral' | 'hostile';
  dialogue: string;
}

export interface POICreature {
  type: string;
  count: number;
  cr: number;
  behavior: string; // 'hostile', 'defensive', 'neutral'
}

export interface POIQuest {
  title: string;
  description: string;
  rewardXp: number;
  rewardGold: number;
}

// ============================================================================
// POI DISCOVERY
// ============================================================================

/**
 * Discover and generate content for a POI
 */
export async function discoverPOI(
  characterId: string,
  poiId: string,
  poiType: string,
  poiName: string,
  biome: string
): Promise<{ success: boolean; content?: POIContent; message: string }> {
  // Check if already discovered
  const { data: existingPOI } = await supabaseServiceClient
    .from('world_pois')
    .select('generated_content, discovered_by_characters, first_discovered_at')
    .eq('id', poiId)
    .single();

  if (existingPOI?.discovered_by_characters?.includes(characterId)) {
    // Already discovered - return existing content
    return {
      success: true,
      content: existingPOI.generated_content,
      message: 'You return to a familiar location.',
    };
  }

  // Fetch character for context
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (!character) {
    return { success: false, message: 'Character not found' };
  }

  // Generate content with Gemini
  const content = await generatePOIContent(
    poiType,
    poiName,
    biome,
    character as CharacterRecord
  );

  // Store content in database
  const updateData: any = {
    generated_content: content,
    discovered_by_characters: [...(existingPOI?.discovered_by_characters || []), characterId],
  };

  if (!existingPOI?.first_discovered_at) {
    updateData.first_discovered_at = new Date().toISOString();
  }

  await supabaseServiceClient
    .from('world_pois')
    .update(updateData)
    .eq('id', poiId);

  // Create NPCs in database (with error handling)
  const npcInserts = content.inhabitants.map(npc => ({
    name: npc.name,
    occupation: npc.role,
    disposition: npc.disposition,
    dialogue_snippets: [npc.dialogue],
    location_id: poiId,
    campaign_seed: character.campaign_seed,
  }));

  if (npcInserts.length > 0) {
    const { error: npcError } = await supabaseServiceClient
      .from('npcs')
      .insert(npcInserts);

    if (npcError) {
      console.error('[POIDiscovery] Failed to create NPCs:', npcError);
      // Continue - POI still discovered even if NPCs fail
    }
  }

  // Create journal entry for discovery
  await supabaseServiceClient
    .from('journal_entries')
    .insert({
      character_id: characterId,
      entry_type: 'discovery',
      content: `Discovered: ${poiName}. ${content.description}`,
      metadata: {
        poiId,
        poiType,
        biome,
      },
    });

  return {
    success: true,
    content,
    message: `You discover ${poiName}!`,
  };
}

/**
 * Generate POI content using Gemini Flash
 */
async function generatePOIContent(
  poiType: string,
  poiName: string,
  biome: string,
  character: CharacterRecord
): Promise<POIContent> {
  try {
    const model = await getModel('flash');

    const prompt = `You are The Chronicler, generating content for a D&D 5e location discovery.

LOCATION:
- Name: ${poiName}
- Type: ${poiType}
- Biome: ${biome}

CHARACTER DISCOVERING IT:
- Level: ${character.level}
- Class: ${character.class}

Generate unique, interesting content for this location. Respond with ONLY a JSON object:

{
  "description": "2-3 vivid sentences describing what the character sees",
  "atmosphere": "Mood, sounds, smells - immersive details",
  "inhabitants": [
    {"name": "NPC Name", "role": "merchant/guard/elder", "disposition": "friendly/neutral/hostile", "dialogue": "What they say when approached"}
  ],
  "creatures": [
    {"type": "Monster name", "count": 1-3, "cr": ${Math.max(0.125, character.level * 0.3)}, "behavior": "hostile/defensive/neutral"}
  ],
  "quests": [
    {"title": "Quest Name", "description": "What needs doing", "rewardXp": ${50 * character.level}, "rewardGold": ${20 * character.level}}
  ],
  "secrets": ["Hidden lore or clues about the world"],
  "treasures": ["Items or valuables that might be found"]
}

GUIDELINES:
- Dungeons: Usually hostile creatures, treasures, maybe 1 quest
- Villages: Friendly NPCs, merchants, 1-2 quests, no creatures
- Ruins: Mix of creatures and secrets, ancient lore
- Shrines: Peaceful, lore-heavy, maybe a guardian
- Scale difficulty to character level (currently ${character.level})
- Keep it concise but evocative
- 0-2 quests maximum
- For dangerous locations, include creatures appropriate to CR ${Math.max(0.125, character.level * 0.5)}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Parse JSON
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in response');
    }

    const parsed = JSON.parse(jsonMatch[0]) as POIContent;

    console.log('[POIDiscovery] Content generated:', {
      poiType,
      inhabitants: parsed.inhabitants.length,
      creatures: parsed.creatures.length,
      quests: parsed.quests.length,
    });

    return parsed;
  } catch (error) {
    console.error('[POIDiscovery] Error generating content:', error);
    // Fallback to generic content
    return generateFallbackContent(poiType, poiName);
  }
}

/**
 * Fallback content if AI fails
 */
function generateFallbackContent(poiType: string, poiName: string): POIContent {
  const content: POIContent = {
    description: `You arrive at ${poiName}, a ${poiType} in the wilderness.`,
    atmosphere: 'The air is still and quiet.',
    inhabitants: [],
    creatures: [],
    quests: [],
    secrets: [],
    treasures: [],
  };

  if (poiType === 'village') {
    content.inhabitants.push({
      name: 'Village Elder',
      role: 'quest_giver',
      disposition: 'friendly',
      dialogue: 'Welcome, traveler. How can I help you?',
    });
  }

  if (poiType === 'dungeon' || poiType === 'ruins') {
    content.creatures.push({
      type: 'Goblin',
      count: 2,
      cr: 0.25,
      behavior: 'hostile',
    });
  }

  return content;
}
