# Dynamic Consequences System Design

## Overview

**The Problem**: Player claims "I'm the king's son" → DM accepts → Now what?

**The Solution**: Hybrid system where Rule Engine creates mechanical threat probabilities, and LLM creatively manifests those threats.

**Date**: 2025-10-19
**Status**: Design complete, ready for Phase 2 implementation

---

## 🎯 Core Principle

**"Bold narrative claims trigger mechanical consequences that the LLM brings to life."**

- **Player**: Makes bold claim ("I'm the king's son")
- **Rule Engine**: Accepts claim → Sets threat levels (25% kidnapping chance)
- **LLM**: Creates specific threat scenarios when triggered
- **Result**: Risk/reward balance + emergent storytelling

---

## 🏗️ Architecture

### **Flow Diagram**

```
Player: "I'm the king's son"
    ↓
Intent Detector: SOCIAL_CLAIM (royal_heritage)
    ↓
Rule Engine: Roll Persuasion vs NPC Insight
    ↓
If BELIEVED:
    ✅ Add reputation_tag: "accepted_royal_claim"
    ✅ Set active_threats["royal_target"] = 25%
    ✅ reputation_score["nobles"] += 20
    ↓
Database: Store threat level and tags
    ↓
[Later: Player rests]
    ↓
Rule Engine: Roll 1d100 vs threat_level (25%)
    ↓
If TRIGGERED (roll ≤ 25):
    ✅ encounter_type = "royal_threat"
    ✅ encounter_variant = random("kidnapping", "assassination", ...)
    ✅ trigger_active_phase = true
    ↓
LLM: Generate kidnapping scenario
    "Three hooded figures burst into your room..."
    ↓
Active Phase: Combat/Escape/Negotiate
```

---

## 📊 Threat System Mechanics

### **Threat Types**

| Claim | Threat Type | Base Chance | Severity | Variants |
|-------|-------------|-------------|----------|----------|
| "I'm the king's son" | `royal_target` | 25% | High | Kidnapping, assassination, blackmail, messenger, rival claimant |
| "I'm famous" | `celebrity_target` | 15% | Medium | Stalkers, challengers, imposters, fan mobs |
| "Dragon owes me" | `dragon_enemy` | 10% | Very High | Dragon cultists, dragon spawn, vengeance |
| "I'm cursed" | `supernatural` | 20% | Low | Curse manifestations, clerics, exorcists |

### **Threat Calculation**

```typescript
// Base threat
baseThreat = 25% (for royal claims)

// Location modifiers
if (location === 'remote_wilderness'): baseThreat -= 15%
if (location === 'capital_city'): baseThreat += 50%
if (location === 'royal_castle'): baseThreat += 75%

// Action modifiers
if (action === 'rest'): baseThreat += 10% (vulnerable while sleeping)
if (action === 'travel'): baseThreat += 0% (baseline)
if (action === 'public_speech'): baseThreat += 100% (guaranteed!)

// Time escalation
if (days_since_claim > 7): baseThreat += 5% per week

// Final calculation
actualThreat = clamp(baseThreat + modifiers, 0%, 100%)
```

---

## 🎮 Example Scenarios

### **Scenario 1: Kidnapping for Ransom**

```
Turn 8: Player rests at inn (threat triggered)

Rule Engine:
  - Threat roll: 22 vs 25% → TRIGGERED
  - Encounter: royal_target → kidnapping
  - Spawn: 3x Bounty Hunters (CR 2)
  - Context: "kidnapping_for_ransom"

LLM Narrative:
  "You wake to rough hands and the glint of steel. 'Don't struggle,
   prince. Your uncle is offering 50,000 gold for you—alive. We intend
   to collect.' Three armed kidnappers surround your bed."

Player Options:
  1. Fight (STR/DEX checks, combat)
  2. Flee (DEX check to escape through window)
  3. Negotiate (CHA check: "I'll pay you double!")
  4. Surrender (captured → escape quest)

Outcomes:

  A) WIN COMBAT:
     - Loot: "Wanted poster with your face"
     - XP: 600 (CR 2 x 3)
     - Threat reduced: 25% → 15%
     - New quest: "Find who hired them"

  B) FLEE:
     - Escape successful
     - Leave gear behind (lose items)
     - Threat remains: 25%
     - Now on the run

  C) CAPTURED:
     - Status: "captured"
     - Position: "kidnapper_hideout"
     - 48-hour timer until delivery
     - Escape quest begins

  D) NEGOTIATE:
     - CHA check vs DC 15
     - Success: They take gold but let you go
     - Failure: Combat starts anyway
```

