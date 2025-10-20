# TUI Complete Implementation Plan

## Overview

This document provides the complete architecture and implementation plan to bring the TUI to full feature parity with the Web UI. All critical systems are designed to match the web interface layout and functionality.

## Architecture Summary

```
cli/src/
├── index.ts                          # ✅ Entry point with --user flag
├── api/
│   ├── client.ts                     # ✅ Basic API client
│   ├── dmChat.ts                     # ✅ DM chat integration
│   ├── characters.ts                 # 📋 Character CRUD operations
│   ├── quests.ts                     # 📋 Quest API calls
│   ├── combat.ts                     # 📋 Combat API calls
│   └── spells.ts                     # 📋 Spell data fetching
├── ui/
│   ├── layout.ts                     # ✅ 3-column layout manager
│   ├── theme.ts                      # ✅ Color schemes
│   ├── characterPanel.ts             # ✅ Basic stats display
│   ├── mapPanel.ts                   # ✅ ASCII world map
│   ├── chatPanel.ts                  # ✅ Chat interface
│   ├── questPanel.ts                 # 📋 Quest list & progress
│   ├── combatModal.ts                # 📋 Combat UI overlay
│   ├── levelUpModal.ts               # 📋 Level up dialog
│   ├── inventoryPanel.ts             # 📋 Inventory management
│   ├── journalPanel.ts               # 📋 Narrative log
│   ├── helpModal.ts                  # 📋 Help screen
│   └── wizards/
│       ├── characterCreation.ts      # 📋 Session 0 wizard
│       ├── raceSelection.ts          # 📋 Race picker
│       ├── classSelection.ts         # 📋 Class picker
│       ├── abilityScores.ts          # 📋 Point buy system
│       ├── backgroundSelection.ts    # 📋 Background picker
│       ├── skillSelection.ts         # 📋 Skill proficiencies
│       ├── equipmentSelection.ts     # 📋 Starting gear
│       └── spellSelection.ts         # 📋 Spell picker
├── types/
│   └── index.ts                      # ✅ Type definitions
└── utils/
    ├── parser.ts                     # 📋 Parse DM responses
    ├── formatter.ts                  # 📋 Format text for terminal
    ├── dice.ts                       # 📋 Dice rolling utilities
    └── keyboard.ts                   # 📋 Key binding helpers
```

Legend: ✅ Implemented | 📋 Needs Implementation

## Critical Systems to Implement

### 1. Character Creation Wizard (Session 0)

**Matches Web UI:**
- Step 1: Name input
- Step 2: Race selection (10 races with descriptions)
- Step 3: Class selection (12 classes with descriptions)
- Step 4: Ability scores (Point Buy system, 27 points)
- Step 5: Background selection (6 backgrounds with features)
- Step 6: Skill selection (class + background proficiencies)
- Step 7: Equipment selection (class-specific choices)
- Step 8: Spell selection (for casters only)
- Step 9: Character confirmation
- Step 10: AI portrait generation (optional/skip in TUI)

**Implementation:**
```typescript
// cli/src/ui/wizards/characterCreation.ts
class CharacterCreationWizard {
  // Multi-step wizard matching web UI flow
  // Uses blessed forms and list widgets
  // Validates all D&D 5e rules
  // Submits to POST /api/characters endpoint
}
```

### 2. Combat System

**Matches Web UI (ActivePhaseModal.tsx):**
- Initiative tracker (sorted combatants)
- Turn indicator (whose turn it is)
- Action menu (Attack, Cast Spell, Use Item, Dodge, Disengage, Help, Hide, Ready, Dash)
- Target selection
- Dice roll display with animation
- HP bars for all combatants
- Status effects display
- Combat log

**Implementation:**
```typescript
// cli/src/ui/combatModal.ts
class CombatModal {
  // Fullscreen overlay during combat
  // Top: Initiative tracker
  // Middle: Combatant details (player + enemies)
  // Bottom: Action menu + combat log
  // Arrow keys to navigate, Enter to select
}
```

**Combat Flow:**
```
1. DM triggers combat (triggerActivePhase: true)
2. TUI creates CombatModal overlay
3. Fetch combat state: GET /api/active-events/:characterId
4. Display initiative order
5. On player turn:
   - Show action menu
   - Player selects action + target
   - POST /api/active/action { actionType, targetId }
   - Display results (dice, damage, etc.)
6. On enemy turn:
   - Auto-resolve via backend
   - Display narrative + results
7. Combat ends when one side defeated
8. Return to normal dashboard
```

