# D&D 5e Level-Up - Complete Specification

**What ACTUALLY happens when a character levels up**

---

## EVERY Level-Up (All Classes)

### 1. Hit Points
- Roll hit die (or take average)
- Add CON modifier
- Minimum: +1 HP per level
- Add to hp_max AND hp_current (gain the HP immediately)

### 2. Hit Dice Pool
- Gain +1 hit die of class type
- Used during short rests for healing

### 3. Proficiency Bonus (Specific Levels)
- **Levels 5, 9, 13, 17**: Proficiency bonus increases
- Level 1-4: +2
- Level 5-8: +3
- Level 9-12: +4
- Level 13-16: +5
- Level 17-20: +6

### 4. Class Features
- Check class table for features gained at this level
- Examples: Extra Attack (Fighter 5), Evasion (Rogue 7), etc.

---

## Spellcasters - Additional Changes

### 5. Spell Slots
- Gain new spell slot levels
- Increase number of slots
- Example: Bard level 3 gets 3rd level 1 slot + 2 level 2 slots

### 6. Spells Known/Prepared
- **Bard/Sorcerer/Warlock** (Spells Known):
  - Learn 1 new spell at most levels
  - Can REPLACE 1 old spell with different spell

- **Wizard** (Spellbook):
  - Learn 2 new spells per level (add to spellbook)
  - Can prepare different spells each day

- **Cleric/Druid/Paladin** (Prepared Casters):
  - Can prepare more spells (based on level + WIS/CHA)
  - Don't "learn" spells, prepare from full list

### 7. Cantrip Scaling
- At levels 5, 11, 17: Cantrip damage increases
- Vicious Mockery: 1d4 → 2d4 at level 5
- Fire Bolt: 1d10 → 2d10 at level 5

### 8. New Cantrips (Some Classes)
- Specific levels grant additional cantrips
- Bard: Gets new cantrip at levels 4 and 10
- Wizard/Sorcerer: Similar progression

---

## Ability Score Improvement Levels

### 9. ASI or Feat (Levels 4, 8, 12, 16, 19)
- **Choice**: +2 to one ability OR +1 to two abilities OR take a Feat
- Fighter: ALSO gets ASI at levels 6 and 14
- Rogue: ALSO gets ASI at level 10

**CRITICAL**: Player must choose!
- Can't automate this
- Requires decision (ASI or Feat?)
- If ASI: Which abilities?

---

## Subclass Selection

### 10. Subclass Choice (Varies by Class)
- **Level 1**: Cleric (Domain), Sorcerer (Origin), Warlock (Patron)
- **Level 2**: Druid (Circle), Wizard (School)
- **Level 3**: Barbarian, Bard, Fighter, Monk, Paladin, Ranger, Rogue

**CRITICAL**: Player chooses subclass
- Grants new features immediately
- Affects all future progression
- Can't be changed!

---

## What Our Current System Does

### Implemented:
- HP increase ✅
- Proficiency bonus ✅
- Hit dice pool ✅

### Missing:
- Spell slot progression ❌
- New spell selection ❌
- Spell replacement ❌
- Cantrip scaling ❌
- New cantrips at certain levels ❌
- **ASI/Feat choice** ❌ (CRITICAL!)
- Class features ❌
- Subclass features (after selection) ❌

---

## What GUI Spell Selection Means

### At Character Creation (Level 0→1):
**GUI Modal**: "Choose your starting spells"
- Cantrip checkboxes (select 2 for Bard)
- Spell checkboxes (select 4 for Bard)
- Confirm button
- The Chronicler narrates after

### At Level 2→3 (Bard):
**Notification**: "Level 3! You learn 1 new spell + choose subclass"

**GUI Modal 1 - New Spell**:
- Show available Bard spells
- Mark which are already known (disabled)
- Select 1 new spell
- Optionally: Replace 1 old spell

**GUI Modal 2 - Subclass**:
- College of Lore (description + features)
- College of Valor (description + features)
- College of Glamour (if available)
- Choose one

**The Chronicler**: Narrates both choices

### At Level 4 (Bard):
**Notification**: "Level 4! ASI + New Spell + New Cantrip"

**GUI Modal 1 - ASI**:
- Option 1: +2 to one ability (dropdown)
- Option 2: +1 to two abilities (two dropdowns)
- Option 3: Choose Feat (if implemented)
- Must choose!

**GUI Modal 2 - New Spell**:
- Select 1 new spell from Bard list
- Optional: Replace 1 old spell

**GUI Modal 3 - New Cantrip**:
- Select 1 new cantrip from Bard list

**The Chronicler**: Narrates all three choices

---

## The Reality:

**Level-ups are COMPLEX.** They require:
- Multiple choices
- Rule validation
- Database lookups
- Player decisions

**LLM narration is NOT sufficient** for managing this.

You NEED structured UI for:
- Spell selection
- ASI/Feat choice
- Subclass selection
- Ability score increases

**The Chronicler's role**: Provide flavor, explain options, celebrate choices

---

## Implementation Approach:

### Hybrid System (Best):
```
Level-Up Event
    ↓
The Chronicler: "You've grown stronger! Level 4!"
    ↓
GUI Modal: ASI Selection
Player chooses: +2 CHA
    ↓
The Chronicler: "Your presence becomes magnetic..."
    ↓
GUI Modal: New Spell Selection
Player chooses: Invisibility
    ↓
The Chronicler: "You've mastered the art of vanishing..."
    ↓
Game continues
```

**Benefits**:
- Reliable (GUI handles complex choices)
- Immersive (The Chronicler narrates flavor)
- Flexible (Can add tooltips, descriptions, validation)

---

## Bottom Line:

**Session 0 AND all future level-ups need structured UI**, not just LLM chat.

The game is:
- 95% perfect (combat, quests, exploration all work)
- 5% broken (character progression choices)

Fix: Build modal UIs for:
1. Initial spell selection (Session 0)
2. ASI selection (levels 4, 8, 12, 16, 19)
3. New spell selection (most level-ups)
4. Subclass selection (levels 1-3 depending on class)

**Want me to design these modals?** Or ship game with defaults for now?