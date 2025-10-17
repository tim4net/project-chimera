// Type definitions for Nuaibria world-building

export interface Deity {
  id: string;
  name: string;
  title: string | null;
  domains: string[];
  alignment: string | null;
  description: string;
  symbol_description: string | null;
  followers_description: string | null;
  tenets: string[] | null;
  is_active: boolean;
  power_level: string | null;
  created_at: string;
}

export interface RaceLore {
  id: string;
  race_name: string;
  origin_story: string;
  culture: string;
  relations: Record<string, any>;
  notable_figures: string[] | null;
  homeland: string | null;
  lifespan: string | null;
  physical_traits: string | null;
  cultural_values: string[] | null;
  created_at: string;
}

export interface WorldLore {
  id: string;
  category: 'creation_myth' | 'historical_event' | 'legend' | 'prophecy' | 'cultural_tale';
  title: string;
  content: string;
  era: 'ancient' | 'old_empire' | 'fall' | 'current' | 'future' | null;
  importance: number;
  generated_by: 'gemini_pro' | 'local_llm' | 'human_authored' | null;
  tags: string[] | null;
  created_at: string;
}

export interface Location {
  id: string;
  name: string;
  location_type: string;
  position_x: number;
  position_y: number;
  region_id: string | null;
  biome: string | null;
  description: string | null;
  history: string | null;
  size_category: string | null;
  danger_level: number;
  population: number;
  available_services: string[] | null;
  discovered_by: string[] | null;
  campaign_seed: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface NPC {
  id: string;
  name: string;
  race: string | null;
  occupation: string | null;
  personality: string | null;
  backstory: string | null;
  location_id: string | null;
  faction_id: string | null;
  disposition: string;
  quest_giver: boolean;
  merchant: boolean;
  dialogue_snippets: string[] | null;
  importance: number;
  is_alive: boolean;
  campaign_seed: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface Faction {
  id: string;
  name: string;
  faction_type: string | null;
  description: string;
  goals: string[] | null;
  history: string | null;
  leader_npc_id: string | null;
  headquarters_location_id: string | null;
  power_level: number;
  resources: string[] | null;
  relations: Record<string, any>;
  is_active: boolean;
  campaign_seed: string | null;
  created_at: string;
}

export interface Quest {
  id: string;
  character_id: string | null;
  title: string;
  description: string;
  quest_type: string | null;
  quest_giver_id: string | null;
  objectives: Array<{ description: string; completed: boolean }>;
  rewards: Record<string, any>;
  status: string;
  difficulty: number;
  location_id: string | null;
  narrative_arc: string | null;
  started_at: string;
  completed_at: string | null;
  metadata: Record<string, any>;
}
