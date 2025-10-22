/**
 * @file Travel Service
 *
 * Core business logic for travel system including:
 * - Encounter pool definitions
 * - Severity calculations based on danger levels
 * - Event generation from templates
 * - Auto-resolution for trivial events
 */

import type {
  TravelSession,
  TravelEvent,
  TravelEventTemplate,
  Severity,
  RegionContext,
  TravelEventGenerationResult,
} from '../types/travel';
import { v4 as uuidv4 } from 'uuid';

/**
 * Encounter pools organized by severity level.
 * Each pool contains 3-5 template events with predefined characteristics.
 */
export const ENCOUNTER_POOLS: Record<Severity, TravelEventTemplate[]> = {
  trivial: [
    {
      type: 'merchant',
      severity: 'trivial',
      description: 'A traveling merchant waves at you from their cart, offering simple wares.',
      requires_response: false,
    },
    {
      type: 'landmark',
      severity: 'trivial',
      description: 'You notice an interesting rock formation in the distance.',
      requires_response: false,
    },
    {
      type: 'weather',
      severity: 'trivial',
      description: 'The sun breaks through the clouds, warming your face.',
      requires_response: false,
    },
    {
      type: 'traveler',
      severity: 'trivial',
      description: 'A fellow traveler passes by, offering a friendly nod.',
      requires_response: false,
    },
  ],

  minor: [
    {
      type: 'weather',
      severity: 'minor',
      description: 'Dark clouds gather overhead. A light drizzle begins to fall.',
      requires_response: false,
    },
    {
      type: 'traveler',
      severity: 'minor',
      description: 'A weary traveler asks for directions to the nearest settlement.',
      requires_response: true,
      choices: [
        { label: 'Give directions', consequence: 'The traveler thanks you and continues on.' },
        { label: 'Ignore them', consequence: 'The traveler sighs and walks away.' },
      ],
    },
    {
      type: 'merchant',
      severity: 'minor',
      description: 'A merchant offers to sell you supplies at a reasonable price.',
      requires_response: true,
      choices: [
        { label: 'Browse wares', consequence: 'You examine the merchant\'s inventory.' },
        { label: 'Decline politely', consequence: 'The merchant nods and packs up their goods.' },
      ],
    },
    {
      type: 'landmark',
      severity: 'minor',
      description: 'You discover an old trail marker, worn by time but still legible.',
      requires_response: false,
    },
  ],

  moderate: [
    {
      type: 'bandits',
      severity: 'moderate',
      description: 'Two bandits emerge from the brush, demanding your coin purse.',
      requires_response: true,
      choices: [
        { label: 'Fight', consequence: 'You prepare for combat.', dc: 12, skill: 'athletics' },
        { label: 'Intimidate', consequence: 'You attempt to scare them off.', dc: 13, skill: 'intimidation' },
        { label: 'Flee', consequence: 'You turn and run.', dc: 11, skill: 'athletics' },
      ],
    },
    {
      type: 'storm',
      severity: 'moderate',
      description: 'A sudden storm rolls in, wind whipping at your cloak and rain pelting down.',
      requires_response: true,
      choices: [
        { label: 'Seek shelter', consequence: 'You look for protection from the elements.', dc: 10, skill: 'survival' },
        { label: 'Press on', consequence: 'You continue through the storm, risking exhaustion.' },
      ],
    },
    {
      type: 'trap',
      severity: 'moderate',
      description: 'You spot signs of a trap ahead - disturbed earth and unusual tracks.',
      requires_response: true,
      choices: [
        { label: 'Disarm', consequence: 'You attempt to disable the trap.', dc: 13, skill: 'sleight_of_hand' },
        { label: 'Avoid', consequence: 'You carefully navigate around the danger.', dc: 11, skill: 'perception' },
      ],
    },
    {
      type: 'monster',
      severity: 'moderate',
      description: 'A dire wolf blocks the path ahead, growling menacingly.',
      requires_response: true,
      choices: [
        { label: 'Fight', consequence: 'You draw your weapon.' },
        { label: 'Calm the beast', consequence: 'You try to soothe the creature.', dc: 14, skill: 'animal_handling' },
      ],
    },
  ],

  dangerous: [
    {
      type: 'bandits',
      severity: 'dangerous',
      description: 'A well-organized bandit gang surrounds you, weapons drawn and ready.',
      requires_response: true,
      choices: [
        { label: 'Fight', consequence: 'You prepare to battle the gang.' },
        { label: 'Negotiate', consequence: 'You attempt to bargain with the leader.', dc: 16, skill: 'persuasion' },
        { label: 'Surrender', consequence: 'You drop your weapon and raise your hands.' },
      ],
    },
    {
      type: 'monster',
      severity: 'dangerous',
      description: 'A young dragon descends from the sky, eyes fixed on you with predatory interest.',
      requires_response: true,
      choices: [
        { label: 'Fight', consequence: 'You stand your ground against the dragon.' },
        { label: 'Hide', consequence: 'You attempt to conceal yourself.', dc: 17, skill: 'stealth' },
        { label: 'Offer tribute', consequence: 'You present your valuables to appease the beast.', dc: 15, skill: 'persuasion' },
      ],
    },
    {
      type: 'storm',
      severity: 'dangerous',
      description: 'A violent tempest erupts with lightning striking dangerously close.',
      requires_response: true,
      choices: [
        { label: 'Find shelter immediately', consequence: 'You desperately search for cover.', dc: 14, skill: 'survival' },
        { label: 'Endure', consequence: 'You steel yourself against the storm\'s fury.', dc: 16, skill: 'constitution' },
      ],
    },
    {
      type: 'trap',
      severity: 'dangerous',
      description: 'You trigger a complex magical trap - arcane energy begins to crackle around you.',
      requires_response: true,
      choices: [
        { label: 'Dispel magic', consequence: 'You attempt to counter the spell.', dc: 15, skill: 'arcana' },
        { label: 'Dodge', consequence: 'You try to avoid the magical discharge.', dc: 16, skill: 'acrobatics' },
      ],
    },
  ],

  deadly: [
    {
      type: 'boss',
      severity: 'deadly',
      description: 'A legendary beast emerges - an ancient owlbear of enormous size, scarred from countless battles.',
      requires_response: true,
      choices: [
        { label: 'Fight to the death', consequence: 'You prepare for an epic battle.' },
        { label: 'Attempt escape', consequence: 'You try to flee from this apex predator.', dc: 18, skill: 'athletics' },
      ],
    },
    {
      type: 'catastrophe',
      severity: 'deadly',
      description: 'The ground begins to shake violently - an earthquake tears through the region.',
      requires_response: true,
      choices: [
        { label: 'Find stable ground', consequence: 'You search for safety amid the chaos.', dc: 17, skill: 'survival' },
        { label: 'Protect yourself', consequence: 'You brace against the tremors.', dc: 18, skill: 'athletics' },
      ],
    },
    {
      type: 'monster',
      severity: 'deadly',
      description: 'A fully grown adult dragon lands before you, its scales gleaming like polished armor.',
      requires_response: true,
      choices: [
        { label: 'Challenge the dragon', consequence: 'You face death with honor.' },
        { label: 'Beg for mercy', consequence: 'You prostrate yourself before the wyrm.', dc: 19, skill: 'persuasion' },
      ],
    },
  ],
};

