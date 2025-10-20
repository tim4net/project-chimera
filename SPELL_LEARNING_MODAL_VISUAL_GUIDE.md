# SpellLearningModal Visual Guide

## Modal Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                    ╔═══════════════════════╗                    │
│                    ║  Learn New Spells     ║  (Arcane gradient) │
│                    ║  Level 5 Wizard       ║                    │
│                    ╚═══════════════════════╝                    │
│              Cantrips: 0 / 0    Spells: 2 / 3                  │
├─────────────────────────────────────────────────────────────────┤
│  🔍 [Search spells by name or description...]                   │
│                                                                 │
│  [All] [Lvl 1] [Lvl 2] [Lvl 3]...      [School: All Schools ▼] │
├─────────────────────────────────────────────────────────────────┤
│  ☐ Replace one known spell (optional for Wizard)               │
│     [Select spell to replace... ▼]                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐    │
│  │ Leveled Spells                                         │    │
│  │ ┌─────────────────────────────────────────────────┐  │    │
│  │ │ [Level 1] Burning Hands            Evocation   ☐│  │    │
│  │ │ ⏱️ 1 action  📍 Self (15-ft cone)  🔮 V,S       │  │    │
│  │ │ ⌛ Instantaneous                                 │  │    │
│  │ │ Each creature in a 15-foot cone must make...   │  │    │
│  │ └─────────────────────────────────────────────────┘  │    │
│  │                                                        │    │
│  │ ┌─────────────────────────────────────────────────┐  │    │
│  │ │ [Level 2] Scorching Ray          Evocation   ☑│  │    │
│  │ │ ⏱️ 1 action  📍 120 feet  🔮 V,S                │  │    │
│  │ │ ⌛ Instantaneous                                 │  │    │
│  │ │ You create three rays of fire...                │  │    │
│  │ └─────────────────────────────────────────────────┘  │    │
│  │                                                        │    │
│  │ ┌─────────────────────────────────────────────────┐  │    │
│  │ │ [Level 3] Fireball              Evocation    ☑│  │    │
│  │ │ ⏱️ 1 action  📍 150 feet  🔮 V,S,M              │  │    │
│  │ │ ⌛ Instantaneous                                 │  │    │
│  │ │ A bright streak flashes...            [SELECTED]│  │    │
│  │ └─────────────────────────────────────────────────┘  │    │
│  │                                                        │    │
│  │ ┌─────────────────────────────────────────────────┐  │    │
│  │ │ [Level 1] Magic Missile          Evocation     │  │    │
│  │ │ ⏱️ 1 action  📍 120 feet  🔮 V,S                │  │    │
│  │ │ ⌛ Instantaneous                   [Known] ✓   │  │    │
│  │ │ You create three glowing darts...               │  │    │
│  │ └─────────────────────────────────────────────────┘  │    │
│  └───────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────────┤
│                [Cancel]           [Confirm Selection]           │
└─────────────────────────────────────────────────────────────────┘
```

## Hover Tooltip Example

When hovering over a spell card, a detailed tooltip appears:

```
┌──────────────────────────────────────────────┐
│ Fireball                                     │
├──────────────────────────────────────────────┤
│ School: Evocation                            │
│ Casting Time: 1 action                       │
│ Range: 150 feet                              │
│ Duration: Instantaneous                      │
│ Components: V, S, M (tiny ball of bat guano) │
│ Damage: Fire                                 │
├──────────────────────────────────────────────┤
│ A bright streak flashes from your pointing  │
│ finger to a point you choose within range   │
│ and then blossoms with a low roar into an   │
│ explosion of flame. Each creature in a      │
│ 20-foot-radius sphere centered on that point│
│ must make a Dexterity saving throw. A target│
│ takes 8d6 fire damage on a failed save, or  │
│ half as much damage on a successful one.    │
│                                              │
│ At Higher Levels: When you cast this spell  │
│ using a spell slot of 4th level or higher,  │
│ the damage increases by 1d6 for each slot   │
│ level above 3rd.                             │
└──────────────────────────────────────────────┘
```

## Color Coding by Spell Level

The spell level badge has different colors:
- **Cantrip**: Mana blue (#4FC3F7)
- **Level 1**: Green (#66BB6A)
- **Level 2**: Blue (#42A5F5)
- **Level 3**: Purple (#AB47BC)
- **Level 4**: Yellow (#FFCA28)
- **Level 5**: Orange (#FF7043)
- **Level 6**: Red (#EF5350)
- **Level 7**: Pink (#EC407A)
- **Level 8**: Indigo (#5C6BC0)
- **Level 9**: Gold (#FFD700)

## State Indicators

### Selected Spell
```
┌─────────────────────────────────────────────────┐
│ [Level 3] Fireball              Evocation   ☑│  <- Checkbox checked
│ ⏱️ 1 action  📍 150 feet  🔮 V,S,M              │
│ ⌛ Instantaneous                                 │
│ A bright streak flashes...       [ARCANE GLOW] │  <- Blue glow effect
└─────────────────────────────────────────────────┘
```

### Known Spell (Disabled)
```
┌─────────────────────────────────────────────────┐
│ [Level 1] Magic Missile          Evocation     │  <- Grayed out
│ ⏱️ 1 action  📍 120 feet  🔮 V,S                │
│ ⌛ Instantaneous                   [Known] ✓   │  <- Green badge
│ You create three glowing darts...               │
└─────────────────────────────────────────────────┘
```

### Disabled (Limit Reached)
```
┌─────────────────────────────────────────────────┐
│ [Level 2] Misty Step            Conjuration  ☐│  <- Dimmed, cursor blocked
│ ⏱️ 1 bonus action  📍 Self  🔮 V                │
│ ⌛ Instantaneous                                 │
│ Briefly surrounded by silvery mist...           │
└─────────────────────────────────────────────────┘
```

## Progress Indicator States

### In Progress
```
Cantrips: 1 / 2    Spells: 2 / 3
  ↑ Blue           ↑ Arcane color
