# TUI Feature Parity Plan

**Goal:** Ensure the TUI has all features (and planned features) of the Web UI

## Feature Comparison Matrix

| Feature | Web UI Status | TUI Status | Priority | Notes |
|---------|---------------|------------|----------|-------|
| **Authentication** |
| Login/Signup | ✅ Implemented | ❌ Missing | LOW | TUI should connect with existing session or prompt for credentials |
| OAuth (Supabase) | ✅ Implemented | ❌ Missing | LOW | Can use API key or session token |
| **Character Creation** |
| Character Creation Wizard | ✅ Implemented | ❌ Missing | HIGH | Full D&D 5e character creation flow |
| Race Selection | ✅ Implemented | ❌ Missing | HIGH | With racial bonuses |
| Class Selection | ✅ Implemented | ❌ Missing | HIGH | All 12 core classes |
| Subclass Selection | ✅ Implemented (Modal) | ❌ Missing | HIGH | Triggered at appropriate level |
| Ability Score Generation | ✅ Implemented | ❌ Missing | HIGH | Roll or point buy |
| Background Selection | ✅ Implemented | ❌ Missing | MEDIUM | Personality traits, ideals, etc. |
| Equipment Selection | ✅ Implemented | ❌ Missing | MEDIUM | Starting gear based on class |
| Spell Selection (for casters) | ✅ Implemented | ❌ Missing | HIGH | Full spell list with filtering |
| Character Portrait | ✅ Implemented (AI-generated) | ❌ Missing | LOW | Could show ASCII art or skip |
| **Dashboard/Main Interface** |
| Character Stats Panel | ✅ Implemented | ✅ Basic | MEDIUM | Need to add: skills, abilities, inventory |
| Interactive Map | ✅ Implemented (Phaser) | ✅ Basic | MEDIUM | TUI has ASCII art map |
| Map Zoom/Pan | ✅ Implemented | ❌ Missing | LOW | Arrow keys navigation |
| Fog of War | ✅ Implemented | ✅ Implemented | ✅ DONE | |
| **AI DM Chat** |
| Chat Interface | ✅ Implemented | ✅ Basic | HIGH | TUI has input box |
| Message History | ✅ Implemented | ✅ Basic | HIGH | Scrolling works |
| Streaming Responses | ✅ Implemented | ❌ Missing | HIGH | Backend integration needed |
| DM Response Parsing | ✅ Implemented | ❌ Missing | HIGH | Handle actions, state updates |
| Context-Aware Prompts | ✅ Implemented | ❌ Missing | MEDIUM | Send character state with messages |
| **Quest System** |
| Quest Panel | ✅ Implemented | ❌ Missing | HIGH | Show active/available quests |
| Quest Progress Tracking | ✅ Implemented | ❌ Missing | HIGH | Update quest objectives |
| Quest Completion | ✅ Implemented | ❌ Missing | HIGH | Rewards and XP |
| Radiant Quests (Layer 1) | ✅ Implemented | ❌ Missing | HIGH | Template-based quests |
| **Combat/Active Phase** |
| Active Phase Modal | ✅ Implemented | ❌ Missing | HIGH | Turn-based combat interface |
| Initiative Tracker | ✅ Implemented | ❌ Missing | HIGH | Show turn order |
| Combat Actions | ✅ Implemented | ❌ Missing | HIGH | Attack, Cast Spell, Use Item, etc. |
| Target Selection | ✅ Implemented | ❌ Missing | HIGH | Select enemies |
| Damage/Healing Display | ✅ Implemented | ❌ Missing | HIGH | Show HP changes |
| Death Saves | ✅ Backend | ❌ Missing | HIGH | Stabilization mechanic |
| **Character Progression** |
| Level Up Modal | ✅ Implemented | ❌ Missing | HIGH | HP, abilities, spells |
| XP Display | ✅ Implemented | ✅ Basic | MEDIUM | Show XP bar |
| Skill Improvements | ✅ Implemented | ❌ Missing | MEDIUM | ASI, feat selection |
| Spell Learning | ✅ Implemented | ❌ Missing | HIGH | New spells on level up |
| **Inventory & Equipment** |
| Inventory Display | ✅ Implemented | ✅ Basic | MEDIUM | Listed in character panel |
| Equipment Management | ✅ Implemented | ❌ Missing | MEDIUM | Equip/unequip items |
| Item Details | ✅ Implemented | ❌ Missing | LOW | Show stats, descriptions |
| Loot Collection | ✅ Implemented | ❌ Missing | MEDIUM | Add items from quests/combat |
| **Idle Tasks** |
| Idle Task Selection | ✅ Implemented | ❌ Missing | MEDIUM | Travel, Scout, etc. |
| Idle Task Progress | ✅ Implemented | ❌ Missing | MEDIUM | Show time remaining |
| Idle Task Completion | ✅ Implemented | ❌ Missing | MEDIUM | Rewards and narration |
| **World & Exploration** |
| Procedural World Generation | ✅ Implemented | ❌ Missing | MEDIUM | Generate on character creation |
| Biome Display | ✅ Implemented | ✅ Basic | MEDIUM | Show terrain types |
| POI (Points of Interest) | ✅ Implemented | ❌ Missing | MEDIUM | Towns, dungeons, etc. |
| Movement | ✅ Implemented | ❌ Missing | HIGH | Navigate via chat or keys |
| **Journal & History** |
| Journal Feed | ✅ Implemented | ❌ Missing | MEDIUM | Narrative log |
| Entry Types | ✅ Implemented | ❌ Missing | MEDIUM | Combat, exploration, quest, etc. |
| Journal Archive | ✅ Planned | ❌ Missing | LOW | View past entries |
| **Tension System** |
| Tension Badge | ✅ Implemented | ❌ Missing | LOW | Hidden threat indicator |
| Dynamic Encounters | ✅ Backend | ❌ Missing | MEDIUM | Trigger based on tension |
| **UI/UX Features** |
| Responsive Layout | ✅ Implemented | ✅ Implemented | ✅ DONE | 3-column layout |
| Keyboard Navigation | ✅ Implemented | ✅ Implemented | ✅ DONE | Tab, arrows, etc. |
| Loading States | ✅ Implemented | ⚠️ Partial | LOW | Show spinners |
| Error Handling | ✅ Implemented | ⚠️ Partial | MEDIUM | User-friendly messages |
| Help/Tutorial | ❌ Planned | ❌ Missing | LOW | Key bindings, commands |