/**
 * Calculate event severity based on region danger level and random roll.
 *
 * @param dangerLevel - Region danger level (1-5)
 * @param roll - Random roll (0-100)
 * @returns Severity level for the event
 *
 * Distribution by danger level:
 * - Danger 1: Mostly trivial (70%), some minor (25%), rare moderate (5%)
 * - Danger 2: Mix of trivial (40%), minor (40%), moderate (15%), rare dangerous (5%)
 * - Danger 3: Balanced across all levels (20% each)
 * - Danger 4: Skewed toward danger (10% trivial, 15% minor, 25% moderate, 35% dangerous, 15% deadly)
 * - Danger 5: Mostly deadly (10% trivial, 10% minor, 15% moderate, 30% dangerous, 35% deadly)
 */
export function calculateSeverity(dangerLevel: number, roll: number): Severity {
  // Clamp danger level to valid range
  const danger = Math.max(1, Math.min(5, dangerLevel));

  // Define percentile ranges for each danger level
  switch (danger) {
    case 1:
      if (roll < 70) return 'trivial';
      if (roll < 95) return 'minor';
      return 'moderate';

    case 2:
      if (roll < 40) return 'trivial';
      if (roll < 80) return 'minor';
      if (roll < 95) return 'moderate';
      return 'dangerous';

    case 3:
      if (roll < 20) return 'trivial';
      if (roll < 40) return 'minor';
      if (roll < 60) return 'moderate';
      if (roll < 80) return 'dangerous';
      return 'deadly';

    case 4:
      if (roll < 10) return 'trivial';
      if (roll < 25) return 'minor';
      if (roll < 50) return 'moderate';
      if (roll < 85) return 'dangerous';
      return 'deadly';

    case 5:
      if (roll < 10) return 'trivial';
      if (roll < 20) return 'minor';
      if (roll < 35) return 'moderate';
      if (roll < 65) return 'dangerous';
      return 'deadly';

    default:
      return 'trivial';
  }
}

