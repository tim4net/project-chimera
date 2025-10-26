# Design System Usage Examples

Complete code examples for using the Nuaibria Design System components.

---

## Table of Contents

1. [Importing Components](#importing-components)
2. [Card Component](#card-component)
3. [Button Component](#button-component)
4. [Slider Component](#slider-component)
5. [Typography](#typography)
6. [Color Usage](#color-usage)
7. [Animations](#animations)
8. [Responsive Grids](#responsive-grids)
9. [Forms](#forms)
10. [Complete Page Example](#complete-page-example)

---

## Importing Components

```tsx
// Import shared components
import { Card, Button, Slider } from '@/components/shared';

// Import color tokens
import { colors, getColor, hexToRgba } from '@/design/colors';

// Import Lucide icons
import { Sparkles, Sword, ChevronRight, ChevronLeft } from 'lucide-react';
```

---

## Card Component

### Basic Card

```tsx
import { Card } from '@/components/shared';
import { Sparkles } from 'lucide-react';

function RaceCard() {
  const [selectedRace, setSelectedRace] = useState('elf');

  return (
    <Card
      selected={selectedRace === 'elf'}
      onClick={() => setSelectedRace('elf')}
      ariaLabel="Select Elf race"
    >
      <Sparkles className="w-12 h-12 text-nuaibria-gold mb-3 mx-auto" />
      <h3 className="text-xl font-bold text-nuaibria-text-primary mb-2 text-center">
        Elf
      </h3>
      <p className="text-sm text-nuaibria-text-secondary text-center">
        Graceful and wise, with keen senses and mastery of magic.
      </p>
    </Card>
  );
}
```

### Compact Card Variant

```tsx
<Card variant="compact" selected={isSelected} onClick={handleSelect}>
  <div className="flex items-center gap-3">
    <Sword className="w-6 h-6 text-nuaibria-gold" />
    <span className="font-semibold text-nuaibria-text-primary">Fighter</span>
  </div>
</Card>
```

### Disabled Card

```tsx
<Card disabled ariaLabel="Locked - requires level 5">
  <div className="relative">
    <Lock className="w-8 h-8 text-nuaibria-text-muted mb-2" />
    <p className="text-sm text-nuaibria-text-muted">Unlock at Level 5</p>
  </div>
</Card>
```

### Card Grid (Races)

```tsx
function RaceSelection() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);

  const races = [
    { id: 'elf', name: 'Elf', icon: Sparkles, description: '...' },
    { id: 'dwarf', name: 'Dwarf', icon: Hammer, description: '...' },
    // ... more races
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
      {races.map((race) => (
        <Card
          key={race.id}
          selected={selectedRace === race.id}
          onClick={() => setSelectedRace(race.id)}
          ariaLabel={`Select ${race.name} race`}
        >
          <race.icon className="w-12 h-12 text-nuaibria-gold mb-3 mx-auto" />
          <h3 className="text-xl font-bold text-nuaibria-text-primary mb-2 text-center">
            {race.name}
          </h3>
          <p className="text-sm text-nuaibria-text-secondary text-center">
            {race.description}
          </p>
        </Card>
      ))}
    </div>
  );
}
```

---

## Button Component

### Primary Button

```tsx
import { Button } from '@/components/shared';
import { ChevronRight } from 'lucide-react';

function NextButton() {
  return (
    <Button
      variant="primary"
      onClick={handleNext}
      iconAfter={<ChevronRight className="w-5 h-5" />}
    >
      Next
    </Button>
  );
}
```

### Secondary Button

```tsx
<Button
  variant="secondary"
  onClick={handleBack}
  iconBefore={<ChevronLeft className="w-5 h-5" />}
>
  Back
</Button>
```

### Loading Button

```tsx
<Button
  variant="primary"
  loading={isSubmitting}
  onClick={handleSubmit}
>
  Save Character
</Button>
```

### Disabled Button

```tsx
<Button variant="primary" disabled>
  Complete Previous Steps
</Button>
```

### Full Width Button

```tsx
<Button variant="primary" fullWidth onClick={handleCreate}>
  Create Character
</Button>
```

### Button Group (Footer Navigation)

```tsx
function WizardFooter({ onBack, onNext, canGoBack, canGoNext }: FooterProps) {
  return (
    <div className="flex justify-between items-center gap-4 pt-6 border-t border-nuaibria-border">
      <Button
        variant="secondary"
        onClick={onBack}
        disabled={!canGoBack}
        iconBefore={<ChevronLeft className="w-5 h-5" />}
      >
        Back
      </Button>
      <Button
        variant="primary"
        onClick={onNext}
        disabled={!canGoNext}
        iconAfter={<ChevronRight className="w-5 h-5" />}
      >
        Next
      </Button>
    </div>
  );
}
```

---

## Slider Component

### Basic Slider (Ability Score)

```tsx
import { Slider } from '@/components/shared';

function AbilityScoreSlider() {
  const [strength, setStrength] = useState(10);

  return (
    <Slider
      id="strength"
      label="Strength"
      min={8}
      max={15}
      value={strength}
      onChange={setStrength}
      showValue
    />
  );
}
```

### Slider with Custom Format

```tsx
<Slider
  id="level"
  label="Character Level"
  min={1}
  max={20}
  value={level}
  onChange={setLevel}
  formatValue={(v) => `Level ${v}`}
  showTooltip
/>
```

### Slider without Tooltip

```tsx
<Slider
  id="gold"
  label="Starting Gold"
  min={0}
  max={1000}
  step={50}
  value={gold}
  onChange={setGold}
  formatValue={(v) => `${v} GP`}
  showTooltip={false}
/>
```

### Disabled Slider

```tsx
<Slider
  id="locked-stat"
  label="Racial Bonus (Fixed)"
  min={0}
  max={5}
  value={2}
  onChange={() => {}}
  disabled
/>
```

### Multiple Ability Scores

```tsx
function AbilityScores() {
  const [scores, setScores] = useState({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });

  const abilities = [
    { key: 'strength', label: 'Strength (STR)' },
    { key: 'dexterity', label: 'Dexterity (DEX)' },
    { key: 'constitution', label: 'Constitution (CON)' },
    { key: 'intelligence', label: 'Intelligence (INT)' },
    { key: 'wisdom', label: 'Wisdom (WIS)' },
    { key: 'charisma', label: 'Charisma (CHA)' },
  ];

  return (
    <div className="space-y-6">
      {abilities.map(({ key, label }) => (
        <Slider
          key={key}
          id={key}
          label={label}
          min={8}
          max={15}
          value={scores[key]}
          onChange={(value) => setScores({ ...scores, [key]: value })}
          showValue
          showTooltip
        />
      ))}
    </div>
  );
}
```

---

## Typography

### Headings

```tsx
<h1 className="typography-h1 text-nuaibria-text-primary mb-6">
  Create Your Character
</h1>

<h2 className="typography-h2 text-nuaibria-text-primary mb-4">
  Choose Your Race
</h2>

<h3 className="typography-h3 text-nuaibria-text-primary mb-3">
  Elf
</h3>
```

### Body Text

```tsx
<p className="typography-body text-nuaibria-text-secondary mb-4">
  Elves are a magical people of otherworldly grace, living in the world but not entirely part of it.
</p>

<p className="typography-body-large text-nuaibria-text-primary mb-4">
  Important instruction text that needs emphasis.
</p>
```

### Captions and Labels

```tsx
<span className="typography-caption">
  Required field
</span>

<label className="block text-sm font-semibold text-nuaibria-text-primary mb-2">
  Character Name
</label>
```

### Gold Accent Text

```tsx
<span className="text-nuaibria-gold font-bold">
  +2 Dexterity
</span>

<p className="text-lg text-nuaibria-gold font-semibold">
  Welcome, Adventurer!
</p>
```

---

## Color Usage

### Using Color Tokens (TypeScript)

```tsx
import { colors, getColor, hexToRgba } from '@/design/colors';

// Direct access
const backgroundColor = colors.purple[1]; // #3D2B7D

// Using helper function
const borderColor = getColor('gold.standard'); // #D4AF37

// Convert to rgba
const overlayColor = hexToRgba(colors.gold.standard, 0.1); // rgba(212,175,55,0.1)
```

### Using Tailwind Classes

```tsx
// Background colors
<div className="bg-nuaibria-purple-0">Darkest purple</div>
<div className="bg-nuaibria-purple-1">Card background</div>
<div className="bg-nuaibria-purple-2">Interactive surface</div>

// Text colors
<p className="text-nuaibria-text-primary">Primary text</p>
<p className="text-nuaibria-text-secondary">Secondary text</p>
<p className="text-nuaibria-text-muted">Muted text</p>

// Border colors
<div className="border border-nuaibria-border">Default border</div>
<div className="border border-nuaibria-gold">Gold border</div>

// Status colors
<p className="text-nuaibria-success">Success message</p>
<p className="text-nuaibria-error">Error message</p>
<p className="text-nuaibria-warning">Warning message</p>
```

---

## Animations

### Page Transitions

```tsx
// Fade in
<div className="animate-fade-in">
  Content appears smoothly
</div>

// Slide up
<div className="animate-slide-up">
  Content slides up from below
</div>

// Combined fade + slide
<div className="animate-fade-in animate-slide-up">
  Smooth page entry
</div>
```

### Hover Effects

```tsx
// Card hover (built into Card component)
<Card className="hover:-translate-y-0.5 hover:shadow-card-hover">
  ...
</Card>

// Custom hover effect
<div className="transition-all duration-200 hover:scale-105 hover:shadow-glow">
  Hover me!
</div>
```

### Loading States

```tsx
// Spinner
<div className="flex items-center justify-center">
  <div className="spinner" />
</div>

// Skeleton loader
<div className="skeleton h-32 w-full" />

// Progress bar
<div className="progress-bar">
  <div className="progress-fill" style={{ width: '60%' }} />
</div>
```

### Success/Error Animations

```tsx
// Success checkmark
<div className="success-checkmark">
  <Check className="w-8 h-8 text-nuaibria-success" />
</div>

// Error shake
<div className="error-shake">
  <AlertCircle className="w-8 h-8 text-nuaibria-error" />
</div>

// Error pulse border
<input className="input-field error error-pulse" />
```

---

## Responsive Grids

### Race Grid (5 columns on desktop)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5">
  {races.map(race => (
    <Card key={race.id}>...</Card>
  ))}
</div>
```

### Class Grid (4 columns on desktop)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
  {classes.map(cls => (
    <Card key={cls.id}>...</Card>
  ))}
</div>
```

### Background Grid (3 columns on tablet/desktop)

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
  {backgrounds.map(bg => (
    <Card key={bg.id}>...</Card>
  ))}
</div>
```

---

## Forms

### Text Input

```tsx
<div className="space-y-2">
  <label htmlFor="character-name" className="block text-sm font-semibold text-nuaibria-text-primary">
    Character Name <span className="text-nuaibria-error">*</span>
  </label>
  <input
    type="text"
    id="character-name"
    placeholder="Enter your character's name"
    className="input-field w-full"
    required
    aria-required="true"
  />
</div>
```

### Input with Error

```tsx
<div className="space-y-2">
  <label htmlFor="name" className="block text-sm font-semibold text-nuaibria-text-primary">
    Character Name
  </label>
  <input
    type="text"
    id="name"
    className={`input-field w-full ${hasError ? 'error' : ''}`}
    aria-invalid={hasError}
    aria-describedby={hasError ? "name-error" : undefined}
  />
  {hasError && (
    <p id="name-error" role="alert" className="text-nuaibria-error text-sm mt-1 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      Character name is required.
    </p>
  )}
</div>
```

### Input with Success

```tsx
<input
  type="text"
  className="input-field w-full success"
  aria-invalid={false}
/>
<p className="text-nuaibria-success text-sm mt-1 flex items-center gap-1">
  <Check className="w-4 h-4" />
  Name is available!
</p>
```

---

## Complete Page Example

### Race Selection Page

```tsx
import { useState } from 'react';
import { Card, Button } from '@/components/shared';
import { Sparkles, Hammer, Target, ChevronRight, ChevronLeft } from 'lucide-react';

interface Race {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

function RaceSelectionPage() {
  const [selectedRace, setSelectedRace] = useState<string | null>(null);

  const races: Race[] = [
    {
      id: 'elf',
      name: 'Elf',
      icon: Sparkles,
      description: 'Graceful and wise, with keen senses and mastery of magic.',
    },
    {
      id: 'dwarf',
      name: 'Dwarf',
      icon: Hammer,
      description: 'Stout and hardy, renowned for their craftsmanship and resilience.',
    },
    {
      id: 'human',
      name: 'Human',
      icon: Target,
      description: 'Versatile and ambitious, adaptable to any situation.',
    },
    // ... more races
  ];

  const handleNext = () => {
    if (selectedRace) {
      // Navigate to next page
      console.log('Selected race:', selectedRace);
    }
  };

  return (
    <div className="min-h-screen bg-nuaibria-bg p-6 animate-fade-in animate-slide-up">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="typography-h1 text-nuaibria-text-primary mb-4 text-center">
          Choose Your Race
        </h1>
        <p className="typography-body text-nuaibria-text-secondary mb-8 text-center max-w-2xl mx-auto">
          Your race determines your character's physical traits, innate abilities, and cultural background.
        </p>

        {/* Race Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5 mb-8">
          {races.map((race) => {
            const Icon = race.icon;
            return (
              <Card
                key={race.id}
                selected={selectedRace === race.id}
                onClick={() => setSelectedRace(race.id)}
                ariaLabel={`Select ${race.name} race`}
              >
                <Icon className="w-12 h-12 text-nuaibria-gold mb-3 mx-auto" />
                <h3 className="text-xl font-bold text-nuaibria-text-primary mb-2 text-center">
                  {race.name}
                </h3>
                <p className="text-sm text-nuaibria-text-secondary text-center">
                  {race.description}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center gap-4 pt-6 border-t border-nuaibria-border">
          <Button
            variant="secondary"
            onClick={() => console.log('Back')}
            iconBefore={<ChevronLeft className="w-5 h-5" />}
          >
            Back
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={!selectedRace}
            iconAfter={<ChevronRight className="w-5 h-5" />}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RaceSelectionPage;
```

---

## Best Practices

### Accessibility

1. **Always use labels for inputs:**
```tsx
<label htmlFor="input-id">Label</label>
<input id="input-id" />
```

2. **Provide ARIA attributes:**
```tsx
<Button ariaLabel="Save character" />
<Card ariaLabel="Select Elf race" />
```

3. **Use semantic HTML:**
```tsx
<button> not <div onClick>
<h1>, <h2>, <h3> for headings
<label> for form labels
```

### Performance

1. **Use transform for animations (GPU-accelerated):**
```tsx
className="hover:-translate-y-0.5" // Good
className="hover:top-[-2px]" // Avoid
```

2. **Avoid animating opacity on gradient text (causes flicker)**

3. **Use CSS transitions instead of JavaScript animations**

### Responsive Design

1. **Mobile-first approach:**
```tsx
className="text-base lg:text-lg" // Base for mobile, lg for desktop
```

2. **Use responsive grids:**
```tsx
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5"
```

3. **Test on multiple screen sizes (320px, 768px, 1024px, 1440px)**

---

## Resources

- **Tailwind Documentation:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/
- **WCAG Contrast Checker:** https://webaim.org/resources/contrastchecker/
- **Design System Spec:** `/srv/project-chimera/DESIGN_SYSTEM.md`
