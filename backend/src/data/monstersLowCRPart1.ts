/**
 * D&D 5e SRD Monster Database - CR 0-2 Part 1
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LOWCRPART1: Record<string, Monster> = {
  "acolyte": {
    index: "acolyte",
    name: "Acolyte",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any alignment",
    armorClass: 10,
    hitPoints: 9,
    hitDice: "2d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 14,
      charisma: 11
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Club",
        attackBonus: 2,
        damage: "1d4",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +2 to hit, reach 5 ft., one target. Hit: 2 (1d4) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Spellcasting",
        description: "The acolyte is a 1st-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 12, +4 to hit with spell attacks). The acolyte has following cleric spells prepared:  - Cantrips (at will): light, sacred flame, thaumaturgy - 1st level (3 slots): bless, cure wounds, sanctuary"
      }
    ],
    senses: { passive_perception: "12" },
    languages: "any one language (usually Common)",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "ankheg": {
    index: "ankheg",
    name: "Ankheg",
    size: "Large",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 14,
    hitPoints: 39,
    hitDice: "6d10",
    speed: { walk: "30 ft.", burrow: "10 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 11,
      constitution: 13,
      intelligence: 1,
      wisdom: 13,
      charisma: 6
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 250,
    attacks: [
      {
        name: "Bite",
        attackBonus: 5,
        damage: "2d6+3",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) slashing damage plus 3 (1d6) acid damage. If the target is a Large or smaller creature, it is grappled (escape DC 13). Until this grapple ends, the ankheg can bite only the grappled creature and has advantage on attack rolls to do so."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", tremorsense: "60 ft.", passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "ape": {
    index: "ape",
    name: "Ape",
    size: "Medium",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 19,
    hitDice: "3d8",
    speed: { walk: "30 ft.", climb: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 14,
      constitution: 14,
      intelligence: 6,
      wisdom: 12,
      charisma: 7
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Fist",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage."
      },
      {
        name: "Rock",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +5 to hit, range 25/50 ft., one target. Hit: 6 (1d6 + 3) bludgeoning damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "13" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "axe-beak": {
    index: "axe-beak",
    name: "Axe Beak",
    size: "Large",
    type: "beast",
    alignment: "unaligned",
    armorClass: 11,
    hitPoints: 19,
    hitDice: "3d10",
    speed: { walk: "50 ft." },
    abilityScores: {
      strength: 14,
      dexterity: 12,
      constitution: 12,
      intelligence: 2,
      wisdom: 10,
      charisma: 5
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Beak",
        attackBonus: 4,
        damage: "1d8+2",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 6 (1d8 + 2) slashing damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "10" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "azer": {
    index: "azer",
    name: "Azer",
    size: "Medium",
    type: "elemental",
    alignment: "lawful neutral",
    armorClass: 15,
    hitPoints: 39,
    hitDice: "6d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 12,
      constitution: 15,
      intelligence: 12,
      wisdom: 13,
      charisma: 10
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Warhammer",
        attackBonus: 5,
        damage: "1d8+3",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage, or 8 (1d10 + 3) bludgeoning damage if used with two hands to make a melee attack, plus 3 (1d6) fire damage."
      }
    ],
    specialAbilities: [
      {
        name: "Heated Body",
        description: "A creature that touches the azer or hits it with a melee attack while within 5 ft. of it takes 5 (1d10) fire damage."
      },
      {
        name: "Heated Weapons",
        description: "When the azer hits with a metal melee weapon, it deals an extra 3 (1d6) fire damage (included in the attack)."
      },
      {
        name: "Illumination",
        description: "The azer sheds bright light in a 10-foot radius and dim light for an additional 10 ft.."
      }
    ],
    senses: { passive_perception: "11" },
    languages: "Ignan",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  }
};
