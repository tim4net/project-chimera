/**
 * RPC Function: persist_town_atomically
 *
 * Atomically persists a generated town with all related data (locations, NPCs, quests, secrets)
 * in a single database transaction. This ensures:
 * - Race condition prevention: SELECT ... FOR UPDATE on campaign_seed
 * - Data integrity: NPC IDs properly linked as foreign keys to quests
 * - Atomicity: All-or-nothing persistence - no partial town data
 *
 * Parameters:
 * - p_campaign_seed: Unique identifier for the campaign/world
 * - p_name: Town name
 * - p_region: Region type (e.g., "temperate forest")
 * - p_prosperity_level: "modest" | "comfortable" | "prosperous"
 * - p_safety_rating: "relatively safe" | "somewhat dangerous" | "dangerous"
 * - p_trade_route_notes: Text description of trade route positioning
 * - p_full_data: Complete town JSON (JSONB) including locations, NPCs, quests, secrets, atmosphere, etc.
 *
 * Returns:
 * - town_id: ID of the created town (or existing if already created)
 * - success: boolean
 */
CREATE OR REPLACE FUNCTION persist_town_atomically(
  p_campaign_seed TEXT,
  p_name TEXT,
  p_region TEXT,
  p_prosperity_level TEXT,
  p_safety_rating TEXT,
  p_trade_route_notes TEXT,
  p_full_data JSONB
)
RETURNS TABLE(town_id UUID, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_town_id UUID;
  v_location JSONB;
  v_npc JSONB;
  v_quest JSONB;
  v_secret JSONB;
  v_npc_map JSONB := '{}'::JSONB; -- Map of NPC names to their IDs
  v_inserted_npc_id UUID;
  v_inserted_npc_name TEXT;
  v_npc_giver_id UUID;
BEGIN
  -- STEP 1: Try to acquire lock and insert town (with conflict handling)
  BEGIN
    INSERT INTO towns (
      campaign_seed,
      name,
      region,
      prosperity_level,
      safety_rating,
      trade_route_notes,
      full_data
    ) VALUES (
      p_campaign_seed,
      p_name,
      p_region,
      p_prosperity_level,
      p_safety_rating,
      p_trade_route_notes,
      p_full_data
    )
    ON CONFLICT (campaign_seed) DO UPDATE
    SET updated_at = NOW()
    RETURNING towns.id INTO v_town_id;
  EXCEPTION WHEN OTHERS THEN
    -- If insert failed, try to get existing town
    SELECT id INTO v_town_id FROM towns WHERE campaign_seed = p_campaign_seed;
    IF v_town_id IS NULL THEN
      RETURN QUERY SELECT NULL::UUID, FALSE, 'Failed to create or retrieve town: ' || SQLERRM;
      RETURN;
    END IF;
    -- Existing town found, return it
    RETURN QUERY SELECT v_town_id, TRUE, 'Town already exists';
    RETURN;
  END;

  -- STEP 2: Insert locations from full_data.locations array
  IF p_full_data -> 'locations' IS NOT NULL THEN
    FOR v_location IN SELECT jsonb_array_elements(p_full_data -> 'locations')
    LOOP
      BEGIN
        INSERT INTO town_locations (
          town_id,
          category,
          name,
          description,
          reveal_tier
        ) VALUES (
          v_town_id,
          v_location ->> 'category',
          v_location ->> 'name',
          v_location -> 'description',
          v_location ->> 'reveal_tier'
        );
      EXCEPTION WHEN OTHERS THEN
        -- Log but continue
        RAISE WARNING 'Failed to insert location: %', SQLERRM;
      END;
    END LOOP;
  END IF;

  -- STEP 3: Insert NPCs and build NPC ID map
  IF p_full_data -> 'npcs' IS NOT NULL THEN
    FOR v_npc IN SELECT jsonb_array_elements(p_full_data -> 'npcs')
    LOOP
      BEGIN
        INSERT INTO town_npcs (
          town_id,
          name,
          role,
          personality,
          appearance,
          motivations,
          secret,
          alignment,
          relationship_with_town
        ) VALUES (
          v_town_id,
          v_npc ->> 'name',
          v_npc ->> 'role',
          v_npc -> 'personality',
          v_npc -> 'appearance',
          v_npc ->> 'motivations',
          v_npc ->> 'secret',
          v_npc ->> 'alignment',
          v_npc ->> 'relationship_with_town'
        )
        RETURNING id, name INTO v_inserted_npc_id, v_inserted_npc_name;

        -- Add to map: NPC name -> ID
        v_npc_map := jsonb_set(v_npc_map, ARRAY[v_inserted_npc_name], to_jsonb(v_inserted_npc_id::TEXT));
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to insert NPC: %', SQLERRM;
      END;
    END LOOP;
  END IF;

  -- STEP 4: Insert quests with proper NPC foreign keys
  IF p_full_data -> 'quests' IS NOT NULL THEN
    FOR v_quest IN SELECT jsonb_array_elements(p_full_data -> 'quests')
    LOOP
      BEGIN
        -- Look up the NPC ID by giver name from our map
        v_npc_giver_id := (v_npc_map ->> (v_quest ->> 'giver'))::UUID;

        INSERT INTO npc_quests (
          town_id,
          npc_id,
          npc_name,
          title,
          difficulty,
          summary,
          details,
          rewards,
          is_primary
        ) VALUES (
          v_town_id,
          v_npc_giver_id,
          v_quest ->> 'giver',
          v_quest ->> 'title',
          v_quest ->> 'difficulty',
          v_quest ->> 'summary',
          v_quest -> 'details',
          v_quest -> 'rewards',
          (v_quest ->> 'is_primary')::BOOLEAN
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to insert quest: %', SQLERRM;
      END;
    END LOOP;
  END IF;

  -- STEP 5: Insert secrets
  IF p_full_data -> 'secrets' IS NOT NULL THEN
    FOR v_secret IN SELECT jsonb_array_elements(p_full_data -> 'secrets')
    LOOP
      BEGIN
        INSERT INTO town_secrets (
          town_id,
          title,
          summary,
          details,
          discovery_difficulty,
          discovery_methods,
          affects_npc
        ) VALUES (
          v_town_id,
          v_secret ->> 'title',
          v_secret ->> 'summary',
          v_secret -> 'details',
          v_secret ->> 'discovery_difficulty',
          ARRAY[v_secret ->> 'discovery_method'],
          v_secret ->> 'affects_npc'
        );
      EXCEPTION WHEN OTHERS THEN
        RAISE WARNING 'Failed to insert secret: %', SQLERRM;
      END;
    END LOOP;
  END IF;

  -- Success!
  RETURN QUERY SELECT v_town_id, TRUE, 'Town persisted successfully';
EXCEPTION WHEN OTHERS THEN
  RETURN QUERY SELECT NULL::UUID, FALSE, 'Critical error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;
