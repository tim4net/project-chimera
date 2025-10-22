# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Nuaibria is a semi-idle RPG powered by an AI Dungeon Master. The project uses an optimized AI architecture:
- **Gemini Flash (Primary)**: Fast, cost-effective cloud LLM for all real-time player interactions (~$2-5/month for 10-50 players)
- **Gemini Pro (Premium)**: Reserved for special moments (character onboarding, major story beats) when quality is critical
- **Local LLM (GTX 1080)**: Used ONLY for async background tasks (quest generation, POI descriptions) where 4-8s latency is acceptable

The game features a conversational web interface where players chat with "The Chronicler" (AI DM) to play. The project implements D&D 5e mechanics adapted for semi-idle gameplay.

## Architecture

### Database: Supabase Cloud
- The project uses **Supabase Cloud** (hosted PostgreSQL with RESTful APIs)
- Provides PostgreSQL database with built-in RESTful APIs and real-time capabilities
- Project URL: https://muhlitkerrjparpcuwmc.supabase.co
- Connection details stored in `.env` files (not committed to git)
- See `SUPABASE_CLOUD_CREDENTIALS.md` for full configuration details

### Key Components
1. **Backend Server**: Manages game logic, rules adjudication (5e mechanics), game state, and AI communication
2. **Database (Supabase Cloud)**: PostgreSQL with RESTful APIs, allowing direct interaction from web/Discord frontends
3. **Web Frontend**: Primary UI displaying procedurally generated map, character sheets, and game logs (React/Vite app)
4. **Discord Bot**: Secondary interface for notifications, narrative updates, and quick actions (planned)

### AI Architecture (Updated 2025-01-20)
- **Gemini Flash**: Handles ALL real-time chat (< 2s response time, $0.20-$1.00/month for 10-50 players)
- **Gemini Pro**: Reserved for special moments requiring highest quality (onboarding, major story beats)
- **Local LLM (GTX 1080)**: Background tasks only (quest templates, POI descriptions, journal summaries)
  - Not used for real-time chat due to 4-8s latency (breaks immersion)
- **Cost Tracking**: Built-in token usage monitoring and per-request cost calculation
- **Prompt Caching**: In-memory cache for system prompts and character sheets to reduce redundant token usage

## Development Commands

### Fresh Start Workflow

When starting fresh or fixing issues with the setup:

```bash
# 1. Clean up previous build artifacts
./clean_start.sh

# 2. Verify the setup
./verify_setup.sh

# 3. Run the orchestrator
./build_orchestrator.sh

# OR: Run in continuous self-healing mode
./run_continuous.sh
```

**Continuous Mode**: The orchestrator runs in an infinite loop, automatically retrying on failures and monitoring for new tasks. This is the recommended mode for autonomous, unattended development.

### Container Management
```bash
# Start frontend and backend containers
podman compose up -d

# Stop containers
podman compose down

# Check container status
podman compose ps

# View logs
podman compose logs -f

# Rebuild containers
podman compose build
```

### Infrastructure Scripts

**build_orchestrator.sh** - Dual-AI build automation (Gemini + Claude) (v17)
- **Gemini Integration**: Generates build plans from ARCHITECTURE_TASKS.md
- **Claude Error Recovery**: Analyzes failures and generates fixes automatically
- **4-Step TDD Workflow**: Define Tests → Implement → Test → Review (iterative)
- **Verbose Output**: Progress spinners, streaming output for long commands, detailed status
- **Self-Healing**: Auto-retries with fresh context on failures
- **State Tracking**: JSON-based task completion tracking with jq
- **Continuous Mode**: Designed to run in infinite loop without exits
- **Smart Parsing**: Filters Gemini output to extract only executable commands

**run_continuous.sh** - Wrapper for continuous autonomous build mode
- Runs orchestrator in infinite loop
- Monitors completion status
- Automatic retry after failures
- Designed for unattended operation

**verify_setup.sh** - Infrastructure verification script
- Checks project structure and required files
- Verifies Docker Compose registry configuration
- Validates environment variables
- Confirms Git repository status
- Validates orchestrator script syntax
- Checks Supabase container health

