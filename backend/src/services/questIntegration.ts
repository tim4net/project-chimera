/**
 * @file Quest Integration - Connects quest system with DM chat
 *
 * Handles:
 * - Offering quests through DM conversation
 * - Tracking quest progress from player actions
 * - Including quest context in DM prompts
 */

import type { CharacterRecord } from '../types';
import type { CharacterQuest } from '../types/quests';
import { getActiveQuests, shouldOfferQuest, generateRadiantQuest } from './questGenerator';

// ============================================================================
// QUEST CONTEXT FOR DM PROMPTS
// ============================================================================

/**
 * Build quest context string for LLM prompt
 */
export async function getQuestContext(character: CharacterRecord): Promise<string> {
  const activeQuests = await getActiveQuests(character.id);

  if (activeQuests.length === 0) {
    return 'No active quests.';
  }

  let context = 'ACTIVE QUESTS (already accepted):\n';

  activeQuests.forEach((quest, index) => {
    context += `\n${index + 1}. ${quest.title}\n`;
    context += `   Description: ${quest.description}\n`;
    context += `   Progress: ${quest.current_progress}/${quest.target_quantity}\n`;
    context += `   Reward: ${quest.xp_reward} XP, ${quest.gold_reward} gold\n`;
  });

  context += '\n⚠️ IMPORTANT: These quests are ALREADY ACTIVE. ';
  context += 'DO NOT narrate them as being offered again. ';
  context += 'Only mention them if the player asks about their quests or if they make progress.';

  return context;
}

/**
 * Check if DM should offer a new quest and generate it
 */
export async function maybeOfferQuest(character: CharacterRecord): Promise<CharacterQuest | null> {
  const should = await shouldOfferQuest(character);

  if (!should) {
    return null;
  }

  // Random chance to offer quest (30% when appropriate)
  if (Math.random() > 0.3) {
    return null;
  }

  const quest = await generateRadiantQuest(character);

  if (quest) {
    console.log(`[QuestIntegration] Offering quest to ${character.name}: "${quest.title}"`);
  }

  return quest;
}

/**
 * Build quest offering prompt for LLM
 */
export function buildQuestOfferPrompt(quest: CharacterQuest): string {
  return `
⭐ NEW QUEST TO OFFER (This is NEW, not already active):

Title: "${quest.title}"
Description: ${quest.description}
Objective: ${quest.objective_type === 'collect_items' ? 'Collect' : quest.objective_type === 'kill_enemies' ? 'Defeat' : 'Reach'} ${quest.target_quantity} ${quest.objective_target || 'targets'}
Rewards: ${quest.xp_reward} XP, ${quest.gold_reward} gold

INSTRUCTIONS:
- The player JUST asked for work/quests, so offer this quest NOW
- Have an NPC (merchant, guard, farmer, etc.) offer it
- Make it feel natural and organic
- This quest is NEW - do NOT confuse it with any already-active quests above
- The player doesn't need to explicitly "accept" - it's automatically added

Example: "A worried farmer approaches: 'You're looking for work? Perfect timing!
Wolves have been attacking my livestock. If you could bring me 5 wolf pelts,
I'll pay you 100 XP and 25 gold!'"
`;
}
