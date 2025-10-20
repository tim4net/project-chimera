/**
 * D&D 5e SRD Monster Database - CR 0-2 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LOWCRPART3: Record<string, Monster> = {
  "black-dragon-wyrmling": {
    index: "black-dragon-wyrmling",
    name: "Black Dragon Wyrmling",
    size: "Medium",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 17,
    hitPoints: 33,
    hitDice: "6d8",
    speed: { walk: "30 ft.", fly: "60 ft.", swim: "30 ft." },
    abilityScores: {
      strength: 15,
      dexterity: 14,
      constitution: 13,
      intelligence: 10,
      wisdom: 11,
      charisma: 13
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Bite",
        attackBonus: 4,
        damage: "1d10+2",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +4 to hit, reach 5 ft., one target. Hit: 7 (1d10 + 2) piercing damage plus 2 (1d4) acid damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon can breathe air and water."
      }
    ],
    senses: { blindsight: "10 ft.", darkvision: "60 ft.", passive_perception: "14" },
    languages: "Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["acid"],
    conditionImmunities: []
  }
};
