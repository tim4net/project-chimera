# Project Chimera: MVP Architecture & Development Tasks

This document provides a structured breakdown of the MVP implementation tasks for Project Chimera, designed to be consumed by AI agents (Gemini) to generate executable build commands.

## Task Status Tracking

Each task has:
- **ID**: Unique identifier (e.g., INFRA-001)
- **Status**: `pending`, `in_progress`, `completed`
- **Dependencies**: Tasks that must be completed first
- **Category**: Area of the system (Infrastructure, Backend, Frontend, AI, etc.)

---

## PHASE 1: INFRASTRUCTURE SETUP

### INFRA-001: Project Structure Setup
**Status**: pending
**Dependencies**: None
**Description**: Create the basic project directory structure for backend and frontend

**Deliverables**:
```
/srv/project-chimera/
├── backend/           # Node.js/Python backend server
│   ├── src/
│   ├── tests/
│   └── package.json (or requirements.txt)
├── frontend/          # React web application
│   ├── src/
│   ├── public/
│   └── package.json
├── shared/            # Shared types and utilities
└── docs/              # Additional documentation
```

**Implementation Notes**:
- Backend: Choose Node.js (Express) OR Python (Flask) based on team preference
- Frontend: React with TypeScript
- Use pnpm workspaces or similar for monorepo management

---

### INFRA-002: Backend Technology Stack Setup
**Status**: pending
**Dependencies**: INFRA-001
**Description**: Initialize backend with framework, ORM, and core dependencies

**For Node.js/Express**:
- Express.js for HTTP server
- Prisma or TypeORM for database ORM
- dotenv for environment configuration
- cors, helmet for security
- @supabase/supabase-js for Supabase client

**For Python/Flask**:
- Flask web framework
- SQLAlchemy for ORM
- python-dotenv for environment
- flask-cors for CORS
- supabase-py for Supabase client

**Configuration Files Needed**:
- `.env.example` with all required environment variables
- Database connection to local Supabase instance
- Basic server entry point (server.js or app.py)

---

### INFRA-003: Frontend Technology Stack Setup
**Status**: pending
**Dependencies**: INFRA-001
**Description**: Initialize React frontend with build tools and core libraries

**Required Dependencies**:
- React 18+ with TypeScript
- Vite or Create React App for build tooling
- React Router for navigation
- @supabase/supabase-js for Supabase client
- CSS framework (Tailwind CSS or similar)
- State management (React Context or Zustand)

**Configuration Files**:
- tsconfig.json with strict mode
- vite.config.ts or equivalent
- .env.example for frontend env vars
- Basic App.tsx entry point

---

##  PHASE 2: DATABASE SCHEMA

### DB-001: Core Database Tables - Authentication
**Status**: pending
**Dependencies**: INFRA-002
**Description**: Define Supabase database schema for user authentication (using Supabase Auth)

**Tables** (via Supabase migrations):
```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
```

---

### DB-002: Core Database Tables - Characters
**Status**: pending
**Dependencies**: DB-001
**Description**: Define schema for D&D 5e character data

**Tables**:
```sql
CREATE TABLE public.characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) NOT NULL,
  name TEXT NOT NULL,
  race TEXT NOT NULL,
  class TEXT NOT NULL,
  level INTEGER DEFAULT 1,

  -- Ability Scores (5e)
  strength INTEGER NOT NULL,
  dexterity INTEGER NOT NULL,
  constitution INTEGER NOT NULL,
  intelligence INTEGER NOT NULL,
  wisdom INTEGER NOT NULL,
  charisma INTEGER NOT NULL,

  -- Core Stats
  hp_current INTEGER NOT NULL,
  hp_max INTEGER NOT NULL,
  xp INTEGER DEFAULT 0,

  -- Position in world
  position_x INTEGER NOT NULL,
  position_y INTEGER NOT NULL,
  campaign_seed TEXT NOT NULL,

  -- Status
  idle_task TEXT,
  idle_task_started_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_characters_user_id ON public.characters(user_id);
CREATE INDEX idx_characters_position ON public.characters(position_x, position_y);

-- RLS Policies
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters" ON public.characters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create characters" ON public.characters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own characters" ON public.characters
  FOR UPDATE USING (auth.uid() = user_id);
```

