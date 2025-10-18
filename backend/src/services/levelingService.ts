import { calculateLevelUpBenefits, checkLevelUp, getAbilityModifier } from '../game/experience';

export const evaluateLevelUp = (
  currentXP: number,
  currentLevel: number,
  characterClass: string,
  constitutionScore: number
): { newLevel: number | null; hpIncrease?: number; proficiencyBonus?: number; newFeatures?: string[] } => {
  const potentialLevel = checkLevelUp(currentXP, currentLevel);

  if (!potentialLevel) {
    return { newLevel: null };
  }

  const conModifier = getAbilityModifier(constitutionScore);
  const benefits = calculateLevelUpBenefits(characterClass, potentialLevel, conModifier);

  return {
    newLevel: potentialLevel,
    hpIncrease: benefits.hpIncrease,
    proficiencyBonus: benefits.proficiencyBonus,
    newFeatures: benefits.newFeatures
  };
};
