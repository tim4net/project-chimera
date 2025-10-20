/**
 * @file D&D 5e Damage Types and Resistance System
 * Implements damage type interactions, resistances, immunities, and vulnerabilities
 */

// --- DAMAGE TYPE DEFINITIONS ---

export type PhysicalDamageType = 'slashing' | 'piercing' | 'bludgeoning';
export type ElementalDamageType = 'fire' | 'cold' | 'lightning' | 'thunder' | 'acid';
export type MagicalDamageType = 'force' | 'radiant' | 'necrotic' | 'psychic' | 'poison';

export type DamageType = PhysicalDamageType | ElementalDamageType | MagicalDamageType;

export const ALL_DAMAGE_TYPES: readonly DamageType[] = [
  // Physical
  'slashing', 'piercing', 'bludgeoning',
  // Elemental
  'fire', 'cold', 'lightning', 'thunder', 'acid',
  // Magical
  'force', 'radiant', 'necrotic', 'psychic', 'poison'
] as const;

export const PHYSICAL_DAMAGE_TYPES: readonly PhysicalDamageType[] = ['slashing', 'piercing', 'bludgeoning'];
export const ELEMENTAL_DAMAGE_TYPES: readonly ElementalDamageType[] = ['fire', 'cold', 'lightning', 'thunder', 'acid'];
export const MAGICAL_DAMAGE_TYPES: readonly MagicalDamageType[] = ['force', 'radiant', 'necrotic', 'psychic', 'poison'];

// --- INTERFACES ---

export interface DamageInstance {
  amount: number;
  type: DamageType;
  magical?: boolean; // For overcoming resistance to nonmagical damage
}

export interface DamageResistances {
  resistances: DamageType[];
  immunities: DamageType[];
  vulnerabilities: DamageType[];
}

export interface DamageApplicationResult {
  originalDamage: number;
  finalDamage: number;
  damageType: DamageType;
  wasResisted: boolean;
  wasImmune: boolean;
  wasVulnerable: boolean;
  reductionReason?: string;
}

// --- CORE FUNCTIONS ---

/**
 * Applies a single damage instance to a target considering resistances/immunities/vulnerabilities.
 * @param damage - The damage instance
 * @param target - The target's damage resistances
 * @returns Result with original and final damage amounts
 */
export function applyDamageWithResistances(
  damage: DamageInstance,
  target: DamageResistances
): DamageApplicationResult {
  const { amount, type, magical = false } = damage;

  // Check immunity first (most powerful)
  if (target.immunities.includes(type)) {
    return {
      originalDamage: amount,
      finalDamage: 0,
      damageType: type,
      wasResisted: false,
      wasImmune: true,
      wasVulnerable: false,
      reductionReason: `Immune to ${type} damage`
    };
  }

  // Check vulnerability (double damage)
  if (target.vulnerabilities.includes(type)) {
    return {
      originalDamage: amount,
      finalDamage: amount * 2,
      damageType: type,
      wasResisted: false,
      wasImmune: false,
      wasVulnerable: true,
      reductionReason: `Vulnerable to ${type} damage (doubled)`
    };
  }

  // Check resistance (half damage)
  if (target.resistances.includes(type)) {
    return {
      originalDamage: amount,
      finalDamage: Math.floor(amount / 2),
      damageType: type,
      wasResisted: true,
      wasImmune: false,
      wasVulnerable: false,
      reductionReason: `Resistant to ${type} damage (halved)`
    };
  }

  // No special interaction
  return {
    originalDamage: amount,
    finalDamage: amount,
    damageType: type,
    wasResisted: false,
    wasImmune: false,
    wasVulnerable: false
  };
}

/**
 * Applies multiple damage instances and returns total damage.
 * @param damageInstances - Array of damage instances
 * @param target - The target's damage resistances
 * @returns Total damage and breakdown by type
 */
export function applyMultipleDamageTypes(
  damageInstances: DamageInstance[],
  target: DamageResistances
): {
  totalDamage: number;
  breakdown: DamageApplicationResult[];
  summary: string;
} {
  const breakdown = damageInstances.map(dmg => applyDamageWithResistances(dmg, target));
  const totalDamage = breakdown.reduce((sum, result) => sum + result.finalDamage, 0);

  const summaryParts = breakdown
    .filter(r => r.finalDamage > 0)
    .map(r => {
      if (r.wasImmune) return `0 ${r.damageType} (immune)`;
      if (r.wasVulnerable) return `${r.finalDamage} ${r.damageType} (vulnerable)`;
      if (r.wasResisted) return `${r.finalDamage} ${r.damageType} (resisted)`;
      return `${r.finalDamage} ${r.damageType}`;
    });

  const summary = summaryParts.join(', ') || 'No damage';

  return { totalDamage, breakdown, summary };
}

/**
 * Checks if a damage type is physical (for overcoming resistance to nonmagical damage).
 */
export function isPhysicalDamage(type: DamageType): boolean {
  return PHYSICAL_DAMAGE_TYPES.includes(type as PhysicalDamageType);
}

/**
 * Gets description of damage type for narrative purposes.
 */
export function getDamageTypeDescription(type: DamageType): string {
  const descriptions: Record<DamageType, string> = {
    slashing: 'cutting and slicing',
    piercing: 'stabbing and puncturing',
    bludgeoning: 'crushing and smashing',
    fire: 'burning flames',
    cold: 'freezing ice',
    lightning: 'crackling electricity',
    thunder: 'concussive sound',
    acid: 'corrosive liquid',
    force: 'pure magical energy',
    radiant: 'holy light',
    necrotic: 'death energy',
    psychic: 'mental anguish',
    poison: 'toxic venom'
  };

  return descriptions[type] || type;
}

/**
 * Creates a damage instance from a dice roll result and type.
 */
export function createDamageInstance(
  amount: number,
  type: DamageType,
  magical: boolean = false
): DamageInstance {
  return { amount, type, magical };
}

/**
 * Helper to check if target has any resistance to damage type.
 */
export function hasResistanceTo(type: DamageType, target: DamageResistances): boolean {
  return target.resistances.includes(type) || target.immunities.includes(type);
}

/**
 * Helper to check if target is immune to damage type.
 */
export function isImmuneTo(type: DamageType, target: DamageResistances): boolean {
  return target.immunities.includes(type);
}

/**
 * Helper to check if target is vulnerable to damage type.
 */
export function isVulnerableTo(type: DamageType, target: DamageResistances): boolean {
  return target.vulnerabilities.includes(type);
}