/**
 * Generate a travel event based on session, region, and severity.
 *
 * @param session - Current travel session
 * @param region - Region context (biome, danger level, coordinates)
 * @param severity - Optional severity override; if not provided, will be calculated
 * @returns Generated travel event
 */
export function generateTravelEvent(
  session: TravelSession,
  region: RegionContext,
  severity?: Severity
): TravelEvent {
  // Calculate severity if not provided
  const eventSeverity = severity ?? calculateSeverity(region.danger_level, Math.floor(Math.random() * 100));

  // Get appropriate pool
  const pool = ENCOUNTER_POOLS[eventSeverity];

  // Select random event from pool
  const template = pool[Math.floor(Math.random() * pool.length)];

  // Create event from template
  const event: TravelEvent = {
    id: uuidv4(),
    session_id: session.id,
    type: template.type,
    severity: template.severity,
    description: template.description,
    requires_response: template.requires_response,
    resolved: false,
    choices: template.choices,
    created_at: new Date().toISOString(),
  };

  return event;
}

/**
 * Auto-resolve trivial events that don't require player input.
 *
 * @param event - Travel event to resolve
 * @returns Narration describing the auto-resolution
 */
export function autoResolveEvent(event: TravelEvent): string {
  // Only trivial events should be auto-resolved
  if (event.severity !== 'trivial') {
    throw new Error(`Cannot auto-resolve ${event.severity} event - requires player response`);
  }

  // Generate contextual narration based on event type
  const narrations: Record<string, string[]> = {
    merchant: [
      'The merchant waves goodbye as you pass, their cart rattling down the road.',
      'You exchange pleasantries with the merchant before continuing your journey.',
      'The merchant offers a warm smile as you walk by their colorful stall.',
    ],
    landmark: [
      'You pause briefly to admire the landmark before moving on.',
      'The sight is memorable, worth noting in your mental map of the region.',
      'You file away the location of this landmark for future reference.',
    ],
    weather: [
      'The weather clears as quickly as it arrived.',
      'You adjust your cloak and continue onward, unbothered by the elements.',
      'The pleasant weather lifts your spirits as you travel.',
    ],
    traveler: [
      'The traveler waves farewell and disappears down the path.',
      'You exchange brief nods with the traveler as you pass.',
      'The traveler continues on their way, leaving you to yours.',
    ],
  };

  // Get appropriate narration pool or use default
  const pool = narrations[event.type] || [
    'The moment passes without incident.',
    'You continue your journey, the encounter barely a footnote.',
  ];

  // Select random narration
  const narration = pool[Math.floor(Math.random() * pool.length)];

  return narration;
}

/**
 * Generate a complete travel event with optional auto-resolution.
 *
 * @param session - Current travel session
 * @param region - Region context
 * @param severity - Optional severity override
 * @returns Complete event generation result with event, narration, and resolution status
 */
export function generateTravelEventWithResolution(
  session: TravelSession,
  region: RegionContext,
  severity?: Severity
): TravelEventGenerationResult {
  const event = generateTravelEvent(session, region, severity);

  // Auto-resolve trivial events
  if (event.severity === 'trivial' && !event.requires_response) {
    const narration = autoResolveEvent(event);
    return {
      event: { ...event, resolved: true, resolution: narration },
      narration,
      auto_resolved: true,
    };
  }

  // Return unresolved event for player interaction
  return {
    event,
    auto_resolved: false,
  };
}
