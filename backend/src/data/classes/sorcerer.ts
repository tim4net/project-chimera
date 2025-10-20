/**
 * Sorcerer Class Data
 * Imported from D&D 5e SRD
 */

import { ClassData } from '../classTypes';

export const SORCERER_DATA: ClassData = {
  name: "Sorcerer",
  hitDice: 6,
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    savingThrows: ["CON", "CHA"]
  },
  features: [
  { level: 1, name: "Spellcasting: Sorcerer", description: "An event in your past, or in the life of a parent or ancestor, left an indelible mark on you, infusing you with arcane magic. This font of magic, whatever its origin, fuels your spells.", type: "active" },
  { level: 1, name: "Sorcerous Origin", description: "Choose a sorcerous origin, which describes the source of your innate magical power, such as Draconic Bloodline.\n\nYour choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.", type: "passive" },
  { level: 2, name: "Font of Magic", description: "At 2nd level, you tap into a deep wellspring of magic within yourself. This wellspring is represented by sorcery points, which allow you to create a variety of magical effects.\n\nSorcery Points\n\nYou have 2 sorcery points, and you gain more as you reach higher levels, as shown in the Sorcery Points column of the Sorcerer table. You can never have more sorcery points than shown on the table for your level. You regain all spent sorcery points when you finish a long rest.", type: "passive" },
  { level: 2, name: "Flexible Casting: Creating Spell Slots", description: "You can transform unexpended sorcery points into one spell slot as a bonus action on your turn. The Creating Spell Slots table shows the cost of creating a spell slot of a given level. You can create spell slots no higher in level than 5th. \n\nAny spell slot you create with this feature vanishes when you finish a long rest.", type: "active" },
  { level: 2, name: "Flexible Casting: Converting Spell Slot", description: "As a bonus action on your turn, you can expend one spell slot and gain a number of sorcery points equal to the slot's level..", type: "active" },
  { level: 3, name: "Metamagic", description: "At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level.\n\nYou can use only one Metamagic option on a spell when you cast it, unless otherwise noted.", type: "passive" },
  { level: 4, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 6, name: "Sorcerous Origin feature", description: "Choose a sorcerous origin, which describes the source of your innate magical power, such as Draconic Bloodline.\n\nYour choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.", type: "passive" },
  { level: 8, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 10, name: "Metamagic", description: "At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level.\n\nYou can use only one Metamagic option on a spell when you cast it, unless otherwise noted.", type: "passive" },
  { level: 12, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 14, name: "Sorcerous Origin feature", description: "Choose a sorcerous origin, which describes the source of your innate magical power, such as Draconic Bloodline.\n\nYour choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.", type: "passive" },
  { level: 16, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 17, name: "Metamagic", description: "At 3rd level, you gain the ability to twist your spells to suit your needs. You gain two of the following Metamagic options of your choice. You gain another one at 10th and 17th level.\n\nYou can use only one Metamagic option on a spell when you cast it, unless otherwise noted.", type: "passive" },
  { level: 18, name: "Sorcerous Origin feature", description: "Choose a sorcerous origin, which describes the source of your innate magical power, such as Draconic Bloodline.\n\nYour choice grants you features when you choose it at 1st level and again at 6th, 14th, and 18th level.", type: "passive" },
  { level: 19, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 20, name: "Sorcerous Restoration", description: "At 20th level, you regain 4 expended sorcery points whenever you finish a short rest.", type: "passive" }
  ],
  spellcasting: {
    ability: "CHA",
    slotsPerLevel: { 1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2: [3, 0, 0, 0, 0, 0, 0, 0, 0], 3: [4, 2, 0, 0, 0, 0, 0, 0, 0], 4: [4, 3, 0, 0, 0, 0, 0, 0, 0], 5: [4, 3, 2, 0, 0, 0, 0, 0, 0], 6: [4, 3, 3, 0, 0, 0, 0, 0, 0], 7: [4, 3, 3, 1, 0, 0, 0, 0, 0], 8: [4, 3, 3, 2, 0, 0, 0, 0, 0], 9: [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0], 13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1] }
  },
  subclasses: ["Draconic"]
};
