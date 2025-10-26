# Design System Component Preview

Visual reference for all design system components.

---

## Color Palette

### Primary Purple Shades

```
┌─────────────────┐
│  #2D1B69        │  Purple-0 (Darkest - Deep backgrounds)
│  ■■■■■■■■■■■■■  │
└─────────────────┘

┌─────────────────┐
│  #3D2B7D        │  Purple-1 (Darker - Card backgrounds)
│  ■■■■■■■■■■■■■  │
└─────────────────┘

┌─────────────────┐
│  #4D3B8D        │  Purple-2 (Mid - Interactive surfaces)
│  ■■■■■■■■■■■■■  │
└─────────────────┘

┌─────────────────┐
│  #5D4B9D        │  Purple-3 (Lighter - Hover highlights)
│  ■■■■■■■■■■■■■  │
└─────────────────┘
```

### Gold Accent

```
┌─────────────────┐
│  #B8860B        │  Gold Dark (Pressed states)
│  ████████████   │
└─────────────────┘

┌─────────────────┐
│  #D4AF37        │  Gold Standard (Primary accent)
│  ████████████   │
└─────────────────┘

┌─────────────────┐
│  #F0E68C        │  Gold Light (Highlights, glows)
│  ████████████   │
└─────────────────┘
```

### Teal Secondary

```
┌─────────────────┐
│  #1B4D5C        │  Teal-0 (Dark)
│  ▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────┘

┌─────────────────┐
│  #2B6D7C        │  Teal-1 (Mid)
│  ▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────┘

┌─────────────────┐
│  #3B8D9C        │  Teal-2 (Light)
│  ▓▓▓▓▓▓▓▓▓▓▓▓  │
└─────────────────┘
```

### Status Colors

```
┌─────────────────┐
│  #10B981        │  Success (Green)
│  ✓✓✓✓✓✓✓✓✓✓✓✓  │
└─────────────────┘

┌─────────────────┐
│  #EF4444        │  Error (Red)
│  ✗✗✗✗✗✗✗✗✗✗✗✗  │
└─────────────────┘

┌─────────────────┐
│  #F59E0B        │  Warning (Amber)
│  ⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠⚠  │
└─────────────────┘

┌─────────────────┐
│  #3B82F6        │  Info (Blue)
│  ℹℹℹℹℹℹℹℹℹℹℹℹ  │
└─────────────────┘
```

---

## Typography Scale

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
H1: Create Your Character
    48px, Bold, Tight tracking
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━━━
H2: Choose Your Race
    36px, Bold, Tight tracking
━━━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━━━━━
H3: Elf
    28px, Bold
━━━━━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━━━━
H4: Section Title
    24px, Semibold
━━━━━━━━━━━━━━━━━

━━━━━━━━━━━━━━
H5: Subsection
    20px, Semibold
━━━━━━━━━━━━━━

━━━━━━━━━━━━
H6: Label
    16px, Semibold
━━━━━━━━━━━━

Body Large: Emphasized paragraph text for important instructions.
            18px, Regular, Line-height 1.6

Body: Standard paragraph text for descriptions and content.
      16px, Regular, Line-height 1.5

Body Small: Smaller text for secondary information.
            14px, Regular, Line-height 1.5

Caption: Hints, metadata, and auxiliary information
         12px, Regular, Line-height 1.4
