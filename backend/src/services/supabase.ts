import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type SupabaseKeys = {
  url: string;
  anonKey: string;
};

const resolveSupabaseKeys = (): SupabaseKeys => {
  const url = process.env.SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error('Supabase environment variables SUPABASE_URL and SUPABASE_ANON_KEY must be set.');
  }

  return { url, anonKey };
};

const { url, anonKey } = resolveSupabaseKeys();

export const supabase: SupabaseClient = createClient(url, anonKey);

export default supabase;
