const XP_THRESHOLDS: Record<number, number> = {
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

const CLASS_HIT_DICE: Record<string, number> = {
  Fighter: 10,
  Paladin: 10,
  Ranger: 10,
  Barbarian: 12,
  Wizard: 6,
  Sorcerer: 6,
  Rogue: 8,
  Bard: 8,
  Monk: 8,
  Cleric: 8,
  Druid: 8,
  Warlock: 8
};

const PROFICIENCY_BONUS: Record<number, number> = {
  1: 2,
  2: 2,
  3: 2,
  4: 2,
  5: 3,
  6: 3,
  7: 3,
  8: 3,
  9: 4,
  10: 4,
  11: 4,
  12: 4,
  13: 5,
  14: 5,
  15: 5,
  16: 5,
  17: 6,
  18: 6,
  19: 6,
  20: 6
};

export const getAbilityModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

export const getXPThreshold = (level: number): number => {
  if (level < 1) return 0;
  if (level > 20) return XP_THRESHOLDS[20];
  return XP_THRESHOLDS[level] ?? 0;
};

export const getProficiencyBonus = (level: number): number => {
  if (level < 1) return 2;
  if (level > 20) return 6;
  return PROFICIENCY_BONUS[level] ?? 2;
};

export const getHitDie = (characterClass: string): number => {
  return CLASS_HIT_DICE[characterClass] ?? 8;
};

export const checkLevelUp = (currentXP: number, currentLevel: number): number | null => {
  if (currentLevel >= 20) {
    return null;
  }

  const nextLevel = currentLevel + 1;
  const requiredXP = getXPThreshold(nextLevel);

  if (currentXP >= requiredXP) {
    return nextLevel;
  }

  return null;
};

export interface LevelUpBenefits {
  hpIncrease: number;
  proficiencyBonus: number;
  newFeatures: string[];
}

export const calculateLevelUpBenefits = (
  characterClass: string,
  newLevel: number,
  conModifier = 0
): LevelUpBenefits => {
  const hitDie = getHitDie(characterClass);
  const averageRoll = Math.floor(hitDie / 2) + 1;
  const hpIncrease = Math.max(1, averageRoll + conModifier);
  const proficiencyBonus = getProficiencyBonus(newLevel);
  const features = getClassFeatures(characterClass, newLevel);

  return {
    hpIncrease,
    proficiencyBonus,
    newFeatures: features
  };
};

export const getClassFeatures = (characterClass: string, level: number): string[] => {
  const features: string[] = [];

  if ([4, 8, 12, 16, 19].includes(level)) {
    features.push('Ability Score Improvement');
  }

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
      break;
    default:
      break;
  }

  return features;
};

export default {
  getAbilityModifier,
  getXPThreshold,
  getProficiencyBonus,
  getHitDie,
  checkLevelUp,
  calculateLevelUpBenefits,
  getClassFeatures
};
