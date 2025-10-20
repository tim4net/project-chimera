# Nuaibria - Improvement Tasks

This document contains a systematic breakdown of tasks to complete the MVP and make the app fully functional.

---

## Phase 1: Database Foundation (CRITICAL - Nothing works without this)

### [x] Task 1: Create database migrations for characters table
**Priority**: CRITICAL
**Estimated Time**: 15 minutes
**Dependencies**: None
**Description**: Create SQL migration to define the `characters` table schema in Supabase with all D&D 5e stats.

**Details**:
- Table: `public.characters`
- Columns: id, user_id, name, race, class, level, ability scores (STR/DEX/CON/INT/WIS/CHA), hp_current, hp_max, xp, position_x, position_y, campaign_seed, idle_task, idle_task_started_at
- Indexes: user_id, position (x, y)
- RLS policies: Users can only view/modify their own characters
- File location: `supabase/migrations/001_create_characters_table.sql`

**Acceptance Criteria**:
- Migration file created with proper SQL syntax
- Includes CREATE TABLE, indexes, and RLS policies
- Follows D&D 5e character structure from ARCHITECTURE_TASKS.md

---

### [x] Task 2: Create database migrations for items table
**Priority**: CRITICAL
**Estimated Time**: 10 minutes
**Dependencies**: Task 1
**Description**: Create SQL migration for character inventory and equipment storage.

**Details**:
- Table: `public.items`
- Columns: id, character_id (FK), name, type, description, properties (JSONB), quantity, equipped, created_at
- Indexes: character_id
- RLS policies: Users can manage items belonging to their characters
- Cascade delete when character is deleted
- File location: `supabase/migrations/002_create_items_table.sql`

**Acceptance Criteria**:
- Migration file created with foreign key to characters
- JSONB field for flexible item properties
- RLS policies check character ownership

---

### [x] Task 3: Create database migrations for journal_entries table
**Priority**: CRITICAL
**Estimated Time**: 10 minutes
**Dependencies**: Task 1
**Description**: Create SQL migration for game narrative events and history log.

**Details**:
- Table: `public.journal_entries`
- Columns: id, character_id (FK), entry_type (narrative/combat/quest/system), content (TEXT), metadata (JSONB), created_at
- Indexes: character_id, created_at DESC
- RLS policies: Users can view journal entries for their characters
- File location: `supabase/migrations/003_create_journal_entries_table.sql`

**Acceptance Criteria**:
- Migration file created with proper indexes
- Supports different entry types for filtering
- Metadata field for structured data (XP gained, loot, etc.)

---

### [x] Task 4: Run migrations and verify tables exist in Supabase
**Priority**: CRITICAL
**Estimated Time**: 10 minutes
**Dependencies**: Tasks 1-3
**Description**: Execute all migration files against the Supabase database and verify schema.

**Details**:
- Use Supabase CLI or direct psql connection to run migrations
- Verify tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public'`
- Test RLS policies are active
- Verify foreign key constraints work
- Test inserting sample data

**Acceptance Criteria**:
- All 3 tables exist in database
- RLS is enabled on all tables
- Can insert and query sample records
- Foreign keys enforce referential integrity

---

## Phase 2: Backend Implementation

### [ ] Task 5: Update active.js to implement actual encounter logic
**Priority**: HIGH
**Estimated Time**: 30 minutes
**Dependencies**: Task 4
**Description**: Replace placeholder responses with real encounter generation and resolution logic.

**Details**:
- Current file: `backend/src/routes/active.js`
- Implement GET /:id/active-event - Check database for pending active event
- Implement POST /:id/active-event/choose - Process player choice, call combat.js, update character state
- Implement GET /:id/active-event/history - Query journal_entries for past encounters
- Integrate with: dice.js, combat.js, experience.js, loot.js
- Store results in journal_entries table

**Acceptance Criteria**:
- No more placeholder responses
- Encounters stored/retrieved from database
- Combat resolution uses dice.js and combat.js
- XP and loot awarded properly
- Journal entries created for each encounter
- Tests pass for all 3 endpoints

---

### [x] Task 6: Complete world.js procedural map generation
**Priority**: MEDIUM
**Estimated Time**: 45 minutes
**Dependencies**: Task 4
**Description**: Implement actual procedural generation for world map tiles and Points of Interest.

**Details**:
- Current file: `backend/src/routes/world.js`
- Implement seeded random generation using campaign_seed
- Generate biomes (forest, plains, mountains, water)
- Generate POIs (settlements, dungeons, ruins)
- Implement fog of war (only return explored tiles)
- Cache generated chunks in database for consistency
- Use existing `backend/src/game/map.js` utilities

