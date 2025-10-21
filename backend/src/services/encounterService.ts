import type {
  EncounterOutcome,
  EncounterPromptContext,
  EncounterSeverity,
  EncounterType,
  GeneratedEncounter,
  TravelEncounterContext
} from '../types/encounter-types';
import { encounterGenerationService } from './encounterGenerationService';

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

  rollPercent(): number {
    return Math.floor(this.next() * 100) + 1;
  }
}

const TIME_OF_DAY_SEQUENCE: Array<'dawn' | 'day' | 'dusk' | 'night'> = ['dawn', 'day', 'dusk', 'night'];

function normalizeTimeOfDay(timeOfDay?: string): 'dawn' | 'day' | 'dusk' | 'night' {
  if (!timeOfDay) return 'day';
  if (TIME_OF_DAY_SEQUENCE.includes(timeOfDay as any)) {
    return timeOfDay as any;
  }
  return 'day';
}

function computeBaseChance(context: TravelEncounterContext): number {
  const base = context.onRoad ? 0.15 : 0.25;
  const distanceBonus = Math.min(0.2, Math.floor(context.distance / 10) * 0.03);
  const timeOfDay = normalizeTimeOfDay(context.timeOfDay);
  const timeModifier = timeOfDay === 'night' ? 0.07 : timeOfDay === 'dusk' ? 0.04 : 0;
  const biomeModifier = getBiomeModifier(context.biome);
  const roadDangerModifier = context.roadDanger === 'dangerous' ? 0.08 : context.roadDanger === 'guarded' ? -0.03 : 0;
  return Math.max(0.05, Math.min(0.6, base + distanceBonus + timeModifier + biomeModifier + roadDangerModifier));
}

function getBiomeModifier(biome: string): number {
  if (!biome) return 0;
  const normalized = biome.toLowerCase();
  if (normalized.includes('forest')) return 0.05;
  if (normalized.includes('swamp')) return 0.06;
  if (normalized.includes('desert')) return 0.04;
  if (normalized.includes('mountain')) return 0.03;
  return 0;
}

function determineDangerLevel(context: TravelEncounterContext, chance: number): EncounterSeverity {
  if (context.roadDanger === 'dangerous' || chance >= 0.35) return 'high';
  if (chance >= 0.28) return 'moderate';
  if (chance >= 0.18) return 'low';
  return 'trivial';
}

function selectEncounterType(context: TravelEncounterContext): { type: EncounterType; subtype?: string } {
  const biome = context.biome?.toLowerCase() ?? '';
  if (biome.includes('desert')) {
    return { type: 'weather_event', subtype: 'desert_storm' };
  }

  if (biome.includes('forest')) {
    return { type: 'npc_encounter', subtype: 'wild_beast' };
  }

  if (context.roadDanger === 'dangerous') {
    return { type: 'road_hazard', subtype: 'bandit_ambush' };
  }

  const candidates: Array<{ type: EncounterType; weight: number; subtype?: string }> = [
    { type: 'merchant_caravan', weight: context.onRoad ? 24 : 10 },
    { type: 'traveling_party', weight: 16 },
    { type: 'road_hazard', weight: context.onRoad ? 18 : 12, subtype: 'washout' },
    { type: 'weather_event', weight: 14, subtype: biome.includes('mountain') ? 'rockslide' : 'sudden_storm' },
    { type: 'strange_sound', weight: 12 },
    { type: 'abandoned_structure', weight: context.onRoad ? 8 : 18 },
    { type: 'npc_encounter', weight: 14 }
  ];

  const totalWeight = candidates.reduce((sum, option) => sum + option.weight, 0);
  const randomSeed = new DeterministicRandom(`${context.campaignSeed}:${context.characterId}:${context.position.x}:${context.position.y}:${context.distance}`);
  let roll = randomSeed.next() * totalWeight;

  for (const option of candidates) {
    if (roll < option.weight) {
      return { type: option.type, subtype: option.subtype };
    }
    roll -= option.weight;
  }

  return { type: 'strange_sound' };
}

export class EncounterService {
  constructor() {}

  async evaluateTravelEncounter(context: TravelEncounterContext): Promise<EncounterOutcome> {
    const chance = computeBaseChance(context);
    const dangerLevel = determineDangerLevel(context, chance);
    const timeOfDay = normalizeTimeOfDay(context.timeOfDay);
    const seededRandom = new DeterministicRandom(
      `${context.campaignSeed}:${context.characterId}:${context.position.x}:${context.position.y}:${context.distance}:${timeOfDay}`
    );
    const roll = seededRandom.rollPercent();
    const threshold = Math.round(chance * 100);

    if (roll > threshold) {
      return {
        triggered: false,
        encounter: null,
        roll,
        threshold,
        reason: `Roll ${roll} exceeded threshold ${threshold}`
      };
    }

    const { type, subtype } = selectEncounterType(context);
    const promptContext: EncounterPromptContext = {
      type,
      subtype,
      biome: context.biome,
      timeOfDay,
      distanceTravelled: context.distance,
      dangerLevel,
      roadDanger: context.roadDanger,
      onRoad: context.onRoad
    };

    let encounter: GeneratedEncounter | null = null;

    try {
      encounter = await encounterGenerationService.generateEncounter(promptContext);
    } catch (error) {
      console.error('[EncounterService] Failed to generate encounter via Gemini:', error);
      encounter = this.buildFallbackEncounter(promptContext);
    }

    return {
      triggered: true,
      encounter,
      roll,
      threshold,
      reason: `Roll ${roll} <= ${threshold}`
    };
  }

  private buildFallbackEncounter(context: EncounterPromptContext): GeneratedEncounter {
    const fallbackDescription = this.fallbackDescription(context);
    return {
      id: `fallback-${Math.random().toString(36).slice(2, 8)}`,
      name: this.fallbackName(context),
      type: context.type,
      subtype: context.subtype,
      description: fallbackDescription,
      npcMotivations: ['The travelers want news from the nearest settlement.', 'They offer to trade gossip for supplies.'],
      hook: 'Do you engage with them, keep your distance, or investigate further?',
      tone: 'mysterious'
    };
  }

  private fallbackName(context: EncounterPromptContext): string {
    switch (context.type) {
      case 'merchant_caravan':
        return 'Dust-Laden Caravan';
      case 'traveling_party':
        return 'Road-Weary Companions';
      case 'road_hazard':
        return 'Torn Up Road';
      case 'weather_event':
        return 'Gnawing Gale';
      case 'strange_sound':
        return 'Echoing Howls';
      case 'abandoned_structure':
        return 'Forgotten Waystation';
      case 'npc_encounter':
      default:
        return 'Unexpected Figure';
    }
  }

  private fallbackDescription(context: EncounterPromptContext): string {
    if (context.type === 'weather_event' && context.subtype === 'desert_storm') {
      return 'A wall of sand roars across the dunes, blotting out the horizon and turning the sky the color of brass.';
    }

    if (context.type === 'npc_encounter' && context.subtype === 'wild_beast') {
      return 'The underbrush shivers as a massive stag steps onto the trail, antlers tangled with luminescent moss.';
    }

    if (context.type === 'road_hazard' && context.subtype === 'bandit_ambush') {
      return 'A toppled wagon blocks the road, and shadowy figures linger just beyond the torchlight.';
    }

    return 'Something unexpected interrupts the journey, demanding a choice before the road can continue.';
  }
}

export const encounterService = new EncounterService();

export const __test__ = {
  computeBaseChance,
  selectEncounterType
};
