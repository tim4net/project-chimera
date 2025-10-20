# Character Portrait Generation System

## Overview

Nuaibria features a comprehensive character portrait generation system that creates visually distinct portraits based on:
- **Race** (physical features, body type)
- **Class** (equipment, weapons, armor)
- **Background** (clothing style, social class, profession) ✨
- **Alignment** (mood, lighting, facial expression) ✨

## How It Works

### Dual-Layer System

The system operates at two levels:

1. **Frontend Generation** (Primary) - Used during character creation wizard
2. **Backend Generation** (Fallback) - Used when frontend doesn't generate portrait

### Frontend Portrait Generation

Located in: `frontend/src/components/character-creation/CharacterCreationScreen.tsx`

#### Portrait Prompt Structure

```typescript
const fullPrompt = `
  ${genderEmphasis}          // Gender features and presentation
  ${race} ${class} portrait   // Base character identity
  ${raceDesc}                 // Race-specific physical traits
  CLASS FEATURES: ${classEmphasis}  // Equipment and class-specific gear
  BACKGROUND: ${bgHint}       // Clothing style and social bearing ✨
  MOOD AND LIGHTING: ${alignmentVisuals} ✨  // Alignment-based atmosphere
  Physical build: ${physicalTraits}
  Personality: ${mentalTraits}
  Custom: ${portraitPrompt}   // User-provided description
  D&D fantasy RPG character art, dramatic lighting, highly detailed...
`;
```

### Alignment Visual Effects ✨ NEW

Each of the 9 D&D alignments influences:

| Alignment | Atmosphere | Lighting | Expression |
|-----------|------------|----------|------------|
| **Lawful Good** | Noble pure | Bright golden, warm highlights | Confident kind, compassionate eyes |
| **Neutral Good** | Warm protective | Soft natural sunlight | Friendly approachable |
| **Chaotic Good** | Rebellious hero | Dynamic dramatic, bold contrasts | Mischievous adventurous |
| **Lawful Neutral** | Orderly disciplined | Balanced even | Serious composed |
| **True Neutral** | Balanced natural | Realistic balanced | Calm observant |
| **Chaotic Neutral** | Unpredictable wild | Erratic sharp | Curious free-spirited |
| **Lawful Evil** | Cold tyrannical | Harsh with ominous red-purple | Cruel calculating |
| **Neutral Evil** | Predatory | Dim murky, sickly tones | Selfish cold |
| **Chaotic Evil** | Chaotic destructive | Flickering hellish red-orange | Maniacal wild |

### Background Visual Effects ✨ NEW

Each background shapes clothing, accessories, and demeanor:

| Background | Visual Description |
|------------|-------------------|
| **Acolyte** | Religious robes, holy symbols, spiritual humble bearing |
| **Charlatan** | Flashy practical outfit, confidence, clever smirk |
| **Criminal** | Dark street clothing, hidden weapons, alert demeanor |
| **Entertainer** | Colorful performance costume, dramatic flair, charismatic |
| **Folk Hero** | Common working clothes, honest face, modest heroic bearing |
| **Guild Artisan** | Practical work clothes with tool marks, professional |
| **Hermit** | Worn weathered clothing, ascetic, contemplative wisdom |
| **Noble** | Expensive fine clothing, jewelry, aristocratic regal posture |
| **Outlander** | Rugged wilderness attire, weather-beaten, hardy |
| **Sage** | Scholarly robes, reading glasses, intellectual expression |
| **Sailor** | Nautical clothing, weathered by sea, rope accessories |
| **Soldier** | Military uniform, disciplined bearing, battle-worn |
| **Urchin** | Patched worn clothing, street-smart scrappy bearing |

## Example Generated Prompts

### Example 1: Lawful Good Human Paladin Noble

```
IMPORTANT: MALE character, male features, male presentation.
male Human Paladin portrait: standard human features, diverse appearance.
CLASS FEATURES: gleaming plate armor, longsword and shield, holy radiance, righteous knight.
BACKGROUND: expensive fine clothing, jewelry, aristocratic regal posture, elegant refined bearing.
MOOD AND LIGHTING: noble atmosphere, bright golden lighting with warm highlights, confident kind expression with compassionate eyes.
Physical build: Strong, athletic.
D&D fantasy RPG character art, dramatic lighting, highly detailed face and equipment...
```

**Visual Result:**
- Gleaming plate armor with holy symbols
- Bright golden lighting creating halo effect
- Confident, compassionate facial expression
- Fine nobleman bearing and posture
- Warm uplifting atmosphere

### Example 2: Chaotic Evil Tiefling Warlock Criminal

```
IMPORTANT: FEMALE character, female features, female presentation.
female Tiefling Warlock portrait: MUST HAVE crimson red skin, large curved horns, long tail, glowing eyes.
CLASS FEATURES: eldritch patron symbols, dark pact magic, otherworldly features, occult runes.
BACKGROUND: dark practical street clothing, hidden weapons, suspicious alert demeanor.
MOOD AND LIGHTING: chaotic destructive atmosphere, flickering hellish red-orange lighting, maniacal wild expression.
Physical build: Lean, cunning.
D&D fantasy RPG character art, dramatic lighting, highly detailed face and equipment...
```

**Visual Result:**
- Demonic tiefling features (red skin, horns, tail)
- Dark warlock robes with eldritch symbols
- Flickering hellish lighting
- Maniacal, dangerous expression
- Street criminal bearing with hidden weapons
- Chaotic, menacing atmosphere

### Example 3: True Neutral Half-Elf Druid Hermit

