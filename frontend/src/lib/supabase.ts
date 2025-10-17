import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a single shared Supabase client instance with persistent session
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true, // Enable persistent sessions (default, but explicit)
    autoRefreshToken: true, // Automatically refresh expired tokens
    detectSessionInUrl: true, // Detect OAuth callbacks in URL
    storage: window.localStorage, // Use localStorage for session storage
  }
});
