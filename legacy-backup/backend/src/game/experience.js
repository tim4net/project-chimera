'use strict';

// ============================================================================
// D&D 5e XP THRESHOLDS
// ============================================================================

const XP_THRESHOLDS = {
  1: 0,
  2: 300,
  3: 900,
  4: 2700,
  5: 6500,
  6: 14000,
  7: 23000,
  8: 34000,
  9: 48000,
  10: 64000,
  11: 85000,
  12: 100000,
  13: 120000,
  14: 140000,
  15: 165000,
  16: 195000,
  17: 225000,
  18: 265000,
  19: 305000,
  20: 355000
};

// ============================================================================
// CLASS HIT DICE (for HP increases on level-up)
// ============================================================================

const CLASS_HIT_DICE = {
  'Fighter': 10,
  'Paladin': 10,
  'Ranger': 10,
  'Barbarian': 12,
  'Wizard': 6,
  'Sorcerer': 6,
  'Rogue': 8,
  'Bard': 8,
  'Monk': 8,
  'Cleric': 8,
  'Druid': 8,
  'Warlock': 8
};

// ============================================================================
// PROFICIENCY BONUS BY LEVEL
// ============================================================================

const PROFICIENCY_BONUS = {
  1: 2, 2: 2, 3: 2, 4: 2,
  5: 3, 6: 3, 7: 3, 8: 3,
  9: 4, 10: 4, 11: 4, 12: 4,
  13: 5, 14: 5, 15: 5, 16: 5,
  17: 6, 18: 6, 19: 6, 20: 6
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate ability modifier from ability score
 * @param {number} abilityScore - The ability score (usually 8-20)
 * @returns {number} - The modifier (e.g., 16 -> +3)
 */
function getAbilityModifier(abilityScore) {
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Get XP threshold for a specific level
 * @param {number} level - Character level (1-20)
 * @returns {number} - XP required to reach that level
 */
function getXPThreshold(level) {
  if (level < 1) return 0;
  if (level > 20) return XP_THRESHOLDS[20];
  return XP_THRESHOLDS[level] || 0;
}

/**
 * Get proficiency bonus for a specific level
 * @param {number} level - Character level (1-20)
 * @returns {number} - Proficiency bonus
 */
function getProficiencyBonus(level) {
  if (level < 1) return 2;
  if (level > 20) return 6;
  return PROFICIENCY_BONUS[level] || 2;
}

/**
 * Get hit die for a class
 * @param {string} characterClass - Class name (e.g., 'Fighter')
 * @returns {number} - Hit die size (e.g., 10 for Fighter)
 */
function getHitDie(characterClass) {
  return CLASS_HIT_DICE[characterClass] || 8; // Default to d8 if class not found
}

// ============================================================================
// CORE XP FUNCTIONS
// ============================================================================

/**
 * Check if a character should level up based on their current XP
 * @param {number} currentXP - Character's current XP total
 * @param {number} currentLevel - Character's current level
 * @returns {number|null} - New level if leveled up, null otherwise
 */
function checkLevelUp(currentXP, currentLevel) {
  // Cap at level 20
  if (currentLevel >= 20) {
    return null;
  }

  const nextLevel = currentLevel + 1;
  const requiredXP = getXPThreshold(nextLevel);

  if (currentXP >= requiredXP) {
    return nextLevel;
  }

  return null;
}

/**
 * Calculate stat benefits for leveling up
 * @param {string} characterClass - Class name
 * @param {number} newLevel - The level being gained
 * @param {number} conModifier - Constitution modifier for HP calculation
 * @returns {Object} - { hpIncrease, proficiencyBonus, features }
 */
function calculateLevelUpBenefits(characterClass, newLevel, conModifier = 0) {
  const hitDie = getHitDie(characterClass);

  // HP increase: Average of hit die + CON modifier
  // D&D 5e rule: Can roll or take average (rounded up)
  const averageRoll = Math.floor(hitDie / 2) + 1; // e.g., d10 -> 5+1 = 6
  const hpIncrease = averageRoll + conModifier;

  // Proficiency bonus
  const proficiencyBonus = getProficiencyBonus(newLevel);

  // Features gained at this level (simplified for MVP)
  const features = getClassFeatures(characterClass, newLevel);

  return {
    hpIncrease: Math.max(1, hpIncrease), // Minimum 1 HP per level
    proficiencyBonus,
    newFeatures: features
  };
}

/**
 * Get class features unlocked at a specific level (simplified for MVP)
 * @param {string} characterClass - Class name
 * @param {number} level - Level being gained
 * @returns {Array} - Array of feature names
 */
function getClassFeatures(characterClass, level) {
  // Simplified feature list for MVP
  const features = [];

  // Universal features
  if (level === 4 || level === 8 || level === 12 || level === 16 || level === 19) {
    features.push('Ability Score Improvement');
  }

  // Class-specific features (highly simplified)
  switch (characterClass) {
    case 'Fighter':
      if (level === 2) features.push('Action Surge');
      if (level === 3) features.push('Martial Archetype');
      if (level === 5) features.push('Extra Attack');
      if (level === 9) features.push('Indomitable');
      break;

    case 'Wizard':
      if (level === 2) features.push('Arcane Tradition');
      if (level === 3) features.push('2nd Level Spells');
      if (level === 5) features.push('3rd Level Spells');
      if (level === 7) features.push('4th Level Spells');
      break;

    case 'Rogue':
      if (level === 2) features.push('Cunning Action');
      if (level === 3) features.push('Roguish Archetype');
      if (level === 5) features.push('Uncanny Dodge');
      if (level === 7) features.push('Evasion');
      break;

    case 'Cleric':
      if (level === 2) features.push('Channel Divinity (1/rest)');
      if (level === 3) features.push('2nd Level Spells');
      if (level === 5) features.push('Destroy Undead (CR 1/2)');
      if (level === 6) features.push('Channel Divinity (2/rest)');
      break;

    default:
      // Generic feature for other classes
      if (level === 3) features.push('Subclass Choice');
      if (level === 5) features.push('Class Feature');
      break;
  }

  return features;
}

/**
 * Calculate XP award based on enemy CR (simplified)
 * @param {number} challengeRating - Enemy CR
 * @returns {number} - XP to award
 */
function calculateXPReward(challengeRating) {
  // D&D 5e CR to XP conversion (simplified)
  const xpByCR = {
    0: 10,
    0.125: 25,
    0.25: 50,
    0.5: 100,
    1: 200,
    2: 450,
    3: 700,
    4: 1100,
    5: 1800,
    6: 2300,
    7: 2900,
    8: 3900,
    9: 5000,
    10: 5900
  };

  return xpByCR[challengeRating] || Math.floor(challengeRating * 200);
}

/**
 * Process multiple level-ups if character gained enough XP
 * @param {number} currentXP - Character's current XP
 * @param {number} currentLevel - Character's starting level
 * @param {string} characterClass - Character's class
 * @param {number} conModifier - Constitution modifier
 * @returns {Object} - { newLevel, totalHpGained, levelUpDetails: [] }
 */
function processMultipleLevelUps(currentXP, currentLevel, characterClass, conModifier = 0) {
  let level = currentLevel;
  let totalHpGained = 0;
  const levelUpDetails = [];

  // Keep checking for level-ups (in case of massive XP gain)
  while (level < 20) {
    const nextLevel = checkLevelUp(currentXP, level);
    if (!nextLevel) break;

    const benefits = calculateLevelUpBenefits(characterClass, nextLevel, conModifier);
    totalHpGained += benefits.hpIncrease;

    levelUpDetails.push({
      level: nextLevel,
      hpGained: benefits.hpIncrease,
      proficiencyBonus: benefits.proficiencyBonus,
      features: benefits.newFeatures
    });

    level = nextLevel;
  }

  return {
    newLevel: level,
    totalHpGained,
    levelUpDetails
  };
}

// ============================================================================
// LEGACY COMPATIBILITY (for existing code)
// ============================================================================

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateXPReward instead
 */
const calculateXP = (character, monster) => {
  const cr = monster?.challengeRating || 0.5;
  return calculateXPReward(cr);
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateLevelUpBenefits instead
 */
const levelUp = (character) => {
  const conModifier = getAbilityModifier(character.stats?.constitution || 10);
  const benefits = calculateLevelUpBenefits(
    character.class || 'Fighter',
    character.level + 1,
    conModifier
  );

  character.level++;
  character.stats.health = (character.stats.health || 10) + benefits.hpIncrease;

  return character;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Core functions
  checkLevelUp,
  calculateLevelUpBenefits,
  getXPThreshold,
  getProficiencyBonus,
  calculateXPReward,
  processMultipleLevelUps,

  // Utility functions
  getAbilityModifier,
  getHitDie,
  getClassFeatures,

  // Constants (for testing)
  XP_THRESHOLDS,
  CLASS_HIT_DICE,
  PROFICIENCY_BONUS,

  // Legacy compatibility
  calculateXP,
  levelUp
};
