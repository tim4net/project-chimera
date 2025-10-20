// D&D 5e SRD Weapons
// Auto-generated from 5e-database API

export interface WeaponRange {
  normal: number;
  long?: number;
}

export interface Weapon {
  name: string;
  damage: string;
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  properties: string[];
  cost: number; // in gold pieces
  weight: number; // in pounds
  weaponCategory: 'Simple' | 'Martial';
  weaponRange: 'Melee' | 'Ranged';
  range?: WeaponRange;
  versatileDamage?: string;
}

export const weapons: Record<string, Weapon> = {
  'battleaxe': {
    "name": "Battleaxe",
    "damage": "1d8",
    "damageType": "slashing",
    "properties": [
      "versatile"
    ],
    "cost": 10,
    "weight": 4,
    "weaponCategory": "Martial",
    "weaponRange": "Melee",
    "versatileDamage": "1d10"
  },
  'blowgun': {
    "name": "Blowgun",
    "damage": "1",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "loading"
    ],
    "cost": 10,
    "weight": 1,
    "weaponCategory": "Martial",
    "weaponRange": "Ranged",
    "range": {
      "normal": 25,
      "long": 100
    }
  },
  'club': {
    "name": "Club",
    "damage": "1d4",
    "damageType": "bludgeoning",
    "properties": [
      "light",
      "monk"
    ],
    "cost": 1,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'crossbow__hand': {
    "name": "Crossbow, hand",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "light",
      "loading"
    ],
    "cost": 75,
    "weight": 3,
    "weaponCategory": "Martial",
    "weaponRange": "Ranged",
    "range": {
      "normal": 30,
      "long": 120
    }
  },
  'crossbow__heavy': {
    "name": "Crossbow, heavy",
    "damage": "1d10",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "heavy",
      "loading",
      "two-handed"
    ],
    "cost": 50,
    "weight": 18,
    "weaponCategory": "Martial",
    "weaponRange": "Ranged",
    "range": {
      "normal": 100,
      "long": 400
    }
  },
  'crossbow__light': {
    "name": "Crossbow, light",
    "damage": "1d8",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "loading",
      "two-handed"
    ],
    "cost": 25,
    "weight": 5,
    "weaponCategory": "Simple",
    "weaponRange": "Ranged",
    "range": {
      "normal": 80,
      "long": 320
    }
  },
  'dagger': {
    "name": "Dagger",
    "damage": "1d4",
    "damageType": "piercing",
    "properties": [
      "finesse",
      "light",
      "thrown",
      "monk"
    ],
    "cost": 2,
    "weight": 1,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'dart': {
    "name": "Dart",
    "damage": "1d4",
    "damageType": "piercing",
    "properties": [
      "finesse",
      "thrown"
    ],
    "cost": 5,
    "weight": 0.25,
    "weaponCategory": "Simple",
    "weaponRange": "Ranged",
    "range": {
      "normal": 20,
      "long": 60
    }
  },
  'flail': {
    "name": "Flail",
    "damage": "1d8",
    "damageType": "bludgeoning",
    "properties": [],
    "cost": 10,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'glaive': {
    "name": "Glaive",
    "damage": "1d10",
    "damageType": "slashing",
    "properties": [
      "heavy",
      "reach",
      "two-handed"
    ],
    "cost": 20,
    "weight": 6,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'greataxe': {
    "name": "Greataxe",
    "damage": "1d12",
    "damageType": "slashing",
    "properties": [
      "heavy",
      "two-handed"
    ],
    "cost": 30,
    "weight": 7,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'greatclub': {
    "name": "Greatclub",
    "damage": "1d8",
    "damageType": "bludgeoning",
    "properties": [
      "two-handed"
    ],
    "cost": 2,
    "weight": 10,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'greatsword': {
    "name": "Greatsword",
    "damage": "2d6",
    "damageType": "slashing",
    "properties": [
      "heavy",
      "two-handed"
    ],
    "cost": 50,
    "weight": 6,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'halberd': {
    "name": "Halberd",
    "damage": "1d10",
    "damageType": "slashing",
    "properties": [
      "heavy",
      "reach",
      "two-handed"
    ],
    "cost": 20,
    "weight": 6,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'handaxe': {
    "name": "Handaxe",
    "damage": "1d6",
    "damageType": "slashing",
    "properties": [
      "light",
      "thrown",
      "monk"
    ],
    "cost": 5,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'javelin': {
    "name": "Javelin",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "thrown",
      "monk"
    ],
    "cost": 5,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'lance': {
    "name": "Lance",
    "damage": "1d12",
    "damageType": "piercing",
    "properties": [
      "reach",
      "special"
    ],
    "cost": 10,
    "weight": 6,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'light_hammer': {
    "name": "Light hammer",
    "damage": "1d4",
    "damageType": "bludgeoning",
    "properties": [
      "light",
      "thrown",
      "monk"
    ],
    "cost": 2,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'longbow': {
    "name": "Longbow",
    "damage": "1d8",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "heavy",
      "two-handed"
    ],
    "cost": 50,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Ranged",
    "range": {
      "normal": 150,
      "long": 600
    }
  },
  'longsword': {
    "name": "Longsword",
    "damage": "1d8",
    "damageType": "slashing",
    "properties": [
      "versatile"
    ],
    "cost": 15,
    "weight": 3,
    "weaponCategory": "Martial",
    "weaponRange": "Melee",
    "versatileDamage": "1d10"
  },
  'mace': {
    "name": "Mace",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "properties": [
      "monk"
    ],
    "cost": 5,
    "weight": 4,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'maul': {
    "name": "Maul",
    "damage": "2d6",
    "damageType": "bludgeoning",
    "properties": [
      "heavy",
      "two-handed"
    ],
    "cost": 10,
    "weight": 10,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'morningstar': {
    "name": "Morningstar",
    "damage": "1d8",
    "damageType": "piercing",
    "properties": [],
    "cost": 15,
    "weight": 4,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'net': {
    "name": "Net",
    "damage": "1d4",
    "damageType": "bludgeoning",
    "properties": [
      "thrown",
      "special"
    ],
    "cost": 1,
    "weight": 3,
    "weaponCategory": "Martial",
    "weaponRange": "Ranged",
    "range": {
      "normal": 5,
      "long": 15
    }
  },
  'pike': {
    "name": "Pike",
    "damage": "1d10",
    "damageType": "piercing",
    "properties": [
      "heavy",
      "reach",
      "two-handed"
    ],
    "cost": 5,
    "weight": 18,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'quarterstaff': {
    "name": "Quarterstaff",
    "damage": "1d6",
    "damageType": "bludgeoning",
    "properties": [
      "versatile",
      "monk"
    ],
    "cost": 2,
    "weight": 4,
    "weaponCategory": "Simple",
    "weaponRange": "Melee",
    "versatileDamage": "1d8"
  },
  'rapier': {
    "name": "Rapier",
    "damage": "1d8",
    "damageType": "piercing",
    "properties": [
      "finesse"
    ],
    "cost": 25,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'scimitar': {
    "name": "Scimitar",
    "damage": "1d6",
    "damageType": "slashing",
    "properties": [
      "finesse",
      "light"
    ],
    "cost": 25,
    "weight": 3,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'shortbow': {
    "name": "Shortbow",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "ammunition",
      "two-handed"
    ],
    "cost": 25,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Ranged",
    "range": {
      "normal": 80,
      "long": 320
    }
  },
  'shortsword': {
    "name": "Shortsword",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "finesse",
      "light",
      "monk"
    ],
    "cost": 10,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'sickle': {
    "name": "Sickle",
    "damage": "1d4",
    "damageType": "slashing",
    "properties": [
      "light",
      "monk"
    ],
    "cost": 1,
    "weight": 2,
    "weaponCategory": "Simple",
    "weaponRange": "Melee"
  },
  'sling': {
    "name": "Sling",
    "damage": "1d4",
    "damageType": "bludgeoning",
    "properties": [
      "ammunition"
    ],
    "cost": 1,
    "weight": 0,
    "weaponCategory": "Simple",
    "weaponRange": "Ranged",
    "range": {
      "normal": 30,
      "long": 120
    }
  },
  'spear': {
    "name": "Spear",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "thrown",
      "versatile",
      "monk"
    ],
    "cost": 1,
    "weight": 3,
    "weaponCategory": "Simple",
    "weaponRange": "Melee",
    "versatileDamage": "1d8"
  },
  'trident': {
    "name": "Trident",
    "damage": "1d6",
    "damageType": "piercing",
    "properties": [
      "thrown",
      "versatile"
    ],
    "cost": 5,
    "weight": 4,
    "weaponCategory": "Martial",
    "weaponRange": "Melee",
    "versatileDamage": "1d8"
  },
  'war_pick': {
    "name": "War pick",
    "damage": "1d8",
    "damageType": "piercing",
    "properties": [],
    "cost": 5,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  },
  'warhammer': {
    "name": "Warhammer",
    "damage": "1d8",
    "damageType": "bludgeoning",
    "properties": [
      "versatile"
    ],
    "cost": 15,
    "weight": 2,
    "weaponCategory": "Martial",
    "weaponRange": "Melee",
    "versatileDamage": "1d10"
  },
  'whip': {
    "name": "Whip",
    "damage": "1d4",
    "damageType": "slashing",
    "properties": [
      "finesse",
      "reach"
    ],
    "cost": 2,
    "weight": 3,
    "weaponCategory": "Martial",
    "weaponRange": "Melee"
  }
};

export default weapons;
