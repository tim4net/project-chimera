# Quest System Analysis - Root Cause of Confusion & Duplication

## Executive Summary

**Problem:** Player was offered a "Goblin Cave quest" (200 XP, 50 gold) by a goblin NPC, then a merchant offered a "raiders quest" (400 XP, 100 gold). When asked about the goblin quest, the narrator confirmed both exist separately, causing confusion.

**Root Cause:** The quest system has a **fundamental disconnect** between:
1. **What gets stored in the database** (actual quests)
2. **What the narrator says** (LLM improvisation with limited context)

The LLM narrator can invent quest offers that don't match the database, leading to phantom quests and confusion.

---

## How The Quest System Works (Current Implementation)

### 1. Quest Generation Flow

```
dmChatSecure.ts (Line 388-399)
  ↓
maybeOfferQuest(character)
  ↓ 30% random chance if player has < 3 active quests
generateRadiantQuest(character)
  ↓
1. Select random template from quest_templates table (6 templates exist)
2. Fill template with context (currently hardcoded: "goblin", "wolf_pelt", etc.)
3. INSERT into character_quests table (status = 'active', auto-accepted)
  ↓
Quest stored in database BEFORE narrative is generated
```

### 2. Narrative Generation Flow

```
dmChatSecure.ts (Line 426-451)
  ↓
generateNarrative(character, history, message, actionResult, questOfferData)
  ↓
narratorLLM.ts builds prompt with:
  - Character sheet (HP, gold, equipment)
  - Quest context from getQuestContext() ← CRITICAL: Only shows EXISTING active quests
  - Quest offer data (if one was generated) ← Tells LLM to present NEW quest
  - Action result (what player did)
  - Conversation history
  ↓
LLM generates narrative response
```

### 3. Quest Context Provided to LLM

**From `/srv/nuaibria/backend/src/services/questIntegration.ts` (Lines 21-42):**

```typescript
export async function getQuestContext(character: CharacterRecord): Promise<string> {
  const activeQuests = await getActiveQuests(character.id);

  if (activeQuests.length === 0) {
    return 'No active quests.';
  }

  let context = 'ACTIVE QUESTS:\n';

  activeQuests.forEach((quest, index) => {
    context += `\n${index + 1}. ${quest.title}\n`;
    context += `   Description: ${quest.description}\n`;
    context += `   Progress: ${quest.current_progress}/${quest.target_quantity}\n`;
    context += `   Reward: ${quest.xp_reward} XP, ${quest.gold_reward} gold\n`;
  });

  context += '\nYou can reference these quests in your narration. ';
  return context;
}
```

### 4. Quest Offering Prompt

**From `/srv/nuaibria/backend/src/services/questIntegration.ts` (Lines 71-89):**

```typescript
export function buildQuestOfferPrompt(quest: CharacterQuest): string {
  return `
⭐ OFFER THIS QUEST TO THE PLAYER:

Title: "${quest.title}"
Description: ${quest.description}
Objective: ${quest.objective_type === 'collect_items' ? 'Collect' : ...} ${quest.target_quantity} ${quest.objective_target || 'targets'}
Rewards: ${quest.xp_reward} XP, ${quest.gold_reward} gold

INSTRUCTIONS:
- Introduce this quest naturally in your narrative
- Have an NPC offer it, or present it as an opportunity
- Make it feel organic, not like a quest board
- The player doesn't need to explicitly "accept" - it's auto-added
`;
}
```

---

## Database State (Current)

### Quest Templates (6 total)
```sql
1. "Gather Wolf Pelts" - 5 wolf pelts, 100 XP, 25 gold (fetch/easy)
2. "Clear the Goblin Cave" - Kill 5 goblins, 200 XP, 50 gold (clear/medium)
3. "Scout the Northern Hills" - Reach location, 75 XP, 15 gold (scout/easy)
4. "Deliver Medicine" - Reach location, 50 XP, 20 gold (deliver/easy)
5. "Collect Rare Herbs" - 3 herbs, 150 XP, 30 gold (fetch/medium)
6. "Eliminate Bandit Camp" - Kill 8 enemies, 400 XP, 100 gold (clear/hard)
```

