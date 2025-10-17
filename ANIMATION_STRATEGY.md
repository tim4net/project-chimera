# Animation Strategy for Nuaibria

## Supported Animation Types

### 1. AI-Generated Animations
- **GIF**: Classic animated format, good browser support
- **Animated WebP**: Modern, better compression than GIF
- **Video (MP4/WebM)**: For cinematic backgrounds and epic scenes

### 2. CSS Animations on Static Images
- **Parallax scrolling**: Background images move at different speeds
- **Ken Burns effect**: Slow zoom and pan on static images
- **Particle overlays**: Magical sparkles, embers, fog
- **Glow pulses**: Rhythmic glowing borders/shadows

## When to Use Each Type

### AI-Generated Animations (GIF/WebP)
**Use for:**
- Magical effects (spell casting, portal swirls)
- Environmental effects (flickering torches, flowing water)
- UI elements (animated borders, loading states)
- Character idles (breathing, subtle movement)

**Context Types:**
- `ui_element_animated` - Borders, dividers, icons
- `spell_effect` - Magic visualizations
- `environment_effect` - Fire, water, fog

**Example prompts:**
- "Magical portal swirling with arcane energy, animated loop, purple and gold"
- "Torch flickering with orange flames, animated loop, dark background"
- "Mystical runes glowing and pulsing, animated sequence"

### CSS Animations (Static + Code)
**Use for:**
- Background landscapes (parallax)
- Hero banners (Ken Burns zoom)
- Card hover effects
- Page transitions

**Advantages:**
- No API costs
- Instant loading
- Easy to customize
- Better performance

### Video Backgrounds
**Use for:**
- Login screen cinematics
- Epic story moments
- Zone transitions
- Combat victory screens

## Implementation Examples

### 1. Animated Background Elements
```tsx
<div className="absolute inset-0 pointer-events-none">
  <img
    src={animatedMagicParticles.url}
    className="w-full h-full object-cover opacity-20 mix-blend-screen"
    alt=""
  />
</div>
```

### 2. Parallax Layers
```tsx
<div className="parallax-container">
  <div className="parallax-layer" data-speed="0.2">
    <img src={mountains} />
  </div>
  <div className="parallax-layer" data-speed="0.5">
    <img src={midground} />
  </div>
  <div className="parallax-layer" data-speed="1.0">
    <img src={foreground} />
  </div>
</div>
```

### 3. Animated Borders
```tsx
<div className="relative border-4 border-transparent">
  <img src={animatedGoldBorder.gif} className="absolute inset-0 w-full h-full" />
  <div className="relative z-10">{content}</div>
</div>
```

## Cost & Performance Guidelines

### Free Tier Strategy
1. **Static images**: Primary content (portraits, landscapes)
2. **CSS animations**: 80% of motion needs
3. **Animated GIFs**: Sparingly for key UI elements
4. **Videos**: Only for major moments (1-2 per session)

### Cache Strategy
- **Static images**: Cache forever
- **Animated GIFs**: Cache by context (spell effects reusable)
- **Videos**: CDN delivery, lazy load

## Animation Contexts to Implement

### Phase 1 (MVP)
- [ ] Animated UI borders (gold swirls)
- [ ] Magical particle overlays
- [ ] CSS parallax on landscapes
- [ ] Pulsing glow effects

### Phase 2
- [ ] Spell effect GIFs
- [ ] Environmental animations (fire, water)
- [ ] Character idle animations
- [ ] Animated loading states

### Phase 3
- [ ] Victory screen cinematics
- [ ] Story moment videos
- [ ] Dynamic weather effects
- [ ] Battle transition animations
