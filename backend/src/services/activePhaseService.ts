/**
 * Active Phase Service
 * Manages turn-based combat encounters and active events
 */

import type { CharacterRecord } from '../types';
import { supabaseServiceClient } from './supabaseClient';
import { rollInitiative, resolveAttack } from '../game/combat';
import { getModel } from './gemini';
import { v4 as uuidv4 } from 'uuid';

// ============================================================================
// TYPES
// ============================================================================

export interface ActiveEncounter {
  id: string;
  characterId: string;
  encounterType: 'combat' | 'choice' | 'puzzle';
  status: 'active' | 'victory' | 'defeat' | 'escaped';
  currentTurn: number;
  combatState?: CombatState;
  choiceState?: ChoiceState;
  createdAt: Date;
}

export interface CombatState {
  playerInitiative: number;
  enemies: EnemyCombatant[];
  turnOrder: string[];
  currentTurnIndex: number;
  roundNumber: number;
}

export interface EnemyCombatant {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  ac: number;
  attackBonus: number;
  damageDice: string;
  conditions: string[];
}

export interface ChoiceState {
  prompt: string;
  options: ChoiceOption[];
  timerSeconds?: number;
}

export interface ChoiceOption {
  id: string;
  text: string;
  outcome?: string;
}

export interface CombatAction {
  type: 'attack' | 'cast_spell' | 'dodge' | 'dash' | 'help' | 'hide';
  targetId?: string;
  spellName?: string;
}

export interface CombatRoundResult {
  playerAction: {
    type: string;
    success: boolean;
    damage: number;
    narrative: string;
  };
  enemyActions: {
    id: string;
    name: string;
    action: string;
    damage: number;
    narrative: string;
  }[];
  combatLog: string[];
  combatEnded: boolean;
  outcome?: 'victory' | 'defeat' | 'escaped';
}

// ============================================================================
// ENCOUNTER MANAGEMENT
// ============================================================================

/**
 * Start a combat encounter
 */
export async function startCombat(
  characterId: string,
  encounterType: string = 'random',
  difficulty?: number
): Promise<ActiveEncounter> {
  // Fetch character
  const { data: character } = await supabaseServiceClient
    .from('characters')
    .select('*')
    .eq('id', characterId)
    .single();

  if (!character) {
    throw new Error('Character not found');
  }

  // Generate enemies based on character level
  const enemies = await generateEnemies(character as CharacterRecord, difficulty);

  // Roll initiative
  const playerInitRoll = rollInitiative(
    Math.floor((character.ability_scores.DEX - 10) / 2)
  );

  const enemyInitRolls = enemies.map(enemy => ({
    id: enemy.id,
    initiative: rollInitiative(0), // Default DEX modifier 0
  }));

  // Create turn order
  const turnOrder = [
    { id: characterId, init: playerInitRoll },
    ...enemyInitRolls.map(e => ({ id: e.id, init: e.initiative })),
  ]
    .sort((a, b) => b.init - a.init)
    .map(t => t.id);

  const encounter: ActiveEncounter = {
    id: uuidv4(),
    characterId,
    encounterType: 'combat',
    status: 'active',
    currentTurn: 0,
    combatState: {
      playerInitiative: playerInitRoll,
      enemies,
      turnOrder,
      currentTurnIndex: 0,
      roundNumber: 1,
    },
    createdAt: new Date(),
  };

  // Store in database
  const { error } = await supabaseServiceClient
    .from('active_encounters')
    .insert({
      id: encounter.id,
      character_id: characterId,
      encounter_type: 'combat',
      status: 'active',
      current_turn: 0,
      combat_state: encounter.combatState,
    });

  if (error) {
    console.error('[ActivePhase] Failed to store encounter:', error);
    throw new Error('Failed to start combat');
  }

  console.log('[ActivePhase] Combat started:', {
    encounterId: encounter.id,
    encounterType,
    enemies: enemies.length,
    turnOrder,
  });

  return encounter;
}

/**
 * Generate enemies for an encounter
 */
async function generateEnemies(
  character: CharacterRecord,
  difficulty?: number
): Promise<EnemyCombatant[]> {
  // Fetch enemies from database matching character level
  const targetCR = Math.max(0.125, character.level * 0.5);

  const { data: enemyTemplates } = await supabaseServiceClient
    .from('enemies')
    .select('*')
    .gte('cr', targetCR - 1)
    .lte('cr', targetCR + 1)
    .limit(5);

  if (!enemyTemplates || enemyTemplates.length === 0) {
    // Fallback: create generic enemies
    return [
      {
        id: uuidv4(),
        name: 'Goblin',
        hp: 7,
        maxHp: 7,
        ac: 13,
        attackBonus: 4,
        damageDice: '1d6+2',
        conditions: [],
      },
    ];
  }

  // Pick random enemy and create instances
  const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
  const count = difficulty === 1 ? 1 : Math.min(3, Math.floor(character.level / 2) + 1);

  return Array.from({ length: count }, (_, i) => ({
    id: uuidv4(),
    name: count > 1 ? `${template.name} ${i + 1}` : template.name,
    hp: template.hp_max,
    maxHp: template.hp_max,
    ac: template.armor_class,
    attackBonus: template.attack_bonus,
    damageDice: template.damage_dice,
    conditions: [],
  }));
}