### Character Quests (3 active)
```sql
Character 97cfc613 has:
  - "Eliminate Bandit Camp" (8 goblins, 400 XP, 100 gold) ← RAIDERS QUEST
  - "Clear the Goblin Cave" (5 goblins, 200 XP, 50 gold) ← GOBLIN QUEST

Character 5cac7df8 has:
  - "Gather Wolf Pelts" (5 wolf pelts, 100 XP, 25 gold)
```

---

## The Problem: Why Confusion Occurs

### Issue #1: LLM Creative Freedom vs Database Reality

**Location:** `/srv/nuaibria/backend/src/services/narratorLLM.ts` (Lines 252-276)

The LLM receives:
```
ACTIVE QUESTS:
1. Clear the Goblin Cave
   Progress: 0/5
   Reward: 200 XP, 50 gold

2. Eliminate Bandit Camp
   Progress: 0/8
   Reward: 400 XP, 100 gold

⭐ OFFER THIS QUEST TO THE PLAYER:
Title: "Eliminate Bandit Camp"
Description: A bandit camp threatens travelers. Clear them out.
Rewards: 400 XP, 100 gold
```

**The LLM is told:**
- "Have an NPC offer it naturally"
- "Make it feel organic"
- "Introduce this quest naturally in your narrative"

**The LLM decides:**
- ✅ "A goblin offers the Goblin Cave quest" (already in active quests)
- ✅ "A merchant offers the raiders quest" (the NEW quest being offered)

**Result:** The player sees TWO quest offers, but:
- Only ONE new quest was actually added to the database
- The "goblin quest" was offered EARLIER (not this conversation)
- The LLM is REMINDING the player about an existing quest while ALSO offering a new one

### Issue #2: No Deduplication or Quest History

**Location:** `/srv/nuaibria/backend/src/services/questGenerator.ts` (Lines 19-68)

```typescript
export async function generateRadiantQuest(
  character: CharacterRecord
): Promise<CharacterQuest | null> {
  // Step 1: Get random template
  const { data: templates } = await supabaseServiceClient
    .from('quest_templates')
    .select('*')
    .limit(10);

  // Pick random template
  const template = templates[Math.floor(Math.random() * templates.length)];

  // Step 3: Create quest in database
  await supabaseServiceClient
    .from('character_quests')
    .insert({
      character_id: character.id,
      template_id: template.id,
      title: filledQuest.title,
      // ... auto-status: 'active'
    });
}
```

**Problems:**
- No check if template was already used
- No limit on how many times same quest can be offered
- No "cooldown" period
- Player could get "Clear the Goblin Cave" twice if unlucky

### Issue #3: Quest Progress Tracking is Incomplete

**Location:** `/srv/nuaibria/backend/src/routes/dmChatSecure.ts` (Lines 368-383)

```typescript
// Track quest progress from completed actions
for (const result of actionResults) {
  if (result.success && result.source.action.type === 'MELEE_ATTACK') {
    // Track enemy kills for "kill_enemies" quests
    await updateQuestProgress(characterId, 'kill_enemy', 'goblin'); // ← HARDCODED "goblin"
  }

  if (result.source.action.type === 'TRAVEL') {
    // Check if reached quest location
    const newPos = `${...}`;
    await updateQuestProgress(characterId, 'reach_location', newPos);
  }
}
```

**Problems:**
- Enemy type is hardcoded as "goblin"
- No way to track which SPECIFIC quest should progress
- If you have 2 "kill goblin" quests, BOTH will progress on every goblin kill

### Issue #4: LLM Has No Context About Quest Offering History

**Location:** `/srv/nuaibria/backend/src/services/narratorLLM.ts` (Lines 240-250)

```typescript
// Add recent conversation history (last 5 exchanges)
const recentHistory = conversationHistory.slice(-10);
recentHistory.forEach(msg => {
  messages.push({
    role: msg.role === 'dm' ? 'assistant' : 'user',
    content: msg.content,
  });
});
```

