# Session 0 Interview Service

The Session 0 Interview Service manages the character onboarding flow where **The Chronicler** (AI DM) guides new players through character preparation before entering the world of Nuaibria.

## Overview

This service provides a state machine for the "Session 0" interview - the process where new characters:
1. Are welcomed to the game
2. Learn about their class
3. Select spells (if applicable)
4. Choose starting equipment
5. Define their backstory (ideals, bonds, flaws)
6. Complete preparation and enter the world

## Key Features

- **State Machine**: Manages interview progression with automatic state transitions
- **Class-Specific Logic**: Automatically skips spell selection for non-spellcasters
- **Educational Prompts**: Engaging, immersive prompts for each interview state
- **Progress Tracking**: Calculates completion percentage and next steps
- **Default Recommendations**: Provides sensible spell/equipment defaults for quick setup

## API Reference

### Core Functions

#### `getNextInterviewState(character: CharacterRecord): InterviewState | null`

Returns the next interview state based on current character state.

```typescript
const character = { /* ... */, tutorial_state: 'interview_welcome' };
const nextState = getNextInterviewState(character);
// Returns: 'interview_class_intro'
```

Automatically skips spell states for non-spellcasters (Fighter, Rogue, Barbarian, Monk).

Returns `null` when interview is complete.

---

#### `getInterviewPrompt(character: CharacterRecord): string`

Returns The Chronicler's prompt for the current interview state.

```typescript
const character = { /* ... */, tutorial_state: 'interview_welcome' };
const prompt = getInterviewPrompt(character);
// Returns: "Welcome, [name]! I am The Chronicler..."
```

Prompts are:
- Educational and immersive
- Class-specific where appropriate
- Formatted with markdown for rich display

---

#### `getInterviewProgress(character: CharacterRecord): Session0Progress`

Returns progress information including:
- `currentState`: Current interview state
- `nextState`: Next state (or null if complete)
- `canSkip`: Whether the player can skip (only true for welcome state)
- `percentComplete`: Progress percentage (0-100)

```typescript
const progress = getInterviewProgress(character);
console.log(`Progress: ${progress.percentComplete}%`);
```

---

#### `shouldSkipSpellStates(characterClass: string): boolean`

Checks if a class should skip spell selection states.

```typescript
shouldSkipSpellStates('Fighter') // true
shouldSkipSpellStates('Bard')    // false
```

---

#### `getDefaultSpellChoices(characterClass: string): DefaultSpellChoices`

Returns recommended default spells for a class.

```typescript
const defaults = getDefaultSpellChoices('Bard');
// Returns: { cantrips: ['Vicious Mockery', 'Prestidigitation'], spells: [...] }
```

Used for:
- Skip functionality
- "Help" / recommendations
- Quick character creation

---

#### `isValidStateTransition(currentState, nextState, characterClass): boolean`

Validates whether a state transition is legal.

```typescript
isValidStateTransition('interview_welcome', 'interview_class_intro', 'Bard')
// Returns: true

isValidStateTransition('interview_class_intro', 'needs_cantrips', 'Fighter')
// Returns: false (Fighter doesn't cast spells)
```

---

#### `getInitialInterviewState(): InterviewState`

Returns the starting interview state (`'interview_welcome'`).

---

#### `isInterviewComplete(character: CharacterRecord): boolean`

Checks if the interview is complete (either `tutorial_state === 'interview_complete'` or `level > 0`).

---

## Interview State Flow

### For Spellcasters (Bard, Wizard, Cleric, Sorcerer, Warlock, Druid)

```
interview_welcome
  ↓
interview_class_intro
  ↓
needs_cantrips
  ↓
needs_spells
  ↓
needs_equipment
  ↓
interview_backstory
  ↓
interview_complete
```

### For Non-Spellcasters (Fighter, Rogue, Barbarian, Monk)

```
interview_welcome
  ↓
interview_class_intro
  ↓
needs_equipment
  ↓
interview_backstory
  ↓
interview_complete
```

