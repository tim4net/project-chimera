# Hidden Threats System - Implementation Complete ✅

**Date**: 2025-10-19
**Status**: Phase 2 Complete
**Immersion Level**: Maximum 🎭

---

## 🎯 The Design Philosophy

**"Players should feel the tension, not see the math."**

- ❌ Don't show: "35% kidnapping chance"
- ✅ Show instead: "You feel eyes on you..."

---

## 🏗️ Three-Layer Architecture

### **Layer 1: Backend (Precise Mechanics - HIDDEN)**
```typescript
// What the backend tracks:
character.active_threats = {
  royal_target: {
    chance: 35%,              // ❌ NOT shown to player
    severity: "high",          // ❌ NOT shown to player
    types: [...],              // ❌ NOT shown to player
  }
}

// Every rest/travel:
roll 1d100 vs 35% → if ≤35: trigger kidnapping
```

### **Layer 2: Tension Translation (Vague Warnings)**
```typescript
// Backend converts mechanics to atmosphere:
35% threat → "watched" level
           → "You feel eyes on you..."
           → Icon: 👀
           → Color: orange

// Player sees feeling, NOT numbers
```

### **Layer 3: LLM Narration (Atmospheric)**
```typescript
// LLM receives narrative context:
"ATMOSPHERE: Clear sense of being watched. Shadowy figures,
 eavesdroppers, people asking questions. Create paranoid atmosphere."

"Strangers seem to take unusual interest in you. Coincidence?"

// LLM weaves this into story:
"As you enter the tavern, conversation pauses. A hooded figure
 watches from the corner, whispering to a companion..."
```

---

## 📊 Tension Levels (What Players See)

| Backend Threat | Tension Level | Player Sees | Icon | Atmosphere |
|----------------|---------------|-------------|------|------------|
| 0-10% | Peaceful | "You feel safe" | ✅ | Calm, normal |
| 11-25% | Uneasy | "Something feels off" | 👁️ | Subtle hints |
| 26-40% | Watched | "You feel eyes on you" | 👀 | Paranoid, tense |
| 41-60% | Hunted | "They're close. You know it." | ⚠️ | High tension |
| 61-100% | Imminent | "Danger is imminent" | 🚨 | Extreme danger |

---

## 🎮 Player Experience Examples

### **Scenario: Royal Claim (35% threat)**

**Turn 1: The Claim**
```
Player: "I'm the king's son"
DM: "The old woman's eyes widen. She bows deeply. As she leaves,
     you see her whisper to the baker. Word spreads like wildfire..."

Backend: active_threats["royal_target"] = 25%
Player sees: "Claimed royal bloodline (believed by some)"
```

**Turn 3: Building Tension**
```
Player: "I walk through town"
DM: "You notice the same hooded figure from yesterday. They vanish
     into an alley when you turn. Coincidence? Your instincts say no."

Backend: threat = 25% (uneasy level)
Player sees: 👁️ "Something feels off"
```

**Turn 5: Escalation**
```
Player: "I enter the tavern"
DM: "Conversation stops when you enter. Strangers eye you with keen
     interest. One whispers to the innkeeper, who glances at you
     nervously. You're being watched."

Backend: threat = 30% (watched level, escalated)
Player sees: 👀 "You feel eyes on you"
```

**Turn 8: THE PAYOFF**
```
Player: "I rest for the night"
[Backend rolls: 28 vs 35% → TRIGGERED!]

DM: "You wake to rough hands! Three kidnappers burst through the door!
     'The prince! We've been searching for days!' Roll Initiative!"

Player: 😱 "Holy crap! Where did that come from?!"

[After combat]
System: "This kidnapping was a consequence of claiming royal blood.
         Your choices have lasting effects. Stay vigilant."
```

---

## 🔐 What's Hidden vs What's Shown

### **HIDDEN (Backend Only)**
```json
{
  "active_threats": {
    "royal_target": {
      "chance": 35,
      "severity": "high",
      "types": ["kidnapping", "assassination"],
      "escalation_rate": 5
    }
  }
}
```
❌ Player NEVER sees this!

### **SHOWN (Player-Facing)**
```json
GET /api/tension/:characterId
{
  "tension": {
    "feeling": "Watched",
    "icon": "👀",
    "color": "orange",
    "hasWarning": true
  },
  "warning": "You feel eyes on you, though you can't quite place them.",
  "reputation": [
    "Claimed royal bloodline (believed by some)",
    "Survived previous encounters"
  ]
}
```
✅ Only vague atmospheric info!

---

## 💡 Why This Is Brilliant

### **Creates Genuine Tension**
```
Player doesn't know WHEN threats will trigger
  → Every rest feels risky
  → Every travel creates suspense
  → Genuine fear and surprise
```

