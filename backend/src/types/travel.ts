/**
 * @file Travel System Types
 *
 * Defines interfaces for the travel system including sessions, events, and severity levels.
 */

/**
 * Severity levels for travel events, from harmless to catastrophic
 */
export type Severity = 'trivial' | 'minor' | 'moderate' | 'dangerous' | 'deadly';

/**
 * Travel mode options affecting speed and encounter chances
 */
export type TravelMode = 'cautious' | 'normal' | 'hasty';

/**
 * Status of a travel session
 */
export type TravelStatus = 'active' | 'paused' | 'completed' | 'cancelled';

/**
 * Travel event types
 */
export type TravelEventType =
  | 'encounter'
  | 'landmark'
  | 'weather'
  | 'traveler'
  | 'merchant'
  | 'bandits'
  | 'storm'
  | 'monster'
  | 'trap'
  | 'boss'
  | 'catastrophe';

/**
 * Choice available to player during a travel event
 */
export interface TravelChoice {
  label: string;
  consequence: string;
  dc?: number; // Difficulty Class for skill checks
  skill?: string; // Skill required for DC check
}

/**
 * A travel event that occurs during a journey
 */
export interface TravelEvent {
  id: string;
  session_id: string;
  type: TravelEventType;
  severity: Severity;
  description: string;
  choices?: TravelChoice[];
  requires_response: boolean;
  resolved?: boolean;
  resolution?: string;
  created_at?: string;
}

/**
 * Template for generating travel events
 */
export interface TravelEventTemplate {
  type: TravelEventType;
  severity: Severity;
  description: string;
  requires_response: boolean;
  choices?: TravelChoice[];
}

/**
 * A travel session tracking a character's journey
 */
export interface TravelSession {
  id: string;
  character_id: string;
  destination_id?: string;
  destination_x: number;
  destination_y: number;
  miles_total: number;
  miles_traveled: number;
  travel_mode: TravelMode;
  status: TravelStatus;
  created_at: string;
  updated_at?: string;
  completed_at?: string;
}

/**
 * Region data for contextual event generation
 */
export interface RegionContext {
  biome: string;
  danger_level: number;
  x: number;
  y: number;
  explored?: boolean;
}

/**
 * Result of generating a travel event
 */
export interface TravelEventGenerationResult {
  event: TravelEvent;
  narration?: string;
  auto_resolved?: boolean;
}

/**
 * API Request/Response Types
 */

export interface StartTravelRequest {
  character_id: string;
  destination_id: string;
  travel_mode?: TravelMode;
}

export interface StartTravelResponse {
  sessionId: string;
  milesTotal: number;
  estimatedArrival?: string;
  travelMode: TravelMode;
  message: string;
}

export interface TravelStatusResponse {
  session: TravelSession;
  events: TravelEvent[];
  progressPercent: number;
  currentEvent?: TravelEvent;
}

export interface TravelChoiceRequest {
  sessionId: string;
  choiceLabel: string;
}

export interface TravelChoiceResponse {
  success: boolean;
  consequence: string;
  skillCheck?: {
    skill: string;
    dc: number;
    roll: number;
    total: number;
    passed: boolean;
  };
  nextEvent?: TravelEvent;
  sessionCompleted?: boolean;
}
