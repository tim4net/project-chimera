import React, { useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { CharacterDetails } from "../types/character-details";
import { getCharacterDetails, updateCharacterDetails } from "../data/characters";

type Props = {
  supabase: SupabaseClient;
  characterId: string;
  initial?: CharacterDetails | null; // if you SSR or prefetch
};

export function CharacterDetailsForm({ supabase, characterId, initial }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState<CharacterDetails>(
    initial ?? {
      description: null,
      backstory: null,
      personality_traits: [],
      ideals: [],
      bonds: [],
      flaws: [],
      alignment: null,
      proficiencies: {},
      spells: {},
      avatar_url: null,
    }
  );

  // Comma-separated inputs for arrays
  const arrToText = (arr?: string[] | null) => (arr && arr.length ? arr.join(", ") : "");
  const textToArr = (text: string) =>
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

  // JSON editors as textareas with lenient parsing
  const [proficienciesText, setProficienciesText] = useState(
    JSON.stringify(model.proficiencies ?? {}, null, 2)
  );
  const [spellsText, setSpellsText] = useState(JSON.stringify(model.spells ?? {}, null, 2));

  const parseJson = (text: string) => {
    try {
      const obj = text.trim() ? JSON.parse(text) : {};
      return [obj, null] as const;
    } catch (e: any) {
      return [null, e.message as string] as const;
    }
  };

  const fetchIfNeeded = React.useCallback(async () => {
    if (initial) return;
    setLoading(true);
    const details = await getCharacterDetails(supabase, characterId);
    if (details) {
      setModel(details);
      setProficienciesText(JSON.stringify(details.proficiencies ?? {}, null, 2));
      setSpellsText(JSON.stringify(details.spells ?? {}, null, 2));
    }
    setLoading(false);
  }, [initial, supabase, characterId]);

  React.useEffect(() => {
    void fetchIfNeeded();
  }, [fetchIfNeeded]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const [profs, profErr] = parseJson(proficienciesText);
    if (profErr) {
      setError(`Invalid proficiencies JSON: ${profErr}`);
      setLoading(false);
      return;
    }
    const [sp, spErr] = parseJson(spellsText);
    if (spErr) {
      setError(`Invalid spells JSON: ${spErr}`);
      setLoading(false);
      return;
    }

    const res = await updateCharacterDetails(supabase, characterId, {
      ...model,
      proficiencies: profs ?? {},
      spells: sp ?? {},
    });

    if (!res.ok) setError(res.error);
    setLoading(false);
  };

  return (
    <form onSubmit={onSubmit}>
      {error && <div role="alert">{error}</div>}
      <label>
        Alignment
        <input
          type="text"
          value={model.alignment ?? ""}
          onChange={(e) => setModel((m) => ({ ...m, alignment: e.target.value || null }))}
        />
      </label>

      <label>
        Description
        <textarea
          value={model.description ?? ""}
          onChange={(e) => setModel((m) => ({ ...m, description: e.target.value || null }))}
        />
      </label>

      <label>
        Backstory
        <textarea
          value={model.backstory ?? ""}
          onChange={(e) => setModel((m) => ({ ...m, backstory: e.target.value || null }))}
        />
      </label>

      <label>
        Personality traits (comma-separated)
        <input
          type="text"
          value={arrToText(model.personality_traits)}
          onChange={(e) =>
            setModel((m) => ({ ...m, personality_traits: textToArr(e.target.value) }))
          }
        />
      </label>

      <label>
        Ideals (comma-separated)
        <input
          type="text"
          value={arrToText(model.ideals)}
          onChange={(e) => setModel((m) => ({ ...m, ideals: textToArr(e.target.value) }))}
        />
      </label>

      <label>
        Bonds (comma-separated)
        <input
          type="text"
          value={arrToText(model.bonds)}
          onChange={(e) => setModel((m) => ({ ...m, bonds: textToArr(e.target.value) }))}
        />
      </label>

      <label>
        Flaws (comma-separated)
        <input
          type="text"
          value={arrToText(model.flaws)}
          onChange={(e) => setModel((m) => ({ ...m, flaws: textToArr(e.target.value) }))}
        />
      </label>

      <label>
        Proficiencies (JSON)
        <textarea value={proficienciesText} onChange={(e) => setProficienciesText(e.target.value)} />
      </label>

      <label>
        Spells (JSON)
        <textarea value={spellsText} onChange={(e) => setSpellsText(e.target.value)} />
      </label>

      <label>
        Avatar URL
        <input
          type="url"
          value={model.avatar_url ?? ""}
          onChange={(e) => setModel((m) => ({ ...m, avatar_url: e.target.value || null }))}
        />
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save"}
      </button>
    </form>
  );
}