/**
 * D&D 5e SRD Monster Database - CR 16-20 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_EPICCRPART3: Record<string, Monster> = {
  "androsphinx": {
    index: "androsphinx",
    name: "Androsphinx",
    size: "Large",
    type: "monstrosity",
    alignment: "lawful neutral",
    armorClass: 17,
    hitPoints: 199,
    hitDice: "19d10",
    speed: { walk: "40 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 22,
      dexterity: 10,
      constitution: 20,
      intelligence: 16,
      wisdom: 18,
      charisma: 23
    },
    challengeRating: 17,
    proficiencyBonus: 6,
    xp: 18000,
    attacks: [
      {
        name: "Claw",
        attackBonus: 12,
        damage: "2d10+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +12 to hit, reach 5 ft., one target. Hit: 17 (2d10 + 6) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Inscrutable",
        description: "The sphinx is immune to any effect that would sense its emotions or read its thoughts, as well as any divination spell that it refuses. Wisdom (Insight) checks made to ascertain the sphinx's intentions or sincerity have disadvantage."
      },
      {
        name: "Magic Weapons",
        description: "The sphinx's weapon attacks are magical."
      },
      {
        name: "Spellcasting",
        description: "The sphinx is a 12th-level spellcaster. Its spellcasting ability is Wisdom (spell save DC 18, +10 to hit with spell attacks). It requires no material components to cast its spells. The sphinx has the following cleric spells prepared:  - Cantrips (at will): sacred flame, spare the dying, thaumaturgy - 1st level (4 slots): command, detect evil and good, detect magic - 2nd level (3 slots): lesser restoration, zone of truth - 3rd level (3 slots): dispel magic, tongues - 4th level (3 slots): banishment, freedom of movement - 5th level (2 slots): flame strike, greater restoration - 6th level (1 slot): heroes' feast"
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "20" },
    languages: "Common, Sphinx",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["psychic", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    conditionImmunities: ["Charmed", "Frightened"],
    legendaryActions: [
      {
        name: "Claw Attack",
        description: "The sphinx makes one claw attack.",
        cost: 1
      },
      {
        name: "Teleport (Costs 2 Actions)",
        description: "The sphinx magically teleports, along with any equipment it is wearing or carrying, up to 120 feet to an unoccupied space it can see.",
        cost: 1
      },
      {
        name: "Cast a Spell (Costs 3 Actions)",
        description: "The sphinx casts a spell from its list of prepared spells, using a spell slot as normal.",
        cost: 1
      }
    ]
  },

  "balor": {
    index: "balor",
    name: "Balor",
    size: "Huge",
    type: "fiend",
    subtype: "demon",
    alignment: "chaotic evil",
    armorClass: 19,
    hitPoints: 262,
    hitDice: "21d12",
    speed: { walk: "40 ft.", fly: "80 ft." },
    abilityScores: {
      strength: 26,
      dexterity: 15,
      constitution: 22,
      intelligence: 20,
      wisdom: 16,
      charisma: 22
    },
    challengeRating: 19,
    proficiencyBonus: 6,
    xp: 22000,
    attacks: [
      {
        name: "Longsword",
        attackBonus: 14,
        damage: "3d8+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 10 ft., one target. Hit: 21 (3d8 + 8) slashing damage plus 13 (3d8) lightning damage. If the balor scores a critical hit, it rolls damage dice three times, instead of twice."
      },
      {
        name: "Whip",
        attackBonus: 14,
        damage: "2d6+8",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +14 to hit, reach 30 ft., one target. Hit: 15 (2d6 + 8) slashing damage plus 10 (3d6) fire damage, and the target must succeed on a DC 20 Strength saving throw or be pulled up to 25 feet toward the balor."
      }
    ],
    specialAbilities: [
      {
        name: "Death Throes",
        description: "When the balor dies, it explodes, and each creature within 30 feet of it must make a DC 20 Dexterity saving throw, taking 70 (20d6) fire damage on a failed save, or half as much damage on a successful one. The explosion ignites flammable objects in that area that aren't being worn or carried, and it destroys the balor's weapons."
      },
      {
        name: "Fire Aura",
        description: "At the start of each of the balor's turns, each creature within 5 feet of it takes 10 (3d6) fire damage, and flammable objects in the aura that aren't being worn or carried ignite. A creature that touches the balor or hits it with a melee attack while within 5 feet of it takes 10 (3d6) fire damage."
      },
      {
        name: "Magic Resistance",
        description: "The balor has advantage on saving throws against spells and other magical effects."
      },
      {
        name: "Magic Weapons",
        description: "The balor's weapon attacks are magical."
      }
    ],
    senses: { truesight: "120 ft.", passive_perception: "13" },
    languages: "Abyssal, telepathy 120 ft.",
    damageVulnerabilities: [],
    damageResistances: ["cold", "lightning", "bludgeoning, piercing, and slashing from nonmagical weapons"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["Poisoned"]
  },

  "dragon-turtle": {
    index: "dragon-turtle",
    name: "Dragon Turtle",
    size: "Gargantuan",
    type: "dragon",
    alignment: "neutral",
    armorClass: 20,
    hitPoints: 341,
    hitDice: "22d20",
    speed: { walk: "20 ft.", swim: "40 ft." },
    abilityScores: {
      strength: 25,
      dexterity: 10,
      constitution: 20,
      intelligence: 10,
      wisdom: 12,
      charisma: 12
    },
    challengeRating: 17,
    proficiencyBonus: 6,
    xp: 18000,
    attacks: [
      {
        name: "Bite",
        attackBonus: 13,
        damage: "3d12+7",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 26 (3d12 + 7) piercing damage."
      },
      {
        name: "Claw",
        attackBonus: 13,
        damage: "2d8+7",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +13 to hit, reach 10 ft., one target. Hit: 16 (2d8 + 7) slashing damage."
      },
      {
        name: "Tail",
        attackBonus: 13,
        damage: "3d12+7",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +13 to hit, reach 15 ft., one target. Hit: 26 (3d12 + 7) bludgeoning damage. If the target is a creature, it must succeed on a DC 20 Strength saving throw or be pushed up to 10 feet away from the dragon turtle and knocked prone."
      }
    ],
    specialAbilities: [
      {
        name: "Amphibious",
        description: "The dragon turtle can breathe air and water."
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "11" },
    languages: "Aquan, Draconic",
    damageVulnerabilities: [],
    damageResistances: ["fire"],
    damageImmunities: [],
    conditionImmunities: []
  }
};