```

### Complete (Ready to Submit)
```
Cantrips: 2 / 2    Spells: 3 / 3
  ↑ Green          ↑ Green
```

## Filter Examples

### Level Filter Active
```
[All] [Lvl 1] [Lvl 2←Selected] [Lvl 3]
                  ↑ Highlighted in arcane blue
```

### School Filter Active
```
[School: Evocation ▼]
         ↑ Showing only Evocation spells
```

### Search Active
```
🔍 [fireball___]
    ↑ Shows only spells matching "fireball" in name/description
```

## Spell Replacement Section

### Enabled
```
☑ Replace one known spell (optional for Bard)
  [Magic Missile ▼]  <- Dropdown of known spells
     ↓
  • Magic Missile
  • Shield
  • Detect Magic
```

### Disabled
```
☐ Replace one known spell (optional for Wizard)
   <- Only checkbox, no dropdown
```

## Button States

### Confirm Button - Disabled
```
[         Confirm Selection         ]
  Gray background, cursor blocked
  Reason: Must select exact number of spells
```

### Confirm Button - Enabled
```
[         Confirm Selection         ]
  Arcane-to-mana gradient, glowing on hover
```

### Confirm Button - Submitting
```
[  ⟳  Learning Spells...  ]
  Spinning icon, disabled state
```

## Responsive Behavior

- Modal is max-width 5xl (~80rem)
- Height is max 90vh with internal scrolling
- Filter buttons wrap on narrow screens
- Spell cards stack vertically (always 1 column)
- Search bar is full width
- Tooltips are positioned intelligently to stay on screen

## Icons Used

- 🔍 Search
- ⏱️ Casting time
- 📍 Range
- 🔮 Components
- ⌛ Duration
- ⚠️ Concentration
- 📿 Ritual
- ✓ Known spell
- ☐/☑ Checkbox states
- ⟳ Loading spinner

## Accessibility

- Semantic HTML (inputs, buttons, labels)
- Keyboard navigation works naturally
- Hover tooltips also work with focus
- Color coding supplemented with text labels
- Progress indicator visible and clear
- Error messages display prominently
