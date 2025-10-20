# Alignment Visual Style Guide - Quick Reference

## Color & Lighting Quick Reference

### Good (Warm & Bright)
| Alignment | Primary Colors | Light Quality | Overall Feel |
|-----------|---------------|---------------|--------------|
| **Lawful Good** | Gold, White, Silver | Bright, radiant, halo | Divine hero |
| **Neutral Good** | Warm tones, Natural | Soft, gentle sunlight | Kind protector |
| **Chaotic Good** | Bright, Bold contrasts | Dynamic, dramatic | Rebellious hero |

### Neutral (Balanced)
| Alignment | Primary Colors | Light Quality | Overall Feel |
|-----------|---------------|---------------|--------------|
| **Lawful Neutral** | Grays, Blues, Professional | Even, clean, balanced | Disciplined judge |
| **True Neutral** | Natural earth tones | Realistic, balanced | Pragmatic observer |
| **Chaotic Neutral** | Varied, Unpredictable | Erratic, sharp | Wild card |

### Evil (Dark & Sinister)
| Alignment | Primary Colors | Light Quality | Overall Feel |
|-----------|---------------|---------------|--------------|
| **Lawful Evil** | Cold colors, Red/Purple | Harsh, oppressive | Tyrant |
| **Neutral Evil** | Sickly green/gray | Dim, murky | Predator |
| **Chaotic Evil** | Hellish red/orange | Flickering, violent | Destroyer |

## Expression Matrix

### Law vs Chaos (Facial Expression Style)
- **Lawful**: Controlled, composed, calculated
- **Neutral**: Natural, observant, balanced
- **Chaotic**: Dynamic, wild, unpredictable

### Good vs Evil (Emotional Tone)
- **Good**: Kind, compassionate, caring eyes
- **Neutral**: Pragmatic, unbiased, calm
- **Evil**: Cruel, cold, malevolent

## Atmosphere Keywords

### Lawful Alignments
- Order, structure, discipline
- Clean lines, formal bearing
- Professional, authoritarian

### Chaotic Alignments
- Freedom, rebellion, unpredictability
- Dynamic energy, wild spirit
- Erratic, free-flowing

### Good Alignments
- Noble, heroic, caring
- Warmth, compassion, protection
- Bright, uplifting

### Evil Alignments
- Malevolent, cruel, oppressive
- Darkness, menace, fear
- Sinister, ominous

## Portrait Mood Board

```
                LAWFUL              NEUTRAL             CHAOTIC
              (Ordered)           (Balanced)          (Wild)
         ┌─────────────────┬─────────────────┬─────────────────┐
  GOOD   │  ✨ DIVINE      │  ☀️  GENTLE     │  ⚡ REBELLIOUS  │
(Light)  │  Golden halo    │  Warm sunlight  │  Bold contrasts │
         │  Noble gaze     │  Friendly smile │  Defiant eyes   │
         ├─────────────────┼─────────────────┼─────────────────┤
NEUTRAL  │  ⚖️  JUDGE      │  🌿 BALANCED    │  🎭 WILD        │
(Gray)   │  Even lighting  │  Natural tones  │  Erratic light  │
         │  Composed       │  Calm demeanor  │  Curious gaze   │
         ├─────────────────┼─────────────────┼─────────────────┤
  EVIL   │  👑 TYRANT      │  🗡️  PREDATOR   │  🔥 DESTROYER   │
(Dark)   │  Cold harsh     │  Dim murky      │  Hellish flicker│
         │  Cruel smile    │  Greedy eyes    │  Maniacal grin  │
         └─────────────────┴─────────────────┴─────────────────┘
```

## Character Archetype Examples

### Lawful Good - The Righteous Paladin
```
🎨 Visual Style:
   - Bright golden light from above
   - Shining armor gleaming
   - Confident, compassionate expression
   - Halo effect around head
   - Warm highlights on face
```

### Chaotic Neutral - The Rogue Trickster
```
🎨 Visual Style:
   - Sharp contrasts, dramatic shadows
   - Unpredictable lighting angles
   - Mischievous, curious expression
   - Dynamic pose
   - Erratic energy
```

### Lawful Evil - The Iron Tyrant
```
🎨 Visual Style:
   - Cold harsh lighting from below
   - Deep oppressive shadows
   - Red or purple color tints
   - Cold calculating eyes
   - Authoritarian bearing
```

### Chaotic Evil - The Mad Cultist
```
🎨 Visual Style:
   - Flickering hellish red/orange
   - Violent color tones
   - Chaotic shadow patterns
   - Wild, dangerous eyes
   - Maniacal expression
```

## Implementation Tips

### For Artists
- Start with alignment to set mood and lighting
- Let alignment guide color palette selection
- Use alignment to inform expression and pose
- Good = uplighting, Evil = downlighting, Neutral = balanced

### For Developers
- Alignment modifiers are applied AFTER race/class/background
- Lighting and mood keywords help AI understand atmosphere
- Expression keywords ensure facial features match alignment
- Test with contrasting alignments (LG vs CE) to verify system works

### For Game Designers
- Use alignment visuals for storytelling
- NPCs with clear visual alignment help player decision-making
- Alignment shift could trigger portrait regeneration
- Consider alignment as core character identity, not just rules mechanic

## Color Temperature Guide

```
WARM (Good)          NEUTRAL              COOL (Evil)
═══════════════════════════════════════════════════
Gold                 Gray                 Cold Blue
Orange               Beige                Purple
Yellow               Natural              Dark Red
Warm White           Brown                Black
                     Earth Tones          Sickly Green
```

## Quick Test Cases

To verify alignment system works:

1. **Create Lawful Good Paladin** → Should have golden halo effect
2. **Create Chaotic Evil Warlock** → Should have hellish red lighting
3. **Create True Neutral Druid** → Should have balanced natural lighting
4. **Compare Good vs Evil same race/class** → Should have contrasting moods

## Integration with Other Systems

### Race + Alignment
- **Tiefling + Lawful Good**: Demonic features but divine light (redemption theme)
- **Dwarf + Chaotic Evil**: Stocky build but sinister expression (corruption theme)
- **Elf + Lawful Neutral**: Graceful features with disciplined bearing

### Class + Alignment
- **Paladin + Chaotic Good**: Shining armor but rebellious stance
- **Warlock + Lawful Good**: Dark robes but warm lighting (unusual contrast)
- **Bard + Chaotic Neutral**: Performance outfit with unpredictable expression

## Prompt Weight Priority

The portrait generation system prioritizes features in this order:

1. **Race Physical Traits** (highest priority - defines core appearance)
2. **Class Equipment** (defines gear and profession)
3. **Background Context** (adds social/economic details)
4. **Alignment Atmosphere** (sets mood, lighting, expression)
5. **Base Style** (ensures consistent art quality)

## Troubleshooting

### Portrait doesn't reflect alignment
- Check that alignment parameter is being passed
- Verify alignment matches one of the 9 standard D&D alignments
- Ensure AUTO_GENERATE_PORTRAITS=true in .env

### Alignment style too subtle
- Good vs Evil should show clear lighting differences
- Lawful vs Chaotic should show compositional differences
- Check logs for full generated prompt

### Conflicting visual elements
- This is intentional! A Lawful Good Tiefling should look interesting (redemption)
- Race traits take priority over alignment (physical > psychological)