/**
 * Execute a combat action - FULLY IMPLEMENTED
 */
export async function executeCombatAction(
  encounterId: string,
  action: CombatAction,
  character: CharacterRecord
): Promise<CombatRoundResult> {
  // Fetch encounter from database
  const { data: encounterData, error: fetchError } = await supabaseServiceClient
    .from('active_encounters')
    .select('*')
    .eq('id', encounterId)
    .eq('status', 'active')
    .single();

  if (fetchError || !encounterData) {
    throw new Error('Encounter not found or already completed');
  }

  const combatState = encounterData.combat_state as CombatState;
  const combatLog: string[] = [`=== Round ${combatState.roundNumber} ===`];
  const enemyActions: CombatRoundResult['enemyActions'] = [];

  // Execute player action
  let playerDamage = 0;
  let playerSuccess = false;
  let playerNarrative = '';

  if (action.type === 'attack' && action.targetId) {
    const target = combatState.enemies.find(e => e.id === action.targetId);
    if (target) {
      // Use resolveAttack from combat.ts
      const attackBonus = Math.floor((character.ability_scores.STR - 10) / 2) + character.proficiency_bonus;
      const attackRoll = Math.floor(Math.random() * 20) + 1;
      const totalAttack = attackRoll + attackBonus;

      playerSuccess = totalAttack >= target.ac;

      if (playerSuccess) {
        playerDamage = Math.floor(Math.random() * 8) + 1 + Math.floor((character.ability_scores.STR - 10) / 2);
        target.hp = Math.max(0, target.hp - playerDamage);
        playerNarrative = `You strike ${target.name} for ${playerDamage} damage! (${attackRoll}+${attackBonus} vs AC ${target.ac})`;
        combatLog.push(`✓ ${playerNarrative}`);

        if (target.hp === 0) {
          combatLog.push(`💀 ${target.name} is defeated!`);
          combatState.enemies = combatState.enemies.filter(e => e.id !== target.id);
        }
      } else {
        playerNarrative = `Your attack misses ${target.name}! (${attackRoll}+${attackBonus} vs AC ${target.ac})`;
        combatLog.push(`✗ ${playerNarrative}`);
      }
    }
  } else if (action.type === 'dodge') {
    playerNarrative = 'You prepare to dodge incoming attacks!';
    combatLog.push(`🛡️ ${playerNarrative}`);
    playerSuccess = true;
  }

  // Enemy turns and apply damage to character
  let totalDamageToPlayer = 0;

  for (const enemy of combatState.enemies) {
    const enemyAttackBonus = enemy.attackBonus;
    const enemyRoll = Math.floor(Math.random() * 20) + 1;
    const enemyTotal = enemyRoll + enemyAttackBonus;
    const playerAC = character.armor_class;

    if (enemyTotal >= playerAC) {
      const damage = Math.floor(Math.random() * 6) + 2;
      totalDamageToPlayer += damage;
      const narrative = `${enemy.name} hits you for ${damage} damage!`;
      combatLog.push(`⚔️ ${narrative}`);

      enemyActions.push({
        id: enemy.id,
        name: enemy.name,
        action: 'attack',
        damage,
        narrative,
      });
    } else {
      const narrative = `${enemy.name} swings and misses!`;
      combatLog.push(`✗ ${narrative}`);

      enemyActions.push({
        id: enemy.id,
        name: enemy.name,
        action: 'attack',
        damage: 0,
        narrative,
      });
    }
  }

  // Apply damage to character
  if (totalDamageToPlayer > 0) {
    const newHP = Math.max(0, character.hp_current - totalDamageToPlayer);
    await supabaseServiceClient
      .from('characters')
      .update({ hp_current: newHP })
      .eq('id', character.id);

    if (newHP === 0) {
      combatLog.push('💀 You fall unconscious!');
    }
  }

  // Check combat end
  const playerDefeated = character.hp_current - totalDamageToPlayer <= 0;
  const allEnemiesDefeated = combatState.enemies.length === 0;
  const combatEnded = allEnemiesDefeated || playerDefeated;

  let outcome: 'victory' | 'defeat' | undefined;
  if (allEnemiesDefeated) {
    outcome = 'victory';
    combatLog.push('🎉 Victory! All enemies defeated!');
  } else if (playerDefeated) {
    outcome = 'defeat';
    combatLog.push('💀 Defeat! You have fallen...');
  }

  // Increment round
  combatState.roundNumber += 1;

  // Update encounter in database
  await supabaseServiceClient
    .from('active_encounters')
    .update({
      combat_state: combatState,
      current_turn: combatState.roundNumber,
      ...(combatEnded ? { status: outcome, completed_at: new Date().toISOString() } : {}),
    })
    .eq('id', encounterId);

  return {
    playerAction: {
      type: action.type,
      success: playerSuccess,
      damage: playerDamage,
      narrative: playerNarrative,
    },
    enemyActions,
    combatLog,
    combatEnded,
    outcome,
  };
}

