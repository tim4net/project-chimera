# CharacterPreview Component Usage Guide

## Overview
The `CharacterPreview` component provides a real-time, sticky sidebar that displays character information as users progress through the character creation wizard. It automatically calculates derived stats (HP, AC, Speed) and highlights racial bonuses.

## Basic Usage

```tsx
import { CharacterPreview } from './components/CharacterPreview';
import type { CharacterDraft } from '../../types/wizard';

function CharacterCreationWizard() {
  const [draft, setDraft] = useState<Partial<CharacterDraft>>({});

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Left Sidebar - Character Preview */}
      <div className="lg:col-span-1">
        <CharacterPreview draft={draft} />
      </div>

      {/* Main Content - Wizard Steps */}
      <div className="lg:col-span-3">
        {/* Your wizard steps here */}
      </div>
    </div>
  );
}
```

## Integration with Character Draft Hook

Once the `useCharacterDraft` hook is implemented, usage will be:

```tsx
import { CharacterPreview } from './components/CharacterPreview';
import { useCharacterDraft } from '../../hooks/useCharacterDraft';

function CharacterCreationWizard() {
  const { draft, updateDraft } = useCharacterDraft();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div className="lg:col-span-1">
        <CharacterPreview draft={draft} />
      </div>
      <div className="lg:col-span-3">
        {/* Wizard steps automatically update draft */}
      </div>
    </div>
  );
}
```

## Features

### Automatic Stat Calculation
The component automatically calculates:
- **HP**: Based on class hit die + CON modifier (with racial bonuses applied)
- **AC**: Based on class armor + DEX modifier (respects armor caps, special monk/barbarian rules)
- **Speed**: Based on race (25ft for small races, 30ft for most others)

### Visual Indicators
- **Alignment Colors**: Each alignment has a distinct color (e.g., Lawful Good = blue, Chaotic Evil = red)
- **Racial Bonuses**: Ability scores with racial bonuses are highlighted in gold
- **Icons**: Race and class icons provide quick visual identification

### Responsive Layout
- **Desktop**: Sticky sidebar (stays visible while scrolling)
- **Mobile**: Positioned below the form content
- **Adaptive**: Uses Tailwind's responsive classes (`lg:sticky`, `lg:top-8`)

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `draft` | `Partial<CharacterDraft>` | Yes | Character data to display |
| `className` | `string` | No | Additional CSS classes |

## Character Draft Structure

The component accepts a partial `CharacterDraft` object with these fields:

```typescript
interface CharacterDraft {
  // Identity
  name?: string;
  age?: number;
  description?: string;
  avatarUrl?: string;

  // Core Attributes
  race?: Race;
  class?: CharacterClass;
  background?: Background;

  // Alignment & Personality
  alignment?: Alignment;
  personalityTraits?: string[];
  ideals?: string[];
  bonds?: string[];
  flaws?: string[];

  // Ability Scores (final scores with racial bonuses)
  abilityScores?: AbilityScores;

  // Skills
  proficientSkills?: SkillName[];

  // Equipment
  startingGold?: number;
  equipment?: string[];
}
```

## Empty States

The component gracefully handles incomplete data:
- **No name**: Displays "Unnamed Hero"
- **Missing sections**: Hides sections with no data
- **Partial data**: Shows only completed sections

## Styling Customization

The component uses Nuaibria's design system colors:
- `nuaibria-surface`: Background
- `nuaibria-gold`: Accent color
- `nuaibria-health`: HP display
- `nuaibria-ember`: Speed display
- `nuaibria-text-*`: Text hierarchy

To customize, pass additional classes via `className`:

```tsx
<CharacterPreview
  draft={draft}
  className="shadow-2xl border-4"
/>
```

## Performance

The component uses React.memo for optimization and useMemo hooks for expensive calculations (stat derivation). It will only re-render when the draft object changes.

## Testing

The component includes comprehensive tests covering:
- Empty state rendering
- Stat calculations (HP, AC, Speed)
- Racial bonus application
- Responsive behavior
- Update handling
- All alignment color mappings

Run tests with:
```bash
npm test -- CharacterPreview.test.tsx
```

## D&D 5e Rules Implementation

### Racial Bonuses
- Human: +1 to all abilities
- Elf: +2 DEX
- Dwarf: +2 CON
- Dragonborn: +2 STR, +1 CHA
- Etc. (see RACIAL_BONUSES in component)

### Hit Points (Level 1)
- HP = Max Hit Die + CON Modifier
- Barbarian: d12 (12 + CON)
- Fighter: d10 (10 + CON)
- Wizard: d6 (6 + CON)
- Etc.

### Armor Class
- **Unarmored** (Wizard/Sorcerer): 10 + DEX
- **Light Armor** (Rogue/Bard): 11 + DEX
- **Medium Armor** (Ranger): 13 + DEX (max +2)
- **Heavy Armor** (Fighter/Paladin): 16 + DEX (max +2)
- **Barbarian Unarmored**: 10 + DEX + CON
- **Monk Unarmored**: 10 + DEX + WIS

### Speed
- Small races (Dwarf, Halfling, Gnome): 25 ft
- Most races (Human, Elf, Tiefling, etc.): 30 ft