---

### DB-003: Core Database Tables - Inventory
**Status**: pending
**Dependencies**: DB-002
**Description**: Define schema for character inventory and equipment

**Tables**:
```sql
CREATE TABLE public.items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- weapon, armor, consumable, etc.
  description TEXT,
  properties JSONB, -- flexible storage for item stats
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_items_character ON public.items(character_id);

-- RLS
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own character items" ON public.items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = items.character_id
      AND characters.user_id = auth.uid()
    )
  );
```

---

### DB-004: Game State Tables - Journal and Events
**Status**: pending
**Dependencies**: DB-002
**Description**: Tables to store narrative events and game history

**Tables**:
```sql
CREATE TABLE public.journal_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  character_id UUID REFERENCES public.characters(id) ON DELETE CASCADE,
  entry_type TEXT NOT NULL, -- narrative, combat, quest, system
  content TEXT NOT NULL,
  metadata JSONB, -- additional structured data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_journal_character ON public.journal_entries(character_id);
CREATE INDEX idx_journal_created_at ON public.journal_entries(created_at DESC);

-- RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own journal" ON public.journal_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.characters
      WHERE characters.id = journal_entries.character_id
      AND characters.user_id = auth.uid()
    )
  );
```

---

## PHASE 3: BACKEND API

### BE-001: Authentication API Endpoints
**Status**: pending
**Dependencies**: INFRA-002, DB-001
**Description**: Implement REST API endpoints for authentication

**Endpoints**:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login existing user
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user profile

**Implementation**:
- Use Supabase Auth for actual authentication
- Backend validates tokens and provides user context
- Implement middleware for protected routes

---

### BE-002: Character Management API
**Status**: pending
**Dependencies**: BE-001, DB-002
**Description**: CRUD operations for characters

