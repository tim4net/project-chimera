/**
 * @file D&D 5e Trap Mechanics
 *
 * This module provides trap detection, disarming, and triggering mechanics
 * including common trap types and their effects.
 */

import { rollDice, rollAbilityCheck, rollSavingThrow } from './dice';
import type { AbilityScores } from '../types/index';
import type { DamageType, Ability } from './hazards';

// --- TYPE DEFINITIONS ---

/** Condition effects from traps */
export type Condition =
  | 'blinded'
  | 'charmed'
  | 'deafened'
  | 'frightened'
  | 'grappled'
  | 'incapacitated'
  | 'invisible'
  | 'paralyzed'
  | 'petrified'
  | 'poisoned'
  | 'prone'
  | 'restrained'
  | 'stunned'
  | 'unconscious';

/** Trap trigger types */
export type TriggerType = 'pressure_plate' | 'tripwire' | 'door' | 'chest' | 'magical' | 'proximity';

/** Trap severity levels */
export type TrapSeverity = 'setback' | 'dangerous' | 'deadly';

/** Effect of a triggered trap */
export interface TrapEffect {
  damage?: {
    notation: string; // Dice notation (e.g., "4d10")
    type: DamageType;
  };
  savingThrow?: {
    ability: Ability;
    dc: number;
    successEffect: 'half' | 'none' | 'partial';
  };
  condition?: {
    type: Condition;
    duration: string; // e.g., "1 minute", "until saved", "permanent"
    saveDC?: number;
  };
  special?: string; // Special effects (teleportation, summons, etc.)
}

/** Complete trap definition */
export interface Trap {
  name: string;
  severity: TrapSeverity;
  trigger: TriggerType;
  detectDC: number; // Perception or Investigation DC
  disarmDC: number; // Sleight of Hand or Thieves' Tools DC
  effect: TrapEffect;
  description: string;
  resetable?: boolean; // Can the trap reset after triggering?
}

/** Result of trap detection attempt */
export interface TrapDetectionResult {
  detected: boolean;
  roll: number;
  dc: number;
  margin: number; // How much they beat/missed the DC by
}

/** Result of trap disarm attempt */
export interface TrapDisarmResult {
  disarmed: boolean;
  roll: number;
  dc: number;
  triggered: boolean; // Did failing trigger the trap?
  margin: number;
}

/** Result of triggered trap */
export interface TrapTriggerResult {
  damage: number;
  damageType?: DamageType;
  saved: boolean;
  conditionApplied?: Condition;
  description: string;
}

// --- COMMON TRAPS ---

/**
 * Library of common D&D 5e traps from DMG p.122-123
 */