**Acceptance Criteria**:
- Deterministic generation (same seed = same world)
- Returns tiles around character position
- POIs generated based on biome type
- Fog of war respects character's exploration history
- Reasonable performance (<500ms for map query)

---

### [x] Task 7: Implement loot generation system in loot.js
**Priority**: MEDIUM
**Estimated Time**: 30 minutes
**Dependencies**: Task 4
**Description**: Create loot tables and weighted random item generation.

**Details**:
- Current file: `backend/src/game/loot.js` (currently empty)
- Create loot tables by rarity (common, uncommon, rare)
- Weighted random selection based on enemy CR
- Gold/currency generation
- Basic weapons, armor, consumables (no magic items for MVP)
- Function: `generateLoot(enemyType, challengeRating)`
- Returns array of items to insert into items table

**Acceptance Criteria**:
- Loot tables defined for 5-10 enemy types
- Weighted randomization produces varied results
- Returns properly formatted items ready for database insertion
- No magic items (MVP constraint)
- Unit tests for loot generation

---

### [x] Task 8: Complete experience.js leveling system
**Priority**: MEDIUM
**Estimated Time**: 30 minutes
**Dependencies**: Task 4
**Description**: Implement full XP tracking and automatic level-up system following D&D 5e rules.

**Details**:
- Current file: `backend/src/game/experience.js` (minimal implementation)
- XP thresholds per level (D&D 5e PHB table)
- Function: `checkLevelUp(currentXP, currentLevel)` - returns new level or null
- Function: `calculateLevelUpBenefits(characterClass, newLevel)` - HP increase, proficiency bonus, spell slots
- Auto-update character stats in database when leveling up
- Create journal entry for level-up event

**Acceptance Criteria**:
- XP thresholds match D&D 5e (300 for L2, 900 for L3, etc.)
- HP increases by class hit die + CON modifier
- Proficiency bonus increases at correct levels
- Journal entry created with level-up notification
- Unit tests for all XP calculations

---

## Phase 3: Authentication & Frontend Integration

### [x] Task 9: Wire up LoginPage to use AuthProvider and Supabase
**Priority**: HIGH
**Estimated Time**: 20 minutes
**Dependencies**: None
**Description**: Connect LoginPage form to actual Supabase authentication.

**Details**:
- Current file: `frontend/src/pages/LoginPage.jsx`
- Import and use `useAuth()` hook from AuthProvider
- Call `signIn({ email, password })` on form submit
- Handle loading state during auth
- Display error messages for failed login
- Redirect to `/` (dashboard) on successful login
- Handle Supabase auth errors gracefully

**Acceptance Criteria**:
- Form submits to Supabase auth
- Loading indicator shows during authentication
- Errors displayed to user (invalid credentials, network issues)
- Successful login redirects to dashboard
- Auth state persists across page refreshes

---

### [x] Task 10: Wire up SignupPage to use AuthProvider and Supabase
**Priority**: HIGH
**Estimated Time**: 20 minutes
**Dependencies**: None
**Description**: Connect SignupPage form to Supabase user registration.

**Details**:
- Current file: `frontend/src/pages/SignupPage.jsx`
- Import and use `useAuth()` hook from AuthProvider
- Call `signUp({ email, password })` on form submit
- Create user profile in `public.profiles` table after signup
- Handle loading state and errors
- Redirect to `/create-character` after successful signup
- Email validation

**Acceptance Criteria**:
- Form creates new Supabase auth user
- Profile record created in public.profiles table
- Loading and error states handled
- Redirects to character creation after signup
- Prevents duplicate usernames

---

### [x] Task 11: Connect DashboardPage to fetch real data from APIs
**Priority**: HIGH
**Estimated Time**: 30 minutes
**Dependencies**: Tasks 4, 9, 10
**Description**: Make DashboardPage fetch and display actual character data instead of hardcoded values.

**Details**:
- Current file: `frontend/src/pages/DashboardPage.jsx`
- Fetch user's active character from `/api/characters`
- Pass character data to child components (Map, JournalFeed, IdleTaskForm)
- Poll for active events every 5 seconds
- Show EncounterModal when active event exists
- Handle loading states
- Handle "no character" state (redirect to character creation)

**Acceptance Criteria**:
- Fetches character data on mount
- Shows loading spinner while fetching
- Redirects to /create-character if no characters exist
- Updates in real-time when events occur
- Passes correct props to all child components

