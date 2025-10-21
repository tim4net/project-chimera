# Claude Self-Healing DM System

## Overview

The `@claudecode` command triggers a **true self-healing system** that automatically:
1. Reviews The Chronicler's last response using Claude API
2. Identifies which source files need fixing
3. **Generates and applies code fixes automatically**
4. **Hot-reloads the changes** (no manual rebuild needed)
5. **Git commits the improvements**
6. Responds to the player: "Fixed! This won't happen again."

## How It Works

### Player Experience

```
You: I use my lute to fly
The Chronicler: ✓ You soar into the clouds on musical magic!

You: @claudecode that shouldn't work
Claude Review:

**Issues Found:**
- The Chronicler allowed flight without proper magical abilities
- A Level 1 Bard doesn't have access to flight spells or items

**Original Response:**
"You soar into the clouds on musical magic!"

**Corrected Response:**
"You pluck the strings of your lute, humming an experimental melody.
The notes ring beautifully, but your feet remain firmly on the ground.
Without magical flight capabilities, you cannot defy gravity. What else
would you like to try?"

**Explanation:**
D&D 5e requires specific spells (Fly, Levitate) or magical items for
flight. Bards gain Fly at level 5. The corrected response acknowledges
the attempt while enforcing physics.
```

## Setup

### 1. Get Anthropic API Key

Sign up at https://console.anthropic.com and create an API key.

### 2. Add to `.env`

```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 3. Rebuild Containers

```bash
podman compose build backend
podman compose restart backend
```

## Architecture

### Flow

1. Player types: `@claudecode [optional feedback]`
2. Intent Detector recognizes `REVIEW_DM_RESPONSE` action
3. Review Executor fetches last 2 messages from `dm_conversations`
4. Claude API called with:
   - Player's original message
   - DM's response
   - Action results from rule engine
   - Character sheet context
   - Player's optional feedback
5. Claude analyzes for:
   - D&D 5e rule compliance
   - Physics violations
   - Narrative consistency
   - Character ability restrictions
6. Returns: Issues + Corrected Response + Explanation
7. Displayed to player showing both original and corrected versions

### Cost Optimization

- Uses Claude Sonnet 4 (good balance of quality and cost)
- ~2000 token responses (~$0.01 per review)
- Only triggered manually by player with `@claudecode`
- No automatic monitoring (keeps costs minimal)

### Components

- **Intent Detector** (`intentDetector.ts`): Detects `@claudecode` pattern
- **Review Executor** (`reviewExecutor.ts`): Orchestrates the review process
- **Claude Review Service** (`claudeReview.ts`): Calls Anthropic API
- **Action Type** (`types/actions.ts`): `ReviewDMResponseAction`

## Security

- Fails gracefully if API key missing
- Stores action results in conversation metadata for context
- No state changes (review is read-only)
- Player must be authenticated to use

## Future Enhancements

- Optional automatic review mode (review all responses)
- Review analytics/dashboard
- Training data collection for Local LLM improvements
- Multi-turn review (review last N interactions)