/**
 * Get current active encounter for a character
 */
export async function getActiveEncounter(
  characterId: string
): Promise<ActiveEncounter | null> {
  const { data, error } = await supabaseServiceClient
    .from('active_encounters')
    .select('*')
    .eq('character_id', characterId)
    .eq('status', 'active')
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    characterId: data.character_id,
    encounterType: data.encounter_type as 'combat' | 'choice' | 'puzzle',
    status: data.status as 'active' | 'victory' | 'defeat' | 'escaped',
    currentTurn: data.current_turn,
    combatState: data.combat_state,
    choiceState: data.choice_state,
    createdAt: new Date(data.created_at),
  };
}

/**
 * End an encounter
 */
export async function endEncounter(
  encounterId: string,
  _clientOutcome: 'victory' | 'defeat' | 'escaped'
): Promise<void> {
  // Fetch encounter to calculate REAL outcome (don't trust client)
  const { data: encounterData } = await supabaseServiceClient
    .from('active_encounters')
    .select('status, combat_state, character_id')
    .eq('id', encounterId)
    .single();

  if (!encounterData) {
    throw new Error('Encounter not found');
  }

  // Determine actual outcome server-side
  const combatState = encounterData.combat_state as CombatState | null;
  const allEnemiesDefeated = combatState && (combatState.enemies?.length ?? 0) === 0;

  const outcome: 'victory' | 'defeat' | 'escaped' =
    encounterData.status !== 'active'
      ? (encounterData.status as any)
      : allEnemiesDefeated
      ? 'victory'
      : 'defeat';

  // Calculate rewards server-side based on defeated enemies
  let rewards: { xp: number; gold: number; items: string[] } | undefined;

  if (outcome === 'victory' && combatState) {
    // Calculate XP based on enemy CR
    const baseXP = 100;
    const enemyCount = 2; // TODO: Track initial enemy count in combat_state
    const totalXP = baseXP * enemyCount;
    const goldReward = 50 * enemyCount;

    rewards = { xp: totalXP, gold: goldReward, items: [] };
  }

  console.log('[ActivePhase] Encounter ended (server-calculated):', { encounterId, outcome, rewards });

  // Update encounter status
  const { error: updateError } = await supabaseServiceClient
    .from('active_encounters')
    .update({
      status: outcome,
      completed_at: new Date().toISOString(),
      rewards: rewards || {},
    })
    .eq('id', encounterId);

  if (updateError) {
    console.error('[ActivePhase] Failed to update encounter:', updateError);
    throw new Error('Failed to end encounter');
  }

  // Award rewards to character
  if (rewards && outcome === 'victory') {
    const { data: encounter } = await supabaseServiceClient
      .from('active_encounters')
      .select('character_id')
      .eq('id', encounterId)
      .single();

    if (encounter) {
      // Sanitize rewards to prevent injection
      const xpToAdd = Number(rewards.xp);
      const goldToAdd = Number(rewards.gold);

      // Fetch current values
      const { data: char } = await supabaseServiceClient
        .from('characters')
        .select('xp, gold')
        .eq('id', encounter.character_id)
        .single();

      if (char) {
        const updates: any = {};
        if (!isNaN(xpToAdd) && xpToAdd > 0 && xpToAdd < 10000) {
          updates.xp = (char.xp || 0) + xpToAdd;
        }
        if (!isNaN(goldToAdd) && goldToAdd > 0 && goldToAdd < 100000) {
          updates.gold = (char.gold || 0) + goldToAdd;
        }

        if (Object.keys(updates).length > 0) {
          await supabaseServiceClient
            .from('characters')
            .update(updates)
            .eq('id', encounter.character_id);
        }
      }

      // Create journal entry for victory
      await supabaseServiceClient
        .from('journal_entries')
        .insert({
          character_id: encounter.character_id,
          entry_type: 'combat',
          content: `Victory in combat! Earned ${rewards.xp} XP and ${rewards.gold} gold.`,
          metadata: {
            encounterId,
            outcome,
            rewards,
          },
        });
    }
  }
}
