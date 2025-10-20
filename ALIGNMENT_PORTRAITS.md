# Alignment-Based Character Portraits

## Overview

Character portraits in Nuaibria are now influenced by the character's alignment, creating visually distinct atmospheres that reflect their moral and ethical disposition. This enhancement makes portraits more immersive and true to the character's personality.

## How It Works

When generating a character portrait, the system combines:
1. **Race-specific traits** (physical features, body type)
2. **Class equipment** (armor, weapons, attire)
3. **Background context** (clothing style, profession hints)
4. **Alignment visual style** ⭐ NEW ⭐ (mood, lighting, expression)

## Alignment Visual Styles

### Good Alignments

#### Lawful Good
- **Mood**: Noble and pure atmosphere, divine radiance, heroic presence
- **Lighting**: Bright golden light, warm highlights, halo effect
- **Expression**: Confident and kind expression, determined noble gaze, compassionate eyes
- **Example Characters**: Paladins, devoted clerics, noble knights

#### Neutral Good
- **Mood**: Warm and protective atmosphere, gentle heroism, caring presence
- **Lighting**: Soft warm lighting, natural sunlight, gentle glow
- **Expression**: Warm friendly expression, genuine smile, approachable demeanor
- **Example Characters**: Healers, protectors, selfless heroes

#### Chaotic Good
- **Mood**: Rebellious hero atmosphere, free-spirited energy, adventurous vibe
- **Lighting**: Dynamic dramatic lighting, bold contrasts, energetic highlights
- **Expression**: Mischievous smile, adventurous spirit, defiant yet kind eyes
- **Example Characters**: Robin Hood types, rebel heroes, free spirits

### Neutral Alignments

#### Lawful Neutral
- **Mood**: Orderly and disciplined atmosphere, structured presence, formal bearing
- **Lighting**: Balanced even lighting, clean shadows, professional illumination
- **Expression**: Serious focused expression, disciplined gaze, composed demeanor
- **Example Characters**: Judges, soldiers following orders, bureaucrats

#### True Neutral
- **Mood**: Balanced natural atmosphere, harmonious presence, pragmatic bearing
- **Lighting**: Natural balanced lighting, neutral tones, realistic shadows
- **Expression**: Calm neutral expression, observant eyes, unbiased demeanor
- **Example Characters**: Druids, neutral scholars, pragmatic merchants

#### Chaotic Neutral
- **Mood**: Unpredictable atmosphere, wild energy, free-spirited presence
- **Lighting**: Erratic lighting, sharp contrasts, dynamic shadows
- **Expression**: Unpredictable expression, curious eyes, free-spirited demeanor
- **Example Characters**: Tricksters, free agents, unpredictable adventurers

### Evil Alignments

#### Lawful Evil
- **Mood**: Cold tyrannical atmosphere, oppressive presence, authoritarian bearing
- **Lighting**: Harsh cold lighting, deep shadows, ominous red or purple tints
- **Expression**: Cold calculating expression, cruel smile, merciless eyes
- **Example Characters**: Tyrants, evil nobles, oppressive rulers

#### Neutral Evil
- **Mood**: Selfish malevolent atmosphere, predatory presence, opportunistic bearing
- **Lighting**: Dim sinister lighting, murky shadows, sickly green or gray tones
- **Expression**: Selfish smirk, greedy eyes, uncaring cold demeanor
- **Example Characters**: Mercenaries, criminals, self-serving villains

#### Chaotic Evil
- **Mood**: Destructive chaotic atmosphere, malevolent madness, terrifying presence
- **Lighting**: Flickering hellish lighting, violent red and orange tones, chaotic shadows
- **Expression**: Maniacal expression, wild dangerous eyes, cruel twisted smile
- **Example Characters**: Demons, psychopaths, agents of chaos

## Implementation Details

### Backend Service

The alignment visual styling is implemented in:
```
backend/src/services/characterPortraitPrompts.ts
```

Key functions:
- `buildCharacterPortraitPrompt(race, class, background, alignment?, name?)` - Main portrait prompt builder
- `getSupportedAlignments()` - Returns list of all supported alignments
- `getAlignmentStyle(alignment)` - Returns visual style for specific alignment

