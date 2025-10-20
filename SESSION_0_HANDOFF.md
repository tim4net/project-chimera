# Session 0 Interview System - Handoff Document

**Date**: 2025-10-19
**Status**: 80% Complete - Ready for Final Integration
**Token Usage**: 509k/1M

---

## WHAT'S COMPLETE

### Phase 1: Database ✅
- Expanded tutorial_state enum (7 interview states)
- Added interview_data JSONB column
- Migration applied successfully

### Phase 2: Core Service ✅
- session0Interview.ts created (630 lines)
- State machine logic complete
- Interview prompts written
- 28 tests passing
- Fully documented

### Phase 3: Intent Detection ✅
- detectInterviewIntent() function created
- Integrated into main intent detector
- Detects: SKIP, ENTER_WORLD, CONTINUE

---

## REMAINING WORK (2-3 hours)

### Phase 4: Rule Engine Executors

Add to `/srv/nuaibria/backend/src/services/ruleEngine.ts`:

```typescript
async function executeSkipInterview(
  action: SkipInterviewAction,
  character: CharacterRecord
): Promise<ActionResult> {
  // Import from session0Interview
  const { getDefaultSpellChoices } = await import('./session0Interview');

  const stateChanges: StateChange[] = [];

  // Auto-assign default spells for spellcasters
  if (isSpellcaster(character.class)) {
    const defaults = getDefaultSpellChoices(character.class);

    stateChanges.push({
      entityId: character.id,
      field: 'selected_cantrips',
      oldValue: [],
      newValue: defaults.cantrips,
    });

    stateChanges.push({
      entityId: character.id,
      field: 'selected_spells',
      oldValue: [],
      newValue: defaults.spells,
    });
  }

  // Jump to interview_complete
  stateChanges.push({
    entityId: character.id,
    field: 'tutorial_state',
    oldValue: character.tutorial_state,
    newValue: 'interview_complete',
  });

  return {
    success: true,
    outcome: 'success',
    narrativeContext: {
      summary: 'Interview skipped. Default choices assigned.',
    },
    stateChanges,
    // ... standard ActionResult fields
  };
}

async function executeContinueInterview(
  action: ContinueInterviewAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const { getNextInterviewState } = await import('./session0Interview');

  const nextState = getNextInterviewState(character);

  return {
    success: true,
    stateChanges: [{
      entityId: character.id,
      field: 'tutorial_state',
      oldValue: character.tutorial_state,
      newValue: nextState,
    }],
    narrativeContext: {
      summary: 'Advancing to next stage...',
    },
    // ... standard fields
  };
}

async function executeEnterWorld(
  action: EnterWorldAction,
  character: CharacterRecord
): Promise<ActionResult> {
  // Set position to starting coordinates
  return {
    success: true,
    stateChanges: [
      {
        entityId: character.id,
        field: 'position_x',
        oldValue: null,
        newValue: 500,
      },
      {
        entityId: character.id,
        field: 'position_y',
        oldValue: null,
        newValue: 500,
      },
      {
        entityId: character.id,
        field: 'tutorial_state',
        oldValue: 'interview_complete',
        newValue: null,
      },
    ],
    narrativeContext: {
      summary: 'You enter the world of Nuaibria!',
      details: 'Your adventure begins at the Wanderer\'s Crossroads.',
    },
    // ... standard fields
  };
}
```

Then add to executeAction() switch:
```typescript
case 'SKIP_INTERVIEW':
  return executeSkipInterview(action, character);
case 'CONTINUE_INTERVIEW':
  return executeContinueInterview(action, character);
case 'ENTER_WORLD':
  return executeEnterWorld(action, character);
```

### Phase 5: Character Creation Update

In `/srv/nuaibria/backend/src/routes/characters.ts` (line ~204):

Change:
```typescript
level: isSpellcaster ? 0 : 1,
tutorial_state: isSpellcaster ? 'needs_cantrips' : 'complete',
```

To:
```typescript
level: 0,  // Everyone starts at Level 0 for Session 0
tutorial_state: 'interview_welcome',  // Everyone goes through interview
position_x: null,  // Not in world yet
position_y: null,
```

And create welcome message:
```typescript
const welcomeMessage = `Welcome, ${name}! I am The Chronicler...`;
await supabaseServiceClient
  .from('dm_conversations')
  .insert({
    character_id: createdCharacter.id,
    role: 'dm',
    content: welcomeMessage,
  });
```

### Phase 6: Narrator Enhancement

In `/srv/nuaibria/backend/src/services/narratorLLM.ts`:

```typescript
// After getting tutorial context, add:
const { getInterviewPrompt } = await import('./session0Interview');

if (character.tutorial_state && character.tutorial_state !== 'complete') {
  const interviewPrompt = getInterviewPrompt(character);

  // Add to character sheet context
  characterSheet += `\n\n${interviewPrompt}`;
}
```

### Phase 7: Integration Test

Create `/srv/nuaibria/backend/src/__tests__/session0Integration.test.ts`:

```typescript
describe('Session 0 Full Flow', () => {
  test('Bard completes full interview', async () => {
    // 1. Create Bard at interview_welcome
    // 2. Say "ready" → interview_class_intro
    // 3. Say "ready" → needs_cantrips
    // 4. Select cantrips → needs_spells
    // 5. Select spells → needs_equipment
    // 6. Choose equipment → interview_backstory
    // 7. Answer backstory → interview_complete
    // 8. Say "enter world" → Position set, in world!
  });

  test('Fighter shortened interview', async () => {
    // Skips spell states
  });

  test('Skip interview works', async () => {
    // Say "skip" → Defaults assigned → interview_complete
  });
});
```

---

## QUICK INTEGRATION CHECKLIST

1. [ ] Add 3 action types to actions.ts
2. [ ] Add 3 executors to ruleEngine.ts
3. [ ] Update character creation (start interview)
4. [ ] Enhance narrator (inject prompts)
5. [ ] Write integration test
6. [ ] Test end-to-end flow
7. [ ] Verify with real character creation

**Estimated**: 2-3 hours for clean implementation

---

## CURRENT STATE

**What works**: Everything except Session 0 is fully functional
**What's ready**: Session 0 service built and tested (state machine works)
**What's needed**: Wire it into character creation and DM chat

The foundation is solid. Just need to connect the pieces!

---

## FILES TO MODIFY

1. `types/actions.ts` - Add 3 action types
2. `services/ruleEngine.ts` - Add 3 executors
3. `routes/characters.ts` - Start at interview_welcome
4. `services/narratorLLM.ts` - Inject interview prompts
5. `__tests__/session0Integration.test.ts` - Create new test file

**All straightforward additions to existing files.**

---

**Ready to continue?** The hard architectural work is done!