export const COMMON_TRAPS: Record<string, Trap> = {
  pit_trap_basic: {
    name: 'Pit Trap (10 ft)',
    severity: 'setback',
    trigger: 'pressure_plate',
    detectDC: 15,
    disarmDC: 10,
    effect: {
      damage: {
        notation: '1d6',
        type: 'bludgeoning'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 10,
        successEffect: 'none' // Success = avoid falling in
      }
    },
    description: 'A 10-foot-deep pit opens beneath the victim',
    resetable: false
  },
  pit_trap_spiked: {
    name: 'Spiked Pit Trap',
    severity: 'dangerous',
    trigger: 'pressure_plate',
    detectDC: 15,
    disarmDC: 15,
    effect: {
      damage: {
        notation: '2d6+4d6', // 2d6 falling + 4d6 spikes
        type: 'piercing'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 13,
        successEffect: 'none'
      }
    },
    description: 'A 20-foot-deep pit with spikes at the bottom',
    resetable: false
  },
  poison_dart: {
    name: 'Poison Dart Trap',
    severity: 'dangerous',
    trigger: 'tripwire',
    detectDC: 15,
    disarmDC: 15,
    effect: {
      damage: {
        notation: '1d4+3d6', // 1d4 piercing + 3d6 poison
        type: 'poison'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 13,
        successEffect: 'half'
      }
    },
    description: 'Hidden dart launcher fires a poisoned dart',
    resetable: true
  },
  swinging_blade: {
    name: 'Swinging Blade Trap',
    severity: 'deadly',
    trigger: 'pressure_plate',
    detectDC: 20,
    disarmDC: 15,
    effect: {
      damage: {
        notation: '4d10',
        type: 'slashing'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 15,
        successEffect: 'half'
      }
    },
    description: 'A massive blade swings down from the ceiling',
    resetable: true
  },
  falling_net: {
    name: 'Falling Net',
    severity: 'setback',
    trigger: 'tripwire',
    detectDC: 10,
    disarmDC: 10,
    effect: {
      savingThrow: {
        ability: 'DEX',
        dc: 10,
        successEffect: 'none'
      },
      condition: {
        type: 'restrained',
        duration: 'until escaped',
        saveDC: 10
      }
    },
    description: 'A net falls from above, restraining the victim',
    resetable: false
  },
  fire_breathing_statue: {
    name: 'Fire-Breathing Statue',
    severity: 'dangerous',
    trigger: 'proximity',
    detectDC: 15,
    disarmDC: 15,
    effect: {
      damage: {
        notation: '4d6',
        type: 'fire'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 13,
        successEffect: 'half'
      }
    },
    description: 'A statue breathes fire in a 15-foot cone',
    resetable: true
  },
  sleep_gas: {
    name: 'Sleep Gas Trap',
    severity: 'dangerous',
    trigger: 'door',
    detectDC: 15,
    disarmDC: 15,
    effect: {
      savingThrow: {
        ability: 'CON',
        dc: 15,
        successEffect: 'none'
      },
      condition: {
        type: 'unconscious',
        duration: '1 minute',
        saveDC: 15
      }
    },
    description: 'Gas fills the room, causing sleep',
    resetable: false
  },
  lightning_bolt: {
    name: 'Lightning Bolt Trap',
    severity: 'deadly',
    trigger: 'magical',
    detectDC: 17,
    disarmDC: 20,
    effect: {
      damage: {
        notation: '8d6',
        type: 'lightning'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 15,
        successEffect: 'half'
      }
    },
    description: 'A bolt of lightning shoots from a magical glyph',
    resetable: true
  },
  collapsing_ceiling: {
    name: 'Collapsing Ceiling',
    severity: 'deadly',
    trigger: 'pressure_plate',
    detectDC: 15,
    disarmDC: 20,
    effect: {
      damage: {
        notation: '8d6',
        type: 'bludgeoning'
      },
      savingThrow: {
        ability: 'DEX',
        dc: 15,
        successEffect: 'half'
      },
      special: 'Affects all creatures in 10-foot radius'
    },
    description: 'The ceiling collapses, crushing everything below',
    resetable: false
  },
  poisoned_needle: {
    name: 'Poisoned Needle (Lock)',
    severity: 'setback',
    trigger: 'chest',
    detectDC: 20,
    disarmDC: 15,
    effect: {
      damage: {
        notation: '1+2d10', // 1 piercing + 2d10 poison
        type: 'poison'
      },
      savingThrow: {
        ability: 'CON',
        dc: 11,
        successEffect: 'half'
      }
    },
    description: 'A poisoned needle springs from the lock',
    resetable: false
  }
};

// --- TRAP MECHANICS ---

/**
 * Attempts to detect a trap using Perception or Investigation.
 * PHB p.177-178: Perception to notice, Investigation to deduce.
 * @param trap - The trap to detect
 * @param abilityScores - Character's ability scores
 * @param proficient - Is the character proficient in Perception/Investigation?
 * @param proficiencyBonus - Character's proficiency bonus
 * @param options - Optional RNG for deterministic results
 */
export function attemptTrapDetection(
  trap: Trap,
  abilityScores: AbilityScores,
  proficient: boolean,
  proficiencyBonus: number,
  options?: { rng?: () => number; advantage?: boolean }
): TrapDetectionResult {
  // Use WIS for Perception (most common trap detection method)
  const roll = rollAbilityCheck({
    ability: 'Perception',
    abilityScore: abilityScores.WIS,
    proficiencyBonus,
    proficient,
    advantage: options?.advantage ? 'advantage' : undefined,
    rng: options?.rng
  });

  const detected = roll.total >= trap.detectDC;
  const margin = roll.total - trap.detectDC;

  return {
    detected,
    roll: roll.total,
    dc: trap.detectDC,
    margin
  };
}

