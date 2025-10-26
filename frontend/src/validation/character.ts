/**
 * @fileoverview Comprehensive Zod validation schemas for character creation.
 * Validates all wizard steps and final character draft.
 */

import { z } from 'zod';
import type {
  Alignment,
  Race,
  CharacterClass,
  Background,
  SkillName,
  WizardStep,
} from '../types/wizard';

/**
 * Valid alignment options
 */
const ALIGNMENTS: Alignment[] = [
  'Lawful Good',
  'Neutral Good',
  'Chaotic Good',
  'Lawful Neutral',
  'True Neutral',
  'Chaotic Neutral',
  'Lawful Evil',
  'Neutral Evil',
  'Chaotic Evil',
];

/**
 * Valid race options
 */
const RACES: Race[] = [
  'Aasimar',
  'Dragonborn',
  'Dwarf',
  'Elf',
  'Gnome',
  'Goliath',
  'Halfling',
  'Human',
  'Orc',
  'Tiefling',
  'Half-Elf',
  'Half-Orc',
];

/**
 * Valid class options
 */
const CLASSES: CharacterClass[] = [
  'Barbarian',
  'Bard',
  'Cleric',
  'Druid',
  'Fighter',
  'Monk',
  'Paladin',
  'Ranger',
  'Rogue',
  'Sorcerer',
  'Warlock',
  'Wizard',
];

/**
 * Valid background options
 */
const BACKGROUNDS: Background[] = [
  'Acolyte',
  'Charlatan',
  'Criminal',
  'Entertainer',
  'Folk Hero',
  'Guild Artisan',
  'Hermit',
  'Noble',
  'Outlander',
  'Sage',
  'Sailor',
  'Soldier',
  'Urchin',
];

/**
 * Valid skill names
 */
const SKILLS: SkillName[] = [
  'Acrobatics',
  'Animal Handling',
  'Arcana',
  'Athletics',
  'Deception',
  'History',
  'Insight',
  'Intimidation',
  'Investigation',
  'Medicine',
  'Nature',
  'Perception',
  'Performance',
  'Persuasion',
  'Religion',
  'Sleight of Hand',
  'Stealth',
  'Survival',
];

/**
 * Step 1: Identity Schema
 */
export const identitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  age: z
    .number()
    .int('Age must be a whole number')
    .min(1, 'Age must be at least 1')
    .max(1000, 'Age must not exceed 1000')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description must not exceed 500 characters')
    .optional(),
  avatarUrl: z
    .string()
    .url('Avatar URL must be a valid URL')
    .optional()
    .or(z.literal('').transform(() => undefined)),
});

/**
 * Step 2: Core Attributes Schema
 */
export const coreAttributesSchema = z.object({
  race: z.enum(RACES as [Race, ...Race[]], {
    errorMap: () => ({ message: 'Please select a valid race' }),
  }),
  class: z.enum(CLASSES as [CharacterClass, ...CharacterClass[]], {
    errorMap: () => ({ message: 'Please select a valid class' }),
  }),
  background: z.enum(BACKGROUNDS as [Background, ...Background[]], {
    errorMap: () => ({ message: 'Please select a valid background' }),
  }),
});

/**
 * Step 3: Alignment Schema
 */
export const alignmentSchema = z.object({
  alignment: z.enum(ALIGNMENTS as [Alignment, ...Alignment[]], {
    errorMap: () => ({ message: 'Please select a valid alignment' }),
  }),
  personalityTraits: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Personality trait cannot be empty')
        .max(200, 'Personality trait must not exceed 200 characters')
    )
    .min(1, 'At least one personality trait is required')
    .max(4, 'Maximum of 4 personality traits allowed'),
  ideals: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Ideal cannot be empty')
        .max(200, 'Ideal must not exceed 200 characters')
    )
    .min(1, 'At least one ideal is required')
    .max(2, 'Maximum of 2 ideals allowed'),
  bonds: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Bond cannot be empty')
        .max(200, 'Bond must not exceed 200 characters')
    )
    .min(1, 'At least one bond is required')
    .max(2, 'Maximum of 2 bonds allowed'),
  flaws: z
    .array(
      z
        .string()
        .trim()
        .min(1, 'Flaw cannot be empty')
        .max(200, 'Flaw must not exceed 200 characters')
    )
    .min(1, 'At least one flaw is required')
    .max(2, 'Maximum of 2 flaws allowed'),
});

/**
 * Step 4: Ability Scores Schema
 * Note: Detailed validation logic is in abilities.ts
 */
export const abilityScoresSchema = z.object({
  baseScores: z.object({
    STR: z.number().int().min(8).max(15),
    DEX: z.number().int().min(8).max(15),
    CON: z.number().int().min(8).max(15),
    INT: z.number().int().min(8).max(15),
    WIS: z.number().int().min(8).max(15),
    CHA: z.number().int().min(8).max(15),
  }),
  pointsRemaining: z.number().int().min(0).max(27),
  finalScores: z.object({
    STR: z.number().int().min(8).max(20),
    DEX: z.number().int().min(8).max(20),
    CON: z.number().int().min(8).max(20),
    INT: z.number().int().min(8).max(20),
    WIS: z.number().int().min(8).max(20),
    CHA: z.number().int().min(8).max(20),
  }),
});

