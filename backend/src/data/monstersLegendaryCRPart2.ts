/**
 * D&D 5e SRD Monster Database - CR 21-30 Part 2
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_LEGENDARYCRPART2: Record<string, Monster> = {
  "ancient-copper-dragon": {
    index: "ancient-copper-dragon",
    name: "Ancient Copper Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "chaotic good",
    armorClass: 21,
    hitPoints: 350,
    hitDice: "20d20",
    speed: { walk: "40 ft.", climb: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 12,
      constitution: 25,
      intelligence: 20,
      wisdom: 17,
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
        description: "Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage."
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
        name: "Legendary Resistance",
        description: "If the dragon fails a saving throw, it can choose to succeed instead."
      }
    ],
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "27" },
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

  "ancient-gold-dragon": {
    index: "ancient-gold-dragon",
    name: "Ancient Gold Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "lawful good",
    armorClass: 22,
    hitPoints: 546,
    hitDice: "28d20",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 30,
      dexterity: 14,
      constitution: 29,
      intelligence: 18,
      wisdom: 17,
      charisma: 28
    },
    challengeRating: 24,
    proficiencyBonus: 7,
    xp: 62000,
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

  "ancient-green-dragon": {
    index: "ancient-green-dragon",
    name: "Ancient Green Dragon",
    size: "Gargantuan",
    type: "dragon",
    alignment: "lawful evil",
    armorClass: 21,
    hitPoints: 385,
    hitDice: "22d20",
    speed: { walk: "40 ft.", fly: "80 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 27,
      dexterity: 12,
      constitution: 25,
      intelligence: 20,
      wisdom: 17,
      charisma: 19
    },
    challengeRating: 22,
    proficiencyBonus: 7,
    xp: 41000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 15,
        damage: "2d10+8",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +15 to hit, reach 15 ft., one target. Hit: 19 (2d10 + 8) piercing damage plus 10 (3d6) poison damage."
      },
      {
        name: "Claw",
        attackBonus: 15,
        damage: "4d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +15 to hit, reach 10 ft., one target. Hit: 22 (4d6 + 8) slashing damage."
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
    senses: { blindsight: "60 ft.", darkvision: "120 ft.", passive_perception: "27" },
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
        description: "The dragon beats its wings. Each creature within 15 ft. of the dragon must succeed on a DC 23 Dexterity saving throw or take 15 (2d6 + 8) bludgeoning damage and be knocked prone. The dragon can then fly up to half its flying speed.",
        cost: 1
      }
    ]
  }
};