### Integration

Portrait generation is automatically triggered during character creation in:
```
backend/src/routes/characters.ts
```

The system:
1. Extracts alignment from character creation data
2. Builds comprehensive prompt including alignment modifiers
3. Passes prompt to image generation service
4. Saves generated portrait URL to character record

### Example Generated Prompt

For a **Lawful Good Human Paladin**:
```
average human build, varied features, diverse appearance, medium height,
shining plate armor, holy symbol, sword or warhammer, righteous bearing, noble appearance,
fine expensive clothing, jewelry, aristocratic bearing, elegant,
fantasy digital painting, detailed character portrait, cinematic lighting, heroic pose, D&D art style,
noble and pure atmosphere, divine radiance, heroic presence,
bright golden light, warm highlights, halo effect,
confident and kind expression, determined noble gaze, compassionate eyes
```

For a **Chaotic Evil Tiefling Warlock**:
```
humanoid with demonic features, large curved horns, long prehensile tail, red skin, glowing eyes,
dark mysterious robes, eldritch energy, otherworldly features, occult symbols, ominous aura,
dark practical clothing, street-smart appearance, hidden weapons,
fantasy digital painting, detailed character portrait, cinematic lighting,
destructive chaotic atmosphere, malevolent madness, terrifying presence,
flickering hellish lighting, violent red and orange tones, chaotic shadows,
maniacal expression, wild dangerous eyes, cruel twisted smile
Avoid: normal human skin tone, no horns, no tail, round ears
```

## Configuration

Enable automatic portrait generation by setting in `.env`:
```
AUTO_GENERATE_PORTRAITS=true
```

## API Changes

### Updated Function Signature

**Before:**
```typescript
buildCharacterPortraitPrompt(race, characterClass, background, name?)
```

**After:**
```typescript
buildCharacterPortraitPrompt(race, characterClass, background, alignment?, name?)
```

The `alignment` parameter is optional but highly recommended for better portrait generation.

## Visual Examples

| Alignment | Key Visual Traits |
|-----------|------------------|
| Lawful Good | Golden light, noble bearing, compassionate |
| Chaotic Evil | Dark shadows, hellish tones, cruel expression |
| True Neutral | Balanced lighting, calm demeanor |
| Chaotic Good | Dynamic contrasts, mischievous smile |

## Testing

To test alignment-based portraits:

1. Create characters with different alignments
2. Enable `AUTO_GENERATE_PORTRAITS=true`
3. Observe how portraits reflect alignment through:
   - Overall mood and atmosphere
   - Lighting style and color tones
   - Facial expressions and demeanor

## Future Enhancements

Potential improvements:
- Subclass-specific visual modifiers
- Deity influence for clerics/paladins
- Backstory-driven portrait variations
- Dynamic alignment shift visualization (portraits change as alignment shifts)

## Technical Notes

- Alignment styles are additive to base race/class/background prompts
- Negative prompts help avoid unwanted traits (especially for non-human races)
- Portrait generation is non-blocking (character creation succeeds even if portrait fails)
- Generated portraits are stored in Supabase storage and linked via `portrait_url` field

## Developer Guide

### Adding New Alignment Styles

Edit `ALIGNMENT_VISUAL_STYLE` in `characterPortraitPrompts.ts`:

```typescript
const ALIGNMENT_VISUAL_STYLE: Record<string, {...}> = {
  'New Alignment': {
    mood: 'describe overall atmosphere',
    lighting: 'describe lighting style',
    expression: 'describe facial expression'
  }
};
```

### Querying Alignment Styles Programmatically

```typescript
import { getAlignmentStyle, getSupportedAlignments } from './services/characterPortraitPrompts';

// Get all alignments
const alignments = getSupportedAlignments();
console.log(alignments); // ['Lawful Good', 'Neutral Good', ...]

// Get specific alignment style
const style = getAlignmentStyle('Chaotic Good');
console.log(style.mood); // 'rebellious hero atmosphere, ...'
```

## Credits

This feature enhances character portraits by leveraging D&D 5e alignment philosophy to create more immersive and personality-driven visual representations.
