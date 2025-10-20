/**
 * Wizard Class Data
 * Imported from D&D 5e SRD
 */

import { ClassData } from '../classTypes';

export const WIZARD_DATA: ClassData = {
  name: "Wizard",
  hitDice: 6,
  proficiencies: {
    armor: [],
    weapons: [],
    tools: [],
    savingThrows: ["INT", "WIS"]
  },
  features: [
  { level: 1, name: "Spellcasting: Wizard", description: "As a student of arcane magic, you have a spellbook containing spells that show the first glimmerings of your true power.", type: "active" },
  { level: 1, name: "Arcane Recovery", description: "You have learned to regain some of your magical energy by studying your spellbook. Once per day when you finish a short rest, you can choose expended spell slots to recover. The spell slots can have a combined level that is equal to or less than half your wizard level (rounded up), and none of the slots can be 6th level or higher.\n\nFor example, if you're a 4th-level wizard, you can recover up to two levels worth of spell slots. You can recover either a 2nd-level spell slot or two 1st-level spell slots.", type: "passive" },
  { level: 2, name: "Arcane Tradition", description: "When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools, such as Evocation.\n\nYour choice grants you features at 2nd level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 4, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 6, name: "Arcane Tradition feature", description: "When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools, such as Evocation.\n\nYour choice grants you features at 2nd level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 8, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 10, name: "Arcane Tradition feature", description: "When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools, such as Evocation.\n\nYour choice grants you features at 2nd level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 12, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 14, name: "Arcane Tradition feature", description: "When you reach 2nd level, you choose an arcane tradition, shaping your practice of magic through one of eight schools, such as Evocation.\n\nYour choice grants you features at 2nd level and again at 6th, 10th, and 14th level.", type: "passive" },
  { level: 16, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 18, name: "Spell Mastery", description: "At 18th level, you have achieved such mastery over certain spells that you can cast them at will. Choose a 1st-level wizard spell and a 2nd-level wizard spell that are in your spellbook. You can cast those spells at their lowest level without expending a spell slot when you have them prepared. If you want to cast either spell at a higher level, you must expend a spell slot as normal.\n\nBy spending 8 hours in study, you can exchange one or both of the spells you chose for different spells of the same levels.", type: "passive" },
  { level: 19, name: "Ability Score Improvement", description: "When you reach 4th level, and again at 8th, 12th, 16th, and 19th level, you can increase one ability score of your choice by 2, or you can increase two ability scores of your choice by 1. As normal, you can't increase an ability score above 20 using this feature.", type: "choice" },
  { level: 20, name: "Signature Spell", description: "When you reach 20th level, you gain mastery over two powerful spells and can cast them with little effort. Choose two 3rd-level wizard spells in your spellbook as your signature spells. You always have these spells prepared, they don't count against the number of spells you have prepared, and you can cast each of them once at 3rd level without expending a spell slot. When you do so, you can't do so again until you finish a short or long rest.\n\nIf you want to cast either spell at a higher level, you must expend a spell slot as normal.", type: "passive" }
  ],
  spellcasting: {
    ability: "INT",
    slotsPerLevel: { 1: [2, 0, 0, 0, 0, 0, 0, 0, 0], 2: [3, 0, 0, 0, 0, 0, 0, 0, 0], 3: [4, 2, 0, 0, 0, 0, 0, 0, 0], 4: [4, 3, 0, 0, 0, 0, 0, 0, 0], 5: [4, 3, 2, 0, 0, 0, 0, 0, 0], 6: [4, 3, 3, 0, 0, 0, 0, 0, 0], 7: [4, 3, 3, 1, 0, 0, 0, 0, 0], 8: [4, 3, 3, 2, 0, 0, 0, 0, 0], 9: [4, 3, 3, 3, 1, 0, 0, 0, 0], 10: [4, 3, 3, 3, 2, 0, 0, 0, 0], 11: [4, 3, 3, 3, 2, 1, 0, 0, 0], 12: [4, 3, 3, 3, 2, 1, 0, 0, 0], 13: [4, 3, 3, 3, 2, 1, 1, 0, 0], 14: [4, 3, 3, 3, 2, 1, 1, 0, 0], 15: [4, 3, 3, 3, 2, 1, 1, 1, 0], 16: [4, 3, 3, 3, 2, 1, 1, 1, 0], 17: [4, 3, 3, 3, 2, 1, 1, 1, 1], 18: [4, 3, 3, 3, 3, 1, 1, 1, 1], 19: [4, 3, 3, 3, 3, 2, 1, 1, 1], 20: [4, 3, 3, 3, 3, 2, 2, 1, 1] }
  },
  subclasses: ["Evocation"]
};
