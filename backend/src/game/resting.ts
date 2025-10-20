/**
 * D&D 5e Resting Mechanics
 * Implements short rest and long rest recovery systems
 */

export interface HitDie {
  type: number; // d6, d8, d10, d12
  current: number; // how many are available
  max: number; // equal to character level
}

export interface RestingCharacter {
  id: string;
  name: string;
  level: number;
  currentHp: number;
  maxHp: number;
  hitDice: HitDie;
  conModifier: number;
  spellSlots?: SpellSlots;
  classFeatures?: ClassFeature[];
}

export interface SpellSlots {
  level1: { current: number; max: number };
  level2: { current: number; max: number };
  level3: { current: number; max: number };
  level4: { current: number; max: number };
  level5: { current: number; max: number };
  level6: { current: number; max: number };
  level7: { current: number; max: number };
  level8: { current: number; max: number };
  level9: { current: number; max: number };
}

export interface ClassFeature {
  name: string;
  resetsOn: 'short' | 'long' | 'none';
  currentUses: number;
  maxUses: number;
}

export interface ShortRestResult {
  hpRecovered: number;
  hitDiceSpent: number;
  hitDiceRemaining: number;
  featuresRecovered: string[];
  newHp: number;
  success: boolean;
  message: string;
}

export interface LongRestResult {
  hpRecovered: number;
  hitDiceRecovered: number;
  spellSlotsRecovered: Record<string, number>;
  featuresRecovered: string[];
  newHp: number;
  newHitDice: number;
  success: boolean;
  message: string;
}

/**
 * Check if character can spend a hit die
 */
export function canSpendHitDie(character: RestingCharacter): boolean {
  return character.hitDice.current > 0;
}

/**
 * Roll hit die recovery (1d[hitDieType] + CON modifier, minimum 1)
 */
export function rollHitDieRecovery(hitDieType: number, conModifier: number): number {
  const roll = Math.floor(Math.random() * hitDieType) + 1;
  const recovery = roll + conModifier;
  return Math.max(1, recovery); // Minimum 1 HP recovered
}

/**
 * Perform a short rest (1 hour)
 * Players can spend hit dice to recover HP and regain certain class features
 */
export function performShortRest(
  character: RestingCharacter,
  hitDiceToSpend: number
): ShortRestResult {
  // Validate hit dice available
  if (hitDiceToSpend < 0) {
    return {
      hpRecovered: 0,
      hitDiceSpent: 0,
      hitDiceRemaining: character.hitDice.current,
      featuresRecovered: [],
      newHp: character.currentHp,
      success: false,
      message: 'Cannot spend negative hit dice'
    };
  }

  if (hitDiceToSpend > character.hitDice.current) {
    return {
      hpRecovered: 0,
      hitDiceSpent: 0,
      hitDiceRemaining: character.hitDice.current,
      featuresRecovered: [],
      newHp: character.currentHp,
      success: false,
      message: `Only ${character.hitDice.current} hit dice available`
    };
  }

  // Roll for HP recovery
  let totalHpRecovered = 0;
  for (let i = 0; i < hitDiceToSpend; i++) {
    totalHpRecovered += rollHitDieRecovery(
      character.hitDice.type,
      character.conModifier
    );
  }

  // Apply HP recovery (cannot exceed max HP)
  const newHp = Math.min(character.currentHp + totalHpRecovered, character.maxHp);
  const actualHpRecovered = newHp - character.currentHp;

  // Update hit dice
  const newHitDiceCurrent = character.hitDice.current - hitDiceToSpend;

  // Recover short rest class features
  const featuresRecovered: string[] = [];
  if (character.classFeatures) {
    character.classFeatures.forEach(feature => {
      if (feature.resetsOn === 'short' && feature.currentUses < feature.maxUses) {
        feature.currentUses = feature.maxUses;
        featuresRecovered.push(feature.name);
      }
    });
  }

  return {
    hpRecovered: actualHpRecovered,
    hitDiceSpent: hitDiceToSpend,
    hitDiceRemaining: newHitDiceCurrent,
    featuresRecovered,
    newHp,
    success: true,
    message: `Short rest complete. Spent ${hitDiceToSpend} hit ${hitDiceToSpend === 1 ? 'die' : 'dice'}, recovered ${actualHpRecovered} HP.`
  };
}

/**
 * Perform a long rest (8 hours)
 * Recovers all HP, half of total hit dice (minimum 1), all spell slots, and daily abilities
 */
