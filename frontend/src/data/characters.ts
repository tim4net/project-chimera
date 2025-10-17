import { PostgrestSingleResponse, SupabaseClient } from "@supabase/supabase-js";
import { CharacterDetails, CharacterDetailsUpdate } from "../types/character-details";
import { characterDetailsSchema } from "../validation/character-details";

// Normalize DB row -> UI model (avoid undefined in UI)
export function toUiDetails(row: Partial<CharacterDetails>): CharacterDetails {
  return {
    description: row.description ?? null,
    backstory: row.backstory ?? null,
    personality_traits: row.personality_traits ?? [],
    ideals: row.ideals ?? [],
    bonds: row.bonds ?? [],
    flaws: row.flaws ?? [],
    alignment: row.alignment ?? null,
    proficiencies: row.proficiencies ?? {},
    spells: row.spells ?? {},
    avatar_url: row.avatar_url ?? null,
  };
}

// Normalize UI payload -> DB update (empty -> null to avoid storing empty junk)
export function toDbUpdate(input: Partial<CharacterDetails>): CharacterDetailsUpdate {
  return {
    description: input.description?.trim() || null,
    backstory: input.backstory?.trim() || null,
    personality_traits:
      input.personality_traits && input.personality_traits.length > 0 ? input.personality_traits : null,
    ideals: input.ideals && input.ideals.length > 0 ? input.ideals : null,
    bonds: input.bonds && input.bonds.length > 0 ? input.bonds : null,
    flaws: input.flaws && input.flaws.length > 0 ? input.flaws : null,
    alignment: input.alignment?.trim() || null,
    proficiencies:
      input.proficiencies && Object.keys(input.proficiencies).length > 0 ? input.proficiencies : null,
    spells: input.spells && Object.keys(input.spells).length > 0 ? input.spells : null,
    avatar_url: input.avatar_url?.trim() || null,
  };
}

export async function getCharacterDetails(
  supabase: SupabaseClient,
  characterId: string
): Promise<CharacterDetails | null> {
  const { data, error }: PostgrestSingleResponse<any> = await supabase
    .from("characters")
    .select(
      [
        "description",
        "backstory",
        "personality_traits",
        "ideals",
        "bonds",
        "flaws",
        "alignment",
        "proficiencies",
        "spells",
        "avatar_url",
      ].join(",")
    )
    .eq("id", characterId)
    .single();

  if (error) {
    // Optionally surface error to caller
    return null;
  }
  return toUiDetails(data ?? {});
}

export async function updateCharacterDetails(
  supabase: SupabaseClient,
  characterId: string,
  input: Partial<CharacterDetails>
): Promise<{ ok: true } | { ok: false; error: string }> {
  // Validate (lightweight)
  const parsed = characterDetailsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.flatten().formErrors.join("; ") || "Invalid input" };
  }

  const payload = toDbUpdate(parsed.data);

  const { error } = await supabase
    .from("characters")
    .update(payload)
    .eq("id", characterId)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function createCharacterWithDetails(
  supabase: SupabaseClient,
  baseFields: { name: string; owner_id?: string }, // adapt to your schema
  details?: Partial<CharacterDetails>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const normalized = details ? toDbUpdate(details) : {};
  const insertPayload = { ...baseFields, ...normalized };

  const { data, error } = await supabase
    .from("characters")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, id: data.id as string };
}
