# Nuaibria Design System

**Modern, accessible design system for character creation wizard**

---

## Overview

This directory contains the complete design system for the Nuaibria character creation experience. All components follow dark fantasy aesthetics with deep purples, gold accents, and smooth animations optimized for 60 FPS performance.

---

## Files in This Directory

| File | Description |
|------|-------------|
| `colors.ts` | Color tokens and helper functions |
| `USAGE_EXAMPLES.md` | Complete code examples for all components |
| `QUICK_REFERENCE.md` | Fast lookup for common patterns |
| `README.md` | This file |

---

## Getting Started

### 1. Import Components

```tsx
import { Card, Button, Slider } from '@/components/shared';
```

### 2. Import Color Tokens

```tsx
import { colors, getColor, hexToRgba } from '@/design/colors';
```

### 3. Import Icons

```tsx
import { Sparkles, Sword, ChevronRight } from 'lucide-react';
```

### 4. Use Tailwind Classes

```tsx
<div className="bg-nuaibria-purple-1 text-nuaibria-text-primary">
  Content
</div>
```

---

## Core Components

### Card
Selectable card with hover, selected, and disabled states.

```tsx
<Card selected={isSelected} onClick={handleSelect}>
  <Icon className="w-12 h-12 text-nuaibria-gold mb-3" />
  <h3 className="text-xl font-bold text-center">Title</h3>
  <p className="text-sm text-center">Description</p>
</Card>
```

### Button
Primary and secondary buttons with loading states.

```tsx
<Button variant="primary" onClick={handleNext}>
  Next
</Button>
```

### Slider
Modern slider with tooltip and keyboard navigation.

```tsx
<Slider
  label="Strength"
  min={8}
  max={15}
  value={strength}
  onChange={setStrength}
/>
```

---

## Color System

### Primary Colors
- **Purple Shades:** `nuaibria-purple-0` through `nuaibria-purple-3`
- **Gold Accent:** `nuaibria-gold`, `nuaibria-gold-light`, `nuaibria-gold-dark`
- **Teal Secondary:** `nuaibria-teal-0` through `nuaibria-teal-2`

### Status Colors
- **Success:** `nuaibria-success` (green)
- **Error:** `nuaibria-error` (red)
- **Warning:** `nuaibria-warning` (amber)
- **Info:** `nuaibria-info` (blue)

### Text Colors
- **Primary:** `nuaibria-text-primary` (#F3F4F6)
- **Secondary:** `nuaibria-text-secondary` (#D1D5DB)
- **Muted:** `nuaibria-text-muted` (#9CA3AF)

---

## Typography

Use predefined typography classes:

```tsx
className="typography-h1"          // Large page titles
className="typography-h2"          // Section headers
className="typography-h3"          // Card titles
className="typography-body"        // Regular text
className="typography-body-large"  // Emphasized text
className="typography-caption"     // Small labels
```

---

## Responsive Design

All components are mobile-first and responsive:

```tsx
// Mobile: 1 column, Tablet: 3 columns, Desktop: 5 columns
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5"
```

**Breakpoints:**
- Mobile: < 768px (base classes)
- Tablet: 768px+ (`md:` prefix)
- Desktop: 1024px+ (`lg:` prefix)

---

## Animations

### Page Transitions
```tsx
className="animate-fade-in animate-slide-up"
```

### Hover Effects
```tsx
className="hover:-translate-y-0.5 hover:shadow-card-hover"
```

### Loading States
```tsx
<div className="spinner" />              // Spinner
<div className="skeleton h-32 w-full" /> // Skeleton loader
```

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- ✅ Keyboard navigation (Tab, Enter, Space, Arrows)
- ✅ Focus indicators (2px gold ring)
- ✅ ARIA attributes (labels, roles, states)
- ✅ Color contrast (minimum 4.5:1)
- ✅ Screen reader support

**Example:**
```tsx
<Card
  selected={isSelected}
  onClick={handleSelect}
  ariaLabel="Select Elf race"
>
  ...
</Card>
```

---

## File Structure

```
frontend/src/
├── design/                   # This directory
│   ├── colors.ts            # Color tokens
│   ├── USAGE_EXAMPLES.md    # Complete examples
│   ├── QUICK_REFERENCE.md   # Fast lookup
│   └── README.md            # This file
├── styles/
│   ├── global.css           # Global styles + Tailwind
│   └── animations.css       # Animation definitions
└── components/shared/
    ├── Card.tsx             # Reusable card
    ├── Button.tsx           # Reusable button
    ├── Slider.tsx           # Modern slider
    └── index.ts             # Component exports
```

---

## Documentation

- **Full Specification:** `/srv/project-chimera/DESIGN_SYSTEM.md`
- **Usage Examples:** `USAGE_EXAMPLES.md` (in this directory)
- **Quick Reference:** `QUICK_REFERENCE.md` (in this directory)

---

## Installation

The design system is already set up. To use it:

1. **Import styles in `main.tsx`:**
```tsx
import './styles/global.css';
import './styles/animations.css';
```

2. **Import components:**
```tsx
import { Card, Button, Slider } from '@/components/shared';
```

3. **Use Tailwind classes:**
```tsx
className="bg-nuaibria-purple-1 text-nuaibria-gold"
```

---

## Testing

All components include:
- TypeScript types
- Prop validation
- ARIA attributes
- Test IDs (`data-testid`)

**Example test:**
```tsx
import { render, screen } from '@testing-library/react';
import { Card } from '@/components/shared';

test('renders card with content', () => {
  render(<Card testId="test-card">Content</Card>);
  expect(screen.getByTestId('test-card')).toBeInTheDocument();
});
```

---

## Common Patterns

### Selectable Grid (Races/Classes)
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5">
  {items.map(item => (
    <Card
      key={item.id}
      selected={selectedId === item.id}
      onClick={() => setSelectedId(item.id)}
    >
      <Icon className="w-12 h-12 text-nuaibria-gold mb-3 mx-auto" />
      <h3 className="text-xl font-bold text-center">{item.name}</h3>
      <p className="text-sm text-center">{item.description}</p>
    </Card>
  ))}
</div>
```

### Footer Navigation
```tsx
<div className="flex justify-between items-center gap-4 pt-6 border-t border-nuaibria-border">
  <Button variant="secondary" iconBefore={<ChevronLeft />}>
    Back
  </Button>
  <Button variant="primary" iconAfter={<ChevronRight />}>
    Next
  </Button>
</div>
```

### Ability Score Slider
```tsx
<Slider
  id="strength"
  label="Strength (STR)"
  min={8}
  max={15}
  value={strength}
  onChange={setStrength}
  showValue
  showTooltip
/>
```

---

## Performance

All animations are optimized for 60 FPS:
- Uses `transform` instead of `top`/`left`
- Uses CSS transitions instead of JavaScript
- GPU-accelerated animations
- No opacity/filter on gradient-clipped text

---

## Browser Support

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

---

## Contributing

When adding new components:
1. Follow existing patterns in `/components/shared/`
2. Include TypeScript types
3. Add ARIA attributes for accessibility
4. Include `testId` prop for testing
5. Document usage in `USAGE_EXAMPLES.md`
6. Test on mobile, tablet, and desktop

---

## Support

For questions or issues:
1. Check `USAGE_EXAMPLES.md` for code examples
2. Check `QUICK_REFERENCE.md` for fast lookup
3. Review `/srv/project-chimera/DESIGN_SYSTEM.md` for full spec
4. Contact design team for clarifications

---

**Status:** ✅ Design System v1.0 - Ready for Production

**Last Updated:** 2025-10-26