**Problem:**
- LLM sees conversation history BUT NOT which quests were offered when
- LLM doesn't know "I already offered the Goblin Cave quest 3 messages ago"
- LLM can't distinguish between "remind about old quest" vs "offer new quest"

---

## Specific Code Locations of Issues

### 1. Quest Generation (No Deduplication)
**File:** `/srv/nuaibria/backend/src/services/questGenerator.ts`
**Lines:** 19-68 (generateRadiantQuest function)
**Issue:** Random template selection with no checks for duplicates

### 2. Quest Context Building (Limited Information)
**File:** `/srv/nuaibria/backend/src/services/questIntegration.ts`
**Lines:** 21-42 (getQuestContext function)
**Issue:** Only lists active quests, no history of when/how they were offered

### 3. Quest Offering Prompt (Ambiguous Instructions)
**File:** `/srv/nuaibria/backend/src/services/questIntegration.ts`
**Lines:** 71-89 (buildQuestOfferPrompt function)
**Issue:** Tells LLM to "introduce naturally" but doesn't prevent mixing with existing quest mentions

### 4. Narrator Prompt Building (No Quest Metadata)
**File:** `/srv/nuaibria/backend/src/services/narratorLLM.ts`
**Lines:** 131-286 (buildNarrativePrompt function)
**Issue:** Doesn't distinguish between "already offered" and "newly offered" quests

### 5. Quest Progress Tracking (Hardcoded Targets)
**File:** `/srv/nuaibria/backend/src/routes/dmChatSecure.ts`
**Lines:** 368-383
**Issue:** Hardcoded "goblin" target, no specific quest tracking

---

## Recommendations for Fixes

### Priority 1: Prevent Quest Confusion in Narrative

**Fix Location:** `/srv/nuaibria/backend/src/services/questIntegration.ts`

```typescript
export function buildQuestOfferPrompt(quest: CharacterQuest): string {
  return `
⭐ YOU MUST OFFER THIS NEW QUEST TO THE PLAYER:

Title: "${quest.title}"
Description: ${quest.description}
Rewards: ${quest.xp_reward} XP, ${quest.gold_reward} gold

CRITICAL INSTRUCTIONS:
- This is a NEW quest being offered RIGHT NOW
- Do NOT mention any other quests from the ACTIVE QUESTS list
- Focus ONLY on presenting this new opportunity
- Have an NPC approach and offer this specific quest
- After offering, ask if the player wants to pursue it
- Do NOT confuse this with existing quests

Example: "A merchant rushes up to you: 'Adventurer! I need your help. Bandits have been
raiding caravans. If you can eliminate their camp, I'll pay you 400 gold and you'll
gain valuable experience. Will you take the job?'"
`;
}
```

### Priority 2: Add Quest Metadata to Narrative Context

**Fix Location:** `/srv/nuaibria/backend/src/services/questIntegration.ts`

```typescript
export async function getQuestContext(character: CharacterRecord): Promise<string> {
  const activeQuests = await getActiveQuests(character.id);

  if (activeQuests.length === 0) {
    return 'No active quests.';
  }

  let context = 'ACTIVE QUESTS (already accepted, do NOT offer these again):\n';

  activeQuests.forEach((quest, index) => {
    const acceptedDate = new Date(quest.accepted_at);
    const daysAgo = Math.floor((Date.now() - acceptedDate.getTime()) / (1000 * 60 * 60 * 24));

    context += `\n${index + 1}. ${quest.title} (accepted ${daysAgo} days ago)\n`;
    context += `   Description: ${quest.description}\n`;
    context += `   Progress: ${quest.current_progress}/${quest.target_quantity}\n`;
    context += `   Reward: ${quest.xp_reward} XP, ${quest.gold_reward} gold\n`;
  });

  context += '\nIMPORTANT: These quests were ALREADY offered. Only mention them if player asks about their quests.';
  return context;
}
```

### Priority 3: Add Quest Deduplication