---

### [x] Task 12: Connect JournalFeed to fetch from database
**Priority**: MEDIUM
**Estimated Time**: 25 minutes
**Dependencies**: Task 4, 11
**Description**: Make JournalFeed component fetch real journal entries from Supabase.

**Details**:
- Current file: `frontend/src/components/JournalFeed/JournalFeed.jsx`
- Fetch entries from Supabase: `supabase.from('journal_entries').select('*').eq('character_id', characterId).order('created_at', { ascending: false })`
- Implement real-time subscription for new entries
- Infinite scroll / pagination for older entries
- Display entry_type with different styling (combat=red, narrative=blue, etc.)
- Auto-scroll to newest entry when added

**Acceptance Criteria**:
- Fetches real journal entries from database
- Real-time updates when new entries added
- Pagination works for >50 entries
- Entry types visually distinguished
- Auto-scrolls to new content

---

### [ ] Task 13: Connect IdleTaskForm to submit tasks via API
**Priority**: MEDIUM
**Estimated Time**: 20 minutes
**Dependencies**: Task 11
**Description**: Make IdleTaskForm actually submit tasks to the backend API.

**Details**:
- Current file: `frontend/src/components/IdleTaskForm/IdleTaskForm.jsx`
- Change task types to: Travel (N/S/E/W), Scout
- Submit to: `POST /api/characters/:id/idle-task`
- Show task in progress with countdown timer
- Disable form while task is active
- Poll task status: `GET /api/characters/:id/idle-task/status`
- Show task completion notification

**Acceptance Criteria**:
- Form submits task to backend API
- Task types match MVP scope (Travel, Scout only)
- UI shows active task status
- Countdown timer based on task duration
- Form disabled while task in progress
- Notification on task completion

---

### [x] Task 14: Connect Map component to display real world data
**Priority**: MEDIUM
**Estimated Time**: 35 minutes
**Dependencies**: Task 6, 11
**Description**: Connect Map component to fetch and display procedurally generated world tiles.

**Details**:
- Current file: `frontend/src/components/Map/Map.jsx`
- Fetch tiles from: `GET /api/world/:seed/map?x=<char_x>&y=<char_y>&radius=10`
- Display character position marker
- Show fog of war for unexplored tiles
- Fetch POIs: `GET /api/world/:seed/poi?x=<char_x>&y=<char_y>&radius=10`
- Display POI markers on map
- Pan/zoom functionality already exists
- Color tiles by biome type

**Acceptance Criteria**:
- Map displays procedurally generated tiles
- Character position marked clearly
- Fog of war hides unexplored areas
- POIs shown with icons/labels
- Map updates when character moves
- Pan and zoom work smoothly

---

### [ ] Task 15: Integrate CharacterSheet component into dashboard
**Priority**: LOW
**Estimated Time**: 25 minutes
**Dependencies**: Task 11
**Description**: Add CharacterSheet component to dashboard and populate with real data.

**Details**:
- Files: `frontend/src/components/CharacterSheet/*.tsx`
- Add CharacterSheet to DashboardPage (possibly as modal or side panel)
- Pass character data as props
- Display: ability scores, modifiers, HP, XP, level
- Display inventory from items table
- Display equipped items
- Calculate derived stats (AC, proficiency, etc.)

**Acceptance Criteria**:
- CharacterSheet accessible from dashboard
- All stats display correctly from character data
- Inventory shown from database
- Equipped items indicated
- Derived stats calculated accurately
- Responsive layout

---

## Phase 4: AI Integration

### [ ] Task 16: Test and fix Gemini Pro integration
**Priority**: MEDIUM
**Estimated Time**: 20 minutes
**Dependencies**: Task 1
**Description**: Verify Gemini API key works and onboarding scene generation functions correctly.

**Details**:
- Current file: `backend/src/services/gemini.js`
- Verify GEMINI_API_KEY in .env is valid
- Test `generateOnboardingScene()` with sample character
- Add retry logic for rate limits
- Add fallback text if API fails
- Log API usage for cost tracking
- Test integration in character creation flow

**Acceptance Criteria**:
- Gemini API responds successfully
- Onboarding scenes are coherent and relevant
- Rate limit handling implemented
- Fallback prevents app crashes
- API key errors logged clearly
- Cost per request tracked

---

### [ ] Task 17: Test and fix Local LLM integration
**Priority**: MEDIUM
**Estimated Time**: 30 minutes
**Dependencies**: None
**Description**: Debug the 500 errors from local LLM and ensure narration generation works.

