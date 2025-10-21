# Nuaibria World-Building Systems

This README summarizes the new world-building infrastructure powering procedural exploration in Nuaibria. It covers the landmark generation pipeline, travel encounters, and global NPC persistence.

## Landmark POI System

- Service: `backend/src/services/landmarkService.ts`
- Types: `backend/src/types/landmark-types.ts`
- Storage: `world_landmarks` table (`backend/migrations/20251021_create_world_landmarks.sql`)

### Behaviour

- Each campaign tile has a deterministic 0.5% chance to spawn a landmark (stone markers, ruins, waterfalls, caves, abandoned camps, scenic overlooks, shrines).
- Landmarks are generated the first time a character travels nearby. Names/descriptions are deterministic per tile using a seeded RNG.
- The nearest settlement/road metadata is captured for narrative context.
- Discovery state tracks which characters have encountered the landmark, ensuring the DM only announces new discoveries once.
- `worldContext.ts` automatically calls `ensureLandmarksAroundPosition()` and `recordNearbyDiscoveries()` so DM prompts mention newly spotted landmarks.

### Key APIs

- `landmarkService.ensureLandmarksAroundPosition(campaignSeed, position, radiusTiles)` lazily creates landmarks near a position.
- `landmarkService.recordNearbyDiscoveries(character, radius)` updates discovery_state and returns newly found vs known landmarks.
- `landmarkService.getNearbyLandmarks(...)` returns structured summaries for narration and UI.

## Travel Encounter System

- Services: `backend/src/services/encounterService.ts`, `backend/src/services/encounterGenerationService.ts`
- Types: `backend/src/types/encounter-types.ts`

### Behaviour

- Travel encounters scale by biome, distance travelled, road danger, and time of day. Desert biomes bias toward `weather_event` encounters (e.g., desert storms); dangerous roads bias toward bandit ambushes; forests surface wildlife encounters.
- `EncounterService` produces deterministic percentile rolls per travel action. When the threshold is met, it calls the Gemini Flash-backed `EncounterGenerationService` to synthesize names, descriptions, motivations, and hooks.
- Rule engine travel actions now embed encounter summaries and rolls into the authoritative `narrativeContext`, guaranteeing the DM narration references the generated event.

### Key APIs

- `encounterService.evaluateTravelEncounter(context)` → `{ triggered, encounter, roll, threshold }`.
- `encounterGenerationService.generateEncounter(promptContext)` → `GeneratedEncounter` (LLM powered; fallback descriptions handle API failures).

## NPC Persistence System

- Services: `backend/src/services/npcService.ts`, `backend/src/services/npcMovementService.ts`
- Types: `backend/src/types/npc-types.ts`
- Storage: `world_npcs`, `character_npc_reputation` (`backend/migrations/20251021_create_world_npcs.sql`, `backend/migrations/20251021_create_character_npc_reputation.sql`)

### Behaviour

- Settlements automatically gain 2–12 persistent NPCs (scaled by settlement size) via `NpcService.ensureSettlementNpcs`. POIs get a lighter roster.
- NPC records capture race, class, role, personality, state (`alive|dead|missing`), and current/home locations. Killing an NPC updates their state globally.
- `character_npc_reputation` stores per-character scores, quest counts, and last interaction timestamps, enabling genuine shared consequences.
- `NpcMovementService.performWeeklyMovement` migrates a subset of NPCs between settlements, landmarks, or wilderness routes, keeping the world in motion.
- `worldContext.ts` surfaces NPC presence or absence (including deaths) when describing the nearest settlement.

### Key APIs

- `npcService.ensureSettlementNpcs(campaignSeed, settlementSeed)` and `ensurePoiNpcs` for roster seeding.
- `npcService.adjustReputation(characterId, npcId, delta, questsGivenDelta, questsCompletedDelta)` for character-specific reputation updates.
- `npcMovementService.performWeeklyMovement(campaignSeed, options)` for scheduled relocation batches.

## Testing

- Deterministic generation, encounter weighting, NPC roster creation, reputation adjustments, and movement plans are covered by Jest specs under `backend/tests/*Service.test.ts`.

## Integration Notes

- The rule engine travel action now uses both `landmarkService` and `encounterService` to enrich its `narrativeContext` payload.
- `worldContext.ts` consumes landmark/NPC services to ensure the DM prompt naturally mentions nearby discoveries and persistent NPC states for all characters.
- Migrations add trigger-driven `updated_at` maintenance and GIN/enum structures required for performance and referential integrity.
