import type { SupabaseClient } from '@supabase/supabase-js';

import type {
  CharacterNpcReputation,
  NpcHomeType,
  NpcState,
  WorldNpcRecord
} from '../types/npc-types';
import type { SettlementType, SettlementSummary, Vector2 } from '../types/road-types';
import { supabaseServiceClient } from './supabaseClient';
import { landmarkService } from './landmarkService';

interface NpcServiceDependencies {
  supabaseClient?: SupabaseClient;
}

interface SettlementSeed {
  id: string;
  name: string;
  type: SettlementType;
  position: Vector2;
}

interface PoiSeed {
  id: string;
  name: string;
  position: Vector2;
  type: string;
}

interface NpcRosterWithReputation {
  npc: WorldNpcRecord;
  reputation: CharacterNpcReputation | null;
}

class DeterministicRandom {
  private state: number;

  constructor(seed: string) {
    this.state = DeterministicRandom.hash(seed);
  }

  static hash(input: string): number {
    let hash = 0;
    for (let i = 0; i < input.length; i += 1) {
      const chr = input.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0;
    }
    return hash || 1;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), 1 | t);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  pick<T>(items: T[]): T {
    const index = Math.floor(this.next() * items.length);
    return items[Math.max(0, Math.min(items.length - 1, index))];
  }
}

const CORE_RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Tiefling', 'Half-Orc', 'Dragonborn'];
const CORE_CLASSES = ['Fighter', 'Rogue', 'Wizard', 'Cleric', 'Ranger', 'Bard', 'Paladin', 'Druid'];

const FIRST_NAMES = ['Aelric', 'Branwen', 'Caelia', 'Dorian', 'Elara', 'Fenric', 'Ghalia', 'Hadrin', 'Isolde', 'Jareth', 'Kaelin', 'Lyra', 'Marek', 'Nimue', 'Orrin', 'Phaedra', 'Quen', 'Rowan', 'Selene', 'Theron', 'Uriel', 'Vesper', 'Willow', 'Xanthis', 'Ysara', 'Zarek'];
const LAST_NAMES = ['Ashweft', 'Blackmoore', 'Cinderfall', 'Dawnward', 'Emberfall', 'Frostglen', 'Gloomweave', 'Hallowspire', 'Ironvale', 'Jadecrest', 'Kingsmire', 'Lockewood', 'Moonridge', 'Nightbloom', 'Oathstone', 'Pyrelight', 'Quickwater', 'Ravenshade', 'Stormreach', 'Thornfield', 'Umberlane', 'Vigilbrand', 'Whisperwind', 'Yarrowfen', 'Zephyrglade'];

const PERSONALITY_TRAITS = ['stoic but fair', 'quick-witted and curious', 'brooding yet loyal', 'soft-spoken and patient', 'gruff with a hidden warmth', 'idealistic and driven', 'world-weary with sharp humor', 'meticulous and pragmatic', 'superstitious and secretive', 'bold and reckless'];
const PERSONALITY_GOALS = ['seeks to safeguard their neighbors', 'collects stories from every traveler', 'hunts for relics lost in the region', 'quietly tracks local rumors', 'dreams of earning renown beyond their village', 'yearns to settle an old debt', 'watches for threats spilling from the wilds', 'studies ancient rites whispered in town', 'trains volunteers to defend the road', 'guides pilgrims who brave these paths'];

const ROLE_OPTIONS_BY_SETTLEMENT: Record<SettlementType, string[]> = {
  village: ['Bartender', 'Scout', 'Healer', 'Smith', 'Quartermaster', 'Elder'],
  town: ['Guild Factor', 'Captain of the Watch', 'Archivist', 'Spice Broker', 'Innkeeper', 'Chronicler'],
  city: ['Harbormaster', 'Magistrate', 'Academy Provost', 'Syndicate Liaison', 'Temple Speaker', 'Courier Master'],
  capital: ['High Chamberlain', 'Royal Archivist', 'Vaultwarden', 'Knight-Captain', 'Oracle Envoy', 'Court Chronicler'],
  fort: ['Quartermaster', 'Watch Commander', 'Siege Engineer', 'Supply Sergeant', 'Battle Chaplain'],
  outpost: ['Pathfinder', 'Cartographer', 'Signal Keeper', 'Frontier Surgeon', 'Ranger-Captain']
};

const ROLE_OPTIONS_FOR_POI = ['Wandering Scholar', 'Caretaker', 'Reclusive Mystic', 'Treasure Hunter'];

