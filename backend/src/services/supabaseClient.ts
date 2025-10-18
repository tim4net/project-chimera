import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type ServiceKeys = {
  url: string;
  serviceKey: string;
};

const resolveServiceKeys = (): ServiceKeys => {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase service key configuration is missing. Ensure SUPABASE_URL and SUPABASE_SERVICE_KEY are set.');
  }

  return { url, serviceKey };
};

const { url, serviceKey } = resolveServiceKeys();

export const supabaseServiceClient: SupabaseClient = createClient(url, serviceKey);

export default supabaseServiceClient;