### **Scenario 2: Assassination Attempt**

```
Turn 12: Player travels to capital (threat triggered)

Rule Engine:
  - Location: capital_city
  - Threat: 25% + 50% (capital) = 75%
  - Roll: 44 vs 75% → TRIGGERED
  - Variant: assassination

LLM Narrative:
  "As you walk through the crowded market, you glimpse a flash of
   steel. ASSASSIN! A cloaked figure lunges from the shadows, blade
   aimed at your heart! Make a DEX saving throw!"

Mechanics:
  - DEX save vs DC 16
  - Failure: 2d6 piercing damage + poison
  - Success: Half damage, no poison
  - Then: Initiative for combat

Follow-up:
  - If assassin defeated: Find "Contract signed by Duke Malveris"
  - New quest: "Confront Duke Malveris"
  - Political intrigue unlocked
```

### **Scenario 3: Blackmail**

```
Turn 15: Player rests (threat triggered, variant: blackmail)

LLM Narrative:
  "A sealed letter slides under your door. Breaking the seal, you read:

   'We know who you are, Prince. We have proof. Meet us at the old
    mill at midnight with 500 gold, or tomorrow morning, the usurper
    will know you live. Choose wisely.'

   [QUEST: Blackmail - Multiple solutions]"

Player Options:
  1. Pay the blackmail (500 gold)
     - Threat temporarily reduced
     - But they'll be back for more...

  2. Ignore it (risky!)
     - Usurper finds out (threat × 3)
     - Assassins sent immediately

  3. Set a trap (ambush the blackmailers)
     - Stealth check to prepare
     - Combat when they arrive
     - If successful: Eliminate threat permanently

  4. Investigate (who sent the letter?)
     - Investigation check
     - Might uncover larger conspiracy
```

---

## 🔧 Implementation Details

### **Database Schema**

```sql
-- Add to characters table
ALTER TABLE characters
  ADD COLUMN active_threats JSONB DEFAULT '{}',
  ADD COLUMN reputation_tags TEXT[] DEFAULT '{}',
  ADD COLUMN reputation_scores JSONB DEFAULT '{}';

-- Track threat encounters
CREATE TABLE threat_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID REFERENCES characters(id),
  threat_type TEXT NOT NULL,
  threat_variant TEXT NOT NULL,
  triggered_at TIMESTAMP DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  outcome TEXT,
  loot_awarded JSONB,
  xp_awarded INTEGER
);

-- Example data
{
  "active_threats": {
    "royal_target": {
      "chance": 25,
      "severity": "high",
      "types": ["kidnapping", "assassination", "blackmail"],
      "created_at": "2025-10-19T12:00:00Z",
      "escalation_rate": 5
    }
  },
  "reputation_tags": [
    "accepted_royal_claim",
    "defeated_bounty_hunters",
    "wanted_by_usurper"
  ],
  "reputation_scores": {
    "nobles": 20,
    "commoners": 15,
    "guards": -10,
    "usurper_faction": -100
  }
}
```

### **Intent Detector Enhancement**

