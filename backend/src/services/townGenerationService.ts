import { supabaseServiceClient } from './supabaseClient';
import { readFileSync } from 'fs';
import { join } from 'path';
import { persistTownAtomically } from './townPersistenceHelper';

/**
 * Town Generation Service
 * Generates detailed starter towns for campaigns using local LLM
 * Stores results in database atomically via RPC
 */

// Type definitions for generated town data
export interface TownLocation {
  category: 'inn' | 'market' | 'smithy' | 'authority' | 'other';
  name: string;
  description: {
    appearance: string;
    key_feature: string;
    npc_present: string | null;
    quest_hook: string | null;
  };
  reveal_tier: 'public' | 'earned' | 'secret';
}

export interface TownNPC {
  name: string;
  role: string;
  personality: {
    traits: string[];
    quirk: string;
    voice: string;
  };
  appearance: {
    age_apparent: 'young' | 'middle-aged' | 'elderly';
    distinctive_feature: string;
    typical_attire: string;
  };
  motivations: string;
  secret: string;
  alignment: string;
  relationship_with_town: string;
}

export interface TownQuest {
  title: string;
  giver: string;
  difficulty: 'trivial' | 'easy' | 'standard' | 'hard';
  summary: string;
  details: {
    objective: string;
    motivation: string;
    complications: string;
    resolution: string;
  };
  rewards: {
    xp: number;
    gold: number | string;
    items: string[];
  };
  is_primary: boolean;
}

export interface TownThreat {
  name: string;
  danger_level: 'trivial' | 'minor' | 'moderate' | 'serious';
  distance_from_town: string;
  description: string;
  how_town_responds: string;
}

export interface TownSecret {
  title: string;
  summary: string;
  details: {
    what: string;
    why_hidden: string;
    implications: string;
    discovery_method: string;
  };
  discovery_difficulty: 'trivial' | 'easy' | 'standard' | 'hard';
  affects_npc: string | null;
}

export interface GeneratedTown {
  name: string;
  region: string;
  prosperity_level: 'modest' | 'comfortable' | 'prosperous';
  safety_rating: 'relatively safe' | 'somewhat dangerous' | 'dangerous';
  trade_route_notes: string;
  one_liner: string;
  locations: TownLocation[];
  npcs: TownNPC[];
  quests: TownQuest[];
  threats: TownThreat[];
  secrets: TownSecret[];
  trade_route_details: {
    major_cities_connected: string[];
    goods_passing_through: string[];
    caravan_frequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Seasonal';
    economic_impact: string;
  };
  atmosphere: {
    time_of_day_flavor: string;
    seasonal_notes: string;
    ambient_sounds: string;
    signature_smell: string;
  };
}

interface TownGenerationOptions {
  campaignSeed: string;
  campaignName?: string;
  regionType?: string;
}

export class TownGenerationService {
  private static readonly LOCAL_LLM_ENDPOINT =
    process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:1234/v1';

  // Race condition prevention: track in-flight town generation requests
  private static inflight = new Map<string, Promise<GeneratedTown>>();

  // Prompt caching: load once and reuse
  private static cachedPrompt: string | null = null;

  private static getPrompt(): string {
    if (!this.cachedPrompt) {
      const promptPath = join(__dirname, '../..', 'prompts', 'town-generation.txt');
      this.cachedPrompt = readFileSync(promptPath, 'utf-8');
    }
    return this.cachedPrompt;
  }

  /**
   * Check if a town has already been generated for this campaign
   */
  static async townExists(campaignSeed: string): Promise<boolean> {
    try {
      const { data, error } = await supabaseServiceClient
        .from('towns')
        .select('id', { count: 'exact' })
        .eq('campaign_seed', campaignSeed)
        .limit(1);

      if (error) throw error;
      return data && data.length > 0;
    } catch (err) {
      console.error('[TownGen] Error checking town existence:', err);
      throw err;
    }
  }

