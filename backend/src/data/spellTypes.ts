/**
 * D&D 5e Spell Type Definitions
 */

export interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materialComponents?: string;
}

export interface SpellSavingThrow {
  abilityScore: string;
  successEffect: string;
}

export interface Spell {
  name: string;
  level: number; // 0 for cantrips
  school: string; // Evocation, Abjuration, etc.
  castingTime: string;
  range: string;
  components: SpellComponents;
  duration: string;
  concentration: boolean;
  ritual: boolean;
  description: string;
  higherLevels?: string;
  damageType?: string;
  savingThrow?: SpellSavingThrow;
  attackType?: 'melee' | 'ranged';
  classes: string[]; // Which classes can cast this
}

/**
 * Magic schools
 */
export const MAGIC_SCHOOLS = [
  'Abjuration',
  'Conjuration',
  'Divination',
  'Enchantment',
  'Evocation',
  'Illusion',
  'Necromancy',
  'Transmutation',
] as const;

export type MagicSchool = typeof MAGIC_SCHOOLS[number];
