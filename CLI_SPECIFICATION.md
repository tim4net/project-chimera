# Nuaibria - CLI Specification

**Purpose**: Terminal-based interface for gameplay and automated testing
**Status**: Planned for future implementation
**Designed by**: Gemini-2.5-Pro (Planning specialist)

---

## OVERVIEW

A command-line interface that provides:
1. **Interactive Terminal Gameplay** - Play D&D in your terminal
2. **Automated Testing** - Programmatic E2E tests for all classes
3. **CI/CD Integration** - Run tests in pipelines
4. **Developer Tools** - Quick character creation, system verification

---

## ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    CHIMERA CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Commands:                                                  │
│  ├─ play          Interactive gameplay                     │
│  ├─ create        Character creation                       │
│  ├─ test          Single class test                        │
│  ├─ test-all      All classes test                         │
│  └─ verify        Health check                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Libraries:                                                 │
│  ├─ api.ts        HTTP client (calls backend)             │
│  ├─ display.ts    Terminal UI rendering                   │
│  ├─ session.ts    State management                        │
│  └─ prompts.ts    User input handling                     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Backend API (existing):                                    │
│  ├─ POST /api/characters                                   │
│  ├─ POST /api/chat/dm                                      │
│  ├─ GET  /api/characters/:id                               │
│  └─ All game logic reused                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## COMMANDS

### `chimera play`
**Interactive terminal gameplay**

```bash
$ chimera play

Welcome to Nuaibria!

[Character Selection]
> Load existing character or create new? [load/new]: new

[Character Creation via Terminal]
> Name: Thorin
> Race: Dwarf
> Class: Fighter
> [... point-buy, skills, etc ...]

[Game Loop]
┌────────────────────────────────────────────┐
│ The Chronicler:                            │
│                                            │
│ Welcome, Thorin! You stand at (500, 500). │
│ What do you do?                            │
└────────────────────────────────────────────┘

> I attack the goblin

┌────────────────────────────────────────────┐
│ Dice Rolls:                                │
│ ├─ Attack: 1d20+5 = 18 (HIT!)            │
│ └─ Damage: 1d8+3 = 9                      │
└────────────────────────────────────────────┘

┌────────────────────────────────────────────┐
│ The Chronicler:                            │
│                                            │
│ Your blade strikes true! The goblin falls.│
│ You find 12 gold + short sword.           │
└────────────────────────────────────────────┘

> continue...
```

**Features:**
- Full game playable in terminal
- Beautiful boxed UI with colors
- Dice rolls displayed in tables
- Quest/inventory/stats visible
- Session save/load

---

### `chimera create <class> [options]`
**Create character (interactive or automated)**

**Interactive Mode:**
```bash
$ chimera create Bard

Creating Bard character...

Name: Lyra
Race: [list of races]
> Elf

Ability Scores (Point-Buy):
STR [8-15]: 10
DEX [8-15]: 14
...

Session 0 Interview:
> [Guided through cantrip/spell selection]

Character created: Lyra (Level 1 Elf Bard)
Character ID: abc-123-def
```

**Automated Mode:**
```bash
$ chimera create Bard --automated --name "TestBard"

Creating Bard with defaults...
✓ Character created
✓ Session 0 completed (auto-responses)
✓ Level 1 reached
✓ Spells assigned: Vicious Mockery, Mage Hand, Healing Word, ...

Character ID: xyz-789
```

**Options:**
- `--automated` - Use default choices
- `--name <name>` - Character name
- `--race <race>` - Specify race
- `--json` - Output as JSON for scripting

---

### `chimera test <class>`
**Automated test for specific class**

```bash
$ chimera test Bard

Testing Bard Session 0...

[1/7] Creating Bard character
  ✓ Character created (Level 0)
  ✓ tutorial_state: interview_welcome

[2/7] Testing welcome state
  ✓ DM presents Session 0 welcome
  ✓ No skip option mentioned

[3/7] Testing class introduction
  ✓ Bard features explained

[4/7] Testing cantrip selection
  ✓ Database queried (10 cantrips found)
  ✓ Prompt contains: Vicious Mockery, Mage Hand, ...
  ✓ Says "EXACTLY 2 cantrips"
  ✓ No hallucinated spells (Vine, etc.)

[5/7] Selecting cantrips
  Input: "Vicious Mockery and Mage Hand"
  ✓ Validation passed
  ✓ State advanced to needs_spells

[6/7] Testing spell selection
  ✓ Database queried (17 spells found)
  ✓ Prompt contains: Healing Word, Charm Person, ...
  ✓ Says "EXACTLY 4 spells"
  ✓ No cantrips mixed in

[7/7] Completing Session 0
  ✓ Equipment selected
  ✓ Backstory optional
  ✓ Character review shown
  ✓ Entered world
  ✓ Level 0 → 1
  ✓ Spell slots initialized: {'1': 2}

BARD TEST: PASSED ✓

Character ID: test-bard-123 (auto-deleted)
```

