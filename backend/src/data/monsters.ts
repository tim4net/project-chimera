/**
 * D&D 5e SRD Monster Database - Main Export
 *
 * Aggregates all monster collections (117 total monsters)
 * Organized by CR: Low (0-2), Mid (3-5), High (6-10), Very High (11-15), Epic (16-20), Legendary (21-30)
 * Includes 23 legendary creatures with legendary actions
 */

// Export core interfaces
export { 
  Monster, 
  AbilityScores, 
  MonsterAttack, 
  SpecialAbility,
  LegendaryAction,
  LairAction 
} from './monstersCore';

// Import base monsters (37 split into 8 parts)
import { MONSTERS_BASE_PART1 } from './monstersBasePart1';
import { MONSTERS_BASE_PART2 } from './monstersBasePart2';
import { MONSTERS_BASE_PART3 } from './monstersBasePart3';
import { MONSTERS_BASE_PART4 } from './monstersBasePart4';
import { MONSTERS_BASE_PART5 } from './monstersBasePart5';
import { MONSTERS_BASE_PART6 } from './monstersBasePart6';
import { MONSTERS_BASE_PART7 } from './monstersBasePart7';
import { MONSTERS_BASE_PART8 } from './monstersBasePart8';

// Import additional monsters organized by CR (80 total, split into parts for maintainability)
import { MONSTERS_LOWCRPART1 } from './monstersLowCRPart1';
import { MONSTERS_LOWCRPART2 } from './monstersLowCRPart2';
import { MONSTERS_LOWCRPART3 } from './monstersLowCRPart3';
import { MONSTERS_MIDCRPART1 } from './monstersMidCRPart1';
import { MONSTERS_MIDCRPART2 } from './monstersMidCRPart2';
import { MONSTERS_MIDCRPART3 } from './monstersMidCRPart3';
import { MONSTERS_MIDCRPART4 } from './monstersMidCRPart4';
import { MONSTERS_MIDCRPART5 } from './monstersMidCRPart5';
import { MONSTERS_MIDCRPART6 } from './monstersMidCRPart6';
import { MONSTERS_HIGHCRPART1 } from './monstersHighCRPart1';
import { MONSTERS_HIGHCRPART2 } from './monstersHighCRPart2';
import { MONSTERS_HIGHCRPART3 } from './monstersHighCRPart3';
import { MONSTERS_HIGHCRPART4 } from './monstersHighCRPart4';
import { MONSTERS_HIGHCRPART5 } from './monstersHighCRPart5';
import { MONSTERS_VERYHIGHCRPART1 } from './monstersVeryHighCRPart1';
import { MONSTERS_VERYHIGHCRPART2 } from './monstersVeryHighCRPart2';
import { MONSTERS_VERYHIGHCRPART3 } from './monstersVeryHighCRPart3';
import { MONSTERS_VERYHIGHCRPART4 } from './monstersVeryHighCRPart4';
import { MONSTERS_EPICCRPART1 } from './monstersEpicCRPart1';
import { MONSTERS_EPICCRPART2 } from './monstersEpicCRPart2';
import { MONSTERS_EPICCRPART3 } from './monstersEpicCRPart3';
import { MONSTERS_LEGENDARYCRPART1 } from './monstersLegendaryCRPart1';
import { MONSTERS_LEGENDARYCRPART2 } from './monstersLegendaryCRPart2';
import { MONSTERS_LEGENDARYCRPART3 } from './monstersLegendaryCRPart3';

// Merge base monsters for compatibility
export const MONSTERS = {
  ...MONSTERS_BASE_PART1,
  ...MONSTERS_BASE_PART2,
  ...MONSTERS_BASE_PART3,
  ...MONSTERS_BASE_PART4,
  ...MONSTERS_BASE_PART5,
  ...MONSTERS_BASE_PART6,
  ...MONSTERS_BASE_PART7,
  ...MONSTERS_BASE_PART8
};

// Merge all monsters into a single export (117 total monsters)
export const ALL_MONSTERS = {
  ...MONSTERS_BASE_PART1,
  ...MONSTERS_BASE_PART2,
  ...MONSTERS_BASE_PART3,
  ...MONSTERS_BASE_PART4,
  ...MONSTERS_BASE_PART5,
  ...MONSTERS_BASE_PART6,
  ...MONSTERS_BASE_PART7,
  ...MONSTERS_BASE_PART8,
  ...MONSTERS_LOWCRPART1,
  ...MONSTERS_LOWCRPART2,
  ...MONSTERS_LOWCRPART3,
  ...MONSTERS_MIDCRPART1,
  ...MONSTERS_MIDCRPART2,
  ...MONSTERS_MIDCRPART3,
  ...MONSTERS_MIDCRPART4,
  ...MONSTERS_MIDCRPART5,
  ...MONSTERS_MIDCRPART6,
  ...MONSTERS_HIGHCRPART1,
  ...MONSTERS_HIGHCRPART2,
  ...MONSTERS_HIGHCRPART3,
  ...MONSTERS_HIGHCRPART4,
  ...MONSTERS_HIGHCRPART5,
  ...MONSTERS_VERYHIGHCRPART1,
  ...MONSTERS_VERYHIGHCRPART2,
  ...MONSTERS_VERYHIGHCRPART3,
  ...MONSTERS_VERYHIGHCRPART4,
  ...MONSTERS_EPICCRPART1,
  ...MONSTERS_EPICCRPART2,
  ...MONSTERS_EPICCRPART3,
  ...MONSTERS_LEGENDARYCRPART1,
  ...MONSTERS_LEGENDARYCRPART2,
  ...MONSTERS_LEGENDARYCRPART3
};

/**
 * Helper function to get monsters by Challenge Rating
 */
export function getMonstersByCR(minCR: number, maxCR: number) {
  return Object.values(ALL_MONSTERS).filter(
    monster => monster.challengeRating >= minCR && monster.challengeRating <= maxCR
  );
}

/**
 * Helper function to get monsters by type
 */
export function getMonstersByType(type: string) {
  return Object.values(ALL_MONSTERS).filter(
    monster => monster.type.toLowerCase() === type.toLowerCase()
  );
}

/**
 * Helper function to get a random monster within a CR range
 */
export function getRandomMonster(minCR: number, maxCR: number) {
  const eligible = getMonstersByCR(minCR, maxCR);
  if (eligible.length === 0) return null;
  return eligible[Math.floor(Math.random() * eligible.length)];
}

/**
 * Helper function to get legendary monsters
 */
export function getLegendaryMonsters() {
  return Object.values(ALL_MONSTERS).filter(
    monster => monster.legendaryActions && monster.legendaryActions.length > 0
  );
}

/**
 * Calculate encounter difficulty for a given party
 * Based on 5e encounter building rules
 */
export function calculateEncounterXP(monsters: any[]) {
  return monsters.reduce((total, monster) => total + monster.xp, 0);
}
