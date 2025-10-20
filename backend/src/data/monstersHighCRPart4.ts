/**
 * D&D 5e SRD Monster Database - CR 6-10 Part 4
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_HIGHCRPART4: Record<string, Monster> = {
  "frost-giant": {
    index: "frost-giant",
    name: "Frost Giant",
    size: "Huge",
    type: "giant",
    alignment: "neutral evil",
    armorClass: 15,
    hitPoints: 138,
    hitDice: "12d12",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 9,
      constitution: 21,
      intelligence: 9,
      wisdom: 10,
      charisma: 12
    },
    challengeRating: 8,
    proficiencyBonus: 3,
    xp: 3900,
    attacks: [
      {
        name: "Greataxe",
        attackBonus: 9,
        damage: "3d12+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 25 (3d12 + 6) slashing damage."
      },
      {
        name: "Rock",
        attackBonus: 9,
        damage: "4d10+6",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +9 to hit, range 60/240 ft., one target. Hit: 28 (4d10 + 6) bludgeoning damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "13" },
    languages: "Giant",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["cold"],
    conditionImmunities: []
  },

  "giant-ape": {
    index: "giant-ape",
    name: "Giant Ape",
    size: "Huge",
    type: "beast",
    alignment: "unaligned",
    armorClass: 12,
    hitPoints: 157,
    hitDice: "15d12",
    speed: { walk: "40 ft.", climb: "40 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 14,
      constitution: 18,
      intelligence: 7,
      wisdom: 12,
      charisma: 7
    },
    challengeRating: 7,
    proficiencyBonus: 3,
    xp: 2900,
    attacks: [
      {
        name: "Fist",
        attackBonus: 9,
        damage: "3d10+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 22 (3d10 + 6) bludgeoning damage."
      },
      {
        name: "Rock",
        attackBonus: 9,
        damage: "7d6+6",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +9 to hit, range 50/100 ft., one target. Hit: 30 (7d6 + 6) bludgeoning damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "14" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "glabrezu": {
    index: "glabrezu",
    name: "Glabrezu",
    size: "Large",
    type: "fiend",
    subtype: "demon",
    alignment: "chaotic evil",
    armorClass: 17,
    hitPoints: 157,
    hitDice: "15d10",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 20,
      dexterity: 15,
      constitution: 21,
      intelligence: 19,
      wisdom: 17,
      charisma: 16
    },
    challengeRating: 9,
    proficiencyBonus: 4,
    xp: 5000,
    attacks: [
      {
        name: "Pincer",
        attackBonus: 9,
        damage: "2d10+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +9 to hit, reach 10 ft., one target. Hit: 16 (2d10 + 5) bludgeoning damage. If the target is a Medium or smaller creature, it is grappled (escape DC 15). The glabrezu has two pincers, each of which can grapple only one target."
      },
      {
        name: "Fist",
        attackBonus: 9,
        damage: "2d4+2",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 7 (2d4 + 2) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Innate Spellcasting",
        description: "The glabrezu's spellcasting ability is Intelligence (spell save DC 16). The glabrezu can innately cast the following spells, requiring no material components: At will: darkness, detect magic, dispel magic 1/day each: confusion, fly, power word stun"
      },
      {
        name: "Magic Resistance",
        description: "The glabrezu has advantage on saving throws against spells and other magical effects."
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "13" },
    languages: "Abyssal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "fire", "lightning", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["poison"],
    conditionImmunities: ["Poisoned"]
  },

  "guardian-naga": {
    index: "guardian-naga",
    name: "Guardian Naga",
    size: "Large",
    type: "monstrosity",
    alignment: "lawful good",
    armorClass: 18,
    hitPoints: 127,
    hitDice: "15d10",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 18,
      constitution: 16,
      intelligence: 16,
      wisdom: 19,
      charisma: 18
    },
    challengeRating: 10,
    proficiencyBonus: 4,
    xp: 5900,
    attacks: [
      {
        name: "Bite",
        attackBonus: 8,
        damage: "1d8+4",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one creature. Hit: 8 (1d8 + 4) piercing damage, and the target must make a DC 15 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one."
      },
      {
        name: "Spit Poison",
        attackBonus: 8,
        damage: "",
        damageType: "",
        description: "Ranged Weapon Attack: +8 to hit, range 15/30 ft., one creature. Hit: The target must make a DC 15 Constitution saving throw, taking 45 (10d8) poison damage on a failed save, or half as much damage on a successful one."
      }
    ],
    specialAbilities: [
      {
        name: "Rejuvenation",
        description: "If it dies, the naga returns to life in 1d6 days and regains all its hit points. Only a wish spell can prevent this trait from functioning."
      },
      {
        name: "Spellcasting",
        description: "The naga is an 11th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 16, +8 to hit with spell attacks), and it needs only verbal components to cast its spells. It has the following cleric spells prepared:  - Cantrips (at will): mending, sacred flame, thaumaturgy - 1st level (4 slots): command, cure wounds, shield of faith - 2nd level (3 slots): calm emotions, hold person - 3rd level (3 slots): bestow curse, clairvoyance - 4th level (3 slots): banishment, freedom of movement - 5th level (2 slots): flame strike, geas - 6th level (1 slot): true seeing"
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "14" },
    languages: "Celestial, Common",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["Charmed", "Poisoned"]
  }
};