### 3. Quest Panel

**Matches Web UI (QuestPanel.tsx):**
- Active quests list
- Quest objectives with progress (e.g., "Kill 5 goblins: 3/5")
- Quest rewards display
- Quest descriptions
- Accept/Decline prompts

**Implementation:**
```typescript
// cli/src/ui/questPanel.ts
class QuestPanel {
  // 4th column or side panel
  // Scrollable quest list
  // Expandable quest details
  // Progress bars for objectives
}
```

**Quest API:**
```
GET /api/quests/:characterId - Get active quests
POST /api/quests/:questId/accept - Accept quest
POST /api/quests/:questId/complete - Complete quest
```

### 4. Level Up System

**Matches Web UI (LevelUpModal.tsx):**
- Congratulations message
- HP increase options (roll or take average)
- New class features display
- Ability Score Improvement (ASI) or Feat selection
- New spell selection (for casters)
- Subclass selection (at appropriate levels)

**Implementation:**
```typescript
// cli/src/ui/levelUpModal.ts
class LevelUpModal {
  // Modal overlay when XP threshold reached
  // Step 1: HP increase
  // Step 2: Class features (display only)
  // Step 3: ASI/Feat (every 4 levels)
  // Step 4: New spells (if caster)
  // Step 5: Subclass (if applicable)
  // Submit to POST /api/characters/:id/level-up
}
```

### 5. Spell Selection Interface

**Matches Web UI (spell browser in CharacterCreationScreen):**
- Filter by class
- Filter by spell level
- Filter by school of magic
- Search by name
- Spell descriptions
- Spell slot tracking
- Prepared spell management (for Wizards/Clerics)

**Implementation:**
```typescript
// cli/src/ui/wizards/spellSelection.ts
class SpellSelectionWizard {
  // List of available spells
  // Arrow keys to browse
  // Space to select/deselect
  // Shows cantrips separately from leveled spells
  // Displays remaining selections
}
```

**Data Source:**
```
GET /api/spells?class=Wizard&level=0 - Get available spells
Backend has full D&D 5e spell database
```

### 6. Inventory Management

**Matches Web UI (CharacterSheet inventory tab):**
- Inventory list with icons/symbols
- Equipped items (marked with *)
- Item categories (Weapons, Armor, Tools, Consumables)
- Weight/encumbrance tracking
- Item actions (Equip, Use, Drop, Inspect)
- Item details display

**Implementation:**
```typescript
// cli/src/ui/inventoryPanel.ts
class InventoryPanel {
  // Modal or dedicated panel
  // Item list with quantities
  // Context menu for actions
  // Item detail view
  // Encumbrance bar at bottom
}
```

### 7. Movement System

**Matches Web UI (click on map or chat commands):**
- Arrow keys move player on map
- WASD alternative
- Validate movement (terrain, obstacles)
- Update position in backend
- Trigger encounters based on movement

**Implementation:**
```typescript
// Enhanced mapPanel.ts
class MapPanel {
  // Add arrow key handlers
  // On arrow press:
  //   1. Calculate new position
  //   2. POST /api/characters/:id/move { x, y }
  //   3. Update local map
  //   4. Trigger any encounters
}
```

### 8. Idle Task System

**Matches Web UI (IdleTaskPanel):**
- Task list (Travel, Scout, Craft, Rest)
- Task descriptions
- Task duration display
- Progress bar for active task
- Completion notifications

**Implementation:**
```typescript
// cli/src/ui/idleTaskPanel.ts
class IdleTaskPanel {
  // Modal or panel
  // List of available tasks
  // Start task: POST /api/idle/start
  // Show progress: GET /api/idle/status
  // Complete: POST /api/idle/complete
}
```

## Implementation Phases

### Phase 1: Character Creation (1-2 weeks)
**Priority:** CRITICAL - Players can't create characters

Files to create:
1. `cli/src/ui/wizards/characterCreation.ts` (full wizard)
2. `cli/src/ui/wizards/abilityScores.ts` (point buy system)
3. `cli/src/ui/wizards/skillSelection.ts` (skill picker)
4. `cli/src/ui/wizards/spellSelection.ts` (spell browser)
5. `cli/src/api/characters.ts` (POST character creation)

