// Single-responsibility: model only
export type Json = Record<string, unknown>;

export interface CharacterDetails {
  description: string | null;
  backstory: string | null;
  personality_traits: string[] | null;
  ideals: string[] | null;
  bonds: string[] | null;
  flaws: string[] | null;
  alignment: string | null;
  proficiencies: Json | null;
  spells: Json | null;
  avatar_url: string | null;
}

// For payloads where empty arrays/objects are normalized to NULL before update
export type CharacterDetailsUpdate = Partial<CharacterDetails>;