### **Prevents Meta-Gaming**
```
Can't calculate: "I'll rest 4 times, expect 1 encounter"
Must rely on: Gut feeling, narrative hints, atmosphere
```

### **Rewards Intuition**
```
Smart players notice patterns:
  - "I felt watched" → kidnapping happened
  - "Let me avoid resting in cities"
  - Learning through experience, not math
```

### **LLM Creates Atmosphere**
```
With vague instructions, LLM builds tension naturally:
  - Shadows in corners
  - Whispered conversations
  - Strangers asking questions
  - Near-miss encounters

All narrative, no numbers!
```

---

## 🎨 Frontend UI Implementation

### **Status Badge (Vague Warning)**
```tsx
// DashboardPage.tsx

const [tension, setTension] = useState(null);

useEffect(() => {
  fetch(`/api/tension/${character.id}`)
    .then(res => res.json())
    .then(data => setTension(data));
}, [character.id]);

// Display:
{tension?.warning && (
  <div className="tension-warning bg-yellow-900/30 border border-yellow-600 p-3 rounded">
    <span className="text-xl">{tension.tension.icon}</span>
    <span className="text-yellow-200">{tension.warning}</span>
  </div>
)}
```

**Result:**
```
┌────────────────────────────────────────┐
│ 👀 You feel eyes on you, though you   │
│    can't quite place them.            │
└────────────────────────────────────────┘
```

### **Reputation Display (Narrative)**
```tsx
{tension?.reputation.map(rep => (
  <li key={rep} className="text-sm text-gray-300">
    • {rep}
  </li>
))}
```

**Result:**
```
Reputation:
  • Claimed royal bloodline (believed by some)
  • Survived assassination attempts
```

### **Post-Encounter Explanation**
```tsx
// After kidnapping encounter
<div className="explanation bg-red-900/20 p-4 rounded">
  <h3>Why This Happened</h3>
  <p>This kidnapping attempt was triggered by your claim to royal blood.
     Your narrative claims have consequences. Stay vigilant.</p>
</div>
```

---

## 📦 Files Created

1. ✅ `services/tensionCalculator.ts` - Converts threat % to atmosphere
2. ✅ `services/playerFacingTension.ts` - Player-safe tension info
3. ✅ `routes/tension.ts` - API endpoint (no mechanics exposed)
4. ✅ Updated `narratorLLM.ts` - Uses narrative context, not mechanics
5. ✅ Updated `server.ts` - Added /api/tension route

---

## 🎮 Complete Player Experience

```
Session Flow:

Turn 1: Make bold claim
  Player: "I'm the king's son"
  UI: ✅ No immediate warnings

Turn 3: Tension builds
  DM: "You notice whispers when you pass..."
  UI: 👁️ "Something feels off"

Turn 5: Tension increases
  DM: "The same figures keep appearing..."
  UI: 👀 "You feel eyes on you"

Turn 8: THE STRIKE
  DM: "KIDNAPPERS BURST IN!"
  Player: 😱 Genuine shock!
  UI: "📜 Why: Your royal claim had consequences"

Turn 10: Learning
  Player: "I should be more careful where I rest..."
  UI: Still shows 👀 "You feel watched" (threat ongoing)
  Player: Makes strategic choice based on feeling, not math
```

---

## ✅ Implementation Checklist

### **Backend (Complete)**
- [x] Threat system with precise percentages
- [x] Tension calculator (mechanics → atmosphere)
- [x] Player-safe API endpoint
- [x] LLM prompts use narrative context
- [x] Post-encounter explanations

### **Frontend (TODO)**
- [ ] Fetch tension from /api/tension
- [ ] Display vague warning badge
- [ ] Show reputation (narrative form)
- [ ] Post-encounter explanation modal
- [ ] Never show threat percentages

---

## 🎉 Summary

### **The Problem**
Original design showed threat mechanics to players:
- "25% kidnapping chance" ❌
- Breaks immersion
- Enables meta-gaming
- No surprise

### **The Solution (Option B)**
Hide mechanics, show atmosphere:
- "You feel watched" ✅
- Immersive tension
- Genuine surprise
- Strategic intuition

### **The Result**
```
ONE narrative claim → Creates hours of tense gameplay
  - Vague warnings build suspense
  - Encounters feel organic (not mathematical)
  - Players make emotional decisions (not calculated)
  - LLM creates atmosphere naturally

This is cinematic storytelling, not a spreadsheet!
```

---

## 🚀 Next Steps

**Frontend Integration** (Week 1):
1. Add tension badge to Dashboard
2. Display vague warnings
3. Show reputation narratively
4. Post-encounter explanations

**Polish** (Week 2):
5. Threat escalation over time
6. Location-based modifiers
7. Threat reduction mechanics
8. More encounter variants

**Immersion is everything!** 🎭