**Exit Codes:**
- 0 = Success
- 1 = Failure
- 2 = Partial (warnings)

---

### `chimera test-all`
**Test all 12 classes**

```bash
$ chimera test-all

Testing all D&D classes through Session 0...

[1/12] Barbarian
  ✓ Non-spellcaster flow (4 states)
  ✓ Skips spell selection
  ✓ PASSED

[2/12] Bard
  ✓ Full spellcaster flow (7 states)
  ✓ 2 cantrips, 4 spells
  ✓ PASSED

[3/12] Cleric
  ✓ Full spellcaster + subclass at L1
  ✓ 3 cantrips, prepared spells
  ✓ PASSED

... [continues for all classes] ...

[12/12] Wizard
  ✓ Full spellcaster flow
  ✓ 3 cantrips, 6 spells
  ✓ PASSED

========================================
SUMMARY: 12/12 PASSED
All classes working correctly!
========================================

Total time: 5m 23s
```

**Options:**
- `--parallel` - Run tests concurrently
- `--verbose` - Show all details
- `--json` - JSON output for CI/CD

---

### `chimera verify`
**System health check**

```bash
$ chimera verify

Verifying Nuaibria systems...

Backend Health:
  ✓ Server responding (http://localhost:3001)
  ✓ Database connected
  ✓ Migrations applied

API Endpoints:
  ✓ POST /api/characters
  ✓ POST /api/chat/dm
  ✓ GET  /api/tension/:id
  ✓ GET  /api/quests

Database Tables:
  ✓ characters (3 rows)
  ✓ spells (27 rows)
  ✓ enemies (10 rows)
  ✓ quest_templates (6 rows)
  ✓ loot_tables (13 rows)

Game Systems:
  ✓ Intent detection working
  ✓ Rule Engine operational
  ✓ Spell validator functional
  ✓ Quest generator ready
  ✓ Loot generator ready

All systems operational!
```

---

## FILE STRUCTURE

```
cli/
├── package.json              # CLI dependencies
├── tsconfig.json             # TypeScript config
├── index.ts                  # Main entry point
│
├── commands/                 # CLI commands
│   ├── play.ts              # Interactive gameplay
│   ├── create.ts            # Character creation
│   ├── test.ts              # Single class test
│   ├── test-all.ts          # All classes test
│   └── verify.ts            # Health check
│
├── lib/                      # Shared libraries
│   ├── api.ts               # Backend API client
│   ├── display.ts           # Terminal UI rendering
│   ├── session.ts           # State management
│   ├── prompts.ts           # User input helpers
│   ├── logger.ts            # Logging utilities
│   └── config.ts            # Configuration loader
│
├── tests/                    # Test utilities
│   ├── all-classes.ts       # Class test definitions
│   ├── assertions.ts        # Custom assertions
│   ├── fixtures.ts          # Test data
│   └── cleanup.ts           # Test cleanup helpers
│
└── types/                    # CLI-specific types
    ├── commands.ts
    └── session.ts
```

---

## DEPENDENCIES

**Core:**
- `commander` - CLI framework
- `axios` - HTTP client
- `dotenv` - Environment config

**UI:**
- `chalk` - Terminal colors
- `boxen` - Bordered boxes
- `cli-table3` - ASCII tables
- `ora` - Spinners
- `inquirer` - Interactive prompts

**Utils:**
- `fs-extra` - File operations
- `yaml` - Config files

**Development:**
- `typescript`
- `ts-node`
- `@types/*`

---

## USAGE EXAMPLES

### Automated Testing (CI/CD):
```bash
# In GitHub Actions / Jenkins
npm install -g @chimera/cli
chimera test-all --json > results.json
exit $?  # Pass/fail based on test results
```

### Developer Workflow:
```bash
# Quick character test
chimera create Wizard --automated

# Play in terminal
chimera play

# Verify after code changes
chimera verify
```

### Programmatic Usage:
```javascript
const { exec } = require('child_process');

exec('chimera test Bard --json', (err, stdout) => {
  const result = JSON.parse(stdout);
  if (result.passed) {
    console.log('Bard test passed!');
  }
});
```

---

## INTERACTIVE MODE FEATURES