**clean_start.sh** - Cleanup script for fresh starts
- Stops all containers
- Removes backup files created by sed
- Resets state files (project_state.json, logs, etc.)
- Restores original docker-compose.yml from backup or git
- Prepares environment for clean orchestrator run

## Core Design Principles

### 1. Dual-Phase Gameplay
- **Idle Phase**: Abstract, single-roll resolution for background tasks (travel, crafting, minor encounters)
- **Active Phase**: Asynchronous turn-based tactical combat for major encounters

### 2. Layered Quest Generation
- **Layer 1 (Radiant Quests)**: Template-based, procedurally-filled quests using Local LLM
- **Layer 2 (Faction Quests)**: AI-generated multi-step quests responding to world state
- **Layer 3 (Story Arcs)**: Epic narratives generated by Gemini Pro during world creation

### 3. Multi-Vector Progression
- Experience & Leveling (5e XP system)
- Loot & Equipment (including AI-generated unique properties)
- Reputation (faction standing)
- Knowledge (crafting recipes, lore discoveries)

### 4. World Evolution (Epoch System)
- Major story arc completions trigger "Epoch Events"
- Gemini Pro generates historical records of player achievements
- World state changes permanently (new POIs, faction shifts, NPC changes)
- Creates dynamic, evolving narrative rather than static content

### 5. UI/UX Philosophy: Text-First, Map-Centric, Conversational
- **PRIMARY INTERFACE: Chat with The Chronicler (AI DM)**
  - The main dashboard MUST feature a conversational chat interface
  - Players interact with The Chronicler through natural language
  - Players describe what they want to do (e.g., "I travel north", "I search for quests", "I attack the goblin")
  - The Chronicler narrates outcomes and asks for clarifications
  - This is NOT a button-based action system - it's conversational AI gameplay
- Minimalist design prioritizing AI-generated narrative
- Central dashboard layout:
  - **Left:** Character stats panel (HP, XP, position, abilities)
  - **Center:** Interactive map showing biomes and player position
  - **Right:** Chat interface with The Chronicler (scrolling conversation history)
- Journal entries are created FROM the conversation (auto-logged narrative moments)
- Dedicated screens: Character Sheet, Journal Archive, Social (multiplayer), Active Phase overlay
- Inspired by classic MUDs (Multi-User Dungeons) and AI Dungeon

## MVP Scope

The current development focuses on the **Minimum Viable Product** with these constraints:
- **Solo player experience only** (multiplayer postponed)
- **✅ COMPLETE: Conversational AI DM interface** - Players chat with The Chronicler through a fully-functional chat UI
- Core gameplay loop: Chat with DM → AI narration → Player response → State updates
- Travel, Scout, and other idle tasks implemented
- Radiant quest system with AI-generated quests
- Web UI with 3-column layout: Character panel, Map, Chat with The Chronicler
- Character creation with spell selection integrated
- Gemini Flash for all real-time narration
- Full D&D 5e mechanics (combat, skills, leveling, loot)
- AI-powered journal entry detection

**Explicitly excluded from MVP**: Full multiplayer/party systems, portal system, faction/reputation, major NPCs, Discord bot, world epochs, advanced crafting.

### MVP Status: Core Features Complete ✅
The conversational chat interface is fully implemented (`frontend/src/components/ChatInterface.tsx`):
- ✅ Chat message input field with real-time response
- ✅ Conversation history display with message styling
- ✅ Integration with secure backend DM endpoint (`/api/chat/dm`)
- ✅ Action result display (dice rolls, state changes)
- ✅ Auto-generation of journal entries from significant moments (AI-powered significance detection)

## Cost Optimization Strategy

### Why This Architecture is Cost-Effective
- **Gemini Flash** is 40x cheaper than Gemini Pro per million tokens
- **Local LLM** handles batch tasks overnight (free, but not for real-time due to GTX 1080 latency)
- **Prompt Caching** reduces repeated context costs by 90%
- **Cost Tracking** logs every request's token usage and cost for monitoring

### Projected Costs (< $50/month budget)
- **10 players, 50 msgs/month:** $2-3/month
- **50 players, 50 msgs/month:** $5-8/month
- **100 players, 50 msgs/month:** $10-15/month
- **200 players, 50 msgs/month:** $20-30/month

**Scalability:** Can support 100-200 players within $50/month budget.

## Important Files

