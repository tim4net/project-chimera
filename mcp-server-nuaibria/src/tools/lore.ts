import { getSupabase } from '../services/supabase.js';
import { WorldLore, Deity, RaceLore } from '../types/world.js';

/**
 * Get world lore entries by category and/or era
 */
export async function getWorldLore(args: {
  category?: string;
  era?: string;
  limit?: number;
}): Promise<WorldLore[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('world_lore')
    .select('*')
    .order('importance', { ascending: false })
    .order('created_at', { ascending: false });

  if (args.category) {
    query = query.eq('category', args.category);
  }

  if (args.era) {
    query = query.eq('era', args.era);
  }

  if (args.limit) {
    query = query.limit(args.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch world lore: ${error.message}`);
  }

  return data as WorldLore[];
}

/**
 * Get deity by name
 */
export async function getDeity(args: { name: string }): Promise<Deity | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('deities')
    .select('*')
    .eq('name', args.name)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch deity: ${error.message}`);
  }

  return data as Deity;
}

/**
 * List all deities with optional filtering
 */
export async function listDeities(args: {
  domain?: string;
  alignment?: string;
  active_only?: boolean;
}): Promise<Deity[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('deities')
    .select('*')
    .order('name');

  if (args.domain) {
    query = query.contains('domains', [args.domain]);
  }

  if (args.alignment) {
    query = query.eq('alignment', args.alignment);
  }

  if (args.active_only) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list deities: ${error.message}`);
  }

  return data as Deity[];
}

/**
 * Get race lore by race name
 */
export async function getRaceLore(args: { race: string }): Promise<RaceLore | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('races_lore')
    .select('*')
    .eq('race_name', args.race)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch race lore: ${error.message}`);
  }

  return data as RaceLore;
}

/**
 * Get historical timeline
 */
export async function getHistoricalTimeline(args: {
  era?: string;
  event_type?: string;
  limit?: number;
}): Promise<any[]> {
  const supabase = getSupabase();
  let query = supabase
    .from('historical_events')
    .select('*')
    .order('year_in_world', { ascending: true });

  if (args.era) {
    query = query.eq('era', args.era);
  }

  if (args.event_type) {
    query = query.eq('event_type', args.event_type);
  }

  if (args.limit) {
    query = query.limit(args.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch historical timeline: ${error.message}`);
  }

  return data;
}