```

---

## Card Component States

### Default Card
```
┌──────────────────────────────────┐
│                                  │
│             ✨                   │
│                                  │
│            Elf                   │
│                                  │
│  Graceful and wise, with keen    │
│  senses and mastery of magic.    │
│                                  │
└──────────────────────────────────┘
Border: 1px solid #374151 (gray)
Background: #3D2B7D (purple-1)
```

### Hover State
```
┌──────────────────────────────────┐  ↑ -2px (lifted)
│                                  │  ▓ Shadow increased
│             ✨                   │
│                                  │
│            Elf                   │
│                                  │
│  Graceful and wise, with keen    │
│  senses and mastery of magic.    │
│                                  │
└──────────────────────────────────┘
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
Border: 1px solid #D4AF37 (gold) ✨
Background: #3D2B7D (purple-1)
```

### Selected State
```
╔══════════════════════════════════╗
║                                  ║
║             ✨                   ║
║                                  ║
║            Elf                   ║
║                                  ║
║  Graceful and wise, with keen    ║
║  senses and mastery of magic.    ║
║                                  ║
╚══════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Gold glow
Border: 2px solid #D4AF37 (gold) ✨
Background: #4D3B8D (purple-2, lighter)
```

### Disabled State
```
┌──────────────────────────────────┐
│                                  │
│             🔒                   │
│                                  │
│        Locked Race               │
│                                  │
│    Unlock at Level 5             │
│                                  │
└──────────────────────────────────┘
Border: 1px solid #374151 (gray)
Background: #3D2B7D (purple-1)
Opacity: 50%
Cursor: not-allowed
```

---

## Button Component States

### Primary Button (Default)
```
┌──────────────────┐
│   Next Step →    │
└──────────────────┘
Background: #D4AF37 (gold)
Text: #111827 (dark)
Height: 44px
```

### Primary Button (Hover)
```
┌──────────────────┐  ↑ -1px (lifted)
│   Next Step →    │
└──────────────────┘
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Increased shadow
Background: #F0E68C (gold-light)
Text: #111827 (dark)
```

### Primary Button (Loading)
```
┌──────────────────┐
│       ⟳          │  Spinner rotating
└──────────────────┘
Background: #D4AF37 (gold)
Text: #111827 (dark)
Disabled: true
```

### Secondary Button (Default)
```
┌──────────────────┐
│   ← Back         │
└──────────────────┘
Background: transparent
Border: 2px solid #D4AF37 (gold)
Text: #D4AF37 (gold)
```

### Secondary Button (Hover)
```
┌──────────────────┐
│   ← Back         │
└──────────────────┘
Background: rgba(212,175,55,0.1) (gold 10%)
Border: 2px solid #D4AF37 (gold)
Text: #D4AF37 (gold)
```

---

## Slider Component

### Default State
```
Label: Strength                     Value: 10

━━━━━━●━━━━━━━━━━━━━━━━━━━━━━━━━━
8                                15

Track: #374151 (dark gray)
Thumb: #D4AF37 (gold) ● 20px circle
```

### Hover State
```
Label: Strength                     Value: 10

                  ┌────┐
                  │ 10 │  Tooltip appears
                  └─▼──┘
━━━━━━⦿━━━━━━━━━━━━━━━━━━━━━━━━━━━
8                                15

Thumb: ⦿ 24px circle (scaled up)
Glow: 0 0 12px rgba(212,175,55,0.6)
```

### Drag State
```
Label: Strength                     Value: 12

                        ┌────┐
                        │ 12 │  Real-time update
                        └─▼──┘
━━━━━━━━━━⦿━━━━━━━━━━━━━━━━━━━━━━━
8                                15

Cursor: grabbing
Smooth animation as value changes
```

### Disabled State
```
Label: Racial Bonus (Fixed)         Value: 2

━━○━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
0                                 5

Opacity: 50%
Cursor: not-allowed
No interaction
```

---

## Input Field States

### Default
```
┌──────────────────────────────────┐
│ Enter your character's name...   │
└──────────────────────────────────┘
Border: 2px solid #374151 (gray)
Background: #1B2835 (dark)
Text: #F3F4F6 (white)
```

### Focus
```
╔══════════════════════════════════╗
║ Character Name|                  ║
╚══════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Gold glow
Border: 2px solid #D4AF37 (gold)
Background: #1B2835 (dark)
Text: #F3F4F6 (white)
```

### Error
```
╔══════════════════════════════════╗
║                                  ║
╚══════════════════════════════════╝
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  Red glow
⚠ Character name is required.

Border: 2px solid #EF4444 (red)
Error message: #EF4444 (red)
```

### Success
```
╔══════════════════════════════════╗
║ Aragorn                          ║
╚══════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  Green glow
✓ Name is available!

Border: 2px solid #10B981 (green)
Success message: #10B981 (green)
```

---

## Grid Layouts

### Races Grid (Mobile)
```
┌──────────────┐
│     Elf      │
└──────────────┘
┌──────────────┐
│    Dwarf     │
└──────────────┘
┌──────────────┐
│    Human     │
└──────────────┘

1 column
Gap: 12px
```

### Races Grid (Tablet)
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│   Elf    │  │  Dwarf   │  │  Human   │
└──────────┘  └──────────┘  └──────────┘
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Halfling │  │ Half-Orc │  │   Gnome  │
└──────────┘  └──────────┘  └──────────┘

3 columns
Gap: 16px
```

### Races Grid (Desktop)
```
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
│Elf │  │Dwrf│  │Humn│  │Half│  │Gnme│
└────┘  └────┘  └────┘  └────┘  └────┘
┌────┐  ┌────┐  ┌────┐  ┌────┐  ┌────┐
│HlfE│  │HlfO│  │Asim│  │Tifl│  │Drgb│
└────┘  └────┘  └────┘  └────┘  └────┘

5 columns
Gap: 20px
```

---

## Loading States

### Spinner
```
    ⟳
   / \
  /   \
 |     |
  \   /
   \ /

Rotating 360° / 1s
Size: 32px
Border: 3px
Colors: #374151 (gray) + #D4AF37 (gold top)
```