### Documentation
- `project.md`: Complete Architectural Decision Records (ADRs) documenting all design decisions
  - **ADR-015**: AI-Generated POI Content (Proposed - Post-MVP)
  - **ADR-016**: AI-Powered Journal Significance Detection (Active - Implemented)
- `GEMINI.md`: Project overview and development conventions (lighter version)
- `CLAUDE.md`: This file - guidance for Claude Code agents
- `ARCHITECTURE_TASKS.md`: Complete MVP task breakdown with IDs and dependencies (763 lines)
- `TASK_WORKFLOW.md`: 4-step TDD workflow for AI-driven development
- `FIXES.md`: Documentation of orchestrator bug fixes

### Core Services
- `backend/src/services/narratorLLM.ts`: AI narration service (Gemini Flash for real-time)
- `backend/src/services/gemini.ts`: Gemini API wrapper with prompt caching
- `backend/src/services/backgroundTasks.ts`: Async batch processing using Local LLM
- `backend/src/services/ruleEngine.ts`: D&D 5e mechanics and state management
- `backend/src/services/intentDetector.ts`: Natural language → structured actions
- `backend/src/routes/dmChatSecure.ts`: Main chat endpoint with cost tracking

### Scripts
- `build_orchestrator.sh`: AI-driven build automation with Gemini integration (v16)
- `verify_setup.sh`: Infrastructure verification script for quality assurance
- `clean_start.sh`: Cleanup script to reset environment to fresh state

### State and Logs
- `project_state.json`: Enhanced JSON state tracking with task completion arrays
- `bug_reports.txt`: Logs command failures and errors for debugging
- `build.log`: Complete execution log of orchestrator runs
- `prompts/`: Directory for AI prompts (created by orchestrator)
- `test_results/`: Test specifications, implementations, and verification logs

### Configuration
- `docker-compose.yml`: Container configuration for frontend and backend services
- `.env`: Root environment variables (Supabase Cloud credentials, Gemini API key)
- `frontend/.env`: Frontend-specific environment variables (Vite prefixed)
- `SUPABASE_CLOUD_CREDENTIALS.md`: Supabase Cloud project details and credentials (⚠️ contains secrets, should not be committed publicly)

## Git Workflow

- Repository: `nuaibria` (user: tim4net)
- The build orchestrator automatically commits and pushes changes
- Uses conventional commit messages describing executed plans

## Technology Stack

- **Container Runtime**: Podman (Docker alternative)
- **Database**: PostgreSQL via Supabase
- **AI Models**: Gemini Pro (cloud) + Local LLM (planned)
- **Frontend**: React + TypeScript (Vite build system)
- **Backend**: Node.js/Express + TypeScript

## Coding Standards

### TypeScript-Only Policy
**⚠️ CRITICAL: This codebase is TypeScript-only ⚠️**

- **NO JavaScript files** (`.js`/`.jsx`) allowed in `frontend/src/` or `backend/src/`
- All source code must be TypeScript (`.ts`/`.tsx`)
- Legacy JavaScript files were migrated on 2025-10-18 and backed up to `/legacy-backup`

**For AI Agents:**
- ❌ **NEVER** reference or edit files in `/legacy-backup/`
- ❌ **NEVER** suggest importing from `.js` files
- ❌ **NEVER** create new `.js` files
- ✅ **ALWAYS** use TypeScript files from `frontend/src/` or `backend/src/`
- ✅ **ALWAYS** add proper TypeScript types to new code

See `/legacy-backup/README.md` for migration history.

## Development Notes

- Supabase Cloud instance is located at: https://muhlitkerrjparpcuwmc.supabase.co
- The project is containerized and portable via Docker/Podman
- Cost optimization is a key concern: minimize expensive Gemini Pro API calls
- Supabase provides direct database access from frontends, reducing backend API complexity
- Database migrations are managed through Supabase's SQL Editor or CLI
- Use 'podman compose' not 'podman-compose'
- source code files should not exceed 300 lines. If they are approaching that size, split them into smaller modular files. If you work on existing files that are larger than 400 lines, break them into smaller files as you edit them
- make sure to restart containers using the restart containers skill when it's necessary to use a fix or feature that you are implementing
- NEVER COPY ANYTHING FROM .env TO OTHER FILES!