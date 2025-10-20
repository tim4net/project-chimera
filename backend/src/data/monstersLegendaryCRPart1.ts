/**
 * D&D 5e SRD Monster Database - CR 21-30 Part 1
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LEGENDARYCRPART1: Record<string, Monster> = {
  "ancient-black-dragon": {
    index: "ancient-black-dragon",
    name: "Ancient Black Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 22,
    hitPoints: 367,
    hitDice: "21d20",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 14,
      constitution: 25,
      intelligence: 16,
      wisdom: 15,
      charisma: 19
    },
    challengeRating: 21,
    proficiencyBonus: 7,
    xp: 33000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 15,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack:+ 15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) acid damage."
      },
      {
        name: "Claw",
        attackBonus: 15,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 15,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +15 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon can breathe air and water."
      },
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "26" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["acid"],
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "ancient-blue-dragon": {
    index: "ancient-blue-dragon",
    name: "Ancient Blue Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "lawful evil",
    armorClass: 22,
    hitPoints: 481,
    hitDice: "26d20",
    speed: { walk: "40 ft.", burrow: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 29,
      dexterity: 10,
      constitution: 27,
      intelligence: 18,
      wisdom: 17,
      charisma: 21
    },
    challengeRating: 23,
    proficiencyBonus: 7,
    xp: 50000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 16,
        damage: "2d10+9",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +16 to hit, reach 15 ft., one target. Hit: 20 (2d10 + 9) piercing damage plus 11 (2d10) lightning damage."
      },
      {
        name: "Claw",
        attackBonus: 16,
        damage: "2d6+9",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +16 to hit, reach 10 ft., one target. Hit: 16 (2d6 + 9) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 16,
        damage: "2d8+9",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +16 to hit, reach 20 ft., one target. Hit: 18 (2d8 + 9) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "27" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning"],
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 24 Dexterity saving throw or take 16 (2d6 + 9) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "ancient-bronze-dragon": {
    index: "ancient-bronze-dragon",
    name: "Ancient Bronze Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 22,
    hitPoints: 444,
    hitDice: "24d20",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 29,
      dexterity: 10,
      constitution: 27,
      intelligence: 18,
      wisdom: 17,
      charisma: 21
    },
    challengeRating: 22,
    proficiencyBonus: 7,
    xp: 41000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 16,
        damage: "2d10+9",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +16 to hit, reach 15 ft., one target. Hit: 20 (2d10 + 9) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 16,
        damage: "2d6+9",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +16 to hit, reach 10 ft., one target. Hit: 16 (2d6 + 9) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 16,
        damage: "2d8+9",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +16 to hit, reach 20 ft., one target. Hit: 18 (2d8 + 9) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon can breathe air and water."
      },
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "27" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning"],
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 24 Dexterity saving throw or take 16 (2d6 + 9) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