```
IMPORTANT: FEMALE character, female features, female presentation.
female Half-Elf Druid portrait: blend of human and elven, slightly pointed ears, graceful but sturdy.
CLASS FEATURES: wooden staff with vines, animal pelts, nature-themed, leaves and flowers in attire.
BACKGROUND: worn weathered simple clothing, ascetic bearing, contemplative wisdom, isolated appearance.
MOOD AND LIGHTING: balanced natural atmosphere, realistic lighting, calm observant expression.
Physical build: Athletic, harmonious.
D&D fantasy RPG character art, dramatic lighting, highly detailed face and equipment...
```

**Visual Result:**
- Half-elf features with subtle points to ears
- Nature-themed druid staff and attire
- Worn, weathered hermit clothing
- Balanced natural lighting
- Calm, wise, observant expression
- Neutral, contemplative atmosphere

## System Architecture

### Character Creation Flow

```
1. User fills character form
   ↓
2. User selects alignment from dropdown
   ↓
3. User clicks "Generate Portrait"
   ↓
4. Frontend builds comprehensive prompt including:
   - Race physical traits
   - Class equipment
   - Background clothing/bearing ✨
   - Alignment mood/lighting ✨
   ↓
5. Image generation service creates portrait
   ↓
6. Portrait displayed in character creation wizard
   ↓
7. When user clicks "Create Character":
   - Portrait URL sent to backend
   - Character record created with portrait_url
```

### Backend Fallback System

If frontend doesn't generate a portrait (user skips portrait generation), the backend can auto-generate:

**Location:** `backend/src/routes/characters.ts` (lines 331-361)

**Trigger:** `AUTO_GENERATE_PORTRAITS=true` in `.env` AND no `portrait_url` provided

**Uses:** `backend/src/services/characterPortraitPrompts.ts` for intelligent prompt building

## Testing Different Combinations

### Recommended Test Cases

1. **Heroic Paladin:**
   - Lawful Good + Noble + Paladin
   - Should show: Golden lighting, noble bearing, confident expression

2. **Villainous Warlock:**
   - Chaotic Evil + Criminal + Warlock
   - Should show: Hellish lighting, dark clothing, maniacal expression

3. **Neutral Ranger:**
   - True Neutral + Outlander + Ranger
   - Should show: Balanced lighting, wilderness gear, calm expression

4. **Contrasting Tiefling:**
   - Lawful Good + Acolyte + Tiefling Cleric
   - Should show: Demonic features BUT divine golden light (redemption theme)

5. **Conflicted Paladin:**
   - Lawful Evil + Soldier + Paladin
   - Should show: Gleaming armor BUT harsh cold lighting, cruel expression

## Configuration

### Frontend Configuration

No configuration needed - alignment/background effects are automatic when selections are made.

### Backend Configuration

Set in `.env`:
```bash
AUTO_GENERATE_PORTRAITS=true
```

This enables automatic portrait generation for characters created without frontend portraits.

## Troubleshooting

### Portrait doesn't reflect alignment

**Issue:** Portrait looks the same regardless of alignment

**Solution:**
1. Verify alignment is selected in character creation form
2. Check browser console for full generated prompt
3. Ensure `alignmentStyle` object includes selected alignment
4. Try regenerating portrait after changing alignment

### Background not visible in portrait

**Issue:** Character doesn't show background-appropriate clothing

**Solution:**
1. Verify background is selected before generating portrait
2. Check that `backgroundHints` includes the selected background
3. Background effects are subtle - look for bearing and clothing style, not dramatic changes
4. Some classes (heavy armor) may override background clothing

### Portrait generation fails

**Issue:** Portrait doesn't generate at all

**Solution:**
1. Check image generation service is running
2. Verify `VITE_BACKEND_URL` is correctly set in frontend `.env`
3. Check backend logs for image generation errors
4. Try manual portrait generation using "Generate Portrait" button

## Technical Implementation Details

### Frontend Data Flow

```typescript
// 1. User selects alignment
const [alignment, setAlignment] = useState('Lawful Good');

// 2. Portrait generation triggered
const handleGeneratePortraits = () => {
  // Build prompt with alignment
  const alignmentVisuals = alignmentStyle[alignment];
  const fullPrompt = `... ${alignmentVisuals} ...`;

  // Trigger image generation
  setImageGenParams({ prompt: fullPrompt, ... });
};

// 3. Character creation includes portrait
const characterData = {
  ...,
  alignment,
  portrait_url: selectedPortrait  // Generated portrait URL
};
```

### Backend Data Flow

```typescript
// 1. Receive character creation request
const { alignment, portrait_url } = req.body;

// 2. If no portrait, auto-generate
if (AUTO_GENERATE_PORTRAITS && !portrait_url) {
  const prompt = buildCharacterPortraitPrompt(
    race, class, background, alignment, name
  );
  const result = await generateImage({ prompt, ... });
  // Update character with generated portrait
}
```

## Future Enhancements

Potential improvements:
- **Dynamic Alignment Shifts**: Regenerate portrait when alignment changes
- **Deity Influence**: Clerics/Paladins reflect their deity's visual style
- **Subclass Variants**: Specific visual tweaks for subclasses
- **Campaign Themes**: Portrait style adapts to campaign setting (e.g., dark/gritty vs high-fantasy)
- **Multiple Poses**: Generate action poses, resting poses, emotional variants

## Credits

This comprehensive portrait system creates immersive, personality-driven character visualizations that reflect not just what a character looks like, but who they are.
