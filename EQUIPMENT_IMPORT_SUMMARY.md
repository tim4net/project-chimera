# D&D 5e Equipment Import Summary

Successfully imported complete D&D 5e SRD equipment data from https://www.dnd5eapi.co/api/

## Files Created

- `/srv/nuaibria/backend/src/data/weapons.ts` - 37 weapons (546 lines)
- `/srv/nuaibria/backend/src/data/armor.ts` - 13 armor pieces (146 lines)
- `/srv/nuaibria/backend/src/data/gear.ts` - 116 adventuring gear items (827 lines)
- `/srv/nuaibria/backend/src/data/equipment.ts` - Master index (18 lines)

## Total: 166 Equipment Items

### Weapons (37 items)
**Simple Melee:** Club, Dagger, Greatclub, Handaxe, Javelin, Light Hammer, Mace, Quarterstaff, Sickle, Spear

**Simple Ranged:** Crossbow (light), Dart, Shortbow, Sling

**Martial Melee:** Battleaxe, Flail, Glaive, Greataxe, Greatsword, Halberd, Lance, Longsword, Maul, Morningstar, Pike, Rapier, Scimitar, Shortsword, Trident, War Pick, Warhammer, Whip

**Martial Ranged:** Blowgun, Crossbow (hand), Crossbow (heavy), Longbow, Net

**Weapon Data Includes:**
- Damage dice (e.g., "1d8")
- Damage type (slashing, piercing, bludgeoning)
- Properties (finesse, versatile, two-handed, range, thrown, etc.)
- Cost (in gold pieces)
- Weight (in pounds)
- Weapon category (Simple/Martial)
- Range data (normal/long for ranged weapons)
- Versatile damage (for versatile weapons)

### Armor (13 items)
**Light Armor:** Padded, Leather, Studded Leather

**Medium Armor:** Hide, Chain Shirt, Scale Mail, Breastplate, Half Plate

**Heavy Armor:** Ring Mail, Chain Mail, Splint, Plate

**Shield:** Shield

**Armor Data Includes:**
- Base AC value
- Armor type (Light/Medium/Heavy/Shield)
- Dex bonus allowed (yes/no)
- Max dex bonus (for medium armor)
- Strength requirement (for heavy armor)
- Stealth disadvantage (yes/no)
- Cost (in gold pieces)
- Weight (in pounds)

### Adventuring Gear (116 items)
**Categories:**
- Standard Gear (backpack, rope, torches, etc.)
- Tools & Kits (thieves' tools, healer's kit, etc.)
- Holy Symbols (amulet, emblem, reliquary)
- Arcane Foci (crystal, orb, rod, staff, wand)
- Druidic Foci (sprig of mistletoe, totem, yew wand)
- Ammunition (arrows, bolts, bullets, needles)
- Equipment Packs (burglar's pack, explorer's pack, etc.)
- Consumables (rations, potions, oil)

**Gear Data Includes:**
- Name
- Cost (in gold pieces)
- Weight (in pounds)
- Gear category
- Description (where available)

## Usage Example

```typescript
import { weapons, armor, gear, equipment } from './data/equipment';

// Access a specific weapon
const longsword = equipment.weapons.longsword;
console.log(longsword.damage); // "1d8"
console.log(longsword.damageType); // "slashing"
console.log(longsword.versatileDamage); // "1d10"

// Access armor
const chainMail = equipment.armor.chain_mail;
console.log(chainMail.armorClass); // 16
console.log(chainMail.stealthDisadvantage); // true

// Access gear
const backpack = equipment.gear.backpack;
console.log(backpack.cost); // 2 gp
console.log(backpack.weight); // 5 lbs
```

## TypeScript Interfaces

All equipment has proper TypeScript interfaces with type safety:

```typescript
interface Weapon {
  name: string;
  damage: string;
  damageType: 'slashing' | 'piercing' | 'bludgeoning';
  properties: string[];
  cost: number;
  weight: number;
  weaponCategory: 'Simple' | 'Martial';
  weaponRange: 'Melee' | 'Ranged';
  range?: WeaponRange;
  versatileDamage?: string;
}

interface Armor {
  name: string;
  armorClass: number;
  armorType: 'Light' | 'Medium' | 'Heavy' | 'Shield';
  cost: number;
  weight: number;
  dexBonus: boolean;
  maxDexBonus?: number | null;
  strMinimum?: number;
  stealthDisadvantage?: boolean;
}

interface AdventuringGear {
  name: string;
  cost: number;
  weight: number;
  gearCategory: string;
  description: string;
}
```

## Data Source
All data fetched from the official D&D 5e API: https://www.dnd5eapi.co/api/2014/

This is the complete SRD (System Reference Document) equipment catalog, which is open content under the OGL (Open Gaming License).
