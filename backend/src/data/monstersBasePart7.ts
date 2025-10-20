/**
 * D&D 5e SRD Monster Database - Base Collection Part 7
 *
 * Original monsters from initial database (5 monsters)
 */

import { Monster } from './monstersCore';

export const MONSTERS_BASE_PART7: Record<string, Monster> = {
  "mimic": {
    index: "mimic",
    name: "Mimic",
    size: "Medium",
    type: "monstrosity",
    subtype: "shapechanger",
    alignment: "neutral",
    armorClass: 12,
    hitPoints: 58,
    hitDice: "9d8+18",
    speed: { walk: "15 ft." },
    abilityScores: {
      strength: 17,
      dexterity: 12,
      constitution: 15,
      intelligence: 5,
      wisdom: 13,
      charisma: 8
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Pseudopod",
        attackBonus: 5,
        damage: "1d8+3",
        damageType: "bludgeoning",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) bludgeoning damage. If the mimic is in object form, the target is subjected to its Adhesive trait."
      },
      {
        name: "Bite",
        attackBonus: 5,
        damage: "1d8+3",
        damageType: "piercing",
        description: "Melee Weapon Attack: +5 to hit, reach 5 ft., one target. Hit: 7 (1d8 + 3) piercing damage plus 4 (1d8) acid damage."
      }
    ],
    specialAbilities: [
      {
        name: "Shapechanger",
        description: "The mimic can use its action to polymorph into an object or back into its true, amorphous form. Its statistics are the same in each form. Any equipment it is wearing or carrying isn't transformed. It reverts to its true form if it dies."
      },
      {
        name: "Adhesive (Object Form Only)",
        description: "The mimic adheres to anything that touches it. A Huge or smaller creature adhered to the mimic is also grappled by it (escape DC 13). Ability checks made to escape this grapple have disadvantage."
      },
      {
        name: "False Appearance (Object Form Only)",
        description: "While the mimic remains motionless, it is indistinguishable from an ordinary object."
      },
      {
        name: "Grappler",
        description: "The mimic has advantage on attack rolls against any creature grappled by it."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: ["acid"],
    damageImmunities: [],
    conditionImmunities: ["prone"]
  },

  "cockatrice": {
    index: "cockatrice",
    name: "Cockatrice",
    size: "Small",
    type: "monstrosity",
    alignment: "unaligned",
    armorClass: 11,
    hitPoints: 27,
    hitDice: "6d6+6",
    speed: { walk: "20 ft.", fly: "40 ft." },
    abilityScores: {
      strength: 6,
      dexterity: 12,
      constitution: 12,
      intelligence: 2,
      wisdom: 13,
      charisma: 5
    },
    challengeRating: 0.5,
    proficiencyBonus: 2,
    xp: 100,
    attacks: [
      {
        name: "Bite",
        attackBonus: 3,
        damage: "1d4+1",
        damageType: "piercing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one creature. Hit: 3 (1d4 + 1) piercing damage, and the target must succeed on a DC 11 Constitution saving throw against being magically petrified. On a failed save, the creature begins to turn to stone and is restrained. It must repeat the saving throw at the end of its next turn. On a success, the effect ends. On a failure, the creature is petrified for 24 hours."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "60 ft.", passive_perception: "11" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: [],
    conditionImmunities: []
  },

  "flying-sword": {
    index: "flying-sword",
    name: "Flying Sword",
    size: "Small",
    type: "construct",
    alignment: "unaligned",
    armorClass: 17,
    hitPoints: 17,
    hitDice: "5d6",
    speed: { walk: "0 ft.", fly: "50 ft. (hover)" },
    abilityScores: {
      strength: 12,
      dexterity: 15,
      constitution: 11,
      intelligence: 1,
      wisdom: 5,
      charisma: 1
    },
    challengeRating: 0.25,
    proficiencyBonus: 2,
    xp: 50,
    attacks: [
      {
        name: "Longsword",
        attackBonus: 3,
        damage: "1d8+1",
        damageType: "slashing",
        description: "Melee Weapon Attack: +3 to hit, reach 5 ft., one target. Hit: 5 (1d8 + 1) slashing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Antimagic Susceptibility",
        description: "The sword is incapacitated while in the area of an antimagic field. If targeted by dispel magic, the sword must succeed on a Constitution saving throw against the caster's spell save DC or fall unconscious for 1 minute."
      },
      {
        name: "False Appearance",
        description: "While the sword remains motionless and isn't flying, it is indistinguishable from a normal sword."
      }
    ],
    senses: { blindsight: "60 ft. (blind beyond this radius)", passive_perception: "7" },
    languages: "",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["poison", "psychic"],
    conditionImmunities: ["blinded", "charmed", "deafened", "frightened", "paralyzed", "petrified", "poisoned"]
  },

  "awakened-tree": {
    index: "awakened-tree",
    name: "Awakened Tree",
    size: "Huge",
    type: "plant",
    alignment: "unaligned",
    armorClass: 13,
    hitPoints: 59,
    hitDice: "7d12+14",
    speed: { walk: "20 ft." },
    abilityScores: {
      strength: 19,
      dexterity: 6,
      constitution: 15,
      intelligence: 10,
      wisdom: 10,
      charisma: 7
    },
    challengeRating: 2,
    proficiencyBonus: 2,
    xp: 450,
    attacks: [
      {
        name: "Slam",
        attackBonus: 6,
        damage: "3d6+4",
        damageType: "bludgeoning",
        description: "Melee Weapon Attack: +6 to hit, reach 10 ft., one target. Hit: 14 (3d6 + 4) bludgeoning damage."
      }
    ],
    specialAbilities: [
      {
        name: "False Appearance",
        description: "While the tree remains motionless, it is indistinguishable from a normal tree."
      }
    ],
    senses: { passive_perception: "10" },
    languages: "one language known by its creator",
    damageVulnerabilities: ["fire"],
    damageResistances: ["bludgeoning", "piercing"],
    damageImmunities: [],
    conditionImmunities: []
  },

  "fire-elemental": {
    index: "fire-elemental",
    name: "Fire Elemental",
    size: "Large",
    type: "elemental",
    alignment: "neutral",
    armorClass: 13,
    hitPoints: 102,
    hitDice: "12d10+36",
    speed: { walk: "50 ft." },
    abilityScores: {
      strength: 10,
      dexterity: 17,
      constitution: 16,
      intelligence: 6,
      wisdom: 10,
      charisma: 7
    },
    challengeRating: 5,
    proficiencyBonus: 3,
    xp: 1800,
    attacks: [
      {
        name: "Multiattack",
        attackBonus: 0,
        damage: "",
        damageType: "",
        description: "The elemental makes two touch attacks."
      },
      {
        name: "Touch",
        attackBonus: 6,
        damage: "2d6+3",
        damageType: "fire",
        description: "Melee Weapon Attack: +6 to hit, reach 5 ft., one target. Hit: 10 (2d6 + 3) fire damage. If the target is a creature or a flammable object, it ignites. Until a creature takes an action to douse the fire, the target takes 5 (1d10) fire damage at the start of each of its turns."
      }
    ],
    specialAbilities: [
      {
        name: "Fire Form",
        description: "The elemental can move through a space as narrow as 1 inch wide without squeezing. A creature that touches the elemental or hits it with a melee attack while within 5 feet of it takes 5 (1d10) fire damage. In addition, the elemental can enter a hostile creature's space and stop there. The first time it enters a creature's space on a turn, that creature takes 5 (1d10) fire damage and catches fire; until someone takes an action to douse the fire, the creature takes 5 (1d10) fire damage at the start of each of its turns."
      },
      {
        name: "Illumination",
        description: "The elemental sheds bright light in a 30-foot radius and dim light in an additional 30 feet."
      },
      {
        name: "Water Susceptibility",
        description: "For every 5 feet the elemental moves in water, or for every gallon of water splashed on it, it takes 1 cold damage."
      }
    ],
    senses: { darkvision: "60 ft.", passive_perception: "10" },
    languages: "Ignan",
    damageVulnerabilities: [],
    damageResistances: ["bludgeoning", "piercing", "slashing from nonmagical attacks"],
    damageImmunities: ["fire", "poison"],
    conditionImmunities: ["exhaustion", "grappled", "paralyzed", "petrified", "poisoned", "prone", "restrained", "unconscious"]
  },


};
