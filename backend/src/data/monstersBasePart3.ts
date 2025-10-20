/**
 * D&D 5e SRD Monster Database - Base Collection Part 3
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART3: Record<string, Monster> = {
  "cultist": {
    index: "cultist",
    name: "Cultist",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any non-good alignment",
    armorClass: 12,
    hitPoints: 9,
    hitDice: "2d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 11,
      dexterity: 12,
      constitution: 10,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 3,
        damage: "1d6+1",
        damageType: "slashing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 4 (1d6 + 1) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Dark Devotion",
        description: "The cultist has advantage on saving throws against being charmed or frightened."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "bandit": {
    index: "bandit",
    name: "Bandit",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any non-lawful alignment",
    armorClass: 12,
    hitPoints: 11,
    hitDice: "2d8+2",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 11,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 3,
        damage: "1d6+1",
        damageType: "slashing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 4 (1d6 + 1) slashing damage."
      },
      {
        name: "Light Crossbow",
        attackBonus: 3,
        damage: "1d8+1",
        damageType: "piercing",
        description: "Ranged Weapon Attack: +3 to hit, range 80/320 ft., one target. Hit: 5 (1d8 + 1) piercing damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "10" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "guard": {
    index: "guard",
    name: "Guard",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any alignment",
    armorClass: 16,
    hitPoints: 11,
    hitDice: "2d8+2",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 13,
      dexterity: 12,
      constitution: 12,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    challengeRating: 0.125,
    proficiencyBonus: 2,
    xp: 25,
    attacks: [
      {
        name: "Spear",
        attackBonus: 3,
        damage: "1d6+1",
        damageType: "piercing",
        description: "Melee or Ranged Weapon Attack: +3 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d6 + 1) piercing damage, or 5 (1d8 + 1) piercing damage if used with two hands to make a melee attack."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "10" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "shadow": {
    index: "shadow",
    name: "Shadow",
    size: "Medium",
    type: "undead",
    alignment: "chaotic evil",
    armorClass: 12,
    hitPoints: 16,
    hitDice: "3d8+3",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 6,
      dexterity: 14,
      constitution: 13,
      intelligence: 6,
      wisdom: 10,
      charisma: 8
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Strength Drain",
        attackBonus: 4,
        damage: "2d6+2",
        damageType: "necrotic",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one creature. Hit: 9 (2d6 + 2) necrotic damage, and the target's Strength score is reduced by 1d4. The target dies if this reduces its Strength to 0. Otherwise, the reduction lasts until the target finishes a short or long rest."
      }
    ],
    specialAbilities: [
      {
        name: "Amorphous",
        description: "The shadow can move through a space as narrow as 1 inch wide without squeezing."
      },
      {
        name: "Shadow Stealth",
        description: "While in dim light or darkness, the shadow can take the Hide action as a bonus action."
      },
      {
        name: "Sunlight Weakness",
        description: "While in sunlight, the shadow has disadvantage on attack rolls, ability checks, and saving throws."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "",
    damageVulnerabilities: ["radiant"],
    damageResistances: ["acid", "cold", "fire", "lightning", "thunder", "bludgeoning", "piercing", "slashing from nonmagical attacks"],
    damageImmunities: ["necrotic", "poison"],
    conditionImmunities: ["exhaustion", "frightened", "grappled", "paralyzed", "petrified", "poisoned", "prone", "restrained"]
  },

  // ========================================
  // CR 1: Medium Encounters
  // ========================================

  "dire-wolf": {
    index: "dire-wolf",
    name: "Dire Wolf",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 37,
    hitDice: "5d10+10",
    speed: { walk: "50 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 15,
      constitution: 15,
      intelligence: 3,
      wisdom: 12,
      charisma: 7
    },
    challengeRating: 1,
    proficiencyBonus: 2,
    xp: 200,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "2d6+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) piercing damage. If the target is a creature, it must succeed on a DC 13 Strength saving throw or be knocked prone."
      }
    ],
    specialAbilities: [
      {
        name: "Keen Hearing and Smell",
        description: "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
      },
      {
        name: "Pack Tactics",
        description: "The wolf has advantage on an attack roll against a creature if at least one of the wolf's allies is within 5 ft. of the creature and the ally isn't incapacitated."
      }
    ],
    senses: { passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },


};
