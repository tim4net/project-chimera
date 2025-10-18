import type { AbilityScores, CharacterRecord } from '../types';

export interface CharacterCreationInput {
  name: string;
  race: string;
  class: string;
  abilityScores: AbilityScores;
}

export const createCharacterDraft = async (_input: CharacterCreationInput): Promise<Partial<CharacterRecord>> => {
  throw new Error('Character creation service is not yet implemented.');
};

export default {
  createCharacterDraft
};
