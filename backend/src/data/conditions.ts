/**
 * D&D 5e SRD Conditions System
 * Source: https://www.dnd5eapi.co/api/conditions
 *
 * Complete list of all 15 official D&D 5e conditions with their mechanical effects.
 * These conditions can be applied to characters during combat and gameplay.
 */

export interface Condition {
  name: string;
  description: string;
  effects: string[];
}

export const CONDITIONS: Record<string, Condition> = {
  blinded: {
    name: 'Blinded',
    description: 'A blinded creature can\'t see and automatically fails any ability check that requires sight.',
    effects: [
      'Can\'t see and automatically fails any ability check that requires sight',
      'Attack rolls against the creature have advantage',
      'The creature\'s attack rolls have disadvantage'
    ]
  },

  charmed: {
    name: 'Charmed',
    description: 'A charmed creature can\'t attack the charmer or target the charmer with harmful abilities or magical effects.',
    effects: [
      'Can\'t attack the charmer or target the charmer with harmful abilities or magical effects',
      'The charmer has advantage on any ability check to interact socially with the creature'
    ]
  },

  deafened: {
    name: 'Deafened',
    description: 'A deafened creature can\'t hear and automatically fails any ability check that requires hearing.',
    effects: [
      'Can\'t hear',
      'Automatically fails any ability check that requires hearing'
    ]
  },

  exhaustion: {
    name: 'Exhaustion',
    description: 'Some special abilities and environmental hazards, such as starvation and the long-term effects of freezing or scorching temperatures, can lead to a special condition called exhaustion. Exhaustion is measured in six levels.',
    effects: [
      'Level 1: Disadvantage on ability checks',
      'Level 2: Speed halved',
      'Level 3: Disadvantage on attack rolls and saving throws',
      'Level 4: Hit point maximum halved',
      'Level 5: Speed reduced to 0',
      'Level 6: Death',
      'Effects are cumulative - a creature suffers the effect of its current level plus all lower levels',
      'If an already exhausted creature suffers another effect that causes exhaustion, its current level increases',
      'A creature can remove exhaustion by finishing a long rest (if it has food and drink), reducing its exhaustion level by 1'
    ]
  },

  frightened: {
    name: 'Frightened',
    description: 'A frightened creature has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight.',
    effects: [
      'Has disadvantage on ability checks and attack rolls while the source of its fear is within line of sight',
      'Can\'t willingly move closer to the source of its fear'
    ]
  },

  grappled: {
    name: 'Grappled',
    description: 'A grappled creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    effects: [
      'Speed becomes 0',
      'Can\'t benefit from any bonus to its speed',
      'The condition ends if the grappler is incapacitated',
      'The condition ends if an effect removes the grappled creature from the reach of the grappler or grappling effect'
    ]
  },

  incapacitated: {
    name: 'Incapacitated',
    description: 'An incapacitated creature can\'t take actions or reactions.',
    effects: [
      'Can\'t take actions',
      'Can\'t take reactions'
    ]
  },

  invisible: {
    name: 'Invisible',
    description: 'An invisible creature is impossible to see without the aid of magic or a special sense. For the purpose of hiding, the creature is heavily obscured. The creature\'s location can be detected by any noise it makes or any tracks it leaves.',
    effects: [
      'Impossible to see without the aid of magic or a special sense',
      'Considered heavily obscured for the purpose of hiding',
      'Attack rolls against the creature have disadvantage',
      'The creature\'s attack rolls have advantage'
    ]
  },

  paralyzed: {
    name: 'Paralyzed',
    description: 'A paralyzed creature is incapacitated and can\'t move or speak.',
    effects: [
      'Is incapacitated',
      'Can\'t move or speak',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature'
    ]
  },

  petrified: {
    name: 'Petrified',
    description: 'A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.',
    effects: [
      'Transformed into a solid inanimate substance (usually stone)',
      'Weight increases by a factor of ten',
      'Ceases aging',
      'Is incapacitated',
      'Can\'t move or speak',
      'Is unaware of its surroundings',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Has resistance to all damage',
      'Is immune to poison and disease (though existing poison or disease is suspended, not neutralized)'
    ]
  },

  poisoned: {
    name: 'Poisoned',
    description: 'A poisoned creature has disadvantage on attack rolls and ability checks.',
    effects: [
      'Has disadvantage on attack rolls',
      'Has disadvantage on ability checks'
    ]
  },

  prone: {
    name: 'Prone',
    description: 'A prone creature\'s only movement option is to crawl, unless it stands up and thereby ends the condition.',
    effects: [
      'Only movement option is to crawl, unless it stands up',
      'Has disadvantage on attack rolls',
      'An attack roll against the creature has advantage if the attacker is within 5 feet',
      'An attack roll against the creature has disadvantage if the attacker is more than 5 feet away'
    ]
  },

  restrained: {
    name: 'Restrained',
    description: 'A restrained creature\'s speed becomes 0, and it can\'t benefit from any bonus to its speed.',
    effects: [
      'Speed becomes 0',
      'Can\'t benefit from any bonus to its speed',
      'Attack rolls against the creature have advantage',
      'The creature\'s attack rolls have disadvantage',
      'Has disadvantage on Dexterity saving throws'
    ]
  },

  stunned: {
    name: 'Stunned',
    description: 'A stunned creature is incapacitated, can\'t move, and can speak only falteringly.',
    effects: [
      'Is incapacitated',
      'Can\'t move',
      'Can speak only falteringly',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage'
    ]
  },

  unconscious: {
    name: 'Unconscious',
    description: 'An unconscious creature is incapacitated, can\'t move or speak, and is unaware of its surroundings.',
    effects: [
      'Is incapacitated',
      'Can\'t move or speak',
      'Is unaware of its surroundings',
      'Drops whatever it\'s holding and falls prone',
      'Automatically fails Strength and Dexterity saving throws',
      'Attack rolls against the creature have advantage',
      'Any attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature'
    ]
  }
};

/**
 * Get a condition by name (case-insensitive)
 */
export function getCondition(name: string): Condition | undefined {
  const key = name.toLowerCase().replace(/\s+/g, '');
  return CONDITIONS[key];
}

/**
 * Get all condition names
 */
export function getAllConditionNames(): string[] {
  return Object.values(CONDITIONS).map(c => c.name);
}

/**
 * Check if a condition exists
 */
export function hasCondition(name: string): boolean {
  const key = name.toLowerCase().replace(/\s+/g, '');
  return key in CONDITIONS;
}

/**
 * Export all conditions as an array
 */
export const ALL_CONDITIONS = Object.values(CONDITIONS);