```typescript
// In intentDetector.ts

function detectSocialClaim(text: string): SocialClaimAction | null {
  const claimPatterns = [
    {
      pattern: /\b(I'm|I am) (the )?(king's|queen's|prince|princess|duke's|royal)\b/i,
      claimType: 'royal_heritage',
      threatType: 'royal_target',
      difficulty: 18,
    },
    {
      pattern: /\b(I'm|I am) (very |incredibly )?(famous|renowned|legendary)\b/i,
      claimType: 'fame',
      threatType: 'celebrity_target',
      difficulty: 15,
    },
    {
      pattern: /\b(dragon|ancient one|deity) (owes me|is my friend|knows me)\b/i,
      claimType: 'powerful_connection',
      threatType: 'dragon_enemy',
      difficulty: 20,
    },
  ];

  for (const pattern of claimPatterns) {
    if (pattern.pattern.test(text)) {
      return {
        type: 'SOCIAL_CLAIM',
        actionId: uuidv4(),
        actorId: context.characterId,
        timestamp: Date.now(),
        claimType: pattern.claimType,
        threatType: pattern.threatType,
        difficulty: pattern.difficulty,
      };
    }
  }

  return null;
}
```

### **Rule Engine: Execute Social Claim**

```typescript
// In ruleEngine.ts

async function executeSocialClaim(
  action: SocialClaimAction,
  character: CharacterRecord,
  npcContext?: NPC
): Promise<ActionResult> {

  // Roll opposed check: Player Persuasion vs NPC Insight
  const chaModifier = calculateAbilityModifier(character.ability_scores.CHA);
  const playerRoll = rollD20();
  const playerTotal = playerRoll.total + chaModifier;

  const npcInsight = npcContext?.insight || 14; // Default NPC wisdom
  const npcModifier = Math.floor((npcInsight - 10) / 2);
  const npcRoll = rollD20();
  const npcTotal = npcRoll.total + npcModifier;

  const believed = playerTotal >= npcTotal;

  const stateChanges: StateChange[] = [];

  if (believed) {
    // CLAIM ACCEPTED - Set threats!
    const threatConfig = getThreatConfig(action.threatType);

    stateChanges.push({
      entityId: character.id,
      entityType: 'character',
      field: 'active_threats',
      oldValue: character.active_threats || {},
      newValue: {
        ...character.active_threats,
        [action.threatType]: threatConfig,
      },
    });

    stateChanges.push({
      entityId: character.id,
      entityType: 'character',
      field: 'reputation_tags',
      oldValue: character.reputation_tags || [],
      newValue: [...(character.reputation_tags || []), `accepted_${action.claimType}`],
    });
  } else {
    // CLAIM REJECTED - Caught lying!
    stateChanges.push({
      entityId: character.id,
      entityType: 'character',
      field: 'reputation_tags',
      oldValue: character.reputation_tags || [],
      newValue: [...(character.reputation_tags || []), `caught_lying_${action.claimType}`],
    });

    stateChanges.push({
      entityId: character.id,
      entityType: 'character',
      field: 'reputation_scores',
      oldValue: character.reputation_scores || {},
      newValue: {
        ...character.reputation_scores,
        [npcContext?.faction || 'general']: -20,
      },
    });
  }

  return {
    actionId: action.actionId,
    success: believed,
    outcome: believed ? 'success' : 'failure',
    rolls: {
      persuasion: toDiceRoll(playerRoll, chaModifier),
      insight: toDiceRoll(npcRoll, npcModifier),
    },
    stateChanges,
    narrativeContext: {
      summary: believed
        ? `The NPC believes you are ${action.claimType}! But this comes with consequences...`
        : `The NPC sees through your lie! Your reputation suffers.`,
      mood: believed ? 'triumph' : 'defeat',
      details: believed
        ? `Threat activated: ${action.threatType} at ${getThreatConfig(action.threatType).chance}%`
        : 'You are now marked as a liar.',
    },
    createJournalEntry: true,
    executionTimeMs: Date.now() - startTime,
  };
}

function getThreatConfig(threatType: string) {
  const configs = {
    royal_target: {
      chance: 25,
      severity: 'high',
      types: ['kidnapping', 'assassination', 'blackmail', 'messenger', 'rival_claimant'],
      escalation_rate: 5, // +5% per week
    },
    celebrity_target: {
      chance: 15,
      severity: 'medium',
      types: ['stalker', 'challenger', 'imposter', 'fan_mob'],
      escalation_rate: 3,
    },
    dragon_enemy: {
      chance: 10,
      severity: 'very_high',
      types: ['dragon_cultist', 'dragon_spawn', 'vengeance_curse'],
      escalation_rate: 2,
    },
  };

  return configs[threatType] || configs.royal_target;
}
```

