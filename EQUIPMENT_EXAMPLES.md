# Equipment Data Examples

## Sample Weapons

### Longsword (Versatile Martial Melee)
```typescript
{
  name: "Longsword",
  damage: "1d8",
  damageType: "slashing",
  properties: ["versatile"],
  cost: 15,
  weight: 3,
  weaponCategory: "Martial",
  weaponRange: "Melee",
  versatileDamage: "1d10"
}
```

### Shortbow (Simple Ranged)
```typescript
{
  name: "Shortbow",
  damage: "1d6",
  damageType: "piercing",
  properties: ["ammunition", "two-handed"],
  cost: 25,
  weight: 2,
  weaponCategory: "Simple",
  weaponRange: "Ranged",
  range: {
    normal: 80,
    long: 320
  }
}
```

### Dagger (Simple Melee/Thrown)
```typescript
{
  name: "Dagger",
  damage: "1d4",
  damageType: "piercing",
  properties: ["finesse", "light", "thrown", "monk"],
  cost: 2,
  weight: 1,
  weaponCategory: "Simple",
  weaponRange: "Melee"
}
```

## Sample Armor

### Chain Mail (Heavy Armor)
```typescript
{
  name: "Chain Mail",
  armorClass: 16,
  armorType: "Heavy",
  cost: 75,
  weight: 55,
  dexBonus: false,
  maxDexBonus: null,
  strMinimum: 13,
  stealthDisadvantage: true
}
```

### Leather Armor (Light Armor)
```typescript
{
  name: "Leather Armor",
  armorClass: 11,
  armorType: "Light",
  cost: 10,
  weight: 10,
  dexBonus: true,
  maxDexBonus: null
}
```

### Breastplate (Medium Armor)
```typescript
{
  name: "Breastplate",
  armorClass: 14,
  armorType: "Medium",
  cost: 400,
  weight: 20,
  dexBonus: true,
  maxDexBonus: 2
}
```

## Sample Adventuring Gear

### Backpack (Standard Gear)
```typescript
{
  name: "Backpack",
  cost: 2,
  weight: 5,
  gearCategory: "Standard Gear",
  description: ""
}
```

### Acid (vial) (Consumable Weapon)
```typescript
{
  name: "Acid (vial)",
  cost: 25,
  weight: 1,
  gearCategory: "Standard Gear",
  description: "As an action, you can splash the contents of this vial onto a creature within 5 feet of you or throw the vial up to 20 feet, shattering it on impact. In either case, make a ranged attack against a creature or object, treating the acid as an improvised weapon. On a hit, the target takes 2d6 acid damage."
}
```

### Healer's Kit (Tool)
```typescript
{
  name: "Healer's kit",
  cost: 5,
  weight: 3,
  gearCategory: "Kits",
  description: "This kit is a leather pouch containing bandages, salves, and splints. The kit has ten uses. As an action, you can expend one use of the kit to stabilize a creature that has 0 hit points, without needing to make a Wisdom (Medicine) check."
}
```

### Rope, Hempen (50 feet) (Standard Gear)
```typescript
{
  name: "Rope, hempen (50 feet)",
  cost: 1,
  weight: 10,
  gearCategory: "Standard Gear",
  description: "Rope, whether made of hemp or silk, has 2 hit points and can be burst with a DC 17 Strength check."
}
```

### Holy Water (flask) (Consumable)
```typescript
{
  name: "Holy water (flask)",
  cost: 25,
  weight: 1,
  gearCategory: "Standard Gear",
  description: "As an action, you can splash the contents of this flask onto a creature within 5 feet of you or throw it up to 20 feet, shattering it on impact. In either case, make a ranged attack against a target creature, treating the holy water as an improvised weapon. If the target is a fiend or undead, it takes 2d6 radiant damage. A cleric or paladin may create holy water by performing a special ritual. The ritual takes 1 hour to perform, uses 25 gp worth of powdered silver, and requires the caster to expend a 1st-level spell slot."
}
```

### Thieves' Tools (Tool Kit)
```typescript
{
  name: "Thieves' tools",
  cost: 25,
  weight: 1,
  gearCategory: "Kits",
  description: "This set of tools includes a small file, a set of lock picks, a small mirror mounted on a metal handle, a set of narrow-bladed scissors, and a pair of pliers. Proficiency with these tools lets you add your proficiency bonus to any ability checks you make to disarm traps or open locks."
}
```

## All Equipment Counts
- **37 Weapons** (17 Simple, 20 Martial)
- **13 Armor Pieces** (3 Light, 5 Medium, 4 Heavy, 1 Shield)
- **116 Adventuring Gear Items** (includes tools, consumables, ammunition, equipment packs, and arcane/divine foci)

**Total: 166 SRD Equipment Items**
