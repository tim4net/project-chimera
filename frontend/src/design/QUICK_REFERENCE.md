# Design System Quick Reference

Fast lookup for common patterns and classes.

---

## Colors (Tailwind Classes)

### Backgrounds
```
bg-nuaibria-purple-0    // Darkest purple
bg-nuaibria-purple-1    // Card backgrounds
bg-nuaibria-purple-2    // Interactive surfaces
bg-nuaibria-purple-3    // Hover highlights
```

### Text
```
text-nuaibria-text-primary      // #F3F4F6 (main text)
text-nuaibria-text-secondary    // #D1D5DB (labels)
text-nuaibria-text-muted        // #9CA3AF (hints)
text-nuaibria-gold              // #D4AF37 (accent)
```

### Borders
```
border-nuaibria-border    // #374151 (default)
border-nuaibria-gold      // #D4AF37 (accent/selected)
```

### Status
```
text-nuaibria-success    // Green
text-nuaibria-error      // Red
text-nuaibria-warning    // Amber
text-nuaibria-info       // Blue
```

---

## Typography

```tsx
className="typography-h1"           // 48px, bold, tight tracking
className="typography-h2"           // 36px, bold, tight tracking
className="typography-h3"           // 28px, bold
className="typography-body"         // 16px, regular
className="typography-body-large"  // 18px, regular
className="typography-caption"     // 14px, muted
```

---

## Components

### Card
```tsx
<Card selected={true} onClick={() => {}}>
  Content
</Card>
```

### Button
```tsx
<Button variant="primary" onClick={() => {}}>
  Click Me
</Button>

<Button variant="secondary" loading={true}>
  Loading...
</Button>
```

### Slider
```tsx
<Slider
  label="Strength"
  min={8}
  max={15}
  value={10}
  onChange={setValue}
/>
```

---

## Animations

```tsx
className="animate-fade-in"          // Fade in (300ms)
className="animate-slide-up"         // Slide up (300ms)
className="animate-spin"             // Spinner rotation
className="animate-shimmer"          // Skeleton loading
className="animate-shake"            // Error shake
className="animate-checkmark"        // Success animation
```

---

## Spacing

```
p-3     // 12px padding
p-4     // 16px padding
p-5     // 20px padding
gap-3   // 12px gap
gap-4   // 16px gap
gap-5   // 20px gap
```

---

## Responsive Grids

```tsx
// Races (1 / 3 / 5 columns)
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 lg:gap-5"

// Classes (1 / 3 / 4 columns)
className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5"

// Backgrounds (1 / 3 columns)
className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4"
```

---

## Common Patterns

### Selectable Card with Icon
```tsx
<Card selected={selected} onClick={handleSelect}>
  <Icon className="w-12 h-12 text-nuaibria-gold mb-3 mx-auto" />
  <h3 className="text-xl font-bold text-nuaibria-text-primary mb-2 text-center">
    Title
  </h3>
  <p className="text-sm text-nuaibria-text-secondary text-center">
    Description
  </p>
</Card>
```

### Navigation Footer
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

### Input with Label
```tsx
<div className="space-y-2">
  <label htmlFor="input" className="block text-sm font-semibold text-nuaibria-text-primary">
    Label
  </label>
  <input id="input" className="input-field w-full" />
</div>
```

### Input with Error
```tsx
<input className="input-field w-full error" aria-invalid={true} />
<p role="alert" className="text-nuaibria-error text-sm mt-1">
  Error message
</p>
```

---

## Breakpoints

```
Mobile:  < 768px   (base classes)
Tablet:  768px+    (md: prefix)
Desktop: 1024px+   (lg: prefix)
```

---

## Icon Library (Lucide React)

```bash
npm install lucide-react
```

```tsx
import { Sparkles, Sword, Shield, ChevronRight } from 'lucide-react';

<Sparkles className="w-6 h-6 text-nuaibria-gold" />
```

**Common Icons:**
- `Sparkles` - Magic/Aasimar
- `Sword` - Fighter/Warrior
- `Shield` - Defense/Paladin
- `ChevronRight`, `ChevronLeft` - Navigation
- `Check` - Success
- `X` - Close
- `AlertCircle` - Error
- `Info` - Information

---

## File Locations

```
/srv/project-chimera/
├── DESIGN_SYSTEM.md                          # Full spec
└── frontend/src/
    ├── design/
    │   ├── colors.ts                         # Color tokens
    │   ├── USAGE_EXAMPLES.md                 # Code examples
    │   └── QUICK_REFERENCE.md                # This file
    ├── styles/
    │   ├── global.css                        # Global styles
    │   └── animations.css                    # Animations
    └── components/shared/
        ├── Card.tsx                          # Reusable card
        ├── Button.tsx                        # Reusable button
        ├── Slider.tsx                        # Modern slider
        └── index.ts                          # Exports
```

---

## Import Paths

```tsx
// Components
import { Card, Button, Slider } from '@/components/shared';

// Colors
import { colors, getColor } from '@/design/colors';

// Icons
import { Sparkles } from 'lucide-react';
```

---

## Accessibility Checklist

- [ ] Use `<label>` for all inputs
- [ ] Provide `aria-label` for icon-only buttons
- [ ] Use `aria-invalid` for error states
- [ ] Provide `aria-describedby` for error messages
- [ ] Use semantic HTML (`<button>`, not `<div onClick>`)
- [ ] Ensure focus indicators are visible
- [ ] Test keyboard navigation (Tab, Enter, Space, Arrows)
- [ ] Verify color contrast (minimum 4.5:1)

---

## Performance Tips

1. Use `transform` for animations (GPU-accelerated)
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `transition-transform` instead of `transition-all`
4. Lazy load images and heavy components
5. Use `useMemo` for expensive calculations

---

## Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## Support

- **Full Documentation:** `/srv/project-chimera/DESIGN_SYSTEM.md`
- **Usage Examples:** `/srv/project-chimera/frontend/src/design/USAGE_EXAMPLES.md`
- **Tailwind Docs:** https://tailwindcss.com/docs
- **Lucide Icons:** https://lucide.dev/