/**
 * Attempts to disarm a detected trap using Sleight of Hand or Thieves' Tools.
 * PHB p.177: Sleight of Hand (DEX) to disable mechanical traps.
 * @param trap - The trap to disarm
 * @param abilityScores - Character's ability scores
 * @param proficient - Is the character proficient in Sleight of Hand/Thieves' Tools?
 * @param proficiencyBonus - Character's proficiency bonus
 * @param options - Optional RNG and trigger-on-fail setting
 */
export function attemptTrapDisarm(
  trap: Trap,
  abilityScores: AbilityScores,
  proficient: boolean,
  proficiencyBonus: number,
  options?: { rng?: () => number; triggerOnFail?: boolean }
): TrapDisarmResult {
  const roll = rollAbilityCheck({
    ability: 'Sleight of Hand',
    abilityScore: abilityScores.DEX,
    proficiencyBonus,
    proficient,
    rng: options?.rng
  });

  const disarmed = roll.total >= trap.disarmDC;
  const margin = roll.total - trap.disarmDC;

  // Failing by 5+ triggers the trap (optional rule)
  const triggered = !disarmed && (options?.triggerOnFail ?? false) && margin <= -5;

  return {
    disarmed,
    roll: roll.total,
    dc: trap.disarmDC,
    triggered,
    margin
  };
}

/**
 * Triggers a trap and calculates damage/effects.
 * @param trap - The trap being triggered
 * @param abilityScores - Victim's ability scores
 * @param proficiencyBonus - Victim's proficiency bonus for saves
 * @param options - Optional RNG for deterministic results
 */
export function triggerTrap(
  trap: Trap,
  abilityScores: AbilityScores,
  proficiencyBonus: number,
  options?: { rng?: () => number }
): TrapTriggerResult {
  let damage = 0;
  let damageType: DamageType | undefined;
  let saved = false;
  let conditionApplied: Condition | undefined;
  let description = `${trap.name} triggered! `;

  // Roll saving throw if applicable
  if (trap.effect.savingThrow) {
    const saveRoll = rollSavingThrow({
      save: trap.effect.savingThrow.ability,
      abilityScore: abilityScores[trap.effect.savingThrow.ability],
      proficiencyBonus,
      proficient: false, // Rarely proficient in saves from traps
      rng: options?.rng
    });

    saved = saveRoll.total >= trap.effect.savingThrow.dc;
    description += `${trap.effect.savingThrow.ability} save ${saveRoll.total} vs DC ${trap.effect.savingThrow.dc}. `;
  }

  // Calculate damage
  if (trap.effect.damage) {
    const damageRoll = rollDice(trap.effect.damage.notation, options);
    damage = damageRoll.total;
    damageType = trap.effect.damage.type;

    // Apply save effect
    if (saved && trap.effect.savingThrow) {
      if (trap.effect.savingThrow.successEffect === 'half') {
        damage = Math.floor(damage / 2);
        description += `Saved! ${damage} ${damageType} damage (halved). `;
      } else if (trap.effect.savingThrow.successEffect === 'none') {
        damage = 0;
        description += `Saved! No damage taken. `;
      }
    } else {
      description += `${damage} ${damageType} damage. `;
    }
  }

  // Apply condition
  if (trap.effect.condition && (!saved || trap.effect.savingThrow?.successEffect !== 'none')) {
    conditionApplied = trap.effect.condition.type;
    description += `${trap.effect.condition.type} condition applied (${trap.effect.condition.duration}). `;
  }

  // Add special effects
  if (trap.effect.special) {
    description += trap.effect.special;
  }

  return {
    damage,
    damageType,
    saved,
    conditionApplied,
    description: description.trim()
  };
}

// --- EXPORTS ---

export default {
  COMMON_TRAPS,
  attemptTrapDetection,
  attemptTrapDisarm,
  triggerTrap
};
