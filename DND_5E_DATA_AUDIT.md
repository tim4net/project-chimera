# D&D 5e SRD Data Audit Report
**Generated:** 2025-10-19
**Project:** Nuaibria
**Scope:** Comprehensive analysis of D&D 5e System Reference Document (SRD) data in the codebase

---

## Executive Summary

**Overall Completeness: 32%** (7/22 major categories)

The codebase has a **minimal foundation** of D&D 5e SRD data focused on character creation and basic combat. Critical gameplay systems like spells, monsters, and detailed equipment are **completely missing**. The project is currently suitable for basic character creation but lacks the depth needed for actual D&D 5e gameplay.

### Audit Breakdown by Category
- ✅ **Complete:** 3 categories (14%)
- ⚠️ **Partial:** 4 categories (18%)
- ❌ **Missing:** 15 categories (68%)

---

## 1. RACES (10 Core SRD Races)

### Status: ⚠️ **PARTIALLY IMPLEMENTED** (40% complete)

**Location:** `/srv/nuaibria/frontend/src/components/character-creation/CharacterCreationScreen.tsx` (Line 21)

**What's Implemented:**
- ✅ Race names list: `["Aasimar", "Dragonborn", "Dwarf", "Elf", "Gnome", "Goliath", "Halfling", "Human", "Orc", "Tiefling"]`
- ✅ Short descriptions (1 sentence each)
- ✅ Visual appearance hints for portrait generation (Lines 232-243)

**What's Missing:**
❌ **Racial traits and abilities:**
  - Ability score bonuses (e.g., Dwarf +2 CON)
  - Racial speed (e.g., Dwarf 25 ft, Elf 30 ft)
  - Darkvision ranges
  - Languages known
  - Racial special abilities (e.g., Halfling Lucky, Elf Trance, Dragonborn Breath Weapon)
  - Subraces (Hill Dwarf vs Mountain Dwarf, High Elf vs Wood Elf, etc.)

**Critical Gap:** Racial abilities are referenced in UI but **never applied** to character stats. Players can select races but receive no mechanical benefits.

**SRD Compliance:** 4/10 races match SRD exactly. Non-SRD races: Aasimar (Volo's Guide), Goliath (Volo's Guide), Orc (varies by edition).

---

## 2. CLASSES (12 Core SRD Classes)

### Status: ⚠️ **PARTIALLY IMPLEMENTED** (35% complete)

**Location:** `/srv/nuaibria/frontend/src/components/character-creation/CharacterCreationScreen.tsx` (Lines 22, 39-52)

**What's Implemented:**
- ✅ All 12 class names: `["Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"]`
- ✅ Class-specific skill choices and proficiencies (Lines 39-52)
- ✅ Hit dice types: `/srv/nuaibria/backend/src/game/experience.ts` (Lines 24-37)
- ✅ Proficiency bonus by level (Lines 39-60)
- ✅ Basic class features for levels 2-9 (Fighter, Wizard, Rogue, Cleric only) (Lines 122-156)
- ✅ Starting equipment packages for 3 classes (Fighter, Rogue, Wizard) (Lines 54-68)

