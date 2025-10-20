/**
 * Central export for monster database
 *
 * Aggregates all monster data and provides convenience exports
 */

export {
  Monster,
  AbilityScores,
  MonsterAttack,
  SpecialAbility,
  LegendaryAction,
  LairAction,
  MONSTERS,
  ALL_MONSTERS,
  getMonstersByCR,
  getMonstersByType,
  getRandomMonster,
  getLegendaryMonsters,
  calculateEncounterXP
} from './monsters';