function npcCountRangeForSettlement(type: SettlementType): [number, number] {
  switch (type) {
    case 'village':
      return [2, 5];
    case 'town':
      return [4, 7];
    case 'city':
      return [6, 9];
    case 'capital':
      return [8, 12];
    case 'fort':
    case 'outpost':
      return [3, 6];
    default:
      return [2, 4];
  }
}

function npcCountRangeForPoi(): [number, number] {
  return [1, 2];
}

export class NpcService {
  private readonly supabase: SupabaseClient;

  constructor(dependencies: NpcServiceDependencies = {}) {
    this.supabase = dependencies.supabaseClient ?? supabaseServiceClient;
  }

  async ensureSettlementNpcs(campaignSeed: string, settlement: SettlementSeed): Promise<WorldNpcRecord[]> {
    const existing = await this.fetchNpcsByHome('settlement', settlement.id);
    const [minCount, maxCount] = npcCountRangeForSettlement(settlement.type);

    if (existing.length >= minCount) {
      return existing;
    }

    const generator = new DeterministicRandom(`${campaignSeed}:settlement:${settlement.id}`);
    const targetCount = Math.max(minCount, Math.min(maxCount, existing.length + Math.ceil(generator.next() * (maxCount - existing.length))));
    const toCreate = targetCount - existing.length;
    const newNpcs: WorldNpcRecord[] = [];

    for (let i = 0; i < toCreate; i += 1) {
      const npc = await this.createNpcRecord({
        campaignSeed,
        homeType: 'settlement',
        homeId: settlement.id,
        currentType: 'settlement',
        currentId: settlement.id,
        generator,
        roleOptions: ROLE_OPTIONS_BY_SETTLEMENT[settlement.type] ?? ROLE_OPTIONS_FOR_POI
      });

      if (npc) {
        newNpcs.push(npc);
      }
    }

    return [...existing, ...newNpcs];
  }

  async ensurePoiNpcs(campaignSeed: string, poi: PoiSeed): Promise<WorldNpcRecord[]> {
    const existing = await this.fetchNpcsByHome('poi', poi.id);
    const [minCount, maxCount] = npcCountRangeForPoi();

    if (existing.length >= minCount) {
      return existing;
    }

    const generator = new DeterministicRandom(`${campaignSeed}:poi:${poi.id}`);
    const targetCount = Math.max(minCount, Math.min(maxCount, existing.length + Math.ceil(generator.next() * (maxCount - existing.length))));
    const toCreate = targetCount - existing.length;

    const newNpcs: WorldNpcRecord[] = [];
    for (let i = 0; i < toCreate; i += 1) {
      const npc = await this.createNpcRecord({
        campaignSeed,
        homeType: 'poi',
        homeId: poi.id,
        currentType: 'poi',
        currentId: poi.id,
        generator,
        roleOptions: ROLE_OPTIONS_FOR_POI
      });

      if (npc) {
        newNpcs.push(npc);
      }
    }

    return [...existing, ...newNpcs];
  }

  async fetchNpcsByCurrentLocation(locationType: NpcHomeType, locationId: string | null): Promise<WorldNpcRecord[]> {
    const query = this.supabase
      .from('world_npcs')
      .select('*')
      .eq('current_location_type', locationType);

    if (locationId) {
      query.eq('current_location_id', locationId);
    } else {
      query.is('current_location_id', null);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[NpcService] Failed to fetch NPCs by location:', error);
      return [];
    }

    return (data ?? []) as WorldNpcRecord[];
  }

  async fetchNpcsByHome(homeType: NpcHomeType, homeId: string): Promise<WorldNpcRecord[]> {
    const { data, error } = await this.supabase
      .from('world_npcs')
      .select('*')
      .eq('home_location_type', homeType)
      .eq('home_location_id', homeId);

    if (error) {
      console.error('[NpcService] Failed to fetch NPCs by home:', error);
      return [];
    }

    return (data ?? []) as WorldNpcRecord[];
  }

  async updateNpcState(npcId: string, state: NpcState): Promise<void> {
    const { error } = await this.supabase
      .from('world_npcs')
      .update({ state, current_location_type: state === 'dead' ? 'wilderness' : undefined, current_location_id: state === 'dead' ? null : undefined })
      .eq('id', npcId);

    if (error) {
      throw error;
    }
  }

