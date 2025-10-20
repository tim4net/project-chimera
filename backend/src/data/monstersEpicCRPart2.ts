/**
 * D&D 5e SRD Monster Database - CR 16-20 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_EPICCRPART2: Record<string, Monster> = {
  "adult-silver-dragon": {
    index: "adult-silver-dragon",
    name: "Adult Silver Dragon",
    size: "Huge",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 19,
    hitPoints: 243,
    hitDice: "18d12",
    speed: { walk: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 10,
      constitution: 25,
      intelligence: 16,
      wisdom: 13,
      charisma: 21
    },
    challengeRating: 16,
    proficiencyBonus: 5,
    xp: 15000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 13,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 13,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +13 to hit, reach 5 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 13,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      }
    ],
    specialAbilities: [
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
        description: "The dragon beats its wings. Each creature within 10 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "ancient-brass-dragon": {
    index: "ancient-brass-dragon",
    name: "Ancient Brass Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic good",
    armorClass: 20,
    hitPoints: 297,
    hitDice: "17d20",
    speed: { walk: "40 ft.", burrow: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 10,
      constitution: 25,
      intelligence: 16,
      wisdom: 15,
      charisma: 19
    },
    challengeRating: 20,
    proficiencyBonus: 6,
    xp: 25000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 14,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 14,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 14,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +14 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
      }
    ],
    specialAbilities: [
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  },

  "ancient-white-dragon": {
    index: "ancient-white-dragon",
    name: "Ancient White Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic evil",
    armorClass: 20,
    hitPoints: 333,
    hitDice: "18d20",
    speed: { walk: "40 ft.", burrow: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 26,
      dexterity: 10,
      constitution: 26,
      intelligence: 10,
      wisdom: 13,
      charisma: 14
    },
    challengeRating: 20,
    proficiencyBonus: 6,
    xp: 25000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 14,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +14 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 9 (2d8) cold damage."
      },
      {
        name: "Claw",
        attackBonus: 14,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 15 (2d6 + 8) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 14,
        damage: "2d8+8",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +14 to hit, reach 20 ft., one target. Hit: 17 (2d8 + 8) bludgeoning damage."
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
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "23" },
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 22 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
