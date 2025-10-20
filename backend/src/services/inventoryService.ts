/**
 * @file Inventory Service - Manage character equipment and items
 *
 * Handles:
 * - Equipping/unequipping items
 * - Using consumables (potions, scrolls)
 * - Dropping items
 * - Calculating equipment bonuses
 */

import { supabaseServiceClient } from './supabaseClient';
import type { EquipItemAction, UseItemAction, DropItemAction, ActionResult, StateChange } from '../types/actions';
import type { CharacterRecord } from '../types';
import { rollDice } from '../game/dice';

const RULE_ENGINE_VERSION = '1.0.0';

// ============================================================================
// EQUIP ITEM
// ============================================================================

export async function executeEquipItem(
  action: EquipItemAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Get item from database
  const { data: item, error: itemError } = await supabaseServiceClient
    .from('game_items')
    .select('*')
    .eq('id', action.itemId)
    .eq('character_id', character.id)
    .single();

  if (itemError || !item) {
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: RULE_ENGINE_VERSION,
        timestamp: Date.now(),
      },
      narrativeContext: {
        summary: 'You don\'t have that item!',
        mood: 'defeat',
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  // Unequip current item in slot (if any)
  await supabaseServiceClient
    .from('game_items')
    .update({ equipped: false })
    .eq('character_id', character.id)
    .eq('equipped', true)
    .eq('type', item.type); // Unequip same type

  // Equip new item
  await supabaseServiceClient
    .from('game_items')
    .update({ equipped: true })
    .eq('id', action.itemId);

  const stateChanges: StateChange[] = [{
    entityId: character.id,
    entityType: 'character',
    field: 'equipped_items',
    oldValue: 'previous_item',
    newValue: item.name,
  }];

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: `You equip the ${item.name}.`,
      mood: 'neutral',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// USE ITEM
// ============================================================================

export async function executeUseItem(
  action: UseItemAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Get item
  const { data: item, error: itemError } = await supabaseServiceClient
    .from('game_items')
    .select('*')
    .eq('id', action.itemId)
    .eq('character_id', character.id)
    .single();

  if (itemError || !item) {
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: RULE_ENGINE_VERSION,
        timestamp: Date.now(),
      },
      narrativeContext: {
        summary: 'You don\'t have that item!',
        mood: 'defeat',
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  const stateChanges: StateChange[] = [];
  let summary = `You use the ${item.name}.`;

  // Handle item effects based on type
  if (item.type === 'potion') {
    // Healing potion
    const healingDice = item.properties?.healing || '2d4+2';
    const healRoll = rollDice(healingDice);
    const healAmount = Math.min(healRoll.total, character.hp_max - character.hp_current);

    stateChanges.push({
      entityId: character.id,
      entityType: 'character',
      field: 'hp_current',
      oldValue: character.hp_current,
      newValue: character.hp_current + healAmount,
      delta: healAmount,
    });

    summary = `You drink the ${item.name} and recover ${healAmount} HP!`;
  }

  // Consume item (reduce quantity or delete)
  if (item.quantity > 1) {
    await supabaseServiceClient
      .from('game_items')
      .update({ quantity: item.quantity - 1 })
      .eq('id', action.itemId);
  } else {
    await supabaseServiceClient
      .from('game_items')
      .delete()
      .eq('id', action.itemId);
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges,
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary,
      mood: 'neutral',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}

// ============================================================================
// DROP ITEM
// ============================================================================

export async function executeDropItem(
  action: DropItemAction,
  character: CharacterRecord
): Promise<ActionResult> {
  const startTime = Date.now();

  // Delete item from inventory
  const { data: deleted, error } = await supabaseServiceClient
    .from('game_items')
    .delete()
    .eq('id', action.itemId)
    .eq('character_id', character.id)
    .select()
    .single();

  if (error || !deleted) {
    return {
      actionId: action.actionId,
      success: false,
      outcome: 'failure',
      rolls: {},
      stateChanges: [],
      source: {
        action,
        ruleEngineVersion: RULE_ENGINE_VERSION,
        timestamp: Date.now(),
      },
      narrativeContext: {
        summary: 'You don\'t have that item!',
        mood: 'defeat',
      },
      executionTimeMs: Date.now() - startTime,
    };
  }

  return {
    actionId: action.actionId,
    success: true,
    outcome: 'success',
    rolls: {},
    stateChanges: [],
    source: {
      action,
      ruleEngineVersion: RULE_ENGINE_VERSION,
      timestamp: Date.now(),
    },
    narrativeContext: {
      summary: `You drop the ${deleted.name}.`,
      mood: 'neutral',
    },
    createJournalEntry: false,
    executionTimeMs: Date.now() - startTime,
  };
}
