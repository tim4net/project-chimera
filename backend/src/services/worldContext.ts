/**
 * @file World Context - Provides environmental information for DM prompts
 *
 * Includes nearby POIs, biome information, and location details
 * so the DM can describe the actual game world.
 */

import type { CharacterRecord } from '../types';
import { generateTile } from '../game/map';
import { supabaseServiceClient } from './supabaseClient';
import { LocationService } from './locationService';
import { landmarkService } from './landmarkService';
import { npcService } from './npcService';
import type { LocationContext } from '../types/road-types';

const locationService = new LocationService();

// ============================================================================
// GET WORLD CONTEXT FOR DM
// ============================================================================

/**
 * Build world context string for DM prompts
 */
interface WorldContextOptions {
  locationContext?: LocationContext | null;
}

export async function getWorldContext(
  character: CharacterRecord,
  options: WorldContextOptions = {}
): Promise<string> {
  let context = '\nWORLD CONTEXT:\n';

  // Get ACTUAL biome from procedural generation (same as map uses)
  const currentTile = generateTile(character.position_x, character.position_y, character.campaign_seed);
  const biome = currentTile.biome;
  const elevation = currentTile.elevation ?? 0;

  context += `- Current Location: (${character.position_x}, ${character.position_y})\n`;
  context += `- Biome: ${biome}\n`;
  context += `- Elevation: ${Math.round(elevation * 100)}m\n`;
  context += `- ${getBiomeDescription(biome)}\n`;

  // Ensure landmarks generated near current position, then record discovery state
  try {
    const charPosition = { x: character.position_x ?? 0, y: character.position_y ?? 0 };
    await landmarkService.ensureLandmarksAroundPosition(character.campaign_seed, charPosition, 4);
  } catch (error) {
    console.error('[WorldContext] Failed to ensure landmarks:', error);
  }

  let landmarkDiscoverySummary: string | null = null;

  try {
    const discoveries = await landmarkService.recordNearbyDiscoveries(character, 8);
    const lines: string[] = [];

    if (discoveries.newlyDiscovered.length > 0) {
      discoveries.newlyDiscovered.forEach(landmark => {
        lines.push(`- NEW: ${landmark.name} (${landmark.type}) ${landmark.distance.toFixed(1)} miles ${landmark.bearing}`);
      });
    }

    if (discoveries.alreadyKnown.length > 0) {
      discoveries.alreadyKnown.slice(0, 5).forEach(landmark => {
        lines.push(`- ${landmark.name} (${landmark.type}) ${landmark.distance.toFixed(1)} miles ${landmark.bearing}`);
      });
    }

    if (lines.length > 0) {
      landmarkDiscoverySummary = lines.join('\n');
    }
  } catch (error) {
    console.error('[WorldContext] Failed to record landmark discoveries:', error);
  }

  // Query actual nearby POIs from database using spatial proximity function
  const { data: nearbyPOIs } = await supabaseServiceClient
    .rpc('find_nearby_pois', {
      p_campaign_seed: character.campaign_seed,
      p_x: character.position_x,
      p_y: character.position_y,
      p_radius: 50, // 50-mile radius
      p_limit: 5
    });

  if (nearbyPOIs && nearbyPOIs.length > 0) {
    context += `\nNearby Points of Interest:\n`;
    nearbyPOIs.forEach((poi: any) => {
      // Type guard for position safety (column is renamed to poi_position to avoid SQL reserved word)
      if (poi.poi_position && typeof poi.poi_position.x === 'number' && typeof poi.distance === 'number') {
        context += `- ${poi.name} (${poi.type}) - ${Math.round(poi.distance)} miles away\n`;
      }
    });
  }

  if (landmarkDiscoverySummary) {
    context += `\nNearby Landmarks:\n${landmarkDiscoverySummary}\n`;
  }

  // Get surrounding tiles for directional awareness
  const north = generateTile(character.position_x, character.position_y - 10, character.campaign_seed);
  const south = generateTile(character.position_x, character.position_y + 10, character.campaign_seed);
  const east = generateTile(character.position_x + 10, character.position_y, character.campaign_seed);
  const west = generateTile(character.position_x - 10, character.position_y, character.campaign_seed);

  context += `\nSurrounding Terrain (10 miles in each direction):\n`;
  context += `- North: ${north.biome} (elevation ${Math.round((north.elevation ?? 0) * 100)}m)\n`;
  context += `- South: ${south.biome} (elevation ${Math.round((south.elevation ?? 0) * 100)}m)\n`;
  context += `- East: ${east.biome} (elevation ${Math.round((east.elevation ?? 0) * 100)}m)\n`;
  context += `- West: ${west.biome} (elevation ${Math.round((west.elevation ?? 0) * 100)}m)\n`;

  let locationContext: LocationContext | null = null;

  try {
    const charPosition = { x: character.position_x ?? 0, y: character.position_y ?? 0 };
    locationContext = options.locationContext ?? await locationService.buildLocationContext(
      character.campaign_seed,
      charPosition,
      {
        characterId: character.id,
        radius: 40,
        nearbySettlementLimit: 3
      }
    );
  } catch (error) {
    console.error('[WorldContext] Failed to build location context:', error);
  }

  context += `\nTravel Network:\n`;

  if (locationContext) {
    if (locationContext.nearestSettlement) {
      const settlement = locationContext.nearestSettlement;
      context += `- Nearest Settlement: ${settlement.name} (${settlement.type}), `;
      context += `${settlement.distance.toFixed(1)} miles away at (${settlement.x}, ${settlement.y})\n`;
    } else {
      context += '- No settlements detected within immediate range.\n';
    }

    if (locationContext.nearestRoad) {
      const road = locationContext.nearestRoad;
      context += `- Nearest Road: Connects ${road.fromSettlementName} ↔ ${road.toSettlementName}, `;
      context += `${road.distance.toFixed(1)} miles away.\n`;
    } else {
      context += '- Roads have not yet been scouted in this region.\n';
    }

    if (locationContext.nearbySettlements.length > 0) {
      context += '- Nearby Settlements: ';
      context += locationContext.nearbySettlements
        .map(settlement => `${settlement.name} (${settlement.type}, ${settlement.distance.toFixed(1)} mi)`)
        .join(', ');
      context += '\n';
    }

    if (locationContext.nearestSettlement) {
      try {
        const npcSummaries = await npcService.describeNpcPresence(
          character.id,
          'settlement',
          locationContext.nearestSettlement.id
        );
        if (npcSummaries.length > 0) {
          context += '\nLocal NPCs:\n';
          npcSummaries.forEach(line => {
            context += `- ${line}\n`;
          });
        }
      } catch (error) {
        console.error('[WorldContext] Failed to describe NPC presence:', error);
      }
    }
  } else {
    context += '- Location services unavailable; unable to resolve travel network.\n';
  }

  context += `\nDescribe the ${biome} environment in your narrative. `;
  context += `When players ask about surroundings, use the terrain data above for accurate descriptions.`;

  return context;
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