### Game Loop:
```
┌─────────────────────────────────────┐
│ Thorin Ironforge                    │
│ Dwarf Fighter - Level 3             │
│ HP: 28/32  XP: 1150  Gold: 127      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Active Quests (2):                  │
│ ├─ Clear Goblin Cave  ████░░ 4/5   │
│ └─ Deliver Medicine   ██░░░░ 1/3   │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ The Chronicler:                     │
│                                     │
│ The goblin camp lies ahead. Three   │
│ guards patrol the entrance. What    │
│ do you do?                          │
└─────────────────────────────────────┘

> I sneak past the guards

[Dice Roll]
Stealth Check: 1d20+4 = 16 vs DC 13 (SUCCESS)

┌─────────────────────────────────────┐
│ The Chronicler:                     │
│                                     │
│ You slip past unnoticed, your       │
│ footsteps silent on the stone...    │
└─────────────────────────────────────┘

Commands: [a]ttack [i]nventory [q]uests [s]tats [h]elp [quit]

>
```

---

## AUTOMATED TEST MODE

### Test Configuration (YAML):
```yaml
# cli/tests/bard-test.yaml

class: Bard
name: TestBard_Automated
race: Human

session0:
  welcome: "ready"
  class_intro: "continue"
  cantrips: ["Vicious Mockery", "Mage Hand"]
  spells:
    - "Healing Word"
    - "Charm Person"
    - "Dissonant Whispers"
    - "Faerie Fire"
  equipment: "option 1"
  backstory: "skip"
  enter_world: "I'm ready"

assertions:
  level: 1
  cantrip_count: 2
  spell_count: 4
  spell_slots: {"1": 2}
  position: [500, 500]
```

### Running Test:
```bash
$ chimera test Bard --config tests/bard-test.yaml

Running: Bard Session 0 Test

✓ Character created
✓ Session 0 started
✓ Cantrips selected and validated
✓ Spells selected and validated
✓ Equipment chosen
✓ World entered
✓ All assertions passed

PASSED in 12.3s
```

---

## API CLIENT STRUCTURE

```typescript
// cli/lib/api.ts

export class ChimeraAPI {
  private baseURL: string;
  private authToken: string | null;

  constructor(baseURL: string = 'http://localhost:3001') {
    this.baseURL = baseURL;
  }

  async authenticate(email: string, password: string): Promise<string> {
    // Call auth endpoint, get token
  }

  async createCharacter(data: CharacterData): Promise<Character> {
    // POST /api/characters
  }

  async chatWithDM(characterId: string, message: string): Promise<DMResponse> {
    // POST /api/chat/dm
  }

  async getCharacter(characterId: string): Promise<Character> {
    // GET /api/characters/:id
  }

  async deleteCharacter(characterId: string): Promise<void> {
    // DELETE /api/characters/:id (for test cleanup)
  }
}
```

---

## TERMINAL UI HELPERS

```typescript
// cli/lib/display.ts

export function renderDMMessage(message: string, actionResults?: any[]) {
  // Boxed message with colors

  if (actionResults) {
    // Display dice rolls in table
    renderDiceRolls(actionResults);
  }

  console.log(boxen(message, { ... }));
}

export function renderCharacterSheet(character: Character) {
  // ASCII table with stats
  const table = new Table({
    head: ['Stat', 'Value'],
    colWidths: [20, 20]
  });

  table.push(
    ['Name', character.name],
    ['Class', `${character.class} ${character.level}`],
    ['HP', `${character.hp_current}/${character.hp_max}`],
    // ...
  );

  console.log(table.toString());
}

export function renderQuestList(quests: Quest[]) {
  // Progress bars for quests
  quests.forEach(q => {
    const percent = (q.current_progress / q.target_quantity) * 100;
    const bar = progressBar(percent, 20);
    console.log(`${q.title} ${bar} ${q.current_progress}/${q.target_quantity}`);
  });
}

function progressBar(percent: number, width: number): string {
  const filled = Math.floor(width * percent / 100);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}
```

---

## AUTOMATED TEST ASSERTIONS

```typescript
// cli/tests/assertions.ts

export function assertCharacterComplete(character: Character, className: string) {
  // Verify character has all required features

  assert(character.level === 1, 'Character should be Level 1');
  assert(character.tutorial_state === null, 'Tutorial should be complete');

  if (isSpellcaster(className)) {
    const reqs = SPELL_REQUIREMENTS[className];
    assert(character.selected_cantrips.length === reqs.cantrips,
      `Should have ${reqs.cantrips} cantrips, got ${character.selected_cantrips.length}`);
    assert(character.selected_spells.length === reqs.spells['1'],
      `Should have ${reqs.spells['1']} spells, got ${character.selected_spells.length}`);
    assert(character.spell_slots['1'] > 0, 'Should have spell slots');
  }

  assert(character.position, 'Should have position set');

  console.log('✓ All assertions passed');
}

export function assertSpellListValid(response: DMResponse, className: string) {
  // Verify DM response contains real spells, not hallucinations

  const dbSpells = await getExpectedSpells(className);
  const mentioned = dbSpells.filter(spell =>
    response.response.includes(spell.name)
  );

  assert(mentioned.length >= 3,
    'Response should mention at least 3 real spells from database');

  assert(!response.response.includes('Vine'),
    'Should not contain hallucinated spells');

  console.log('✓ Spell list is valid from database');
}
```