  async recordNpcDeath(npcId: string): Promise<void> {
    await this.updateNpcState(npcId, 'dead');
  }

  async adjustReputation(characterId: string, npcId: string, delta: number, questsGivenDelta: number = 0, questsCompletedDelta: number = 0): Promise<CharacterNpcReputation> {
    const existing = await this.getReputation(characterId, npcId);
    const nextScore = Math.max(-100, Math.min(100, (existing?.reputation_score ?? 0) + delta));

    const payload = {
      character_id: characterId,
      npc_id: npcId,
      reputation_score: nextScore,
      quests_given: (existing?.quests_given ?? 0) + questsGivenDelta,
      quests_completed: (existing?.quests_completed ?? 0) + questsCompletedDelta,
      last_interaction_at: new Date().toISOString()
    };

    const { data, error } = await this.supabase
      .from('character_npc_reputation')
      .upsert(payload)
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return data as CharacterNpcReputation;
  }

  async getReputation(characterId: string, npcId: string): Promise<CharacterNpcReputation | null> {
    const { data, error } = await this.supabase
      .from('character_npc_reputation')
      .select('*')
      .eq('character_id', characterId)
      .eq('npc_id', npcId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return (data as CharacterNpcReputation) ?? null;
  }

  async getNpcRosterWithReputation(
    characterId: string,
    locationType: NpcHomeType,
    locationId: string | null
  ): Promise<NpcRosterWithReputation[]> {
    const npcs = await this.fetchNpcsByCurrentLocation(locationType, locationId);
    const roster: NpcRosterWithReputation[] = [];

    for (const npc of npcs) {
      const rep = await this.getReputation(characterId, npc.id);
      roster.push({ npc, reputation: rep });
    }

    return roster;
  }

  async describeNpcPresence(characterId: string, locationType: NpcHomeType, locationId: string | null): Promise<string[]> {
    const roster = await this.getNpcRosterWithReputation(characterId, locationType, locationId);
    const descriptions: string[] = [];

    if (roster.length === 0) {
      return descriptions;
    }

    for (const entry of roster) {
      const reputation = entry.reputation?.reputation_score ?? 0;
      const leaning = reputation > 20 ? 'greets you warmly' : reputation < -20 ? 'eyes you with suspicion' : 'acknowledges you with a nod';

      if (entry.npc.state === 'dead') {
        descriptions.push(`The former ${entry.npc.role.toLowerCase()} ${entry.npc.name} is absent; whispers say they were killed not long ago.`);
        continue;
      }

      descriptions.push(`${entry.npc.name}, the ${entry.npc.role.toLowerCase()}, ${leaning}. (${this.reputationDescriptor(reputation)})`);
    }

    return descriptions;
  }

  private reputationDescriptor(score: number): string {
    if (score >= 60) return 'Esteemed';
    if (score >= 25) return 'Trusted';
    if (score <= -60) return 'Hated';
    if (score <= -25) return 'Distrusted';
    return 'Neutral';
  }

  private async createNpcRecord(options: {
    campaignSeed: string;
    homeType: NpcHomeType;
    homeId: string;
    currentType: NpcHomeType;
    currentId: string;
    generator: DeterministicRandom;
    roleOptions: string[];
  }): Promise<WorldNpcRecord | null> {
    const race = options.generator.pick(CORE_RACES);
    const charClass = options.generator.pick(CORE_CLASSES);
    const firstName = options.generator.pick(FIRST_NAMES);
    const lastName = options.generator.pick(LAST_NAMES);
    const role = options.generator.pick(options.roleOptions);
    const personality = this.buildPersonality(options.generator);

    const payload = {
      campaign_seed: options.campaignSeed,
      name: `${firstName} ${lastName}`,
      race,
      class: charClass,
      role,
      personality,
      state: 'alive' as NpcState,
      home_location_type: options.homeType,
      home_location_id: options.homeId,
      current_location_type: options.currentType,
      current_location_id: options.currentId,
      current_position: null,
      quests_given_total: 0,
      quests_completed_total: 0
    };

    const { data, error } = await this.supabase
      .from('world_npcs')
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('[NpcService] Failed to insert NPC:', error);
      return null;
    }

    return data as WorldNpcRecord;
  }

  private buildPersonality(random: DeterministicRandom): string {
    const trait = random.pick(PERSONALITY_TRAITS);
    const goal = random.pick(PERSONALITY_GOALS);
    return `${trait}; ${goal}.`;
  }
}

export const npcService = new NpcService();
