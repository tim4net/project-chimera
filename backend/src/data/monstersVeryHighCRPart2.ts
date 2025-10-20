/**
 * D&D 5e SRD Monster Database - CR 11-15 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_VERYHIGHCRPART2: Record<string, Monster> = {
  "adult-copper-dragon": {
    index: "adult-copper-dragon",
    name: "Adult Copper Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "chaotic good",
    armorClass: 18,
    hitPoints: 184,
    hitDice: "16d12",
    speed: { walk: "40 ft.", climb: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 12,
      constitution: 21,
      intelligence: 18,
      wisdom: 15,
      charisma: 17
    },
    challengeRating: 14,
    proficiencyBonus: 5,
    xp: 11500,
    attacks: [
      {
        name: "Bite",
        attackBonus: 11,
        damage: "2d10+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 11,
        damage: "2d6+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 11,
        damage: "2d8+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "adult-green-dragon": {
    index: "adult-green-dragon",
    name: "Adult Green Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "lawful evil",
    armorClass: 19,
    hitPoints: 207,
    hitDice: "18d12",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 12,
      constitution: 21,
      intelligence: 18,
      wisdom: 15,
      charisma: 17
    },
    challengeRating: 15,
    proficiencyBonus: 5,
    xp: 13000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 11,
        damage: "2d10+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 7 (2d6) poison damage."
      },
      {
        name: "Claw",
        attackBonus: 11,
        damage: "2d6+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 11,
        damage: "2d8+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
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
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "22" },
    languages: "Common, Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison"],
    conditionImmunities: ["Poisoned"],
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "adult-white-dragon": {
    index: "adult-white-dragon",
    name: "Adult White Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 18,
    hitPoints: 200,
    hitDice: "16d12",
    speed: { walk: "40 ft.", burrow: "30 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 22,
      dexterity: 10,
      constitution: 22,
      intelligence: 8,
      wisdom: 12,
      charisma: 12
    },
    challengeRating: 13,
    proficiencyBonus: 5,
    xp: 10000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 11,
        damage: "2d10+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +11 to hit, reach 10 ft., one target. Hit: 17 (2d10 + 6) piercing damage plus 4 (1d8) cold damage."
      },
      {
        name: "Claw",
        attackBonus: 11,
        damage: "2d6+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +11 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 11,
        damage: "2d8+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +11 to hit, reach 15 ft., one target. Hit: 15 (2d8 + 6) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "Ice Walk",
        description: "The dragon can move across and climb icy surfaces without needing to make an ability check. Additionally, difficult terrain composed of ice or snow doesn't cost it extra moment."
      },
      {
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "21" },
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 19 Dexterity saving throw or take 13 (2d6 + 6) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
