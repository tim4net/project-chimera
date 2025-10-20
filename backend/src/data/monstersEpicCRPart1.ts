/**
 * D&D 5e SRD Monster Database - CR 16-20 Part 1
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_EPICCRPART1: Record<string, Monster> = {
  "adult-blue-dragon": {
    index: "adult-blue-dragon",
    name: "Adult Blue Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "lawful evil",
    armorClass: 19,
    hitPoints: 225,
    hitDice: "18d12",
    speed: { walk: "40 ft.", burrow: "30 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 25,
      dexterity: 10,
      constitution: 23,
      intelligence: 16,
      wisdom: 15,
      charisma: 19
    },
    challengeRating: 16,
    proficiencyBonus: 5,
    xp: 15000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 12,
        damage: "2d10+7",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +12 to hit, reach 10 ft., one target. Hit: 18 (2d10 + 7) piercing damage plus 5 (1d10) lightning damage."
      },
      {
        name: "Claw",
        attackBonus: 12,
        damage: "2d6+7",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 14 (2d6 + 7) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 12,
        damage: "2d8+7",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +12 to hit, reach 15 ft., one target. Hit: 16 (2d8 + 7) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "22" },
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 20 Dexterity saving throw or take 14 (2d6 + 7) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "adult-gold-dragon": {
    index: "adult-gold-dragon",
    name: "Adult Gold Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 19,
    hitPoints: 256,
    hitDice: "19d12",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 14,
      constitution: 25,
      intelligence: 16,
      wisdom: 15,
      charisma: 24
    },
    challengeRating: 17,
    proficiencyBonus: 6,
    xp: 18000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 14,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 14,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 14,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
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
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "24" },
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "adult-red-dragon": {
    index: "adult-red-dragon",
    name: "Adult Red Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 19,
    hitPoints: 256,
    hitDice: "19d12",
    speed: { walk: "40 ft.", climb: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 10,
      constitution: 25,
      intelligence: 16,
      wisdom: 13,
      charisma: 21
    },
    challengeRating: 17,
    proficiencyBonus: 6,
    xp: 18000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 14,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 7 (2d6) fire damage."
      },
      {
        name: "Claw",
        attackBonus: 14,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 14,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "23" },
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
