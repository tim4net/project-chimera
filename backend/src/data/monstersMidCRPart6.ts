/**
 * D&D 5e SRD Monster Database - CR 3-5 Part 6
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_MIDCRPART6: Record<string, Monster> = {
  "half-red-dragon-veteran": {
    index: "half-red-dragon-veteran",
    name: "Half-Red Dragon Veteran",
    size: "Medium",
    type: "humanoid",
    subtype: "human",
    alignment: "any alignment",
    armorClass: 18,
    hitPoints: 65,
    hitDice: "10d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 16,
      dexterity: 13,
      constitution: 14,
      intelligence: 10,
      wisdom: 11,
      charisma: 10
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Longsword",
        attackBonus: 5,
        damage: "",
        damageType: "",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) slashing damage, or 8 (1d10 + 3) slashing damage if used with two hands."
      },
      {
        name: "Shortsword",
        attackBonus: 5,
        damage: "1d6+3",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 6 (1d6 + 3) piercing damage."
      },
      {
        name: "Heavy Crossbow",
        attackBonus: 3,
        damage: "1d10+1",
        damageType: "Piercing",
        description: "Ranged Weapon Attack: +3 to hit, range 100/400 ft., one target. Hit: 6 (1d10 + 1) piercing damage."
      }
    ],
    specialAbilities: [],
    senses: { blindsight: "10 ft.", darkvision: "60 ft.", passive_perception: "12" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: ["fire"],
    damageImmunities: [],
    conditionImmunities: []
  },

  "hill-giant": {
    index: "hill-giant",
    name: "Hill Giant",
    size: "Huge",
    type: "giant",
    alignment: "chaotic evil",
    armorClass: 13,
    hitPoints: 105,
    hitDice: "10d12",
    speed: { walk: "40 ft." },
    abilityScores: {
      strength: 21,
      dexterity: 8,
      constitution: 19,
      intelligence: 5,
      wisdom: 9,
      charisma: 6
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Greatclub",
        attackBonus: 8,
        damage: "3d8+5",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +8 to hit, reach 10 ft., one target. Hit: 18 (3d8 + 5) bludgeoning damage."
      },
      {
        name: "Rock",
        attackBonus: 8,
        damage: "3d10+5",
        damageType: "Bludgeoning",
        description: "Ranged Weapon Attack: +8 to hit, range 60/240 ft., one target. Hit: 21 (3d10 + 5) bludgeoning damage."
      }
    ],
    specialAbilities: [],
    senses: { passive_perception: "12" },
    languages: "Giant",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  }
};