## State Descriptions

### `interview_welcome`

The Chronicler welcomes the player and explains Session 0.

**Prompt includes:**
- Welcome message
- Introduction to Nuaibria
- Explanation of Session 0
- Option to skip for experienced players

**Player actions:**
- Say "ready" to continue
- Say "skip" to use defaults

---

### `interview_class_intro`

The Chronicler explains the player's chosen class in detail.

**Prompt includes:**
- Class role and playstyle
- Key abilities and features
- Spellcasting explanation (if applicable)
- What makes this class unique

**Class-specific content:**
- Spellcasters learn about their spellcasting ability and spell slots
- Non-spellcasters learn about their martial capabilities

---

### `needs_cantrips`

**(Spellcasters only)**

Cantrip selection with educational guidance.

**Prompt includes:**
- Explanation of cantrips (unlimited use, Level 0 spells)
- List of available cantrips by class
- Recommendations for beginners
- Required count (varies by class)

**Integration point:**
Should integrate with `tutorialGuidance.ts` for detailed spell lists.

---

### `needs_spells`

**(Spellcasters only)**

Level 1 spell selection with educational guidance.

**Prompt includes:**
- Explanation of spell slots
- List of available Level 1 spells
- Recommendations for balanced spell selection
- Required count (varies by class)

**Special cases:**
- Clerics and Druids **prepare** spells rather than learning them
- These classes get an explanation of spell preparation instead

---

### `needs_equipment`

Starting equipment selection.

**Prompt includes:**
- Two equipment options for the class
- Detailed list of items in each option
- Flavor text for each set

**Equipment sets:**
Each class has 2 thematic equipment options (e.g., Bard can choose rapier or longsword, diplomat's pack or entertainer's pack).

---

### `interview_backstory`

The player defines their character's personality through D&D 5e's Ideals, Bonds, and Flaws.

**Prompt includes:**
- Three questions:
  1. **Ideal**: What drives you forward?
  2. **Bond**: Who or what do you care about?
  3. **Flaw**: What weakness do you struggle with?
- Examples for each
- Encouragement to answer in their own words

**Purpose:**
These answers seed The Chronicler's narrative generation and create personalized story hooks.

---

### `interview_complete`

Final preparation summary and world entry.

