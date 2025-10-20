/**
 * D&D 5e SRD Monster Database - CR 21-30 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LEGENDARYCRPART3: Record<string, Monster> = {
  "ancient-red-dragon": {
    index: "ancient-red-dragon",
    name: "Ancient Red Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 22,
    hitPoints: 546,
    hitDice: "28d20",
    speed: { walk: "40 ft.", climb: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 30,
      dexterity: 10,
      constitution: 29,
      intelligence: 18,
      wisdom: 15,
      charisma: 23
    },
    challengeRating: 24,
    proficiencyBonus: 7,
    xp: 62000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 17,
        damage: "2d10+10",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage plus 14 (4d6) fire damage."
      },
      {
        name: "Claw",
        attackBonus: 17,
        damage: "2d6+10",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 17,
        damage: "2d8+10",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "26" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: [],
    legendaryActions: [
      {
        name: "Detect",
        description: "The dragon makes a Wisdom (Perception) check.",
        cost: 1
      },
      {
        name: "Tail Attack",
        description: "The dragon makes a tail attack.",
        cost: 1
      },
      {
        name: "Wing Attack (Costs 2 Actions)",
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "ancient-silver-dragon": {
    index: "ancient-silver-dragon",
    name: "Ancient Silver Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 22,
    hitPoints: 487,
    hitDice: "25d20",
    speed: { walk: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 30,
      dexterity: 10,
      constitution: 29,
      intelligence: 18,
      wisdom: 15,
      charisma: 23
    },
    challengeRating: 23,
    proficiencyBonus: 7,
    xp: 50000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 17,
        damage: "2d10+10",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +17 to hit, reach 15 ft., one target. Hit: 21 (2d10 + 10) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 17,
        damage: "2d6+10",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +17 to hit, reach 10 ft., one target. Hit: 17 (2d6 + 10) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 17,
        damage: "2d8+10",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +17 to hit, reach 20 ft., one target. Hit: 19 (2d8 + 10) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "26" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["cold"],
    conditionImmunities: [],
    legendaryActions: [
      {
        name: "Detect",
        description: "The dragon makes a Wisdom (Perception) check.",
        cost: 1
      },
      {
        name: "Tail Attack",
        description: "The dragon makes a tail attack.",
        cost: 1
      },
      {
        name: "Wing Attack (Costs 2 Actions)",
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 25 Dexterity saving throw or take 17 (2d6 + 10) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
