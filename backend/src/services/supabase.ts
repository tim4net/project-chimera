/**
 * DEPRECATED: Backend should use supabaseServiceClient only
 *
 * This file created an anon-key Supabase client, which is NOT recommended for backend use.
 * The anon key provides limited permissions and is intended for client-side use only.
 *
 * Backend operations should ALWAYS use the service role client from supabaseClient.ts
 * which has full admin access and bypasses RLS policies.
 *
 * This file is kept for backward compatibility during migration, but all imports
 * should be replaced with supabaseServiceClient from './supabaseClient'.
 *
 * TODO: Remove this file once all references are migrated to supabaseServiceClient
 */

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

/**
 * @deprecated Use supabaseServiceClient from './supabaseClient' instead
 * Backend should always use service role client for full admin access
 */
export const supabase: SupabaseClient = createClient(url, anonKey);

export default supabase;
