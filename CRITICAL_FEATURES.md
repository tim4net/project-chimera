# CRITICAL MISSING FEATURES - READ THIS FIRST

## 🚨 PRIMARY GAMEPLAY INTERFACE IS MISSING 🚨

### The Problem
The current DashboardPage has placeholder action buttons, but **this is NOT how the game is meant to be played**.

### The Correct Design
**Players interact with the game through CONVERSATIONAL CHAT with The Chronicler (AI Dungeon Master).**

This is an **AI Dungeon**-style game, NOT a button-based RPG.

### What's Missing from Dashboard

#### Current (WRONG):
```
Dashboard with:
- Character stats panel ✓
- Map display ✓
- Action buttons: "Travel", "Scout", "Rest" ✗ (this is a placeholder)
- Journal feed showing entries ✓
```

#### Correct Design (MUST BUILD):
```
Dashboard with:
- Character stats panel (left column) ✓
- Map display (center column) ✓
- CHAT INTERFACE with The Chronicler (right column) ✗ MISSING!
  - Message input field
  - Conversation history
  - Player messages (right-aligned, gold)
  - DM responses (left-aligned, purple)
  - Streaming/typing indicator
```

## How Gameplay Works

### Player Types:
```
"I want to travel north through the forest"
```

### The Chronicler Responds:
```
"You push through dense undergrowth for an hour. The canopy blocks most light,
and you hear strange whispers in the shadows. You arrive at coordinates (500, 505).
A ruined tower looms ahead. What do you do?"
```

### System Auto-Updates:
- Character position changed to (500, 505)
- Journal entry created: "Traveled north, discovered ruined tower"
- Map updates to show new position

### Player Continues:
```
"I approach the tower cautiously and look for an entrance"
```

## Backend Requirements

### New API Endpoint Needed:
`POST /api/chat/dm`

**Request:**
```json
{
  "characterId": "uuid",
  "message": "I travel north",
  "conversationHistory": [
    {"role": "player", "content": "..."},
    {"role": "dm", "content": "..."}
  ]
}
```

**Response:**
```json
{
  "response": "DM narration text...",
  "stateChanges": {
    "position": {"x": 505, "y": 502},
    "hp": -5,
    "xp": 50
  },
  "journalEntry": {
    "type": "exploration",
    "content": "Brief summary for journal"
  },
  "triggerActivePhase": false
}
```

### LLM Integration
- Use **Local LLM** for routine DM responses (default)
- Use **Gemini Pro** for major story moments (rare, high-cost)
- DM prompt must include:
  - Full character sheet (stats, abilities, inventory)
  - Current position and nearby map tiles
  - Recent conversation history (last 10-20 messages)
  - Active quests
  - Recent journal entries for context

## Database Schema Needed

### `dm_conversations` table:
```sql
CREATE TABLE dm_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  character_id UUID REFERENCES characters(id),
  role TEXT CHECK (role IN ('player', 'dm')),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Frontend Components Needed

1. **ChatInterface.tsx** - Main chat component
   - Message list (scrollable)
   - Input field with send button
   - Auto-scroll to latest
   - Loading state while DM responds

2. **ChatMessage.tsx** - Individual message bubble
   - Different styling for player vs DM
   - Timestamp
   - Markdown support for DM narration

3. **Update DashboardPage.tsx**:
   - Replace action buttons panel with ChatInterface
   - Keep 3-column layout: Stats | Map | Chat

## Tell Your Coding Agents:

**"Build a conversational chat interface with The Chronicler AI DM as the primary gameplay mechanic on the dashboard. Players type what they want to do, and the AI narrates outcomes. This is like AI Dungeon or a text-based MUD, not a button-based RPG. See ARCHITECTURE_TASKS.md task UI-CHAT-001 for full requirements."**
