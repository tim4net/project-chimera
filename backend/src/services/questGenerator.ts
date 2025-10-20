/**
 * @file Quest Generator - Layer 1 (Radiant Quests)
 *
 * Generates template-based quests filled with contextual data
 * (nearby locations, available enemies, etc.)
 */

import { supabaseServiceClient } from '../services/supabaseClient';
import type { QuestTemplate, CharacterQuest } from '../types/quests';
import type { CharacterRecord } from '../types';

// ============================================================================
// GENERATE QUEST FROM TEMPLATE
// ============================================================================

/**
 * Generate a quest for a character from a random template
 */
export async function generateRadiantQuest(
  character: CharacterRecord
): Promise<CharacterQuest | null> {

  // Step 1: Get random template
  const { data: templates, error } = await supabaseServiceClient
    .from('quest_templates')
    .select('*')
    .limit(10);

  if (error || !templates || templates.length === 0) {
    console.error('[QuestGenerator] Failed to fetch templates:', error);
    return null;
  }

  // Pick random template
  const template = templates[Math.floor(Math.random() * templates.length)] as QuestTemplate;

  // Step 2: Fill template with context
  const filledQuest = await fillQuestTemplate(template, character);

  // Step 3: Create quest in database
  const { data: quest, error: insertError } = await supabaseServiceClient
    .from('character_quests')
    .insert({
      character_id: character.id,
      template_id: template.id,
      title: filledQuest.title,
      description: filledQuest.description,
      objective_type: template.objective_type,
      objective_target: filledQuest.target,
      current_progress: 0,
      target_quantity: template.target_quantity,
      status: 'active',
      xp_reward: template.base_xp_reward,
      gold_reward: template.base_gold_reward,
      item_rewards: [],
    })
    .select()
    .single();

  if (insertError) {
    console.error('[QuestGenerator] Failed to create quest:', insertError);
    return null;
  }

  console.log(`[QuestGenerator] Created quest: "${filledQuest.title}" for ${character.name}`);

  return quest as CharacterQuest;
}

/**
 * Fill quest template with contextual data
 */
async function fillQuestTemplate(
  template: QuestTemplate,
  character: CharacterRecord
): Promise<{ title: string; description: string; target: string }> {

  // For MVP, use simple templates
  // TODO: Query nearby POIs, actual enemy types, etc.

  switch (template.template_type) {
    case 'fetch':
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'wolf_pelt', // TODO: Dynamic based on biome
      };

    case 'clear':
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'goblin', // TODO: Dynamic based on nearby enemies
      };

    case 'scout':
      // Generate coordinates near player
      const targetX = character.position.x + (Math.random() > 0.5 ? 5 : -5);
      const targetY = character.position.y + (Math.random() > 0.5 ? 5 : -5);

      return {
        title: template.title_template,
        description: `Travel to coordinates (${targetX}, ${targetY}) and report your findings.`,
        target: `${targetX},${targetY}`,
      };

    case 'deliver':
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'next_settlement', // TODO: Find actual settlement
      };

    default:
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'unknown',
      };
  }
}

// ============================================================================
// QUEST PROGRESS TRACKING
// ============================================================================

/**
 * Update quest progress based on player actions
 */
export async function updateQuestProgress(
  characterId: string,
  actionType: string,
  actionTarget?: string
): Promise<void> {

  // Get active quests for character
  const { data: quests, error } = await supabaseServiceClient
    .from('character_quests')
    .select('*')
    .eq('character_id', characterId)
    .eq('status', 'active');

  if (error || !quests) {
    return;
  }

  for (const quest of quests as CharacterQuest[]) {
    let progressMade = false;
    let newProgress = quest.current_progress;

    // Check if action contributes to quest
    switch (quest.objective_type) {
      case 'collect_items':
        // TODO: Check if actionTarget matches quest.objective_target
        if (actionType === 'loot_item' && actionTarget === quest.objective_target) {
          newProgress += 1;
          progressMade = true;
        }
        break;

      case 'kill_enemies':
        if (actionType === 'kill_enemy' && actionTarget === quest.objective_target) {
          newProgress += 1;
          progressMade = true;
        }
        break;

      case 'reach_location':
        // Check if player reached target coordinates
        if (actionType === 'reach_location' && actionTarget === quest.objective_target) {
          newProgress = quest.target_quantity; // Complete immediately
          progressMade = true;
        }
        break;
    }

    if (progressMade) {
      // Update progress
      const completed = newProgress >= quest.target_quantity;

      await supabaseServiceClient
        .from('character_quests')
        .update({
          current_progress: newProgress,
          status: completed ? 'completed' : 'active',
          completed_at: completed ? new Date().toISOString() : null,
        })
        .eq('id', quest.id);

      console.log(`[QuestProgress] ${quest.title}: ${newProgress}/${quest.target_quantity}${completed ? ' ✅ COMPLETED' : ''}`);

      // Award rewards if completed
      if (completed) {
        await awardQuestRewards(characterId, quest);
      }
    }
  }
}

/**
 * Award quest rewards to character
 */
async function awardQuestRewards(
  characterId: string,
  quest: CharacterQuest
): Promise<void> {

  console.log(`[QuestRewards] Awarding rewards for "${quest.title}"`);

  // Award XP
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('xp')
    .eq('id', characterId)
    .single();

  if (character) {
    await supabaseServiceClient
      .from('characters')
      .update({ xp: (character.xp || 0) + quest.xp_reward })
      .eq('id', characterId);
  }

  // Award Gold
  const { data: charGold } = await supabaseServiceClient
    .from('characters')
    .select('gold')
    .eq('id', characterId)
    .single();

  if (charGold) {
    await supabaseServiceClient
      .from('characters')
      .update({ gold: (charGold.gold || 0) + quest.gold_reward })
      .eq('id', characterId);
  }

  // TODO: Award items

  console.log(`[QuestRewards] Awarded: ${quest.xp_reward} XP, ${quest.gold_reward} gold`);

  // Create journal entry
  await supabaseServiceClient
    .from('journal_entries')
    .insert({
      character_id: characterId,
      entry_type: 'quest',
      content: `Completed quest: ${quest.title}! Gained ${quest.xp_reward} XP and ${quest.gold_reward} gold.`,
      metadata: {
        quest_id: quest.id,
        rewards: {
          xp: quest.xp_reward,
          gold: quest.gold_reward,
        },
      },
    });
}

// ============================================================================
// QUEST OFFERING (DM Chat Integration)
// ============================================================================

/**
 * Check if DM should offer a quest (based on player context)
 */
export async function shouldOfferQuest(character: CharacterRecord): Promise<boolean> {
  // Get active quest count
  const { data: activeQuests, error } = await supabaseServiceClient
    .from('character_quests')
    .select('id')
    .eq('character_id', character.id)
    .eq('status', 'active');

  if (error) return false;

  // Offer quest if player has fewer than 3 active quests
  const activeCount = activeQuests?.length || 0;
  return activeCount < 3;
}

/**
 * Get active quests for character
 */
export async function getActiveQuests(characterId: string): Promise<CharacterQuest[]> {
  const { data, error } = await supabaseServiceClient
    .from('character_quests')
    .select('*')
    .eq('character_id', characterId)
    .eq('status', 'active')
    .order('accepted_at', { ascending: false });

  if (error) {
    console.error('[QuestSystem] Failed to fetch active quests:', error);
    return [];
  }

  return (data as CharacterQuest[]) || [];
}