  /**
   * Get cached town data for a campaign
   */
  static async getTown(campaignSeed: string) {
    try {
      console.log(`[TownGen] getTown called for campaign: ${campaignSeed}`);
      const { data, error } = await supabaseServiceClient
        .from('towns')
        .select('*')
        .eq('campaign_seed', campaignSeed)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // 404 is okay

      if (data) {
        console.log(`[TownGen] Found town: ${data.name}, has full_data: ${!!data.full_data}`);
      } else {
        console.log(`[TownGen] No town found for campaign: ${campaignSeed}`);
      }

      return data || null;
    } catch (err) {
      console.error('[TownGen] Error fetching town:', err);
      throw err;
    }
  }

  /**
   * Generate a new town using local LLM with timeout protection
   */
  static async generateTown(options: TownGenerationOptions): Promise<GeneratedTown> {
    const {
      campaignSeed,
      campaignName = 'Unknown Realm',
      regionType = 'temperate forest',
    } = options;

    // Use cached prompt
    let prompt = this.getPrompt();

    // Inject campaign variables
    prompt = prompt
      .replace('{{campaign_name}}', campaignName)
      .replace('{{campaign_seed}}', campaignSeed)
      .replace(/{{region_type}}/g, regionType);

    console.log(`[TownGen] Generating town for campaign: ${campaignSeed}`);

    try {
      // Add 2min timeout - local LLM can take 30-60s for detailed 8000-token generations
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);

      const response = await fetch(`${this.LOCAL_LLM_ENDPOINT}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: process.env.LOCAL_TOWN_MODEL || 'qwen/qwen3-4b-2507',
          messages: [
            {
              role: 'system',
              content: prompt,
            },
            {
              role: 'user',
              content:
                'Generate a complete starter town as valid JSON matching the provided schema. Return ONLY the JSON, no other text.',
            },
          ],
          temperature: 0.7,
          max_tokens: 8000,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(
          `Local LLM error: ${response.status} ${response.statusText}`
        );
      }

      const result = await response.json();
      const content = result.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('No content returned from local LLM');
      }

      // Extract JSON from response with better parsing
      let jsonStr = content.trim();
      const fenced = jsonStr.match(/```json\s*([\s\S]*?)\s*```/i);
      if (fenced) jsonStr = fenced[1];

      // Validate JSON structure
      let townData: GeneratedTown;
      try {
        townData = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.error('[TownGen] Invalid JSON from LLM:', jsonStr.substring(0, 400));
        throw new Error('Local LLM returned invalid JSON');
      }

      // Validate required fields
      if (!townData.name || !townData.locations?.length || !townData.npcs?.length) {
        throw new Error('Generated town missing required fields');
      }

      console.log(`[TownGen] Town generated successfully: ${townData.name}`);
      return townData;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.error('[TownGen] Town generation timeout (120s exceeded)');
        throw new Error('Town generation timeout - local LLM took too long');
      }
      console.error('[TownGen] Error generating town:', err);
      throw err;
    }
  }

  /**
   * Main entry point: Get or generate town for campaign
   * Handles race conditions via in-flight deduplication
   */
  static async getOrGenerateTown(
    options: TownGenerationOptions
  ): Promise<GeneratedTown> {
    const { campaignSeed } = options;

    // RACE CONDITION PREVENTION: Check if another request is already generating this town
    if (this.inflight.has(campaignSeed)) {
      console.log(`[TownGen] Reusing in-flight generation for campaign: ${campaignSeed}`);
      return await this.inflight.get(campaignSeed)!;
    }

    // Create the generation task
    const task = (async () => {
      // Check if town already exists in database
      const exists = await this.townExists(campaignSeed);
      if (exists) {
        console.log(`[TownGen] Using cached town for campaign: ${campaignSeed}`);
        const cachedTown = await this.getTown(campaignSeed);
        if (!cachedTown?.full_data) {
          throw new Error('Cached town missing full_data');
        }
        return cachedTown.full_data as GeneratedTown;
      }

      // Generate new town
      console.log(`[TownGen] Generating new town for campaign: ${campaignSeed}`);
      const newTown = await this.generateTown(options);

      // Persist atomically via RPC
      await persistTownAtomically(campaignSeed, newTown);

      return newTown;
    })();

    // Track in-flight request
    this.inflight.set(campaignSeed, task);

    try {
      return await task;
    } finally {
      // Clean up after completion
      this.inflight.delete(campaignSeed);
    }
  }
}