## Priority Breakdown

### 🔴 CRITICAL (Must Have for MVP)
1. **AI DM Chat Integration** - Backend API calls for streaming responses
2. **Character Creation Wizard** - Full Session 0 flow in TUI
3. **Quest System Display** - Show and track quests
4. **Combat/Active Phase** - Turn-based combat interface
5. **Spell Selection** - For caster classes
6. **Level Up System** - Character progression

### 🟡 HIGH (Important for Full Experience)
1. **Movement System** - Navigate the world
2. **Inventory Management** - Equip/use items
3. **Subclass Selection** - Class specialization
4. **Idle Task System** - Background activities

### 🟢 MEDIUM (Nice to Have)
1. **Journal Panel** - View narrative history
2. **POI Display** - Show nearby locations
3. **Character Sheet Details** - Full stat display

### 🔵 LOW (Future Enhancements)
1. **Authentication** - Session management
2. **ASCII Art Portraits** - Visual flair
3. **Help System** - In-app documentation

## Implementation Plan

### Phase 1: Core Gameplay (Backend Integration)
- [ ] Connect chat to `/api/chat/dm` endpoint
- [ ] Implement streaming response handling
- [ ] Parse DM responses for state updates
- [ ] Handle character state synchronization

### Phase 2: Character Creation
- [ ] Create Session 0 wizard interface
- [ ] Implement race selection menu
- [ ] Implement class selection menu
- [ ] Implement ability score generation
- [ ] Implement spell selection for casters
- [ ] Save character to Supabase

### Phase 3: Quest & Combat Systems
- [ ] Add quest panel to layout
- [ ] Fetch and display active quests
- [ ] Implement combat modal/overlay
- [ ] Show initiative and turn order
- [ ] Implement combat actions (attack, spell, etc.)
- [ ] Handle HP/damage updates

### Phase 4: Character Progression
- [ ] Level up modal/dialog
- [ ] HP increase selection
- [ ] Ability score improvement
- [ ] New spell learning
- [ ] Subclass selection trigger

### Phase 5: World Interaction
- [ ] Implement movement via chat or keybinds
- [ ] Show nearby POIs
- [ ] Implement idle task selection
- [ ] Display task progress

### Phase 6: Polish & Enhancement
- [ ] Add journal panel
- [ ] Improve inventory display
- [ ] Add loading indicators
- [ ] Add help/tutorial screen
- [ ] Error handling and recovery

## File Structure Plan

```
cli/src/
├── index.ts                    # Entry point (existing)
├── api/
│   ├── client.ts               # API client (existing, needs enhancement)
│   ├── dmChat.ts               # NEW: DM chat API integration
│   ├── quests.ts               # NEW: Quest API calls
│   └── combat.ts               # NEW: Combat API calls
├── ui/
│   ├── layout.ts               # Layout manager (existing)
│   ├── theme.ts                # Color theme (existing)
│   ├── characterPanel.ts       # Character stats (existing, needs enhancement)
│   ├── mapPanel.ts             # World map (existing, needs enhancement)
│   ├── chatPanel.ts            # Chat interface (existing, needs enhancement)
│   ├── questPanel.ts           # NEW: Quest display
│   ├── combatModal.ts          # NEW: Combat interface
│   ├── levelUpModal.ts         # NEW: Level up dialog
│   ├── inventoryPanel.ts       # NEW: Inventory management
│   ├── journalPanel.ts         # NEW: Journal display
│   └── wizards/
│       ├── characterCreation.ts  # NEW: Session 0 wizard
│       ├── raceSelection.ts      # NEW: Race picker
│       ├── classSelection.ts     # NEW: Class picker
│       └── spellSelection.ts     # NEW: Spell picker
├── types/
│   └── index.ts                # Type definitions (existing, needs enhancement)
└── utils/
    ├── parser.ts               # NEW: Parse DM responses
    ├── formatter.ts            # NEW: Format text for terminal
    └── keyboard.ts             # NEW: Key binding helpers
```

## Testing Strategy

1. **Manual Testing**: Play through full character creation and gameplay loop
2. **Feature Checklist**: Verify each feature against web UI
3. **Integration Testing**: Ensure TUI → Backend → Database flow works
4. **Edge Cases**: Test error handling, disconnections, invalid input

## Success Criteria

✅ TUI has feature parity with web UI for all MVP features
✅ Users can create characters entirely through TUI
✅ Users can play the full game loop through TUI
✅ Chat interface is fully functional with AI DM
✅ Combat system works in turn-based mode
✅ Character progression (leveling, spells) works
✅ No regression in existing TUI features
