/**
 * Racial Ability Bonuses for Character Creation Display
 * Matches backend D&D 5e SRD data
 */

export type AbilityName = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA';

export interface RacialBonus {
  race: string;
  bonuses: Partial<Record<AbilityName, number>>;
  description: string;
}

export const RACIAL_BONUSES: Record<string, RacialBonus> = {
  Aasimar: {
    race: 'Aasimar',
    bonuses: { CHA: 2, WIS: 1 },
    description: 'Celestial-touched humanoids with divine grace and wisdom.'
  },
  Dragonborn: {
    race: 'Dragonborn',
    bonuses: { STR: 2, CHA: 1 },
    description: 'Draconic ancestry grants strength and presence.'
  },
  Dwarf: {
    race: 'Dwarf',
    bonuses: { CON: 2 },
    description: 'Stout and resilient crafters with exceptional endurance.'
  },
  Elf: {
    race: 'Elf',
    bonuses: { DEX: 2 },
    description: 'Graceful and agile with centuries of refinement.'
  },
  Gnome: {
    race: 'Gnome',
    bonuses: { INT: 2 },
    description: 'Inventive tinkerers with keen intellect.'
  },
  Goliath: {
    race: 'Goliath',
    bonuses: { STR: 2, CON: 1 },
    description: 'Towering mountain warriors of great strength.'
  },
  Halfling: {
    race: 'Halfling',
    bonuses: { DEX: 2 },
    description: 'Small and nimble with natural luck.'
  },
  Human: {
    race: 'Human',
    bonuses: { STR: 1, DEX: 1, CON: 1, INT: 1, WIS: 1, CHA: 1 },
    description: 'Adaptable and ambitious, jack of all trades.'
  },
  Orc: {
    race: 'Orc',
    bonuses: { STR: 2, CON: 1 },
    description: 'Fierce warriors with incredible physical might.'
  },
  Tiefling: {
    race: 'Tiefling',
    bonuses: { INT: 1, CHA: 2 },
    description: 'Infernal heritage grants cunning and charisma.'
  },
  'Half-Elf': {
    race: 'Half-Elf',
    bonuses: { CHA: 2 },
    description: 'Diplomatic and versatile (plus +1 to two other abilities of choice).'
  },
  'Half-Orc': {
    race: 'Half-Orc',
    bonuses: { STR: 2, CON: 1 },
    description: 'Powerful and enduring with orcish heritage.'
  }
};

/**
 * Get racial ability bonuses for a given race
 */
export function getRacialBonuses(raceName: string): Partial<Record<AbilityName, number>> {
  const raceData = RACIAL_BONUSES[raceName];
  return raceData ? raceData.bonuses : {};
}

/**
 * Calculate final ability scores with racial bonuses applied
 */
export function applyRacialBonuses(
  baseScores: Record<AbilityName, number>,
  raceName: string
): Record<AbilityName, number> {
  const bonuses = getRacialBonuses(raceName);
  const finalScores = { ...baseScores };

  Object.entries(bonuses).forEach(([ability, bonus]) => {
    const key = ability as AbilityName;
    finalScores[key] = (finalScores[key] || 0) + bonus;
  });

  return finalScores;
}

/**
 * Get a formatted string describing racial bonuses
 */
export function formatRacialBonuses(raceName: string): string {
  const bonuses = getRacialBonuses(raceName);
  const bonusStrings = Object.entries(bonuses).map(
    ([ability, value]) => `+${value} ${ability}`
  );
  return bonusStrings.join(', ') || 'No bonuses';
}