**What's Missing:**
❌ **Critical class data:**
  - Saving throw proficiencies (e.g., Fighter: STR/CON)
  - Armor proficiencies (e.g., Wizard: no armor, Fighter: all armor)
  - Weapon proficiencies (e.g., Rogue: simple weapons, hand crossbows, longswords, rapiers, shortswords)
  - Tool proficiencies (e.g., Rogue: thieves' tools)
  - Starting HP calculation (only average roll exists, not max at level 1)
  - **Spellcasting progression** (slots per level for 9 caster classes)
  - **Subclasses/archetypes** (e.g., Fighter: Champion/Battle Master/Eldritch Knight)
  - **Complete class features for all levels 1-20**
  - **Multiclassing rules**
  - Starting equipment for 9/12 classes

**Example of Incomplete Implementation:**
```typescript
// experience.ts lines 122-156: Only 4 classes have ANY features defined
// 8 classes return empty arrays for all levels
Barbarian: [], Bard: [], // ... 6 more empty arrays
```

---

## 3. SKILLS (18 Total)

### Status: ✅ **COMPLETE** (100%)

**Location:** `/srv/nuaibria/frontend/src/components/character-creation/CharacterCreationScreen.tsx` (Line 26)

**Implemented:**
```typescript
const SKILLS = [
  'Acrobatics', 'Animal Handling', 'Arcana', 'Athletics',
  'Deception', 'History', 'Insight', 'Intimidation',
  'Investigation', 'Medicine', 'Nature', 'Perception',
  'Performance', 'Persuasion', 'Religion', 'Sleight of Hand',
  'Stealth', 'Survival'
]
```
✅ All 18 SRD skills present and correctly named
✅ Linked to ability scores implicitly
✅ Class skill proficiency selection system works

**No Issues Found.**

---

## 4. BACKGROUNDS (6 Core SRD)

### Status: ✅ **COMPLETE** (100%)

**Location:** `/srv/nuaibria/frontend/src/components/character-creation/CharacterCreationScreen.tsx` (Lines 29-36)

**Implemented:**
- ✅ All 6 SRD backgrounds: Acolyte, Criminal, Folk Hero, Noble, Sage, Soldier
- ✅ Descriptions for each
- ✅ Skill proficiencies (2 skills per background)
- ✅ Background features with descriptions

**Example:**
```typescript
"Acolyte": {
  description: "You have spent your life in service of a temple...",
  skillProficiencies: ['Insight', 'Religion'],
  feature: {
    name: "Shelter of the Faithful",
    description: "You can receive healing and care at temples..."
  }
}
```

**Minor Note:** SRD backgrounds also grant tool proficiencies and languages, which are not implemented. This is acceptable for MVP scope.

---

## 5. ABILITY SCORES & POINT BUY SYSTEM

### Status: ✅ **COMPLETE** (100%)

**Locations:**
- `/srv/nuaibria/frontend/src/components/character-creation/CharacterCreationScreen.tsx` (Lines 76-77)
- `/srv/nuaibria/backend/src/game/rules.ts` (entire file)
- `/srv/nuaibria/backend/src/game/dice.ts` (Lines 102-108)

**Implemented:**
- ✅ Point buy system (27 points, scores 8-15)
- ✅ Point costs per ability score (accurate to SRD)
- ✅ Ability modifier calculation: `Math.floor((score - 10) / 2)`
- ✅ Validation logic for point buy
- ✅ UI for adjusting scores with +/- buttons

**No Issues Found.**

---

## 6. EQUIPMENT (Weapons, Armor, Adventuring Gear)

### Status: ⚠️ **CRITICALLY INCOMPLETE** (5% complete)

**Location:** `/srv/nuaibria/backend/src/game/equipment.ts`

**What's Implemented:**
- ⚠️ Starting equipment packages for 12 classes (item **names only**)
- ⚠️ Starting gold amounts by class (Lines 125-138)

**What's Missing:**
❌ **NO equipment statistics whatsoever:**
  - **Weapons:** No damage dice, no damage types, no properties (finesse, versatile, two-handed, reach, etc.)
  - **Armor:** No AC values, no Strength requirements, no stealth disadvantage
  - **Adventuring Gear:** No weights, no costs, no descriptions
  - **Ammunition tracking:** Arrows/bolts quantities not enforced
  - **Equipment database/catalog:** No master list of items players can buy/find

**Example of Problem:**
```typescript
// Current implementation (equipment.ts line 11):
{ name: 'Greataxe', quantity: 1 }, // NO STATS

// What's needed:
{
  name: 'Greataxe',
  damage: '1d12',
  damageType: 'slashing',
  properties: ['Heavy', 'Two-Handed'],
  weight: 7,
  cost: 30, // gold pieces
  quantity: 1
}
```

**Impact:** Combat system cannot function properly without weapon damage stats. Loot system generates items that have no mechanical effect.

---

## 7. SPELLS (Cantrips through 9th Level)

### Status: ❌ **COMPLETELY MISSING** (0%)

**Evidence:** No spell data found anywhere in codebase.

**What's Needed:**
- ❌ Spell database with all SRD spells (~300+ spells)
- ❌ Spell properties: level, school, casting time, range, components, duration, description
- ❌ Spell slots per class per level (casters only)
- ❌ Cantrips (at-will spells with no slots)
- ❌ Known spells vs prepared spells systems
- ❌ Ritual casting rules
- ❌ Concentration mechanics
- ❌ Spell save DC and spell attack bonus calculations
- ❌ Spell selection UI during character creation
- ❌ Spellcasting system in combat

**Impact:** 9 of 12 classes (75%) rely heavily on spellcasting as their primary mechanic. The game is unplayable for Wizard, Sorcerer, Warlock, Cleric, Druid, Bard, Paladin, Ranger, and Eldritch Knight Fighters.

**Database Evidence:**
```typescript
// types/index.ts line 42:
spell_slots: Record<string, number>; // Field exists but is never populated
```

---

## 8. FEATS

### Status: ❌ **COMPLETELY MISSING** (0%)

**Evidence:** Keyword search found no feat implementations.

**What's Needed:**
- ❌ Feat database (~40 SRD feats)
- ❌ Feat selection during Ability Score Improvement levels (4, 8, 12, 16, 19)
- ❌ Feat prerequisites (e.g., "Heavy Armor Master" requires heavy armor proficiency)
- ❌ Feat bonuses (e.g., "Great Weapon Master": -5 to hit, +10 damage)

**Impact:** Players cannot customize characters beyond class features. This limits build diversity significantly.

---

## 9. CONDITIONS (14 Official Conditions)

### Status: ❌ **COMPLETELY MISSING** (0%)

**Evidence:** No condition system found.

**What's Needed:**
- ❌ Condition definitions: Blinded, Charmed, Deafened, Exhausted, Frightened, Grappled, Incapacitated, Invisible, Paralyzed, Petrified, Poisoned, Prone, Restrained, Stunned, Unconscious
- ❌ Condition effects (e.g., Poisoned: disadvantage on attack rolls and ability checks)
- ❌ Condition duration tracking
- ❌ UI to display active conditions on character sheet

**Impact:** Cannot accurately simulate combat effects, spell consequences, or environmental hazards.

---

## 10. MONSTERS / BESTIARY

### Status: ❌ **COMPLETELY MISSING** (0%)

**Evidence:** No monster stat blocks found. Keyword search for "monster" found only documentation references.

**What Exists:**
- ⚠️ Loot tables for 5 enemy types (goblin, wolf, bandit, skeleton, orc) in `/srv/nuaibria/backend/src/game/loot.ts`
- ⚠️ Basic "Combatant" interface in combat system (health, AC, damage string)

**What's Needed:**
- ❌ Monster stat blocks with SRD creatures (~300+ monsters)
- ❌ Monster properties: HP, AC, speed, ability scores, saving throws, skills, damage resistances/immunities, condition immunities
- ❌ Monster actions: attacks, special abilities, legendary actions, lair actions
- ❌ Challenge Rating (CR) system for encounter balancing
- ❌ Monster types (Aberration, Beast, Celestial, etc.)
- ❌ Monster sizes (Tiny, Small, Medium, Large, Huge, Gargantuan)

**Impact:** No enemies exist beyond hardcoded loot tables. Cannot generate dynamic encounters. AI DM has no creature database to reference.

---

## 11. COMBAT MECHANICS

### Status: ⚠️ **BASIC FRAMEWORK ONLY** (20% complete)

**Location:** `/srv/nuaibria/backend/src/game/combat.ts`

**What's Implemented:**
- ✅ Turn-based combat simulation
- ✅ Attack roll (1d20 vs AC)
- ✅ Damage roll (based on attacker's damage string)
- ✅ HP tracking
- ✅ Combat log generation
- ✅ Win/lose/draw determination

**What's Missing:**
❌ **Advanced combat rules:**
  - **Initiative system** (DEX-based turn order)
  - **Action economy** (Action, Bonus Action, Reaction, Movement)
  - **Advantage/Disadvantage** (framework exists in dice.ts but not used in combat)
  - **Critical hits** (double damage dice on natural 20)
  - **Fumbles/critical fails** (natural 1)
  - **Opportunity attacks**
  - **Cover mechanics** (half/three-quarters cover AC bonuses)
  - **Ranged attack disadvantage** (when target is adjacent)
  - **Two-weapon fighting**
  - **Grappling/shoving**
  - **Status effects** (see Conditions above)
  - **Concentration checks**
  - **Saving throws** (framework exists in dice.ts but not used)
  - **Area of effect spells/attacks**
  - **Multiple attacks per turn** (Fighter Extra Attack, etc.)

**Example of Missing Feature:**
```typescript
// dice.ts lines 166-167: Critical hit detection exists
isCritical: kept === 20,
isFumble: kept === 1,

// combat.ts: But combat system ignores these flags entirely
```

---

## 12. EXPERIENCE & LEVELING

### Status: ⚠️ **PARTIALLY IMPLEMENTED** (60% complete)

**Location:** `/srv/nuaibria/backend/src/game/experience.ts`

**What's Implemented:**
- ✅ XP thresholds for levels 1-20 (Lines 1-22)
- ✅ Proficiency bonus by level (Lines 39-60)
- ✅ Hit dice by class (Lines 24-37)
- ✅ Level-up detection (Lines 82-95)
- ✅ HP increase calculation (average of hit die + CON modifier) (Lines 103-119)
- ✅ Class features for levels 2-9 (4 classes only) (Lines 121-157)
- ✅ Ability Score Improvement tracking (Line 124)

**What's Missing:**
❌ **Level-up details:**
  - **Spellcasting progression** (new spell slots, cantrips, spells known)
  - **Class features for levels 10-20**
  - **Class features for 8 classes** (Barbarian, Bard, Paladin, Ranger, Sorcerer, Warlock, Druid, Monk)
  - **Subclass selection at level 3** (most classes)
  - **ASI vs Feat choice UI**
  - **HP roll choice** (average vs manual roll)
  - **Multiclassing XP requirements**

---

## 13. LOOT SYSTEM

### Status: ⚠️ **BASIC TEMPLATES ONLY** (25% complete)

**Location:** `/srv/nuaibria/backend/src/game/loot.ts`

**What's Implemented:**
- ✅ Loot tables for 5 enemy types (goblin, wolf, bandit, skeleton, orc) (Lines 12-49)
- ✅ Weighted random loot generation
- ✅ CR-based gold amounts (Lines 58-64)
- ✅ CR-based loot drop counts (Lines 66-72)
- ✅ Item quantities and descriptions

**What's Missing:**
❌ **Loot issues:**
  - **No item stats** (see Equipment section above)
  - **Only 5 enemy types have loot tables** (needs 50+ for variety)
  - **No magic items** (SRD has hundreds)
  - **No rarity system** (Common, Uncommon, Rare, Very Rare, Legendary)
  - **No cursed items**
  - **No consumables beyond basic potions**
  - **No treasure hoards** (for major encounters/dungeons)
  - **No art objects or gemstones**

---

## 14. DICE ROLLING SYSTEM

### Status: ✅ **EXCELLENT** (95% complete)

**Location:** `/srv/nuaibria/backend/src/game/dice.ts`

**What's Implemented:**
- ✅ Basic dice notation parser (e.g., "2d6+3")
- ✅ Advantage/Disadvantage system
- ✅ Ability checks
- ✅ Saving throws
- ✅ Attack rolls
- ✅ Damage rolls with multiple components
- ✅ Critical hit support (double dice)
- ✅ Seeded RNG for deterministic testing
- ✅ Detailed result objects with metadata
- ✅ Comprehensive test suite (`backend/src/__tests__/game/dice5e.test.ts`)

**Minor Gaps:**
- ⚠️ No exploding dice (e.g., "roll again on max")
- ⚠️ No reroll mechanics (e.g., Great Weapon Fighting style)

**Overall Assessment:** This is the **most complete and well-tested** system in the codebase.

---

## 15. CHARACTER SHEET DATA

### Status: ⚠️ **BASIC STRUCTURE ONLY** (40% complete)

**Location:** `/srv/nuaibria/backend/src/types/index.ts` (Lines 1-50)

**What's Implemented:**
```typescript
interface CharacterRecord {
  id, user_id, name, race, class, background, alignment, level, xp, gold,
  ability_scores, hp_max, hp_current, temporary_hp, armor_class, speed,
  hit_dice, position, campaign_seed, spell_slots, backstory, skills,
  portrait_url, proficiency_bonus, equipment
}
```

**What's Missing:**
❌ **Character sheet gaps:**
  - **Saving throw proficiencies** (which saves are proficient)
  - **Skill proficiency modifiers** (stored as string array, not with bonuses)
  - **Passive Perception** (10 + Perception modifier)
  - **Initiative bonus** (DEX modifier)
  - **Death saves** (3 successes/failures)
  - **Inspiration** (advantage token from RP)
  - **Exhaustion level** (1-6)
  - **Carrying capacity** (STR × 15)
  - **Prepared spells list** (for prepared casters)
  - **Known spells list** (for spontaneous casters)
  - **Spell save DC** (8 + proficiency + spellcasting ability)
  - **Spell attack bonus** (proficiency + spellcasting ability)
  - **Features and traits** (racial, class, background, feats)
  - **Proficiencies** (armor, weapons, tools, languages)
  - **Personality traits, ideals, bonds, flaws** (partial: only backstory)

---

## 16-22. COMPLETELY MISSING SYSTEMS

### ❌ **16. MULTICLASSING RULES** (0%)
- No level splitting logic
- No prerequisite checks (minimum ability scores)
- No proficiency restrictions when multiclassing

### ❌ **17. MAGIC ITEMS** (0%)
- No magic item database
- No attunement system (3 item limit)
- No item rarities
- No artifact rules

### ❌ **18. LANGUAGES** (0%)
- No language list (Common, Elvish, Dwarven, etc.)
- No language proficiencies

### ❌ **19. TOOLS** (0%)
- No tool proficiencies (Thieves' Tools, Smith's Tools, etc.)
- No tool check mechanics

### ❌ **20. RESTING** (0%)
- No short rest mechanics (1 hour, spend hit dice)
- No long rest mechanics (8 hours, full HP/spell slot recovery)

### ❌ **21. DAMAGE TYPES & RESISTANCES** (0%)
- No damage type system (Slashing, Piercing, Bludgeoning, Fire, Cold, etc.)
- No resistance/immunity/vulnerability tracking

### ❌ **22. ENVIRONMENT & EXPLORATION** (0%)
- No difficult terrain
- No hazards (traps, environmental damage)
- No vision and light rules (dim light, darkness, blindsight)
- No travel pace (slow/normal/fast)

---

## Recommendations: Priority Import List

### 🔴 **CRITICAL (Blocks Core Gameplay)**

1. **Equipment Stats** - Cannot simulate combat without weapon/armor stats
   - Weapon damage, properties (finesse, versatile, range)
   - Armor AC values
   - **Effort:** Medium (1-2 days)
   - **Files to Create:** `backend/src/data/equipment.ts` (weapons, armor, gear catalogs)

2. **Monster Stat Blocks** - No enemies for players to fight
   - At least 20-30 common monsters (goblins, wolves, bandits, undead, etc.)
   - HP, AC, attacks, special abilities
   - **Effort:** Large (3-5 days)
   - **Files to Create:** `backend/src/data/monsters.ts`

3. **Spells Database** - 75% of classes cannot function
   - Focus on cantrips + levels 1-3 spells for MVP (~100 spells)
   - Spell slots per level table
   - **Effort:** Very Large (5-7 days)
   - **Files to Create:** `backend/src/data/spells.ts`, `backend/src/game/spellcasting.ts`

### 🟠 **HIGH PRIORITY (Enhances Gameplay)**

4. **Complete Racial Traits** - Racial abilities have no mechanical effect
   - Ability score bonuses, speed, darkvision, special abilities
   - **Effort:** Small (1 day)
   - **Files to Update:** `frontend/src/data/races.ts` (create new file)

5. **Class Features (All Levels)** - Only 4 classes have features beyond level 1
   - Complete feature lists for all 12 classes, levels 1-20
   - **Effort:** Large (3-4 days)
   - **Files to Update:** `backend/src/data/classFeatures.ts` (create new file)

6. **Combat Enhancements** - Basic combat is too simplistic
   - Initiative, advantage/disadvantage, critical hits, saving throws
   - **Effort:** Medium (2-3 days)
   - **Files to Update:** `backend/src/game/combat.ts`

### 🟡 **MEDIUM PRIORITY (Improves Depth)**

7. **Conditions System** - Needed for spell effects and combat
   - 14 official conditions with effects
   - **Effort:** Small-Medium (1-2 days)

8. **Magic Items** - Essential for loot progression
   - Start with Common/Uncommon items (~50 items)
   - **Effort:** Medium (2 days)

9. **Feats** - Build diversity
   - SRD feats only (~40 feats)
   - **Effort:** Small-Medium (1-2 days)

### 🟢 **LOW PRIORITY (Nice to Have)**

10. **Resting Mechanics** - Can be simplified for MVP
11. **Multiclassing** - Complex system, not needed for MVP
12. **Languages/Tools** - Minor flavor, low gameplay impact

---

## Data Sources & Licensing

### Recommended Data Sources

1. **D&D 5e SRD (Official)** - Public domain, free to use
   - Available at: https://dnd.wizards.com/resources/systems-reference-document
   - Includes: Basic rules, classes, races, spells, monsters, equipment

2. **5e-database API** - Open-source JSON API
   - GitHub: https://github.com/5e-bits/5e-database
   - RESTful API: https://www.dnd5eapi.co/
   - **Recommended for import:** Pre-formatted JSON data

3. **Open5e** - Community-maintained SRD database
   - Website: https://open5e.com/
   - API: https://api.open5e.com/

### Import Strategy

**Option A: Manual Conversion** (More control, more effort)
- Copy SRD PDFs and manually type data into TypeScript files
- **Pros:** Custom data structure, no dependencies
- **Cons:** Time-consuming, error-prone

**Option B: API Integration** (Faster, requires parsing)
- Use 5e-database API to fetch JSON data
- Convert JSON to TypeScript interfaces
- **Pros:** Fast, comprehensive, well-tested data
- **Cons:** Need data transformation layer

**Recommended:** Use **5e-database API** for bulk import, then refine manually.

### Example Script to Import Spells:

```typescript
// scripts/import-spells.ts
import axios from 'axios';

const BASE_URL = 'https://www.dnd5eapi.co/api';

async function importSpells() {
  const response = await axios.get(`${BASE_URL}/spells`);
  const spells = response.data.results;

  for (const spell of spells) {
    const details = await axios.get(`${BASE_URL}${spell.url}`);
    // Transform to local format
    // Save to backend/src/data/spells.ts
  }
}
```

---

## Conclusion

The codebase has a **solid foundation** for character creation and basic mechanics (skills, point buy, dice rolling), but lacks the **actual game content** (spells, monsters, equipment stats) needed to play D&D 5e.

**Immediate Action Required:**
1. Import equipment stats (weapons, armor)
2. Import monster stat blocks (at least 30 creatures)
3. Import spells database (at least levels 0-3)

Without these three additions, the game cannot progress beyond character creation.

**Estimated Total Effort:** 15-20 days of focused development to reach 70% SRD coverage (playable MVP state).

---

## Appendix: File Inventory

### Files WITH D&D Data:
- ✅ `frontend/src/components/character-creation/CharacterCreationScreen.tsx` - Races, classes, skills, backgrounds
- ✅ `backend/src/game/equipment.ts` - Starting equipment (names only)
- ✅ `backend/src/game/dice.ts` - Dice mechanics (excellent)
- ✅ `backend/src/game/rules.ts` - Point buy validation
- ✅ `backend/src/game/experience.ts` - XP thresholds, class features (partial)
- ✅ `backend/src/game/loot.ts` - Loot tables (5 enemy types)
- ✅ `backend/src/game/combat.ts` - Basic combat simulation
- ✅ `backend/src/types/index.ts` - Character data structure

### Files NEEDING D&D Data (To Be Created):
- ❌ `backend/src/data/races.ts` - Full racial traits
- ❌ `backend/src/data/classFeatures.ts` - Complete class features
- ❌ `backend/src/data/equipment.ts` - Equipment with stats
- ❌ `backend/src/data/spells.ts` - Spell database
- ❌ `backend/src/data/monsters.ts` - Monster stat blocks
- ❌ `backend/src/data/feats.ts` - Feats database
- ❌ `backend/src/data/conditions.ts` - Conditions system
- ❌ `backend/src/data/magicItems.ts` - Magic items database
- ❌ `backend/src/game/spellcasting.ts` - Spellcasting rules engine

---

**End of Audit Report**