export function performLongRest(character: RestingCharacter): LongRestResult {
  // Recover all HP
  const hpRecovered = character.maxHp - character.currentHp;
  const newHp = character.maxHp;

  // Recover half of total hit dice (minimum 1)
  const hitDiceToRecover = Math.max(1, Math.floor(character.hitDice.max / 2));
  const newHitDiceCurrent = Math.min(
    character.hitDice.current + hitDiceToRecover,
    character.hitDice.max
  );
  const actualHitDiceRecovered = newHitDiceCurrent - character.hitDice.current;

  // Recover all spell slots
  const spellSlotsRecovered: Record<string, number> = {};
  if (character.spellSlots) {
    for (let level = 1; level <= 9; level++) {
      const slotKey = `level${level}` as keyof SpellSlots;
      const slot = character.spellSlots[slotKey];
      if (slot && slot.max > 0) {
        const recovered = slot.max - slot.current;
        if (recovered > 0) {
          spellSlotsRecovered[`Level ${level}`] = recovered;
          slot.current = slot.max;
        }
      }
    }
  }

  // Recover all class features that reset on long rest
  const featuresRecovered: string[] = [];
  if (character.classFeatures) {
    character.classFeatures.forEach(feature => {
      if (
        (feature.resetsOn === 'long' || feature.resetsOn === 'short') &&
        feature.currentUses < feature.maxUses
      ) {
        feature.currentUses = feature.maxUses;
        featuresRecovered.push(feature.name);
      }
    });
  }

  // Build detailed message
  const messages: string[] = ['Long rest complete.'];
  if (hpRecovered > 0) {
    messages.push(`Recovered ${hpRecovered} HP.`);
  }
  messages.push(`Recovered ${actualHitDiceRecovered} hit ${actualHitDiceRecovered === 1 ? 'die' : 'dice'}.`);

  if (Object.keys(spellSlotsRecovered).length > 0) {
    messages.push('All spell slots recovered.');
  }

  if (featuresRecovered.length > 0) {
    messages.push(`Recovered: ${featuresRecovered.join(', ')}`);
  }

  return {
    hpRecovered,
    hitDiceRecovered: actualHitDiceRecovered,
    spellSlotsRecovered,
    featuresRecovered,
    newHp,
    newHitDice: newHitDiceCurrent,
    success: true,
    message: messages.join(' ')
  };
}

/**
 * Calculate recommended hit dice to spend during short rest
 * Returns a suggestion based on current HP deficit
 */
export function recommendHitDiceToSpend(character: RestingCharacter): number {
  const hpDeficit = character.maxHp - character.currentHp;

  if (hpDeficit === 0) {
    return 0; // Already at max HP
  }

  // Estimate average recovery per hit die
  const avgRecoveryPerDie = (character.hitDice.type / 2) + 1 + character.conModifier;

  // Calculate dice needed to recover deficit
  const diceNeeded = Math.ceil(hpDeficit / Math.max(1, avgRecoveryPerDie));

  // Return the minimum of dice needed or available
  return Math.min(diceNeeded, character.hitDice.current);
}

/**
 * Check if character qualifies for a long rest
 * (Must have at least 1 HP, cannot be in combat)
 */
export function canTakeLongRest(
  character: RestingCharacter,
  inCombat: boolean = false
): { canRest: boolean; reason?: string } {
  if (inCombat) {
    return { canRest: false, reason: 'Cannot rest while in combat' };
  }

  if (character.currentHp <= 0) {
    return { canRest: false, reason: 'Character is unconscious or dead' };
  }

  return { canRest: true };
}

/**
 * Check if character qualifies for a short rest
 */
export function canTakeShortRest(
  character: RestingCharacter,
  inCombat: boolean = false
): { canRest: boolean; reason?: string } {
  if (inCombat) {
    return { canRest: false, reason: 'Cannot rest while in combat' };
  }

  if (character.currentHp <= 0) {
    return { canRest: false, reason: 'Character is unconscious or dead' };
  }

  if (character.hitDice.current === 0 && character.currentHp === character.maxHp) {
    return {
      canRest: true,
      reason: 'No hit dice to spend, but can still rest to recover class features'
    };
  }

  return { canRest: true };
}

/**
 * Get a summary of what will be recovered during a long rest
 */
export function previewLongRest(character: RestingCharacter): {
  willRecoverHp: number;
  willRecoverHitDice: number;
  willRecoverSpellSlots: number;
  willRecoverFeatures: string[];
} {
  const willRecoverHp = character.maxHp - character.currentHp;
  const willRecoverHitDice = Math.min(
    Math.max(1, Math.floor(character.hitDice.max / 2)),
    character.hitDice.max - character.hitDice.current
  );

  let willRecoverSpellSlots = 0;
  if (character.spellSlots) {
    for (let level = 1; level <= 9; level++) {
      const slotKey = `level${level}` as keyof SpellSlots;
      const slot = character.spellSlots[slotKey];
      if (slot) {
        willRecoverSpellSlots += slot.max - slot.current;
      }
    }
  }

  const willRecoverFeatures: string[] = [];
  if (character.classFeatures) {
    character.classFeatures.forEach(feature => {
      if (
        (feature.resetsOn === 'long' || feature.resetsOn === 'short') &&
        feature.currentUses < feature.maxUses
      ) {
        willRecoverFeatures.push(feature.name);
      }
    });
  }

  return {
    willRecoverHp,
    willRecoverHitDice,
    willRecoverSpellSlots,
    willRecoverFeatures
  };
}
