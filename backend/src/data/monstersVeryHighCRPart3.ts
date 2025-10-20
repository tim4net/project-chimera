/**
 * D&D 5e SRD Monster Database - CR 11-15 Part 3
 *
 * Part of the monster database split for maintainability (<300 lines per file)
 * Monsters imported from the 5e-database API (https://www.dnd5eapi.co)
 */

import { Monster } from './monsters';

export const MONSTERS_VERYHIGHCRPART3: Record<string, Monster> = {
  "archmage": {
    index: "archmage",
    name: "Archmage",
    size: "Medium",
    type: "humanoid",
    subtype: "any race",
    alignment: "any alignment",
    armorClass: 12,
    hitPoints: 99,
    hitDice: "18d8",
    speed: { walk: "30 ft." },
    abilityScores: {
      strength: 10,
      dexterity: 14,
      constitution: 12,
      intelligence: 20,
      wisdom: 15,
      charisma: 16
    },
    challengeRating: 12,
    proficiencyBonus: 4,
    xp: 8400,
    attacks: [
      {
        name: "Dagger",
        attackBonus: 6,
        damage: "1d4+2",
        damageType: "Piercing",
        description: "Melee or Ranged Weapon Attack: +6 to hit, reach 5 ft. or range 20/60 ft., one target. Hit: 4 (1d4 + 2) piercing damage."
      }
    ],
    specialAbilities: [
      {
        name: "Magic Resistance",
        description: "The archmage has advantage on saving throws against spells and other magical effects."
      },
      {
        name: "Spellcasting",
        description: "The archmage is an 18th-level spellcaster. Its spellcasting ability is Intelligence (spell save DC 17, +9 to hit with spell attacks). The archmage can cast disguise self and invisibility at will and has the following wizard spells prepared:  - Cantrips (at will): fire bolt, light, mage hand, prestidigitation, shocking grasp - 1st level (4 slots): detect magic, identify, mage armor*, magic missile - 2nd level (3 slots): detect thoughts, mirror image, misty step - 3rd level (3 slots): counterspell, fly, lightning bolt - 4th level (3 slots): banishment, fire shield, stoneskin* - 5th level (3 slots): cone of cold, scrying, wall of force - 6th level (1 slot): globe of invulnerability - 7th level (1 slot): teleport - 8th level (1 slot): mind blank* - 9th level (1 slot): time stop * The archmage casts these spells on itself before combat."
      }
    ],
    senses: { passive_perception: "12" },
    languages: "any six languages",
    damageVulnerabilities: [],
    damageResistances: ["damage from spells", "bludgeoning, piercing, and slashing from nonmagical attacks (from stoneskin)"],
    damageImmunities: [],
    conditionImmunities: []
  },

  "behir": {
    index: "behir",
    name: "Behir",
    size: "Huge",
    type: "monstrosity",
    alignment: "neutral evil",
    armorClass: 17,
    hitPoints: 168,
    hitDice: "16d12",
    speed: { walk: "50 ft.", climb: "40 ft." },
    abilityScores: {
      strength: 23,
      dexterity: 16,
      constitution: 18,
      intelligence: 7,
      wisdom: 14,
      charisma: 12
    },
    challengeRating: 11,
    proficiencyBonus: 4,
    xp: 7200,
    attacks: [
      {
        name: "Bite",
        attackBonus: 10,
        damage: "3d10+6",
        damageType: "Piercing",
        description: "Melee Weapon Attack: +10 to hit, reach 10 ft., one target. Hit: 22 (3d10 + 6) piercing damage."
      },
      {
        name: "Constrict",
        attackBonus: 10,
        damage: "2d10+6",
        damageType: "Bludgeoning",
        description: "Melee Weapon Attack: +10 to hit, reach 5 ft., one Large or smaller creature. Hit: 17 (2d10 + 6) bludgeoning damage plus 17 (2d10 + 6) slashing damage. The target is grappled (escape DC 16) if the behir isn't already constricting a creature, and the target is restrained until this grapple ends."
      }
    ],
    specialAbilities: [],
    senses: { darkvision: "90 ft.", passive_perception: "16" },
    languages: "Draconic",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning"],
    conditionImmunities: []
  },

  "djinni": {
    index: "djinni",
    name: "Djinni",
    size: "Large",
    type: "elemental",
    alignment: "chaotic good",
    armorClass: 17,
    hitPoints: 161,
    hitDice: "14d10",
    speed: { walk: "30 ft.", fly: "90 ft." },
    abilityScores: {
      strength: 21,
      dexterity: 15,
      constitution: 22,
      intelligence: 15,
      wisdom: 16,
      charisma: 20
    },
    challengeRating: 11,
    proficiencyBonus: 4,
    xp: 7200,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 9,
        damage: "2d6+5",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +9 to hit, reach 5 ft., one target. Hit: 12 (2d6 + 5) slashing damage plus 3 (1d6) lightning or thunder damage (djinni's choice)."
      }
    ],
    specialAbilities: [
      {
        name: "Elemental Demise",
        description: "If the djinni dies, its body disintegrates into a warm breeze, leaving behind only equipment the djinni was wearing or carrying."
      },
      {
        name: "Innate Spellcasting",
        description: "The djinni's innate spellcasting ability is Charisma (spell save DC 17, +9 to hit with spell attacks). It can innately cast the following spells, requiring no material components:  At will: detect evil and good, detect magic, thunderwave 3/day each: create food and water (can create wine instead of water), tongues, wind walk 1/day each: conjure elemental (air elemental only), creation, gaseous form, invisibility, major image, plane shift"
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "13" },
    languages: "Auran",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["lightning", "thunder"],
    conditionImmunities: []
  },

  "efreeti": {
    index: "efreeti",
    name: "Efreeti",
    size: "Large",
    type: "elemental",
    alignment: "lawful evil",
    armorClass: 17,
    hitPoints: 200,
    hitDice: "16d10",
    speed: { walk: "40 ft.", fly: "60 ft." },
    abilityScores: {
      strength: 22,
      dexterity: 12,
      constitution: 24,
      intelligence: 16,
      wisdom: 15,
      charisma: 16
    },
    challengeRating: 11,
    proficiencyBonus: 4,
    xp: 7200,
    attacks: [
      {
        name: "Scimitar",
        attackBonus: 10,
        damage: "2d6+6",
        damageType: "Slashing",
        description: "Melee Weapon Attack: +10 to hit, reach 5 ft., one target. Hit: 13 (2d6 + 6) slashing damage plus 7 (2d6) fire damage."
      },
      {
        name: "Hurl Flame",
        attackBonus: 7,
        damage: "5d6",
        damageType: "Fire",
        description: "Ranged Spell Attack: +7 to hit, range 120 ft., one target. Hit: 17 (5d6) fire damage."
      }
    ],
    specialAbilities: [
      {
        name: "Elemental Demise",
        description: "If the efreeti dies, its body disintegrates in a flash of fire and puff of smoke, leaving behind only equipment the djinni was wearing or carrying."
      },
      {
        name: "Innate Spellcasting",
        description: "The efreeti's innate spell casting ability is Charisma (spell save DC 15, +7 to hit with spell attacks). It can innately cast the following spells, requiring no material components:  At will: detect magic 3/day: enlarge/reduce, tongues 1/day each: conjure elemental (fire elemental only), gaseous form, invisibility, major image, plane shift, wall of fire"
      }
    ],
    senses: { darkvision: "120 ft.", passive_perception: "12" },
    languages: "Ignan",
    damageVulnerabilities: [],
    damageResistances: [],
    damageImmunities: ["fire"],
    conditionImmunities: []
  }
};
