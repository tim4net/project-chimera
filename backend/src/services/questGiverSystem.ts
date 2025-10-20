/**
 * @file Quest Giver System - NPC-based quest offering
 *
 * NEW RULES:
 * - One quest per NPC (they can only offer ONE quest ever, or until completed)
 * - Quests only offered when narratively appropriate (not random)
 * - Track which NPC offered which quest
 * - No spam - only offer when player explicitly asks or when contextually appropriate
 */

import { supabaseServiceClient } from './supabaseClient';
import type { CharacterRecord } from '../types';
import type { CharacterQuest, QuestTemplate } from '../types/quests';

// ============================================================================
// TYPES
// ============================================================================

export interface QuestGiver {
  id: string;
  name: string;
  quest_template_id: string | null;
  character_id: string; // Which character's campaign this NPC is in
  quest_offered: boolean; // Has this NPC already offered their quest?
  quest_completed: boolean; // Was the quest they offered completed?
  location: { x: number; y: number } | null;
  created_at: string;
}

export interface QuestOfferContext {
  npcName: string;
  npcId: string;
  quest: CharacterQuest;
  isNewNPC: boolean; // Is this the first time meeting this NPC?
}

// ============================================================================
// NPC MANAGEMENT
// ============================================================================

/**
 * Check if player is asking for quests/work
 */
export function isPlayerAskingForQuest(message: string): boolean {
  const normalized = message.toLowerCase();

  const questRequestPatterns = [
    /\b(any|got|have)\s+(work|jobs?|quests?|tasks?)\b/,
    /\b(looking for|need|want)\s+(work|a job|a quest|something to do)\b/,
    /\b(what can i do|how can i help|need.*help)\b/,
    /\b(hire me|employment|work available)\b/,
  ];

  return questRequestPatterns.some(pattern => pattern.test(normalized));
}

/**
 * Get or create an NPC quest giver - ONLY when player explicitly asks
 *
 * @param characterId - The player's character ID
 * @param npcName - Name mentioned in player's message or narrative
 * @param location - Current location (optional)
 * @returns Quest giver NPC, or null if no quest available
 */
export async function getOrCreateQuestGiver(
  characterId: string,
  npcName: string,
  location?: { x: number; y: number }
): Promise<QuestGiver | null> {
  // Check if this NPC already exists for this character
  const { data: existing, error: fetchError } = await supabaseServiceClient
    .from('quest_givers')
    .select('*')
    .eq('character_id', characterId)
    .eq('name', npcName)
    .maybeSingle();

  if (fetchError) {
    console.error('[QuestGiverSystem] Failed to fetch NPC:', fetchError);
    return null;
  }

  if (existing) {
    // NPC already exists - return them
    return existing as QuestGiver;
  }

  // Create new NPC (but DON'T auto-assign a quest yet)
  // Quest will be assigned when player explicitly asks
  const { data: newNPC, error: createError } = await supabaseServiceClient
    .from('quest_givers')
    .insert({
      character_id: characterId,
      name: npcName,
      quest_template_id: null, // No quest yet
      quest_offered: false,
      quest_completed: false,
      location
    })
    .select()
    .single();

  if (createError) {
    console.error('[QuestGiverSystem] Failed to create NPC:', createError);
    return null;
  }

  console.log(`[QuestGiverSystem] Created NPC: ${npcName} (no quest assigned yet)`);

  return newNPC as QuestGiver;
}

/**
 * Assign a quest to an NPC when they're about to offer it
 * This happens ONLY when:
 * 1. Player asks for work/quests
 * 2. Storyline requires it (DM-driven)
 */
export async function assignQuestToNPC(
  npc: QuestGiver,
  characterId: string
): Promise<boolean> {
  // Already has a quest assigned
  if (npc.quest_template_id) {
    return true;
  }

  // Get a random available template
  const template = await getRandomAvailableTemplate(characterId);

  if (!template) {
    console.log(`[QuestGiverSystem] No available quest templates for ${npc.name}`);
    return false;
  }

  // Assign the template to this NPC
  const { error } = await supabaseServiceClient
    .from('quest_givers')
    .update({ quest_template_id: template.id })
    .eq('id', npc.id);

  if (error) {
    console.error('[QuestGiverSystem] Failed to assign quest to NPC:', error);
    return false;
  }

  console.log(`[QuestGiverSystem] Assigned quest "${template.title_template}" to ${npc.name}`);

  // Update local object
  npc.quest_template_id = template.id;

  return true;
}

/**
 * Get a random quest template that hasn't been used in this campaign yet
 */