### **Rule Engine: Check Threats on Rest/Travel**

```typescript
// In executeRest() and executeTravel()

async function checkThreats(
  character: CharacterRecord,
  action: 'rest' | 'travel',
  location: string
): Promise<ThreatEncounter | null> {

  if (!character.active_threats) return null;

  for (const [threatType, threatData] of Object.entries(character.active_threats)) {
    // Calculate modified threat chance
    let actualChance = threatData.chance;

    // Location modifiers
    if (location === 'capital_city') actualChance += 50;
    if (location === 'remote_wilderness') actualChance -= 15;
    if (location === 'royal_castle') actualChance += 75;

    // Action modifiers
    if (action === 'rest') actualChance += 10; // Vulnerable when sleeping

    // Roll for threat
    const roll = Math.random() * 100;

    if (roll <= actualChance) {
      // THREAT TRIGGERED!
      const variant = threatData.types[Math.floor(Math.random() * threatData.types.length)];

      return {
        threatType,
        variant,
        severity: threatData.severity,
        triggered: true,
      };
    }
  }

  return null; // No threats triggered
}

// In executeRest()
async function executeRest(action: RestAction, character: CharacterRecord) {
  // Normal rest mechanics...
  const normalResult = { /* HP recovery, etc. */ };

  // Check for threats
  const threat = await checkThreats(character, 'rest', action.location);

  if (threat) {
    return {
      ...normalResult,
      triggerActivePhase: true,
      narrativeContext: {
        summary: "Your rest is interrupted!",
        threatType: threat.threatType,
        threatVariant: threat.variant,
        threatSeverity: threat.severity,
        mood: 'tense',
      },
    };
  }

  return normalResult;
}
```

### **LLM Prompt Enhancement**

```typescript
// In narratorLLM.ts

function buildNarrativePrompt(
  character: CharacterRecord,
  conversationHistory: ChatMessage[],
  playerMessage: string,
  actionResult: ActionResult
): NarratorMessage[] {

  let contextAdditions = '';

  // Add threat context if encounter triggered
  if (actionResult.narrativeContext.threatType) {
    contextAdditions += `
THREAT ENCOUNTER TRIGGERED:
- Type: ${actionResult.narrativeContext.threatType}
- Variant: ${actionResult.narrativeContext.threatVariant}
- Severity: ${actionResult.narrativeContext.threatSeverity}

Generate a ${actionResult.narrativeContext.threatVariant} scenario.
The player claimed royal heritage earlier. This encounter is a consequence.

Possible scenarios:
- Kidnapping: Bounty hunters, rival kingdoms, crime syndicates
- Assassination: Professional killers, poisoned darts, ambush
- Blackmail: Threatening letters, extortion, exposure threats
- Messenger: Loyalist finding you, political allies, resistance
- Rival: Another claimant to throne, duel challenge

Choose the most interesting variant for the current story context.
Make it dramatic and give the player meaningful choices.
`;
  }

  // Add reputation context
  if (character.reputation_tags && character.reputation_tags.length > 0) {
    contextAdditions += `
REPUTATION TAGS (honor these in your narrative):
${character.reputation_tags.map(tag => `- ${tag}`).join('\n')}