### Skeleton Loader
```
┌──────────────────────────────────┐
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                  │
│ ░░░░░░░░░░░░░░░░░░░░░░░░         │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
│                                  │
└──────────────────────────────────┘

Shimmer effect (left → right)
Background gradient: #2D1B69 → #3D2B7D → #2D1B69
Animation: 2s infinite
```

### Progress Bar
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
███████████████░░░░░░░░░░░░░░░░░░░░
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Height: 4px
Background: #3D2B7D (purple)
Fill: #D4AF37 (gold)
Progress: 60%
```

---

## Animations

### Fade In
```
Frame 1:  ░░░░░░░░  (opacity: 0)
Frame 2:  ▒▒▒▒▒▒▒▒  (opacity: 0.33)
Frame 3:  ▓▓▓▓▓▓▓▓  (opacity: 0.66)
Frame 4:  ████████  (opacity: 1)

Duration: 300ms
Easing: ease-out
```

### Slide Up
```
Frame 1:  ↓ +20px  (translateY: 20px)
Frame 2:  ↓ +13px  (translateY: 13px)
Frame 3:  ↓ +7px   (translateY: 7px)
Frame 4:  →  0px   (translateY: 0)

Duration: 300ms
Easing: ease-out
Combined with fade-in
```

### Success Checkmark
```
Frame 1:  ·         (scale: 0, rotate: 0°)
Frame 2:  ✓         (scale: 1.2, rotate: 180°)
Frame 3:  ✓         (scale: 1, rotate: 360°)

Duration: 400ms
Easing: ease
Color: #10B981 (green)
```

### Error Shake
```
Frame 1:  ←  -5px
Frame 2:  →  +5px
Frame 3:  ←  -5px
Frame 4:  →   0px

Duration: 300ms
Easing: ease
```

---

## Responsive Breakpoints

```
┌─────────────────────────────────────────┐
│  Mobile: < 768px                        │
│  • Single column layouts                │
│  • Full-width cards                     │
│  • Stacked navigation                   │
│  • Font size: base                      │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Tablet: 768px - 1023px                 │
│  • 2-3 column layouts                   │
│  • Horizontal navigation                │
│  • Reduced padding                      │
│  • Font size: base → lg                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Desktop: 1024px+                       │
│  • 3-5 column layouts                   │
│  • Full navigation with labels          │
│  • Increased spacing                    │
│  • Font size: lg                        │
└─────────────────────────────────────────┘
```

---

## Accessibility Features

### Focus Indicator
```
┌══════════════════════════════════╗
║          Button Text             ║
╚══════════════════════════════════╝
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░

2px solid #D4AF37 (gold)
Offset: 2px
Visible on Tab key press
```

### Skip to Content Link
```
┌─────────────────────┐
│  Skip to content    │  (Visible on focus)
└─────────────────────┘
▼
[Hidden by default, appears on Tab]
```

### Screen Reader Only
```
<span class="sr-only">Loading...</span>

Visually hidden but announced to screen readers
Position: absolute
Width: 1px, Height: 1px
Overflow: hidden
```

---

## Component Combinations

### Selectable Card with Icon and Badge
```
┌──────────────────────────────────┐
│              ┌─────────┐         │
│              │ ✨ Rare │         │
│              └─────────┘         │
│                                  │
│               ✨                 │
│                                  │
│              Elf                 │
│                                  │
│  +2 Dexterity, +1 Intelligence   │
│                                  │
│  Graceful and wise, with keen    │
│  senses and mastery of magic.    │
│                                  │
└──────────────────────────────────┘
```

### Footer Navigation
```
┌──────────────────────────────────┐
├──────────────────────────────────┤  Divider
│                                  │
│  ┌────────┐           ┌────────┐ │
│  │ ← Back │           │ Next → │ │
│  └────────┘           └────────┘ │
│  Secondary           Primary      │
│                                  │
└──────────────────────────────────┘
```

### Page Layout Example
```
┌─────────────────────────────────────────┐
│                                         │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│         Choose Your Race                │
│    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━     │
│                                         │
│  Your race determines your character's  │
│  physical traits and abilities.         │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐       │
│  │Elf │  │Dwrf│  │Humn│  │Half│       │
│  └────┘  └────┘  └────┘  └────┘       │
│                                         │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐       │
│  │HlfE│  │HlfO│  │Asim│  │Tifl│       │
│  └────┘  └────┘  └────┘  └────┘       │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌────────┐                 ┌────────┐ │
│  │ ← Back │                 │ Next → │ │
│  └────────┘                 └────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

**Preview Status:** Complete visual reference for all design system components

**Usage:** Reference this document when implementing UI to ensure visual consistency

**Last Updated:** 2025-10-26