**Prompt includes:**
- Confirmation of character details
- Summary of choices made
- Starting location (Wanderer's Crossroads at 500, 500)
- Invitation to enter the world

**Player actions:**
- Say "I'm ready" or "Enter the world" to begin playing

---

## Usage Example

### Backend Route (Character Creation Endpoint)

```typescript
import {
  getInitialInterviewState,
  getNextInterviewState,
  getInterviewPrompt,
  getInterviewProgress
} from './services/session0Interview';

// When creating a new character
router.post('/characters', async (req, res) => {
  const newCharacter = await createCharacter({
    ...req.body,
    level: 0,
    tutorial_state: getInitialInterviewState()
  });

  const prompt = getInterviewPrompt(newCharacter);
  const progress = getInterviewProgress(newCharacter);

  res.json({
    character: newCharacter,
    chroniclerMessage: prompt,
    progress
  });
});
```

### Backend Route (Interview Progression)

```typescript
router.post('/characters/:id/interview-response', async (req, res) => {
  const character = await getCharacter(req.params.id);
  const { response } = req.body;

  // Process player's response (spell selection, equipment choice, backstory, etc.)
  // This would integrate with other services to validate and apply choices

  // Move to next state
  const nextState = getNextInterviewState(character);

  if (!nextState) {
    // Interview complete - level up to 1 and enter world
    await updateCharacter(character.id, {
      level: 1,
      tutorial_state: 'interview_complete',
      position: { x: 500, y: 500 }
    });

    return res.json({
      complete: true,
      message: "Welcome to Nuaibria!"
    });
  }

  await updateCharacter(character.id, { tutorial_state: nextState });
  const updatedCharacter = await getCharacter(character.id);

  res.json({
    character: updatedCharacter,
    chroniclerMessage: getInterviewPrompt(updatedCharacter),
    progress: getInterviewProgress(updatedCharacter)
  });
});
```

### Frontend Integration (React)

```tsx
import { useState, useEffect } from 'react';

function Session0Screen({ character }) {
  const [prompt, setPrompt] = useState('');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    fetch(`/api/characters/${character.id}/interview-state`)
      .then(res => res.json())
      .then(data => {
        setPrompt(data.chroniclerMessage);
        setProgress(data.progress.percentComplete);
      });
  }, [character.id]);

  const handleResponse = async (response) => {
    const res = await fetch(`/api/characters/${character.id}/interview-response`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ response })
    });

    const data = await res.json();

    if (data.complete) {
      // Navigate to main game
      navigateTo('/dashboard');
    } else {
      setPrompt(data.chroniclerMessage);
      setProgress(data.progress.percentComplete);
    }
  };

  return (
    <div className="session0-screen">
      <div className="progress-bar">
        <div style={{ width: `${progress}%` }} />
      </div>

      <div className="chronicler-prompt">
        <ReactMarkdown>{prompt}</ReactMarkdown>
      </div>

      <ChatInput onSubmit={handleResponse} />
    </div>
  );
}
```

## Integration Points

### With tutorialGuidance.ts

The `needs_cantrips` and `needs_spells` states should integrate with the existing `tutorialGuidance.ts` service for detailed spell selection prompts:

```typescript
import { getTutorialContext } from './tutorialGuidance';

function getInterviewPrompt(character: CharacterRecord): string {
  const state = character.tutorial_state;

  if (state === 'needs_cantrips' || state === 'needs_spells') {
    // Use detailed spell selection prompts
    return getTutorialContext(character);
  }

  // ...rest of interview prompts
}
```

### With Character Creation

New characters should start with:
```typescript
{
  level: 0,
  tutorial_state: 'interview_welcome',
  // ...other properties
}
```

### With DM Chat Endpoint

The Session 0 interview should flow through the DM chat endpoint (`/dm-chat`) so players interact naturally with The Chronicler. The backend should:

1. Detect that character is in Session 0 (`level === 0`)
2. Use `getInterviewPrompt()` to provide context to LLM
3. Process player responses and advance states
4. Use LLM to provide natural, conversational responses

## Testing

Run the comprehensive test suite:

```bash
cd backend
npm test -- session0Interview.test.ts
```

Tests cover:
- State progression for spellcasters and non-spellcasters
- Progress calculation
- Prompt generation
- Default spell choices
- State transition validation
- Full integration flows

## Future Enhancements

- [ ] **Multi-language support**: Translate prompts
- [ ] **Voice acting**: TTS for The Chronicler's prompts
- [ ] **Animated transitions**: Visual feedback between states
- [ ] **Save/resume**: Allow players to pause Session 0 and return later
- [ ] **Randomized recommendations**: Vary default spell/equipment suggestions
- [ ] **Class archetypes**: Offer subclass selection during interview
- [ ] **Background integration**: Use background to suggest ideals/bonds/flaws

## Design Philosophy

The Session 0 Interview is designed to:

1. **Educate**: Teach D&D 5e mechanics to new players
2. **Immerse**: Set the tone with The Chronicler's narrative voice
3. **Personalize**: Capture player choices to seed future storytelling
4. **Streamline**: Allow experienced players to skip with sensible defaults
5. **Engage**: Make character creation feel like the start of an adventure

This is **not** a dry form-filling experience. It's the first moment of gameplay - the moment when The Chronicler meets the hero and prepares them for their journey into Nuaibria.

---

**Related Documentation:**
- `tutorialGuidance.ts` - Detailed spell selection prompts
- `CLAUDE.md` - Project overview and MVP scope
- `project.md` - Complete architectural decisions

**Authors:** Claude Code (Anthropic)
**Last Updated:** 2025-10-20