---

## SESSION PERSISTENCE

```typescript
// cli/lib/session.ts

export class GameSession {
  private character: Character | null;
  private conversationHistory: Message[];
  private sessionFile: string;

  constructor(sessionFile: string = '~/.chimera-session.json') {
    this.sessionFile = sessionFile;
  }

  save(): void {
    fs.writeFileSync(this.sessionFile, JSON.stringify({
      character: this.character,
      conversationHistory: this.conversationHistory,
      timestamp: new Date().toISOString()
    }));
  }

  load(): boolean {
    if (fs.existsSync(this.sessionFile)) {
      const data = JSON.parse(fs.readFileSync(this.sessionFile, 'utf-8'));
      this.character = data.character;
      this.conversationHistory = data.conversationHistory;
      return true;
    }
    return false;
  }

  clear(): void {
    if (fs.existsSync(this.sessionFile)) {
      fs.unlinkSync(this.sessionFile);
    }
  }
}
```

---

## CI/CD INTEGRATION

### GitHub Actions Example:
```yaml
# .github/workflows/test-all-classes.yml

name: Test All Classes

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Start Backend
        run: |
          docker-compose up -d

      - name: Install CLI
        run: |
          cd cli
          npm install

      - name: Run All Class Tests
        run: |
          npx chimera test-all --json > results.json

      - name: Verify Results
        run: |
          node -e "
            const r = require('./results.json');
            if (r.failed > 0) process.exit(1);
          "
```

---

## EXAMPLE: BARD TEST WORKFLOW

```typescript
// Automated Bard test

async function testBard() {
  const api = new ChimeraAPI();

  // 1. Auth
  await api.authenticate('test@chimera.local', 'testpass');

  // 2. Create Bard
  const character = await api.createCharacter({
    name: 'AutoBard',
    race: 'Human',
    class: 'Bard',
    ability_scores: { STR: 8, DEX: 14, CON: 12, INT: 10, WIS: 13, CHA: 15 }
  });

  // 3. Session 0: Welcome
  let response = await api.chatWithDM(character.id, 'ready');
  assertContains(response.response, 'Session 0');

  // 4. Session 0: Class Intro
  response = await api.chatWithDM(character.id, 'continue');
  assertContains(response.response, 'Bard');

  // 5. Cantrip Selection
  response = await api.chatWithDM(character.id, 'Vicious Mockery and Mage Hand');
  assertSpellListValid(response);
  assert(response.stateChanges.some(sc => sc.field === 'selected_cantrips'));

  // 6. Spell Selection
  response = await api.chatWithDM(character.id,
    'Healing Word, Charm Person, Dissonant Whispers, Faerie Fire');
  assert(response.stateChanges.some(sc => sc.field === 'selected_spells'));

  // 7. Complete
  response = await api.chatWithDM(character.id, "I'm ready to enter the world");
  assert(response.stateChanges.some(sc => sc.field === 'level' && sc.newValue === 1));

  // 8. Verify final state
  const finalChar = await api.getCharacter(character.id);
  assertCharacterComplete(finalChar, 'Bard');

  // 9. Cleanup
  await api.deleteCharacter(character.id);

  return { passed: true, class: 'Bard' };
}
```

---

## BENEFITS

**For Development:**
- Quick testing without browser
- Automated regression tests
- CI/CD integration

**For Users:**
- Terminal-based gameplay (SSH-friendly)
- Lightweight (no browser needed)
- Scriptable adventures

**For Quality:**
- Comprehensive E2E tests
- All classes verified
- Consistent testing

---

## IMPLEMENTATION PHASES

**Phase 1**: Basic CLI framework and API client
**Phase 2**: Automated testing commands
**Phase 3**: Interactive gameplay mode
**Phase 4**: Beautiful terminal UI
**Phase 5**: Session persistence and advanced features

**Total Effort**: 8-10 hours over multiple sessions

---

## FUTURE ENHANCEMENTS

- **Multiplayer CLI**: Multiple terminals, one game
- **Replay Mode**: Record and replay sessions
- **Script Mode**: Run pre-written adventure scripts
- **Performance Testing**: Load testing via CLI
- **Admin Tools**: Database management, character editing

---

## NEXT STEPS

**When ready to implement:**

1. Create `cli/` directory
2. Set up package.json with dependencies
3. Build Phase 1 (framework + API client)
4. Build Phase 2 (automated tests)
5. Test with Bard
6. Expand to all classes
7. Add interactive mode

**Prioritize**: Automated testing first (most valuable for QA)

---

**This spec is ready for implementation in next session!**