**Fix Location:** `/srv/nuaibria/backend/src/services/questGenerator.ts`

```typescript
export async function generateRadiantQuest(
  character: CharacterRecord
): Promise<CharacterQuest | null> {

  // Get character's quest history (active + completed)
  const { data: existingQuests } = await supabaseServiceClient
    .from('character_quests')
    .select('template_id')
    .eq('character_id', character.id)
    .in('status', ['active', 'completed']);

  const usedTemplateIds = existingQuests?.map(q => q.template_id) || [];

  // Get templates NOT already used
  const { data: templates } = await supabaseServiceClient
    .from('quest_templates')
    .select('*')
    .not('id', 'in', `(${usedTemplateIds.join(',')})`)
    .limit(10);

  if (!templates || templates.length === 0) {
    console.log('[QuestGenerator] No unused templates available');
    return null;
  }

  // Pick random from unused templates
  const template = templates[Math.floor(Math.random() * templates.length)];

  // ... rest of function
}
```

### Priority 4: Improve Quest Progress Tracking

**Fix Location:** `/srv/nuaibria/backend/src/routes/dmChatSecure.ts`

Instead of hardcoded targets, extract enemy type from action result:

```typescript
// Step 5.6: CHECK QUEST PROGRESS
for (const result of actionResults) {
  if (result.success && result.source.action.type === 'MELEE_ATTACK') {
    // Extract enemy type from narrative context
    const enemyType = result.narrativeContext.enemyType || 'unknown';
    await updateQuestProgress(characterId, 'kill_enemy', enemyType);
  }
}
```

### Priority 5: Add Quest Offer Tracking

**New Table Needed:**

```sql
CREATE TABLE quest_offer_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  quest_id UUID REFERENCES character_quests(id),
  offered_by TEXT, -- "goblin merchant", "town guard", etc.
  offered_in_message_id UUID REFERENCES dm_conversations(id),
  offered_at TIMESTAMP DEFAULT NOW()
);
```

This would allow:
- Tracking WHO offered WHICH quest and WHEN
- Preventing LLM from re-offering same quest
- Better narrative continuity

---

## Summary: The Core Problem

**The quest system works correctly for database operations** (quests are stored, tracked, and rewarded properly).

**The problem is narrative consistency:** The LLM narrator doesn't have enough context to distinguish between:
1. "Remind the player about an existing quest"
2. "Offer a brand new quest"
3. "Multiple NPCs offering different quests in the same conversation"

This leads to:
- ✅ Database: Correct quest state
- ❌ Narrative: Confusing quest mentions
- ❌ Player Experience: "Did I accept 1 quest or 2? Which goblin quest?"

**The fix is to:**
1. Make quest offer prompts MORE explicit and restrictive
2. Add metadata to active quest context (when offered, by whom)
3. Implement deduplication to prevent duplicate template usage
4. Consider rate-limiting quest offers (max 1 per conversation)

---

## Test Case: What Actually Happened

**Database State:**
```
Character has 2 active quests:
1. "Clear the Goblin Cave" (200 XP, 50 gold) - Offered 30 minutes ago
2. "Eliminate Bandit Camp" (400 XP, 100 gold) - Offered just now (this message)
```

**What LLM Saw:**
```
ACTIVE QUESTS:
1. Clear the Goblin Cave (200 XP, 50 gold)

⭐ OFFER THIS QUEST:
Eliminate Bandit Camp (400 XP, 100 gold)
```

**What LLM Generated:**
```
"A goblin approaches offering the Goblin Cave quest for 200 XP and 50 gold.
A merchant also has a raiders quest for 400 XP and 100 gold."
```

**Why This Happened:**
- LLM saw the ACTIVE quest and decided to narrate it as "being offered"
- LLM ALSO narrated the NEW quest being offered
- Result: Player thinks 2 NEW quests were offered, but only 1 actually was
- The "goblin quest" was ALREADY in the database from earlier

**The Fix:** Explicitly tell LLM "Do NOT mention active quests when offering new ones"