**Details**:
- Current file: `backend/src/services/localLLM.js`
- Current error: AxiosError 500 when calling http://localhost:1234
- Verify LLM server is actually running at configured hostname
- Update .env LOCAL_LLM_HOSTNAMES if needed
- Test different model names (update LOCAL_LLM_MODEL)
- Verify API format matches (OpenAI-compatible API)
- Add better error handling and fallback text
- Test travel narration, scout results, minor encounters

**Acceptance Criteria**:
- Local LLM responds without 500 errors
- Narration text is coherent and relevant
- Handles LLM unavailability gracefully
- Template fallback works when LLM fails
- Multiple LLM endpoints supported (failover)
- Tests pass without requiring live LLM

---

## Phase 5: User Experience & Polish

### [x] Task 18: Add basic CSS styling to improve UI appearance
**Priority**: MEDIUM
**Estimated Time**: 45 minutes
**Dependencies**: None
**Description**: Add CSS to make the app look less like raw HTML and more like a game interface.

**Details**:
- Option 1: Reinstall Tailwind CSS properly (fix previous config issues)
- Option 2: Write custom CSS file with game-themed styling
- Style all pages: Login, Signup, Dashboard, Character Creation
- Make buttons look like buttons (not default browser style)
- Add padding, margins, backgrounds
- Style map with border, legend
- Style journal feed as scrollable parchment-like area
- Dark theme or fantasy-themed color palette

**Acceptance Criteria**:
- All pages have consistent styling
- Forms are visually appealing and easy to use
- Dashboard layout is intuitive
- Responsive design (works on different screen sizes)
- Colors and fonts match fantasy/RPG theme
- No unstyled browser default elements

---

### [ ] Task 19: Fix failing active.test.js
**Priority**: LOW
**Estimated Time**: 15 minutes
**Dependencies**: Task 5
**Description**: Debug and fix the failing active.test.js test suite.

**Details**:
- Current file: `backend/tests/active.test.js`
- Update test expectations to match new implementation
- Ensure Supabase mock works correctly with active.js
- Test all 3 endpoints: GET active-event, POST choose, GET history
- Add integration test for full encounter flow
- Mock database responses properly

**Acceptance Criteria**:
- All active.test.js tests pass
- Test coverage >80% for active.js
- Tests validate actual logic, not just status codes
- Mock data matches real database schema

---

### [x] Task 20: Add protected route guards for authenticated pages
**Priority**: MEDIUM
**Estimated Time**: 25 minutes
**Dependencies**: Tasks 9, 10
**Description**: Prevent unauthenticated users from accessing dashboard and character pages.

**Details**:
- Create ProtectedRoute wrapper component
- Check `user` from AuthContext
- Redirect to /login if not authenticated
- Protect routes: /, /create-character, /profile
- Allow public access: /login, /signup
- Handle loading state while checking auth
- Persist auth state across refreshes

**Acceptance Criteria**:
- Dashboard redirects to login if not authenticated
- Login/signup pages redirect to dashboard if already authenticated
- Auth state persists across page refreshes
- Loading spinner shows while checking auth
- No flash of protected content before redirect

---

## Remaining Optional Tasks (Sprint 4+)

### [ ] Create profiles table migration
**Priority**: LOW
**Description**: Extend Supabase auth.users with custom profiles table for usernames, settings, etc.

---

### [ ] Implement idle task background processing
**Priority**: MEDIUM
**Description**: Create cron job or queue system to automatically resolve idle tasks when duration expires.

---

### [ ] Add navigation menu to all pages
**Priority**: LOW
**Description**: Header with links to Dashboard, Profile, Logout across all authenticated pages.

---

### [ ] Implement character creation wizard fully
**Priority**: HIGH
**Description**: Complete multi-step wizard with race selection, class selection, ability score assignment (point-buy), and summary.

---

### [ ] Add comprehensive error boundaries
**Priority**: LOW
**Description**: React error boundaries to catch and display component errors gracefully.

---

### [ ] Set up Docker Compose for production
**Priority**: LOW
**Description**: Create production docker-compose.yml with optimized builds and environment configs.

---

## Getting Started

**Recommended Order**:
1. Start with Tasks 1-4 (Database migrations) - foundation for everything
2. Then Tasks 5-8 (Backend implementation) - make APIs functional
3. Then Tasks 9-15 (Frontend integration) - connect UI to backend
4. Finally Tasks 16-20 (Polish and testing) - improve quality

**To begin, run**: Start with Task 1 - Create the characters table migration.