These tags represent past claims and their outcomes. Reference them!
`;
  }

  return [
    { role: 'system', content: NARRATIVE_SYSTEM_PROMPT },
    { role: 'system', content: contextAdditions },
    // ... rest of prompt
  ];
}
```

---

## 🎲 Gameplay Impact

### **Strategic Depth**

Players must consider:
- **CHA stat matters**: High CHA = Claims believed more often
- **Location matters**: Cities are dangerous, wilderness is safer
- **Timing matters**: Threats escalate over time
- **Risk management**: Can hide identity to reduce threats

### **Example Strategic Choices**

```
Player (CHA 8, low charisma):
  "Should I claim royal heritage?"
  - Risk: 60% chance of being caught lying (CHA modifier -1)
  - If caught: Reputation destroyed
  - Strategy: Better stay anonymous

Player (CHA 16, high charisma):
  "I'll claim royal heritage"
  - Risk: 20% chance of being caught (CHA modifier +3)
  - If believed: 25% ongoing threat but access to nobles
  - Strategy: Worth it! Can handle the consequences

Player (accepted royal claim, in capital city):
  "Should I rest here or travel to wilderness?"
  - Capital: 75% threat chance (dangerous!)
  - Wilderness: 10% threat chance (safer)
  - Strategy: Travel to safer area before resting
```

---

## 📈 Escalation Examples

### **Week 1: Initial Claim**
```
Threat level: 25%
Enemies: Bounty hunters (CR 2)
Stakes: Kidnapping for ransom
```

### **Week 3: Word Spreads**
```
Threat level: 35% (escalated)
Enemies: Professional kidnappers (CR 3)
Stakes: Higher ransom, better tactics
```

### **Week 5: Uncle Hears**
```
Threat level: 50%
Enemies: Royal assassins (CR 4)
Stakes: Kill orders, no capture
New Quest: "The Usurper Knows"
```

### **Week 8: Public Knowledge**
```
Threat level: 75%
Enemies: Army squads (CR 5 x 5)
Stakes: Political crisis, civil war brewing
Quest Chain: "Reclaim the Throne" or "Flee the Kingdom"
```

---

## 💡 Benefits

### **For Players**
- ✅ Bold claims create unique storylines
- ✅ Risk/reward is transparent (can see threat %)
- ✅ Strategic choices matter (where to rest, when to reveal)
- ✅ Can reduce threats through gameplay
- ✅ Emergent narratives (every playthrough different)

### **For the Game**
- ✅ Prevents consequence-free claims
- ✅ Makes CHA stat valuable
- ✅ Creates endgame content (throne quests)
- ✅ Balances narrative freedom with mechanical fairness
- ✅ LLM + Rule Engine synergy

---

## 🚀 Implementation Priority

### **Phase 2A: Core Threat System** (High Priority)
- Database: Add active_threats column
- Intent: Detect SOCIAL_CLAIM actions
- Rule Engine: Set threats when claims accepted
- Rule Engine: Roll for threats on rest/travel
- Basic encounters when triggered

### **Phase 2B: LLM Integration** (High Priority)
- Pass threat context to LLM prompts
- LLM creates specific scenarios
- Reputation tags in prompts

### **Phase 2C: Escalation** (Medium Priority)
- Time-based escalation
- Location modifiers
- Threat reduction mechanics

### **Phase 2D: Advanced** (Low Priority)
- Faction system
- Political intrigue quests
- Capture/escape mechanics
- Kingdom management endgame

---

## 🎯 Summary

**Your Question**: "What if DM accepts royal claim, then kidnapping?"

**Answer**: This is EXACTLY the feature we should build!

**The System**:
1. Bold claim → Persuasion check
2. If believed → Set threat_level
3. Threats trigger probabilistically
4. LLM creates creative manifestations
5. Player deals with consequences
6. Can reduce threats or let them escalate

**Result**: ONE narrative claim creates HOURS of emergent, consequence-driven gameplay!

---

**Next Steps**: Want me to implement Phase 2A (core threat system)?
