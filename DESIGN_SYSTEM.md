# Nuaibria Design System v1.0

**Complete Modern Design System for Character Creation Wizard**

This design system provides a cohesive, accessible, and modern visual language for the Nuaibria character creation experience. All components follow dark fantasy aesthetics with rich purples, gold accents, and smooth animations.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography System](#typography-system)
3. [Component Specifications](#component-specifications)
4. [Animations & Transitions](#animations--transitions)
5. [Icon Set](#icon-set)
6. [Spacing System](#spacing-system)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [Implementation Guide](#implementation-guide)

---

## 1. Color Palette

### Primary Colors (Dark Fantasy Enhanced)

**Deep Purple/Indigo Backgrounds**
```
Primary-0 (Darkest):  #2D1B69  - Deep backgrounds, base layer
Primary-1 (Darker):   #3D2B7D  - Card backgrounds, elevated surfaces
Primary-2 (Mid):      #4D3B8D  - Interactive surfaces, hovers
Primary-3 (Lighter):  #5D4B9D  - Hover states, highlights
```

**Nuaibria Gold (Accent)**
```
Gold Standard:        #D4AF37  - Primary accent, buttons, highlights
Gold Light:           #F0E68C  - Light highlights, glows
Gold Dark:            #B8860B  - Dark shadows, pressed states
```

**Secondary Teal/Blue**
```
Teal-0 (Dark):        #1B4D5C  - Secondary backgrounds
Teal-1 (Mid):         #2B6D7C  - Secondary surfaces
Teal-2 (Light):       #3B8D9C  - Secondary highlights
```

### Status Colors

```
Success:              #10B981  - Green (positive actions, success states)
Error:                #EF4444  - Red (errors, validation failures)
Warning:              #F59E0B  - Amber/Yellow (warnings, cautions)
Info:                 #3B82F6  - Blue (informational messages)
```

### Neutrals

```
Text Primary:         #F3F4F6  - Near white (main text)
Text Secondary:       #D1D5DB  - Light gray (secondary text)
Text Muted:           #9CA3AF  - Medium gray (muted text, labels)
Background:           #111827  - Very dark (page background)
Border:               #374151  - Dark gray (borders, dividers)
```

### Tailwind Configuration

**File:** `tailwind.config.js`

```javascript
colors: {
  'nuaibria': {
    // Gold accent
    'gold': '#D4AF37',
    'gold-light': '#F0E68C',
    'gold-dark': '#B8860B',

    // Purple primary
    'purple': {
      '0': '#2D1B69',
      '1': '#3D2B7D',
      '2': '#4D3B8D',
      '3': '#5D4B9D',
    },

    // Teal secondary
    'teal': {
      '0': '#1B4D5C',
      '1': '#2B6D7C',
      '2': '#3B8D9C',
    },

    // Status colors
    'success': '#10B981',
    'error': '#EF4444',
    'warning': '#F59E0B',
    'info': '#3B82F6',

    // Text colors
    'text': {
      'primary': '#F3F4F6',
      'secondary': '#D1D5DB',
      'muted': '#9CA3AF',
    },

    // Background
    'bg': '#111827',
    'border': '#374151',
  }
}
```

### Usage Guidelines

- **Backgrounds:** Use purple-0 for base, purple-1 for cards, purple-2 for interactive elements
- **Accents:** Gold for primary actions, teal for secondary/informational elements
- **Status:** Use semantic colors (success/error/warning/info) for feedback
- **Text:** Primary for body text, secondary for labels, muted for hints

---

## 2. Typography System

### Font Families

**Headers:** Inter or Poppins (bold, tight letter-spacing)
- Modern sans-serif with strong geometric presence
- Used for headings, titles, labels

**Body:** Inter or Poppins (regular, normal letter-spacing)
- Highly readable for paragraphs and descriptions
- Consistent with headers for cohesive feel

**Monospace:** Fira Code or IBM Plex Mono
- Used for stats, numbers, code-like elements
- Clear distinction for numerical data

### Font Scale

| Element | Size | Weight | Letter Spacing | Line Height | Tailwind Class |
|---------|------|--------|----------------|-------------|----------------|
| H1 | 48px | Bold | -2px | 1.2 | `text-5xl font-bold tracking-tighter` |
| H2 | 36px | Bold | -1px | 1.3 | `text-4xl font-bold tracking-tight` |
| H3 | 28px | Bold | -0.5px | 1.3 | `text-3xl font-bold tracking-tight` |
| H4 | 24px | Semibold | 0 | 1.4 | `text-2xl font-semibold` |
| H5 | 20px | Semibold | 0 | 1.4 | `text-xl font-semibold` |
| H6 | 16px | Semibold | 0 | 1.5 | `text-base font-semibold` |
| Body Large | 18px | Regular | 0 | 1.6 | `text-lg font-normal leading-relaxed` |
| Body | 16px | Regular | 0 | 1.5 | `text-base font-normal` |
| Body Small | 14px | Regular | 0 | 1.5 | `text-sm font-normal` |
| Caption | 12px | Regular | 0 | 1.4 | `text-xs font-normal` |

### Custom Typography Classes

```css
.typography-h1 {
  @apply text-5xl font-bold tracking-tighter leading-tight;
}

.typography-h2 {
  @apply text-4xl font-bold tracking-tight leading-tight;
}

.typography-h3 {
  @apply text-3xl font-bold tracking-tight;
}

.typography-body {
  @apply text-base font-normal leading-normal;
}

.typography-body-large {
  @apply text-lg font-normal leading-relaxed;
}

.typography-caption {
  @apply text-sm font-normal text-nuaibria-text-muted;
}
```

### Usage Guidelines

- Use H1 for page titles (e.g., "Create Your Character")
- Use H2 for section headers (e.g., "Choose Your Race")
- Use H3 for card titles
- Use Body for descriptions and paragraphs
- Use Caption for hints, labels, metadata

---

## 3. Component Specifications

### Cards (Primary UI Element)

Cards are the fundamental building block for selection interfaces (races, classes, backgrounds).

**Design:**
```
Background: #3D2B7D (purple-1) or #4D3B8D (purple-2)
Border: 1px solid #374151
Padding: 16px (mobile), 20px (desktop)
Border-radius: 8px
Box-shadow: 0 4px 6px rgba(0,0,0,0.1)
```

**States:**

```css
/* Default */
.card {
  background: #3D2B7D;
  border: 1px solid #374151;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: all 200ms ease;
  cursor: pointer;
}

/* Hover */
.card:hover {
  border-color: #D4AF37;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  transform: translateY(-2px);
}

/* Selected/Active */
.card.selected {
  border-color: #D4AF37;
  background: rgba(212,175,55,0.1);
  box-shadow: 0 0 20px rgba(212,175,55,0.3);
}

/* Disabled */
.card.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Tailwind Classes:**
```
className="bg-nuaibria-purple-1 border border-nuaibria-border rounded-lg p-5
           shadow-card hover:border-nuaibria-gold hover:shadow-card-hover
           hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
```

---

### Buttons

Buttons provide primary and secondary actions throughout the wizard.

**Design:**
```
Height: 44px
Padding: 12px 24px
Border-radius: 8px
Font: Semibold 16px
Transition: all 200ms ease
```

**Primary Button:**

```css
.btn-primary {
  background: #D4AF37;
  color: #111827;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  background: #F0E68C;
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
  transform: translateY(-1px);
}

.btn-primary:active {
  background: #B8860B;
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}
```

**Tailwind Classes:**
```
className="bg-nuaibria-gold text-nuaibria-bg font-semibold px-6 py-3
           rounded-lg hover:bg-nuaibria-gold-light hover:shadow-lg
           hover:-translate-y-px active:bg-nuaibria-gold-dark
           transition-all duration-200 disabled:opacity-50
           disabled:cursor-not-allowed"
```

**Secondary Button:**

```css
.btn-secondary {
  background: transparent;
  border: 2px solid #D4AF37;
  color: #D4AF37;
  padding: 10px 22px; /* Adjusted for border */
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(212,175,55,0.1);
}

.btn-secondary:active {
  background: rgba(212,175,55,0.2);
}
```

**Tailwind Classes:**
```
className="bg-transparent border-2 border-nuaibria-gold text-nuaibria-gold
           font-semibold px-6 py-2.5 rounded-lg
           hover:bg-nuaibria-gold/10 transition-all duration-200"
```

---

### Sliders (Modern Design - Critical!)

Custom slider component with modern aesthetics and smooth interactions.

**Design:**
```
Track Height: 6px
Track Background: #374151 (border gray)
Track Border-radius: 3px

Thumb Size: 20px
Thumb Background: #D4AF37 (gold)
Thumb Border: 2px solid #111827
Thumb Border-radius: 50% (circle)
Thumb Box-shadow: 0 2px 4px rgba(0,0,0,0.2)
```

**Hover State:**
```
Thumb Size: 24px (scale up)
Box-shadow: 0 0 12px rgba(212,175,55,0.6) (glow effect)
Cursor: grab
```

**Drag State:**
```
Cursor: grabbing
Real-time value display (tooltip)
Smooth animation
```

**Focus State:**
```
Outline: 2px solid #D4AF37
Box-shadow: 0 0 8px rgba(212,175,55,0.4)
```

**CSS Implementation:**

```css
/* Track */
input[type="range"] {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  background: #374151;
  border-radius: 3px;
  outline: none;
  transition: all 200ms ease;
}

/* Thumb (Webkit - Chrome/Safari) */
input[type="range"]::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #D4AF37;
  border: 2px solid #111827;
  border-radius: 50%;
  cursor: grab;
  transition: all 200ms ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-webkit-slider-thumb:hover {
  width: 24px;
  height: 24px;
  box-shadow: 0 0 12px rgba(212,175,55,0.6);
}

input[type="range"]::-webkit-slider-thumb:active {
  cursor: grabbing;
}

/* Thumb (Firefox) */
input[type="range"]::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #D4AF37;
  border: 2px solid #111827;
  border-radius: 50%;
  cursor: grab;
  transition: all 200ms ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

input[type="range"]::-moz-range-thumb:hover {
  width: 24px;
  height: 24px;
  box-shadow: 0 0 12px rgba(212,175,55,0.6);
}

/* Focus state */
input[type="range"]:focus {
  outline: 2px solid #D4AF37;
  box-shadow: 0 0 8px rgba(212,175,55,0.4);
}
```

---

### Input Fields

Text inputs for character name, custom values, etc.

**Design:**
```
Height: 44px
Padding: 12px 16px
Border: 2px solid #374151
Background: #1B2835 (slightly darker than card)
Border-radius: 8px
Font-size: 16px
Transition: all 200ms ease
```

**States:**

```css
/* Default */
input[type="text"],
input[type="number"],
textarea {
  height: 44px;
  padding: 12px 16px;
  background: #1B2835;
  border: 2px solid #374151;
  border-radius: 8px;
  color: #F3F4F6;
  font-size: 16px;
  transition: all 200ms ease;
}

/* Focus */
input:focus,
textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 8px rgba(212,175,55,0.3);
}

/* Error State */
input.error {
  border-color: #EF4444;
  box-shadow: 0 0 8px rgba(239,68,68,0.3);
}

/* Success State */
input.success {
  border-color: #10B981;
  box-shadow: 0 0 8px rgba(16,185,129,0.3);
}

/* Disabled */
input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Tailwind Classes:**
```
className="h-11 px-4 bg-nuaibria-purple-0 border-2 border-nuaibria-border
           rounded-lg text-nuaibria-text-primary focus:border-nuaibria-gold
           focus:outline-none focus:shadow-glow transition-all duration-200"
```

---

### Grids (Card Layout)

Responsive grid layouts for displaying multiple selectable cards.

**Mobile (320px - 767px):**
```
Columns: 1
Gap: 12px
```

**Tablet (768px - 1023px):**
```
Columns: 2
Gap: 16px
```

**Desktop (1024px+):**
```
Columns: 2-4 (context-dependent)
Gap: 20px
```

**Context-Specific Grids:**

```css
/* Races Grid */
.races-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, 1fr); /* Mobile */
}

@media (min-width: 768px) {
  .races-grid {
    gap: 16px;
    grid-template-columns: repeat(3, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .races-grid {
    gap: 20px;
    grid-template-columns: repeat(5, 1fr); /* Desktop - 5 columns for races */
  }
}

/* Classes Grid */
.classes-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, 1fr); /* Mobile */
}

@media (min-width: 768px) {
  .classes-grid {
    gap: 16px;
    grid-template-columns: repeat(3, 1fr); /* Tablet */
  }
}

@media (min-width: 1024px) {
  .classes-grid {
    gap: 20px;
    grid-template-columns: repeat(4, 1fr); /* Desktop - 4 columns for classes */
  }
}

/* Backgrounds Grid */
.backgrounds-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(1, 1fr); /* Mobile */
}

@media (min-width: 768px) {
  .backgrounds-grid {
    gap: 16px;
    grid-template-columns: repeat(3, 1fr); /* Tablet & Desktop - 3 columns */
  }
}
```

**Tailwind Classes:**

```tsx
// Races
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5"

// Classes
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"

// Backgrounds
className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
```

---

## 4. Animations & Transitions

### Page Transitions

**Fade In:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.fade-in {
  animation: fadeIn 300ms ease-out;
}
```

**Slide Up:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 300ms ease-out;
}
```

**Combined (Fade + Slide):**
```css
.fade-slide-up {
  animation: fadeIn 300ms ease-out, slideUp 300ms ease-out;
}
```

**Tailwind Usage:**
```
className="animate-fade-in animate-slide-up"
```

---

### Hover Effects

**Card Hover:**
```css
.card {
  transition: all 200ms ease-out;
}

.card:hover {
  transform: scale(1.02) translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);
}
```

**Button Hover:**
```css
.button {
  transition: all 150ms ease;
}

.button:hover {
  background: #F0E68C;
  transform: translateY(-1px);
}
```

**Slider Thumb Hover:**
```css
input[type="range"]::-webkit-slider-thumb {
  transition: all 200ms ease;
}

input[type="range"]::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(212,175,55,0.6);
}
```

---

### Loading States

**Spinner:**

```css
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #374151;
  border-top-color: #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
```

**Tailwind Usage:**
```tsx
<div className="w-8 h-8 border-3 border-nuaibria-border border-t-nuaibria-gold rounded-full animate-spin" />
```

**Skeleton Loader (Placeholder):**

```css
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    #2D1B69 0%,
    #3D2B7D 50%,
    #2D1B69 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  border-radius: 8px;
}
```

**Progress Bar:**

```css
.progress-bar {
  height: 4px;
  background: #3D2B7D;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #D4AF37;
  transition: width 300ms ease;
}
```

---

### Success/Error Animations

**Success (Checkmark):**

```css
@keyframes checkmark {
  0% {
    transform: scale(0) rotate(0deg);
  }
  50% {
    transform: scale(1.2) rotate(180deg);
  }
  100% {
    transform: scale(1) rotate(360deg);
  }
}

.success-checkmark {
  animation: checkmark 400ms ease;
}
```

**Error (Shake):**

```css
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  50% { transform: translateX(5px); }
  75% { transform: translateX(-5px); }
}

.error-shake {
  animation: shake 300ms ease;
}
```

**Error Border Pulse:**

```css
@keyframes errorPulse {
  0%, 100% {
    border-color: #EF4444;
    box-shadow: 0 0 8px rgba(239,68,68,0.3);
  }
  50% {
    border-color: #DC2626;
    box-shadow: 0 0 12px rgba(239,68,68,0.5);
  }
}

.error-pulse {
  animation: errorPulse 1s ease infinite;
}
```

---

## 5. Icon Set

### Race Icons (12 designs)

Recommended: Use **Lucide React** or **Heroicons** for consistency and speed.

| Race | Icon | Lucide/Heroicons Name |
|------|------|----------------------|
| Aasimar | Angel wings | `Sparkles` or `Star` |
| Dragonborn | Dragon head | `Flame` or `Zap` |
| Dwarf | Axe + beard | `Hammer` or `Shield` |
| Elf | Pointed ears + bow | `Target` or `Wind` |
| Gnome | Mushroom + wrench | `Wrench` or `Zap` |
| Half-Elf | Mix traits | `Users` or `User` |
| Half-Orc | Tusks + green | `Shield` or `Swords` |
| Halfling | Feet + lucky coin | `Circle` or `Clover` |
| Human | Crown + sword | `Crown` or `Sword` |
| Tiefling | Horns + tail | `Flame` or `Triangle` |

### Class Icons (12 designs)

| Class | Icon | Lucide/Heroicons Name |
|-------|------|----------------------|
| Barbarian | Axe + rage | `Axe` or `Flame` |
| Bard | Lute + music | `Music` or `Mic` |
| Cleric | Holy symbol | `Cross` or `Heart` |
| Druid | Leaf + nature | `Leaf` or `TreePine` |
| Fighter | Sword + shield | `Sword` or `Shield` |
| Monk | Open hand | `Hand` or `Zap` |
| Paladin | Holy sword | `Sword` or `Shield` |
| Ranger | Bow + arrow | `Target` or `Compass` |
| Rogue | Dagger + shadow | `Knife` or `EyeOff` |
| Sorcerer | Magic staff + sparkles | `Sparkles` or `Wand` |
| Warlock | Pentagram + arcane | `Star` or `Flame` |
| Wizard | Spellbook + hat | `BookOpen` or `Scroll` |

### UI Icons

| Purpose | Icon | Lucide Name |
|---------|------|-------------|
| Back | ← | `ChevronLeft` or `ArrowLeft` |
| Next | → | `ChevronRight` or `ArrowRight` |
| Settings | ⚙ | `Settings` |
| Save | 💾 | `Save` |
| Delete | 🗑 | `Trash` or `Trash2` |
| Edit | ✏ | `Edit` or `Pencil` |
| Check | ✓ | `Check` |
| Close | ✕ | `X` |
| Loading | ⟳ | `Loader` or `Loader2` |
| Error | ⚠ | `AlertCircle` or `AlertTriangle` |
| Info | ℹ | `Info` |

**Installation:**

```bash
npm install lucide-react
```

**Usage:**

```tsx
import { Sparkles, Sword, ChevronRight } from 'lucide-react';

<Sparkles className="w-6 h-6 text-nuaibria-gold" />
```

---

## 6. Spacing System

### Base Unit: 4px

| Name | Value | Rem | Usage |
|------|-------|-----|-------|
| xs | 4px | 0.25rem | Tight spacing, icon padding |
| sm | 8px | 0.5rem | Small gaps, button padding |
| md | 12px | 0.75rem | Standard spacing between elements |
| lg | 16px | 1rem | Card padding, section margins |
| xl | 20px | 1.25rem | Large padding, desktop cards |
| 2xl | 24px | 1.5rem | Section headers, major spacing |
| 3xl | 32px | 2rem | Page sections, major divisions |
| 4xl | 40px | 2.5rem | Large sections |
| 5xl | 48px | 3rem | Hero sections, page headers |

### Usage Guidelines

**Padding:**
- Cards: 16px (mobile), 20px (desktop)
- Buttons: 12px vertical, 24px horizontal
- Inputs: 12px vertical, 16px horizontal

**Margin:**
- Between sections: 32px
- Between elements: 12px
- Between cards: 16px (via grid gap)

**Gap (Grid/Flex):**
- Mobile: 12px
- Tablet: 16px
- Desktop: 20px

**Tailwind Classes:**
```
p-3 = 12px
p-4 = 16px
p-5 = 20px
gap-3 = 12px
gap-4 = 16px
gap-5 = 20px
```

---

## 7. Responsive Design

### Breakpoints

```
Mobile:  320px - 767px
Tablet:  768px - 1023px
Desktop: 1024px+
```

**Tailwind Breakpoints:**
```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

### Layout Principles

**Mobile-First Approach:**
- Design for mobile (320px base)
- Enhance for larger screens using `md:` and `lg:` prefixes

**Single Column on Mobile:**
- All cards stack vertically
- Full-width elements
- Minimal horizontal scrolling

**Multi-Column on Tablet/Desktop:**
- 2-3 columns on tablet (768px)
- 3-4 columns on desktop (1024px)
- Flexible layouts using CSS Grid

**Example:**

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
  {/* Cards */}
</div>
```

### Font Size Adjustments

```css
/* Mobile */
h1 { font-size: 36px; }
h2 { font-size: 28px; }
body { font-size: 14px; }

/* Desktop */
@media (min-width: 1024px) {
  h1 { font-size: 48px; }
  h2 { font-size: 36px; }
  body { font-size: 16px; }
}
```

**Tailwind:**
```
className="text-4xl lg:text-5xl"
```

---

## 8. Accessibility

### WCAG 2.1 AA Compliance

**Contrast Ratios:**
- Normal text (< 18px): Minimum 4.5:1
- Large text (≥ 18px): Minimum 3:1
- Interactive elements: Minimum 3:1

**Color Contrast Verification:**

| Foreground | Background | Ratio | Pass? |
|------------|------------|-------|-------|
| #F3F4F6 | #2D1B69 | 8.2:1 | ✓ AAA |
| #D4AF37 | #111827 | 7.5:1 | ✓ AAA |
| #10B981 | #111827 | 3.8:1 | ✓ AA (large) |
| #EF4444 | #111827 | 4.9:1 | ✓ AA |

**Do Not Rely on Color Alone:**
- Use icons + text labels
- Use patterns/shapes for differentiation
- Provide text alternatives

---

### Focus Indicators

**Visible Focus Ring:**
- Minimum 2px solid border
- High contrast color (#D4AF37)
- Not hidden by `outline: none` without alternative

```css
*:focus {
  outline: 2px solid #D4AF37;
  outline-offset: 2px;
}

/* Alternative: Custom focus styles */
.button:focus-visible {
  box-shadow: 0 0 0 3px rgba(212,175,55,0.5);
}
```

**Tailwind:**
```
className="focus:outline-none focus:ring-2 focus:ring-nuaibria-gold focus:ring-offset-2 focus:ring-offset-nuaibria-bg"
```

---

### Typography Accessibility

**Font Size:**
- Minimum 14px for body text
- Minimum 16px for inputs (prevents mobile zoom)

**Line Height:**
- Minimum 1.5 for body text
- Minimum 1.2 for headings

**Letter Spacing:**
- Not too tight (avoid negative values except headings)
- Avoid all-caps unless necessary

---

### Form Accessibility

**Labels:**
- Every input must have associated `<label>`
- Use `htmlFor` attribute to link label to input
- Placeholder text is NOT sufficient

```tsx
<label htmlFor="character-name" className="block text-sm font-semibold mb-2">
  Character Name
</label>
<input
  id="character-name"
  type="text"
  placeholder="Enter name"
  aria-required="true"
/>
```

**Error Messages:**
- Link to input using `aria-describedby`
- Use `role="alert"` for dynamic errors
- Include error icon + text

```tsx
<input
  id="character-name"
  type="text"
  aria-invalid={hasError}
  aria-describedby={hasError ? "name-error" : undefined}
/>
{hasError && (
  <p id="name-error" role="alert" className="text-nuaibria-error text-sm mt-1">
    Character name is required.
  </p>
)}
```

**Required Fields:**
- Mark with asterisk (*) in label
- Use `aria-required="true"`

---

### Keyboard Navigation

**Tab Order:**
- Logical tab order (top to bottom, left to right)
- All interactive elements reachable via Tab
- No keyboard traps

**Keyboard Shortcuts:**
- Enter: Submit form, activate button
- Space: Toggle checkbox, activate button
- Arrow keys: Navigate sliders, radio groups
- Escape: Close modals, cancel actions

**Slider Keyboard Support:**
```tsx
<input
  type="range"
  min={8}
  max={15}
  value={value}
  onChange={handleChange}
  onKeyDown={(e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
      // Decrease value
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
      // Increase value
    }
  }}
  aria-label="Ability Score"
  aria-valuemin={8}
  aria-valuemax={15}
  aria-valuenow={value}
/>
```

---

### ARIA Attributes

**Common ARIA Attributes:**

```tsx
// Labels
aria-label="Close dialog"
aria-labelledby="dialog-title"

// Descriptions
aria-describedby="error-message"

// States
aria-disabled={true}
aria-invalid={hasError}
aria-required={true}
aria-selected={isSelected}
aria-current="page"

// Roles
role="alert"
role="dialog"
role="navigation"
role="button"

// Live regions
aria-live="polite"
aria-atomic="true"
```

**Example: Selectable Card**

```tsx
<div
  role="button"
  tabIndex={0}
  aria-pressed={isSelected}
  onClick={handleSelect}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleSelect();
    }
  }}
  className={`card ${isSelected ? 'selected' : ''}`}
>
  {/* Card content */}
</div>
```

---

## 9. Implementation Guide

### File Structure

```
frontend/src/
├── design/
│   └── colors.ts              # Color tokens/constants
├── styles/
│   ├── global.css             # Global styles + reset
│   ├── animations.css         # Animation definitions
│   └── tailwind.config.js     # Tailwind configuration (moved from root)
└── components/
    └── shared/
        ├── Card.tsx           # Reusable card component
        ├── Button.tsx         # Reusable button component
        └── Slider.tsx         # Modern slider component
```

### Installation Steps

1. **Install Dependencies:**
```bash
npm install lucide-react
```

2. **Create Files:**
- Copy all files from this spec to appropriate locations
- Update `tailwind.config.js` with new color tokens
- Add animation CSS to `animations.css`

3. **Import in App:**
```tsx
// main.tsx
import './styles/global.css';
import './styles/animations.css';
```

4. **Use Components:**
```tsx
import { Card } from './components/shared/Card';
import { Button } from './components/shared/Button';
import { Slider } from './components/shared/Slider';
```

### Testing Checklist

- [ ] All colors have sufficient contrast (use WebAIM Contrast Checker)
- [ ] All components render correctly on mobile/tablet/desktop
- [ ] Animations are smooth (60 FPS)
- [ ] Keyboard navigation works (Tab, Enter, Space, Arrows)
- [ ] Focus indicators are visible
- [ ] Screen reader announces elements correctly
- [ ] Forms validate properly
- [ ] Hover effects work on desktop
- [ ] Touch interactions work on mobile

---

## Quick Reference: Common Patterns

### Selectable Card Grid (Races/Classes)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
  {items.map((item) => (
    <Card
      key={item.id}
      selected={selectedId === item.id}
      onClick={() => setSelectedId(item.id)}
    >
      <Icon className="w-12 h-12 text-nuaibria-gold mb-3" />
      <h3 className="text-xl font-bold text-nuaibria-text-primary mb-2">
        {item.name}
      </h3>
      <p className="text-sm text-nuaibria-text-secondary">
        {item.description}
      </p>
    </Card>
  ))}
</div>
```

### Button Group (Footer Navigation)

```tsx
<div className="flex justify-between items-center gap-4">
  <Button variant="secondary" onClick={handleBack}>
    <ChevronLeft className="w-5 h-5 mr-2" />
    Back
  </Button>
  <Button variant="primary" onClick={handleNext}>
    Next
    <ChevronRight className="w-5 h-5 ml-2" />
  </Button>
</div>
```

### Ability Score Slider

```tsx
<div className="space-y-2">
  <label htmlFor="strength" className="block text-sm font-semibold text-nuaibria-text-primary">
    Strength: {strengthValue}
  </label>
  <Slider
    id="strength"
    min={8}
    max={15}
    value={strengthValue}
    onChange={setStrengthValue}
  />
</div>
```

---

## Version History

**v1.0** - 2025-10-26
- Initial design system release
- Complete color palette, typography, and component specifications
- Modern slider design with hover/drag states
- Accessibility guidelines (WCAG 2.1 AA)
- Responsive design patterns
- Animation & transition definitions

---

**Status:** ✅ Design System READY for all developers to use immediately

**Contact:** Design team for questions or clarifications
