import { SupabaseClient } from "@supabase/supabase-js";

export async function uploadCharacterAvatar(
  supabase: SupabaseClient,
  characterId: string,
  file: File
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const path = `${characterId}/${Date.now()}_${file.name}`;
  const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
    upsert: false,
    cacheControl: "3600",
  });
  if (upErr) return { ok: false, error: upErr.message };

  const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
  if (!pub?.publicUrl) {
    return { ok: false, error: "Public URL not available" };
  }

  return { ok: true, url: pub.publicUrl };
}
