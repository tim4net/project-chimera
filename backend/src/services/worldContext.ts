/**
 * @file World Context - Provides environmental information for DM prompts
 *
 * Includes nearby POIs, biome information, and location details
 * so the DM can describe the actual game world.
 */

import type { CharacterRecord } from '../types';

// ============================================================================
// GET WORLD CONTEXT FOR DM
// ============================================================================

/**
 * Build world context string for DM prompts
 */
export async function getWorldContext(character: CharacterRecord): Promise<string> {
  let context = '\nWORLD CONTEXT:\n';

  // Get current biome (simplified for MVP)
  const biome = getBiomeAtPosition(character.position.x, character.position.y);
  context += `- Current Location: (${character.position.x}, ${character.position.y})\n`;
  context += `- Biome: ${biome}\n`;
  context += `- ${getBiomeDescription(biome)}\n`;

  // TODO: Query actual POIs from database
  // For now, provide general context
  context += `\nDescribe the ${biome} environment in your narrative. `;
  context += `Reference the terrain, weather, and atmosphere appropriate to this biome.`;

  return context;
}

/**
 * Determine biome at position (simplified procedural generation)
 */
function getBiomeAtPosition(x: number, y: number): string {
  // Simple hash-based biome selection for MVP
  const hash = (x * 73856093) ^ (y * 19349663);
  const biomes = ['forest', 'plains', 'mountains', 'desert', 'swamp'];
  return biomes[Math.abs(hash) % biomes.length];
}

/**
 * Get atmospheric description for biome
 */
function getBiomeDescription(biome: string): string {
  const descriptions: Record<string, string> = {
    forest: 'Dense woods with towering trees, dappled sunlight, and the sounds of wildlife',
    plains: 'Rolling grasslands stretching to the horizon, wildflowers swaying in the breeze',
    mountains: 'Rugged peaks with rocky terrain, thin air, and spectacular vistas',
    desert: 'Endless dunes under scorching sun, sparse vegetation, mirages in the distance',
    swamp: 'Murky wetlands with twisted trees, thick mist, and the croaking of frogs',
  };

  return descriptions[biome] || 'A mysterious landscape';
}