/**
 * Step 5: Skills Schema
 * Note: Class-specific constraints validated in skills.ts
 */
export const skillsSchema = z.object({
  proficientSkills: z
    .array(
      z.enum(SKILLS as [SkillName, ...SkillName[]], {
        errorMap: () => ({ message: 'Invalid skill name' }),
      })
    )
    .min(2, 'At least 2 skills are required')
    .max(10, 'Maximum of 10 proficient skills allowed'),
  backgroundSkills: z.array(
    z.enum(SKILLS as [SkillName, ...SkillName[]])
  ),
  classSkills: z.array(
    z.enum(SKILLS as [SkillName, ...SkillName[]])
  ),
});

/**
 * Step 6: Equipment Schema
 */
export const equipmentSchema = z.object({
  startingGold: z.number().int().min(0).max(1000),
  selectedEquipment: z
    .array(z.string().trim().min(1).max(100))
    .min(1, 'At least one equipment item is required')
    .max(20, 'Maximum of 20 equipment items allowed'),
  weapon: z.string().trim().max(50).optional(),
  armor: z.string().trim().max(50).optional(),
  tools: z.array(z.string().trim().max(50)).optional(),
});

/**
 * Complete Character Draft Schema
 * All steps combined and validated
 */
export const characterDraftSchema = z.object({
  // Identity
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  age: z.number().int().min(1).max(1000).optional(),
  description: z.string().trim().max(500).optional(),
  avatarUrl: z.string().url().optional(),

  // Core Attributes
  race: z.enum(RACES as [Race, ...Race[]]),
  class: z.enum(CLASSES as [CharacterClass, ...CharacterClass[]]),
  background: z.enum(BACKGROUNDS as [Background, ...Background[]]),

  // Alignment & Personality
  alignment: z.enum(ALIGNMENTS as [Alignment, ...Alignment[]]),
  personalityTraits: z.array(z.string().trim().min(1).max(200)).min(1).max(4),
  ideals: z.array(z.string().trim().min(1).max(200)).min(1).max(2),
  bonds: z.array(z.string().trim().min(1).max(200)).min(1).max(2),
  flaws: z.array(z.string().trim().min(1).max(200)).min(1).max(2),

  // Ability Scores (final scores with racial bonuses)
  abilityScores: z.object({
    STR: z.number().int().min(8).max(20),
    DEX: z.number().int().min(8).max(20),
    CON: z.number().int().min(8).max(20),
    INT: z.number().int().min(8).max(20),
    WIS: z.number().int().min(8).max(20),
    CHA: z.number().int().min(8).max(20),
  }),

  // Skills
  proficientSkills: z.array(z.enum(SKILLS as [SkillName, ...SkillName[]])).min(2).max(10),

  // Equipment
  startingGold: z.number().int().min(0).max(1000),
  equipment: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
});

/**
 * Final Character Schema (matches database schema)
 */
export const characterFinalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  name: z.string().trim().min(2).max(50),
  race: z.string(),
  class: z.string(),
  level: z.number().int().min(1).max(20),
  abilityScores: z.object({
    STR: z.number().int(),
    DEX: z.number().int(),
    CON: z.number().int(),
    INT: z.number().int(),
    WIS: z.number().int(),
    CHA: z.number().int(),
  }),
  hpCurrent: z.number().int().min(0),
  hpMax: z.number().int().min(1),
  xp: z.number().int().min(0),
  positionX: z.number().int(),
  positionY: z.number().int(),
  campaignSeed: z.string().nullable(),
  idleTask: z.string().nullable(),
  idleTaskStartedAt: z.string().nullable(),

  // Extended details
  description: z.string().nullable().optional(),
  backstory: z.string().nullable().optional(),
  personalityTraits: z.array(z.string()).nullable().optional(),
  ideals: z.array(z.string()).nullable().optional(),
  bonds: z.array(z.string()).nullable().optional(),
  flaws: z.array(z.string()).nullable().optional(),
  alignment: z.string().nullable().optional(),
  proficiencies: z.record(z.unknown()).nullable().optional(),
  spells: z.record(z.unknown()).nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

/**
 * Wizard Step Validation Map
 */
export const wizardStepSchemas: Record<WizardStep, z.ZodSchema | null> = {
  identity: identitySchema,
  coreAttributes: coreAttributesSchema,
  alignment: alignmentSchema,
  abilityScores: abilityScoresSchema,
  skills: skillsSchema,
  equipment: equipmentSchema,
  review: null, // Review step doesn't need its own schema
};

/**
 * Type inference helpers
 */
export type IdentityInput = z.infer<typeof identitySchema>;
export type CoreAttributesInput = z.infer<typeof coreAttributesSchema>;
export type AlignmentInput = z.infer<typeof alignmentSchema>;
export type AbilityScoresInput = z.infer<typeof abilityScoresSchema>;
export type SkillsInput = z.infer<typeof skillsSchema>;
export type EquipmentInput = z.infer<typeof equipmentSchema>;
export type CharacterDraftInput = z.infer<typeof characterDraftSchema>;
export type CharacterFinalInput = z.infer<typeof characterFinalSchema>;
