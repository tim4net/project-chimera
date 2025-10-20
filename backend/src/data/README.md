# D&D 5e Magic Items Database

## Overview

This directory contains the complete D&D 5e System Reference Document (SRD) magic items database imported from the [D&D 5e API](https://www.dnd5eapi.co/api/magic-items).

## Files

- **magicItemsData.json** - Raw JSON data containing all 239 magic items
- **magicItems.ts** - TypeScript module with type definitions and helper functions

## Import Statistics

### Total Items: 239

### By Rarity
- **Rare**: 79 items
- **Uncommon**: 69 items
- **Very Rare**: 51 items
- **Legendary**: 27 items
- **Common**: 12 items
- **Artifact**: 1 item

### By Type
- **Wondrous Item**: 88 items
- **Weapon**: 28 items
- **Ring**: 25 items
- **Armor**: 16 items
- **Potion**: 16 items
- **Wand**: 13 items
- **Staff**: 12 items
- **Boots**: 7 items
- **Cloak**: 7 items
- **Amulet**: 6 items
- **Rod**: 6 items
- **Headgear**: 5 items
- **Container**: 4 items
- **Belt**: 2 items
- **Gloves**: 2 items
- **Ioun Stone**: 1 item
- **Scroll**: 1 item

### Attunement
- **Requires Attunement**: 126 items (52.7%)
- **No Attunement Required**: 113 items (47.3%)

## Data Structure

```typescript
interface MagicItem {
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare' | 'legendary' | 'artifact';
  type: string;
  requiresAttunement: boolean;
  description: string;
  properties?: {
    bonus?: number;        // +1/+2/+3 for weapons/armor
    charges?: number;      // Number of charges (e.g., Staff of the Magi: 50)
    damage?: string;       // Damage dice
    ac?: number;          // Armor class bonus
    effects?: string[];   // Special effects extracted from description
  };
}
```

## Usage Examples

### Get Items by Rarity

```typescript
import { getMagicItemsByRarity } from './magicItems';

const legendaryItems = getMagicItemsByRarity('legendary');
// Returns all 27 legendary items
```

### Get Items by Type

```typescript
import { getMagicItemsByType } from './magicItems';

const potions = getMagicItemsByType('potion');
// Returns all 16 potions
```

### Find Specific Item

```typescript
import { getMagicItemByName } from './magicItems';

const vorpalSword = getMagicItemByName('Vorpal Sword');
// Returns the Vorpal Sword item
```

### Get Random Loot

```typescript
import { getRandomMagicItem, getRandomMagicItems } from './magicItems';

// Get a single random legendary item
const treasure = getRandomMagicItem('legendary');

// Get 3 random uncommon rings
const rings = getRandomMagicItems(3, {
  rarity: 'uncommon',
  type: 'ring'
});
```

### Search Items

```typescript
import { searchMagicItems } from './magicItems';

// Find all items with "dragon" in the name
const dragonItems = searchMagicItems('dragon');
```

### Get Attunement Items

```typescript
import { getAttunementItems } from './magicItems';

// Get all items requiring attunement
const attunementItems = getAttunementItems();
// Returns 126 items
```

## Notable Items

### Legendary Items (27)
- Vorpal Sword (+3 weapon, decapitation on nat 20)
- Staff of the Magi (50 charges, powerful spellcasting)
- Scarab of Protection
- Sphere of Annihilation
- And 23 more...

### Very Rare Items (51)
- +3 Weapons and Armor
- Manual of Bodily Health
- Ring of Shooting Stars
- Staff of Power
- And 47 more...

### Rare Items (79)
- +2 Weapons and Armor
- Ring of Spell Storing (stores 5 spell levels)
- Boots of Speed
- Flame Tongue
- And 75 more...

### Uncommon Items (69)
- +1 Weapons and Armor
- Bag of Holding (extradimensional storage)
- Boots of Levitation
- Cloak of Protection
- And 65 more...

### Common Items (12)
- Potion of Healing (2d4+2 HP)
- +1 Ammunition
- Potion of Climbing
- And 9 more...

## Import Process

The data was imported using `/scripts/fetchMagicItems.ts`:

1. Fetched the list of all magic items from the API
2. Retrieved detailed information for each item
3. Parsed and extracted properties (bonus, charges, effects)
4. Detected item types from names and categories
5. Identified attunement requirements from descriptions
6. Generated TypeScript-compatible data structure

### Excluded Data

- **Variant items** were skipped (e.g., individual +1/+2/+3 variants)
- Parent items represent all variants (e.g., "Weapon, +1, +2, or +3")
- This reduced 362 API entries to 239 unique items

## Integration with Attunement System

See `/srv/nuaibria/backend/src/game/attunement.ts` for the D&D 5e attunement rules implementation:

- Maximum 3 attuned items per character
- Attunement requires a short rest (1 hour)
- Class/race/alignment restrictions are enforced
- Breaking attunement is instant

## Testing

Comprehensive test suites are available:

```bash
cd /srv/nuaibria/backend
npm test -- magicItems.test.ts
npm test -- attunement.test.ts
```

## References

- [D&D 5e API Documentation](https://www.dnd5eapi.co/docs/)
- [D&D 5e System Reference Document](https://dnd.wizards.com/resources/systems-reference-document)
- D&D 5e Player's Handbook (magic items chapter)
- D&D 5e Dungeon Master's Guide (magic items chapter)