**Endpoints**:
- `GET /api/characters` - List user's characters
- `POST /api/characters` - Create new character
- `GET /api/characters/:id` - Get character details
- `PATCH /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

**Business Logic**:
- Validate 5e rules (point-buy for ability scores)
- Generate starting equipment
- Set initial position on procedural map
- Create first journal entry with Gemini Pro (onboarding scene)

---

### BE-003: Idle Phase Task API
**Status**: pending
**Dependencies**: BE-002
**Description**: Endpoints for setting and resolving idle phase tasks

**Endpoints**:
- `POST /api/characters/:id/idle-task` - Set idle task (travel, scout)
- `GET /api/characters/:id/idle-task/status` - Check task status
- `POST /api/characters/:id/idle-task/resolve` - Manually resolve task

**Implementation**:
- Background job system (cron or queue) to process idle tasks
- Call local LLM for narrative generation
- Roll dice for skill checks
- Update character position/state
- Create journal entries
- Trigger Active Phase events based on rolls

---

### BE-004: Active Phase Events API
**Status**: pending
**Dependencies**: BE-003
**Description**: Handle active phase encounters and choices

**Endpoints**:
- `GET /api/characters/:id/active-event` - Get current active event
- `POST /api/characters/:id/active-event/choose` - Make choice in event
- `GET /api/characters/:id/active-event/history` - Past active events

**Implementation**:
- Generate choice matrix (3-5 options)
- Process choice and call AI for outcome
- Award XP, loot, update state
- Return to idle phase

---

### BE-005: Map and World Generation API
**Status**: pending
**Dependencies**: BE-002
**Description**: Procedural map generation for campaign

**Endpoints**:
- `GET /api/world/:seed/map` - Get map tiles around position
- `GET /api/world/:seed/poi` - Get Points of Interest near position

**Implementation**:
- Procedural generation using campaign seed
- Fog of War - only return explored tiles
- Biomes, settlements, dungeons
- Cache generated regions in database

---

## PHASE 4: FRONTEND COMPONENTS

### FE-001: Authentication UI
**Status**: pending
**Dependencies**: INFRA-003, BE-001
**Description**: Login, signup, and profile pages

**Components**:
- `LoginPage.tsx` - Login form
- `SignupPage.tsx` - Registration form
- `ProfilePage.tsx` - User profile display
- `AuthProvider.tsx` - React context for auth state

**Features**:
- Form validation
- Error handling
- Redirect after auth
- Persist session with Supabase

---

### FE-002: Character Creation Wizard
**Status**: pending
**Dependencies**: FE-001, BE-002
**Description**: Step-by-step character creation flow

**Components**:
- `CharacterCreationWizard.tsx` - Multi-step form container
- `RaceSelection.tsx` - Choose race
- `ClassSelection.tsx` - Choose class
- `AbilityScoreAssignment.tsx` - Point-buy system
- `CharacterSummary.tsx` - Final review

**Features**:
- Visual progress indicator
- 5e-compliant rules enforcement
- Call backend to create character
- Display Gemini Pro generated opening scene

---

### FE-003: Main Dashboard - Map View
**Status**: pending
**Dependencies**: FE-002, BE-005
**Description**: Central game interface with interactive map

**Components**:
- `Dashboard.tsx` - Main layout
- `GameMap.tsx` - Canvas or SVG-based map
- `MapTile.tsx` - Individual map tiles
- `CharacterMarker.tsx` - Player position
- `FogOfWar.tsx` - Overlay for unexplored areas

**Features**:
- Render procedurally generated map
- Show character position
- Display Points of Interest
- Fog of War visualization
- Pan/zoom controls

---

### FE-004: Journal Feed Component
**Status**: pending
**Dependencies**: FE-003, DB-004
**Description**: Scrollable feed of narrative events

**Components**:
- `JournalFeed.tsx` - Container with auto-scroll
- `JournalEntry.tsx` - Single entry display
- `JournalFilters.tsx` - Filter by type (optional)

**Features**:
- Real-time updates via Supabase subscriptions
- Infinite scroll for history
- Categorize by entry type
- Timestamp display

---

### FE-005: Idle Phase Task UI
**Status**: pending
**Dependencies**: FE-003, BE-003
**Description**: Interface for setting idle tasks

**Components**:
- `IdleTaskPanel.tsx` - Task selection UI
- `TaskButton.tsx` - Travel, Scout buttons
- `TaskStatus.tsx` - Progress indicator

**Features**:
- Set idle task (travel direction, scout)
- Show task in progress
- Display estimated completion time
- Auto-update when task completes

---

### FE-006: Active Phase Modal
**Status**: pending
**Dependencies**: FE-004, BE-004
**Description**: Modal overlay for active encounters

**Components**:
- `ActivePhaseModal.tsx` - Full-screen modal
- `EventNarrative.tsx` - AI-generated story text
- `ChoiceMatrix.tsx` - Display 3-5 choice buttons
- `EventOutcome.tsx` - Results of choice

**Features**:
- Non-dismissible modal when event active
- Large, readable text for narrative
- Clear choice buttons
- Smooth transitions
- Display rewards (XP, loot)

---

### FE-007: Character Sheet Component
**Status**: pending
**Dependencies**: FE-003, BE-002
**Description**: Detailed character stats display

**Components**:
- `CharacterSheet.tsx` - Main sheet container
- `StatsPanel.tsx` - Ability scores and modifiers
- `InventoryPanel.tsx` - Items and equipment
- `SpellsPanel.tsx` - For caster classes (MVP: basic)
- `ProgressionPanel.tsx` - XP and level

**Features**:
- Tab-based organization
- Real-time stat updates
- Drag-and-drop equipment (optional)
- Calculated modifiers

---

## PHASE 5: AI INTEGRATION

### AI-001: Local LLM Integration
**Status**: pending
**Dependencies**: BE-003
**Description**: Set up local LLM for narration (Ollama or similar)

**Requirements**:
- Install and configure Ollama or LM Studio
- Choose appropriate model (Mistral 7B, Llama 2, etc.)
- Create prompt templates for:
  - Travel narration
  - Scout results
  - Minor encounters
  - Item descriptions

**Implementation**:
- Backend service to call local LLM
- Streaming responses for real-time feel
- Fallback to template-based generation if LLM unavailable

---

### AI-002: Gemini Pro Integration - Onboarding
**Status**: pending
**Dependencies**: BE-002, AI-001
**Description**: One-time Gemini Pro call for character creation

**Implementation**:
- API key configuration
- Prompt template with character details (race, class, background)
- Generate unique 2-3 paragraph opening scene
- Store in journal as first entry
- Error handling and retry logic

---

### AI-003: AI Prompt Engineering
**Status**: pending
**Dependencies**: AI-001, AI-002
**Description**: Refine prompts for consistent, quality output

**Deliverables**:
- Prompt library in `/backend/prompts/`
- Templates for each narrative type
- System prompts for tone and style
- Example few-shot prompts
- Testing and iteration on outputs

---

## PHASE 6: GAME MECHANICS

### GM-001: 5e Dice Rolling System
**Status**: pending
**Dependencies**: BE-002
**Description**: Implement D&D 5e dice mechanics

**Features**:
- Dice notation parser (1d20, 2d6+3, etc.)
- Advantage/disadvantage
- Saving throws
- Skill checks with proficiency
- Attack rolls and damage

**Implementation**:
- Utility library in `/shared/dice.ts`
- Deterministic RNG with seed for fairness
- Logging all rolls to database

---

### GM-002: Combat System - Abstracted (Idle Phase)
**Status**: pending
**Dependencies**: GM-001, BE-003
**Description**: Single-roll combat for idle phase encounters

**Algorithm**:
1. Calculate party Combat Power Rating
2. Compare to enemy CR
3. Roll with modifiers
4. Determine outcome (victory, defeat, escape)
5. Apply HP loss, XP gain, loot

**Implementation**:
- Combat calculator function
- Enemy templates (goblin, wolf, bandit)
- Loot tables based on enemy type

---

### GM-003: Leveling and Progression
**Status**: pending
**Dependencies**: GM-001, BE-002
**Description**: XP and level-up system

**Features**:
- XP thresholds per level (5e PHB)
- Automatic level-up triggers
- HP increase (class hit die + CON)
- Proficiency bonus increases
- New spell slots for casters

**Implementation**:
- Level-up service in backend
- Notification to frontend
- Update character stats

---

### GM-004: Basic Loot Generation
**Status**: pending
**Dependencies**: GM-002, DB-003
**Description**: Generate random loot from encounters

**Features**:
- Loot tables (common, uncommon, rare)
- Gold and currency
- Basic weapons and armor (no magic items in MVP)
- Consumables (potions)

**Implementation**:
- Weighted random selection
- Add to character inventory
- Display in journal

---

## PHASE 7: DEPLOYMENT & TESTING

### TEST-001: Unit Tests - Backend
**Status**: pending
**Dependencies**: BE-001, BE-002, BE-003, BE-004
**Description**: Unit tests for core backend logic

**Coverage**:
- Authentication middleware
- Character CRUD operations
- Dice rolling mechanics
- Combat calculations
- Task resolution logic

**Tools**: Jest, Pytest, or appropriate test framework

---

### TEST-002: Unit Tests - Frontend
**Status**: pending
**Dependencies**: FE-001, FE-002, FE-003
**Description**: Component and integration tests

**Coverage**:
- Authentication flows
- Character creation wizard
- Map rendering
- Journal updates

**Tools**: React Testing Library, Jest

---

### DEPLOY-001: Development Environment Setup
**Status**: pending
**Dependencies**: INFRA-002, INFRA-003
**Description**: Local development workflow

**Features**:
- Docker Compose for all services
- Hot reload for frontend and backend
- Database migrations automation
- Seed data for testing
- Environment variable management

---

### DEPLOY-002: Production Build Configuration
**Status**: pending
**Dependencies**: TEST-001, TEST-002
**Description**: Prepare for production deployment

**Features**:
- Frontend production build (minified, optimized)
- Backend transpilation if needed
- Environment-specific configs
- Health check endpoints
- Logging and monitoring setup

---

## TASK EXECUTION RULES

### Dependency Resolution
- Tasks can be executed OUT OF ORDER
- A task is READY when ALL dependencies are complete
- Multiple tasks may be ready simultaneously - choose by priority
- Non-essential tasks should NOT block essential ones

### Priority Matrix
1. **Critical Path**: INFRA → DB → BE → FE (main features)
2. **Parallel Work**: Tests can be written alongside implementation
3. **Nice-to-Have**: Documentation, polish, optional features

### Example Scenarios

**Scenario 1**: After INFRA-002 completes
- Ready: INFRA-003 (Frontend stack) - CAN START IMMEDIATELY
- Ready: DB-001 (Auth tables) - CAN START IMMEDIATELY
- Blocked: BE-001 (needs DB-001)
→ Agent should pick DB-001 (higher priority) OR INFRA-003 (parallel work)

**Scenario 2**: DB schema tasks
- DB-001, DB-002, DB-003 have linear dependencies
- BUT: Can work on INFRA-003 (frontend) while waiting
- Don't block on non-critical tasks!

## TASK DEPENDENCY GRAPH

```
INFRA-001
  ├─> INFRA-002
  │     ├─> DB-001
  │     │     ├─> DB-002
  │     │     │     ├─> DB-003
  │     │     │     ├─> DB-004
  │     │     │     ├─> BE-002
  │     │     │     │     ├─> BE-003
  │     │     │     │     │     ├─> BE-004
  │     │     │     │     │     └─> AI-001
  │     │     │     │     │           ├─> AI-002
  │     │     │     │     │           └─> AI-003
  │     │     │     │     ├─> BE-005
  │     │     │     │     └─> GM-001
  │     │     │     │           ├─> GM-002
  │     │     │     │           ├─> GM-003
  │     │     │     │           └─> GM-004
  │     │     │     └─> FE-002
  │     │     └─> BE-001
  │     │           └─> FE-001
  │     │                 └─> FE-002
  │     └─> AI-001
  └─> INFRA-003
        └─> FE-001
              ├─> FE-002
              │     └─> FE-003
              │           ├─> FE-004
              │           ├─> FE-005
              │           └─> FE-007
              ├─> FE-004
              └─> FE-006
