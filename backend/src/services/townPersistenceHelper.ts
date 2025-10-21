/**
 * Town Persistence Helper
 * Handles atomic persistence of generated towns using Supabase RPC
 */

import { supabaseServiceClient } from './supabaseClient';
import type { GeneratedTown } from './townGenerationService';

/**
 * Atomically persist a town using the RPC function
 * This solves: race condition + data integrity + partial persistence in one transaction
 */
export async function persistTownAtomically(
  campaignSeed: string,
  town: GeneratedTown
): Promise<string> {
  try {
    const { data, error } = await supabaseServiceClient.rpc(
      'persist_town_atomically',
      {
        p_campaign_seed: campaignSeed,
        p_name: town.name,
        p_region: town.region,
        p_prosperity_level: town.prosperity_level,
        p_safety_rating: town.safety_rating,
        p_trade_route_notes: town.trade_route_notes,
        p_full_data: town, // Complete JSONB with all nested data
      }
    );

    if (error) {
      console.error('[TownPersist] RPC error:', error);
      throw error;
    }

    const result = data?.[0];
    if (!result?.success) {
      throw new Error(result?.message || 'Unknown persistence error');
    }

    console.log(`[TownPersist] Town persisted atomically: ${town.name} (${result.town_id})`);
    return result.town_id as string;
  } catch (err) {
    console.error('[TownPersist] Error persisting town:', err);
    throw err;
  }
}