Integration:
- Add "Create New Character" option to main menu
- Handle --new flag for direct creation
- Submit complete character data to backend
- Handle tutorial state for spellcasters

### Phase 2: Combat System (1 week)
**Priority:** CRITICAL - Combat encounters fail

Files to create:
1. `cli/src/ui/combatModal.ts` (combat UI)
2. `cli/src/api/combat.ts` (combat API calls)
3. `cli/src/utils/dice.ts` (dice rolling display)

Integration:
- Detect triggerActivePhase from DM chat
- Create combat overlay
- Handle turn-based flow
- Return to dashboard on combat end

### Phase 3: Quest & Progression (1 week)
**Priority:** HIGH - Core gameplay loop

Files to create:
1. `cli/src/ui/questPanel.ts` (quest display)
2. `cli/src/ui/levelUpModal.ts` (level up dialog)
3. `cli/src/api/quests.ts` (quest API)

Integration:
- Add quest panel to 4-column layout
- Trigger level up modal on XP threshold
- Quest progress updates from DM chat

### Phase 4: Inventory & Movement (3-5 days)
**Priority:** MEDIUM - Improves UX

Files to create:
1. `cli/src/ui/inventoryPanel.ts` (inventory UI)
2. Enhanced `cli/src/ui/mapPanel.ts` (arrow key movement)
3. `cli/src/ui/idleTaskPanel.ts` (task selection)

### Phase 5: Polish (3-5 days)
**Priority:** LOW - Nice to have

Files to create:
1. `cli/src/ui/journalPanel.ts` (narrative log)
2. `cli/src/ui/helpModal.ts` (help screen)
3. Enhanced error handling
4. Loading animations

## Testing Strategy

### Unit Tests
- Dice rolling functions
- Ability score calculations
- Point buy validation
- Spell selection logic

### Integration Tests
- Character creation end-to-end
- Combat flow
- Quest tracking
- State synchronization

### Manual Testing
- Play through full game loop
- Test all keybindings
- Test all wizard flows
- Test error scenarios

## Estimated Effort

| Phase | Features | Estimated Time | Priority |
|-------|----------|----------------|----------|
| Phase 1 | Character Creation | 7-10 days | CRITICAL |
| Phase 2 | Combat System | 5-7 days | CRITICAL |
| Phase 3 | Quest & Progression | 5-7 days | HIGH |
| Phase 4 | Inventory & Movement | 3-5 days | MEDIUM |
| Phase 5 | Polish | 3-5 days | LOW |
| **TOTAL** | **All Features** | **23-34 days** | |

## Success Criteria

✅ **Phase 1 Complete:**
- Players can create characters entirely in TUI
- All D&D 5e rules enforced
- Matches web UI options

✅ **Phase 2 Complete:**
- Players can engage in combat
- Turn-based actions work
- Combat state syncs with backend

✅ **Phase 3 Complete:**
- Players can see and track quests
- Players can level up
- XP and progression work

✅ **Phase 4 Complete:**
- Players can manage inventory
- Players can move with arrow keys
- Idle tasks work

✅ **Phase 5 Complete:**
- TUI has help system
- Error handling is robust
- User experience is polished

## Current Status

**Completed:**
- Authentication (--user flag)
- Character loading
- AI DM chat integration
- Basic dashboard layout
- Character stats display
- World map display

**In Progress:**
- Character creation wizard (started)

**Remaining:**
- Combat system
- Quest panel
- Level up system
- Spell selection
- Inventory management
- Movement system
- Idle tasks
- Polish features

**Overall Progress:** ~28% complete (8/28 major features)

## Next Steps

1. **Complete Character Creation Wizard** (current task)
   - Implement point buy system
   - Add skill selection
   - Add equipment selection
   - Integrate with backend API

2. **Implement Combat System** (next critical task)
   - Create combat modal overlay
   - Build action menu
   - Integrate with active events API
   - Test combat flow

3. **Add Quest Panel** (following task)
   - Create quest display UI
   - Fetch quests from API
   - Update progress tracking

Continue through phases 4-5 as time and resources permit.