async function getRandomAvailableTemplate(characterId: string): Promise<QuestTemplate | null> {
  // Get all templates
  const { data: allTemplates, error: templatesError } = await supabaseServiceClient
    .from('quest_templates')
    .select('*');

  if (templatesError || !allTemplates || allTemplates.length === 0) {
    console.error('[QuestGiverSystem] Failed to fetch templates:', templatesError);
    return null;
  }

  // Get templates already used by NPCs in this campaign
  const { data: usedTemplates, error: usedError } = await supabaseServiceClient
    .from('quest_givers')
    .select('quest_template_id')
    .eq('character_id', characterId)
    .not('quest_template_id', 'is', null);

  if (usedError) {
    console.error('[QuestGiverSystem] Failed to fetch used templates:', usedError);
    return null;
  }

  const usedTemplateIds = new Set((usedTemplates || []).map(qt => qt.quest_template_id));

  // Filter out used templates
  const availableTemplates = allTemplates.filter(
    template => !usedTemplateIds.has(template.id)
  );

  if (availableTemplates.length === 0) {
    console.log('[QuestGiverSystem] All templates have been used in this campaign');
    return null;
  }

  // Return random available template
  return availableTemplates[Math.floor(Math.random() * availableTemplates.length)] as QuestTemplate;
}

// ============================================================================
// QUEST OFFERING
// ============================================================================

/**
 * Check if an NPC can offer a quest
 *
 * @param npc - The quest giver NPC
 * @returns true if this NPC can offer a quest
 */
export function canOfferQuest(npc: QuestGiver): boolean {
  // Can't offer if already offered
  if (npc.quest_offered) {
    return false;
  }

  // Can't offer if no template assigned
  if (!npc.quest_template_id) {
    return false;
  }

  return true;
}

/**
 * Offer a quest from an NPC to a character
 *
 * @param npc - The quest giver NPC
 * @param character - The player's character
 * @returns The created quest, or null if failed
 */
export async function offerQuestFromNPC(
  npc: QuestGiver,
  character: CharacterRecord
): Promise<QuestOfferContext | null> {
  // Verify NPC can offer a quest
  if (!canOfferQuest(npc)) {
    console.log(`[QuestGiverSystem] NPC ${npc.name} cannot offer a quest (already offered or no template)`);
    return null;
  }

  // Get the template
  const { data: template, error: templateError } = await supabaseServiceClient
    .from('quest_templates')
    .select('*')
    .eq('id', npc.quest_template_id)
    .single();

  if (templateError || !template) {
    console.error('[QuestGiverSystem] Failed to fetch template:', templateError);
    return null;
  }

  // Fill template with context
  const filledQuest = fillQuestTemplate(template as QuestTemplate, character);

  // Create quest in database
  const { data: quest, error: questError } = await supabaseServiceClient
    .from('character_quests')
    .insert({
      character_id: character.id,
      quest_giver_id: npc.id,
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

  if (questError) {
    console.error('[QuestGiverSystem] Failed to create quest:', questError);
    return null;
  }

  // Mark NPC as having offered their quest
  await supabaseServiceClient
    .from('quest_givers')
    .update({ quest_offered: true })
    .eq('id', npc.id);

  console.log(`[QuestGiverSystem] ${npc.name} offered quest: "${filledQuest.title}" to ${character.name}`);

  return {
    npcName: npc.name,
    npcId: npc.id,
    quest: quest as CharacterQuest,
    isNewNPC: true // First time offering
  };
}

/**
 * Fill quest template with contextual data
 */
function fillQuestTemplate(
  template: QuestTemplate,
  character: CharacterRecord
): { title: string; description: string; target: string } {
  switch (template.template_type) {
    case 'fetch':
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'wolf_pelt',
      };

    case 'clear':
      return {
        title: template.title_template,
        description: template.description_template,
        target: 'goblin',
      };

    case 'scout':
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
        target: 'next_settlement',
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
// QUEST DETECTION FROM NARRATIVE
// ============================================================================

/**
 * Detect if player's message suggests they're talking to an NPC who might offer a quest
 *
 * @param message - Player's message
 * @returns NPC name if detected, null otherwise
 */
export function detectQuestGiverInteraction(message: string): string | null {
  const normalized = message.toLowerCase();

  // Patterns that suggest NPC interaction
  const questPatterns = [
    /\b(talk to|speak with|ask|approach)\s+(?:the\s+)?(\w+)/i,
    /\b(\w+)\s+(?:offers?|mentions?|says?|tells?)\b/i,
    /\bquest\b.*\b(?:from|by)\s+(\w+)/i,
  ];

  for (const pattern of questPatterns) {
    const match = message.match(pattern);
    if (match && match[1]) {
      // Extract NPC name (basic heuristic)
      const potentialName = match[1];

      // Skip common words that aren't names
      const skipWords = ['the', 'a', 'an', 'to', 'with', 'for', 'quest', 'merchant', 'shopkeeper', 'guard'];
      if (!skipWords.includes(potentialName.toLowerCase())) {
        return potentialName.charAt(0).toUpperCase() + potentialName.slice(1);
      }
    }
  }

  return null;
}

/**
 * Extract NPC name from narrative (when narrator mentions an NPC offering something)
 */
export function extractNPCFromNarrative(narrative: string): string | null {
  // Look for patterns like "A merchant approaches" or "The goblin says"
  const npcPatterns = [
    /(?:a|an|the)\s+(\w+)\s+(?:approaches?|offers?|says?|asks?|mentions?)/i,
    /(\w+)\s+(?:the\s+)?(?:merchant|trader|farmer|guard|goblin|traveler)/i,
  ];

  for (const pattern of npcPatterns) {
    const match = narrative.match(pattern);
    if (match && match[1]) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  return null;
}