```

---

## IMPLEMENTATION PRIORITY

### Sprint 1: Foundation
1. INFRA-001, INFRA-002, INFRA-003
2. DB-001, DB-002
3. BE-001, FE-001

### Sprint 2: Core Game Loop
4. DB-003, DB-004
5. BE-002, FE-002
6. GM-001, GM-002

### Sprint 3: Idle Phase
7. BE-003, FE-003, FE-004, FE-005
8. AI-001, AI-003
9. BE-005

### Sprint 4: Active Phase
10. BE-004, FE-006
11. GM-003, GM-004
12. AI-002

### Sprint 5: Polish & Testing
13. FE-007
14. TEST-001, TEST-002
15. DEPLOY-001, DEPLOY-002

---

## NOTES FOR AI AGENTS

When generating shell commands:
1. **Start with task dependencies** - Check state file for completed prerequisites
2. **Generate idempotent commands** - Safe to run multiple times
3. **Include error handling** - Check if files/directories exist before creating
4. **Follow project conventions** - Use established naming patterns
5. **Commit incrementally** - Each completed task gets a commit
6. **Update state file** - Mark tasks as completed using jq

Example state tracking:
```json
{
  "supabase_setup_complete": true,
  "backend_server_initialized": true,
  "tasks_completed": [
    "INFRA-001",
    "INFRA-002"
  ],
  "tasks_in_progress": [
    "DB-001"
  ],
  "current_sprint": 1
}
```
