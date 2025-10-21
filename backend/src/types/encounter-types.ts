/**
 * Encounter type definitions for travel encounters and narrative events.
 */

import type { Vector2 } from './road-types';

export type EncounterType =
  | 'merchant_caravan'
  | 'traveling_party'
  | 'road_hazard'
  | 'weather_event'
  | 'strange_sound'
  | 'abandoned_structure'
  | 'npc_encounter';

export type EncounterSeverity = 'trivial' | 'low' | 'moderate' | 'high';

export interface EncounterPromptContext {
  type: EncounterType;
  subtype?: string;
  biome: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  distanceTravelled: number;
  dangerLevel: EncounterSeverity;
  roadDanger: 'guarded' | 'moderate' | 'dangerous';
  onRoad: boolean;
}

export interface GeneratedEncounter {
  id: string;
  name: string;
  type: EncounterType;
  subtype?: string;
  description: string;
  npcMotivations: string[];
  hook: string;
  tone: 'whimsical' | 'ominous' | 'mysterious' | 'urgent' | 'calm';
}

export interface EncounterOutcome {
  triggered: boolean;
  encounter: GeneratedEncounter | null;
  roll: number;
  threshold: number;
  reason: string;
}

export interface TravelEncounterContext {
  campaignSeed: string;
  characterId: string;
  position: Vector2;
  biome: string;
  timeOfDay: 'dawn' | 'day' | 'dusk' | 'night';
  distance: number;
  onRoad: boolean;
  roadDanger: 'guarded' | 'moderate' | 'dangerous';
}
