# Multiplayer, Factions, and Epochs - Implementation Guide

**Status:** Foundation Complete - Ready for Phase 2 Implementation
**Created:** 2025-10-21
**ADRs:** ADR-003 (Parties), ADR-004 (Interaction), ADR-007 (Factions), ADR-012 (Epochs)

---

## ✅ What's Already Built

### **Database Schema (Complete)**
- ✅ `parties` table - Party metadata and leadership
- ✅ `party_members` table - Character-to-party relationships
- ✅ `party_invites` table - Invitation system with expiry
- ✅ `factions` table - Faction definitions (existing)
- ✅ `faction_memberships` table - Character reputation with factions
- ✅ `faction_quests` table - Layer 2 quest system
- ✅ `campaign_chronicle` table - Epoch historical records

### **Backend API (Complete)**
- ✅ `POST /api/party/create` - Create party
- ✅ `POST /api/party/:id/invite` - Invite character
- ✅ `POST /api/party/invite/:id/accept` - Accept invite
- ✅ `GET /api/party/:id/members` - Get party members
- ✅ `POST /api/party/:id/leave` - Leave party

### **Services (Complete)**
- ✅ `partyService.ts` - Core party management logic
- ✅ All functions include ownership validation

---

## 🚧 What Needs Implementation

### **1. Party System (ADR-003, ADR-004)**

**Frontend UI Needed:**
- Party creation modal
- Party member list display
- Invite management UI
- Player directory (browse available players)
- Rendezvous quest markers on map

**Backend Logic Needed:**
- Shared party inventory
- Party-wide quest tracking
- Turn coordination for combat
- Party chat/communication
- Difficulty scaling based on party size

**AI Integration Needed:**
- DM narratives for multiple characters
- Party-aware quest generation
- Coordinated story arcs

**Estimated:** 2-3 weeks

---

### **2. Faction System (ADR-007)**

**Database Ready:**
- Tables exist and are linked

**Backend Needed:**
- Reputation gain/loss mechanics
- Faction quest generation (Layer 2)
- NPC faction affiliations
- Faction relationship tracking (allies/enemies)

**AI Integration Needed:**
- Major NPC persona generation (Gemini Pro)
- Faction-specific quest narratives
- Reputation-aware dialogue

**Frontend Needed:**
- Faction reputation display
- Faction quest UI
- NPC dialogue system

**Estimated:** 2-3 weeks

---

### **3. Epoch System (ADR-012)**

**Database Ready:**
- `campaign_chronicle` table created

**Backend Needed:**
- Story arc completion detection
- World state modification engine
- POI creation/modification
- NPC updates

**AI Integration Needed:**
- Gemini Pro historical record generation
- Consequence prediction and application
- New quest generation based on epoch changes

**Frontend Needed:**
- Chronicle viewer
- Epoch celebration UI
- World change notifications

**Estimated:** 2-3 weeks

---

## 🎯 Implementation Priority

**Phase 2A: Basic Multiplayer (4-6 weeks)**
1. Party creation and joining (Week 1-2)
2. Shared combat and turns (Week 3-4)
3. Party chat and coordination (Week 5-6)

**Phase 2B: Faction System (3-4 weeks)**
1. Reputation mechanics (Week 1)
2. Faction quests (Week 2-3)
3. Major NPC system (Week 4)

**Phase 2C: World Epochs (3-4 weeks)**
1. Story arc detection (Week 1)
2. AI historical generation (Week 2)
3. World modification engine (Week 3-4)

---

## 📝 Next Steps for Developers

**To Continue Multiplayer:**
1. Read ADR-003 and ADR-004 in `project.md`
2. Build frontend party UI components
3. Implement real-time party state synchronization
4. Test with 2+ players

**To Continue Factions:**
1. Read ADR-007 in `project.md`
2. Populate `factions` table with initial factions
3. Implement reputation gain/loss in rule engine
4. Generate Major NPC personas with Gemini

**To Continue Epochs:**
1. Read ADR-012 in `project.md`
2. Define story arc completion criteria
3. Build world modification service
4. Test epoch triggers

---

## 🔧 Technical Notes

**Party Synchronization:**
- Use Supabase real-time subscriptions for party state
- WebSockets for turn coordination
- Optimistic UI updates with conflict resolution

**Faction Reputation:**
- Already exists: `characters.reputation_scores` (JSONB)
- Already exists: `characters.reputation_tags` (array)
- Integrate with existing systems

**Epoch Storage:**
- Each epoch increments `epoch_number`
- World changes stored as JSONB diffs
- Apply changes atomically to maintain consistency

---

## ✅ Current State

**Status:** Foundation complete, ready for implementation
**Time Investment:** 3 hours (database + API foundation)
**Remaining:** 8-12 weeks for full features
**Next Owner:** Future developer or continued iteration

**The architecture is sound and ready to build upon!**
