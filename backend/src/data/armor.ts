// D&D 5e SRD Armor
// Auto-generated from 5e-database API

export interface Armor {
  name: string;
  armorClass: number;
  armorType: 'Light' | 'Medium' | 'Heavy' | 'Shield';
  cost: number; // in gold pieces
  weight: number; // in pounds
  dexBonus: boolean;
  maxDexBonus?: number | null;
  strMinimum?: number;
  stealthDisadvantage?: boolean;
}

export const armor: Record<string, Armor> = {
  'breastplate': {
    "name": "Breastplate",
    "armorClass": 14,
    "armorType": "Medium",
    "cost": 400,
    "weight": 20,
    "dexBonus": true,
    "maxDexBonus": 2
  },
  'chain_mail': {
    "name": "Chain Mail",
    "armorClass": 16,
    "armorType": "Heavy",
    "cost": 75,
    "weight": 55,
    "dexBonus": false,
    "maxDexBonus": null,
    "strMinimum": 13,
    "stealthDisadvantage": true
  },
  'chain_shirt': {
    "name": "Chain Shirt",
    "armorClass": 13,
    "armorType": "Medium",
    "cost": 50,
    "weight": 20,
    "dexBonus": true,
    "maxDexBonus": 2
  },
  'half_plate_armor': {
    "name": "Half Plate Armor",
    "armorClass": 15,
    "armorType": "Medium",
    "cost": 750,
    "weight": 40,
    "dexBonus": true,
    "maxDexBonus": 2,
    "stealthDisadvantage": true
  },
  'hide_armor': {
    "name": "Hide Armor",
    "armorClass": 12,
    "armorType": "Medium",
    "cost": 10,
    "weight": 12,
    "dexBonus": true,
    "maxDexBonus": 2
  },
  'leather_armor': {
    "name": "Leather Armor",
    "armorClass": 11,
    "armorType": "Light",
    "cost": 10,
    "weight": 10,
    "dexBonus": true,
    "maxDexBonus": null
  },
  'padded_armor': {
    "name": "Padded Armor",
    "armorClass": 11,
    "armorType": "Light",
    "cost": 5,
    "weight": 8,
    "dexBonus": true,
    "maxDexBonus": null,
    "stealthDisadvantage": true
  },
  'plate_armor': {
    "name": "Plate Armor",
    "armorClass": 18,
    "armorType": "Heavy",
    "cost": 1500,
    "weight": 65,
    "dexBonus": false,
    "maxDexBonus": null,
    "strMinimum": 15,
    "stealthDisadvantage": true
  },
  'ring_mail': {
    "name": "Ring Mail",
    "armorClass": 14,
    "armorType": "Heavy",
    "cost": 30,
    "weight": 40,
    "dexBonus": false,
    "maxDexBonus": null,
    "stealthDisadvantage": true
  },
  'scale_mail': {
    "name": "Scale Mail",
    "armorClass": 14,
    "armorType": "Medium",
    "cost": 50,
    "weight": 45,
    "dexBonus": true,
    "maxDexBonus": 2,
    "stealthDisadvantage": true
  },
  'shield': {
    "name": "Shield",
    "armorClass": 2,
    "armorType": "Shield",
    "cost": 10,
    "weight": 6,
    "dexBonus": false,
    "maxDexBonus": null
  },
  'splint_armor': {
    "name": "Splint Armor",
    "armorClass": 17,
    "armorType": "Heavy",
    "cost": 200,
    "weight": 60,
    "dexBonus": false,
    "maxDexBonus": null,
    "strMinimum": 15,
    "stealthDisadvantage": true
  },
  'studded_leather_armor': {
    "name": "Studded Leather Armor",
    "armorClass": 12,
    "armorType": "Light",
    "cost": 45,
    "weight": 13,
    "dexBonus": true,
    "maxDexBonus": null
  }
};

export default armor;
