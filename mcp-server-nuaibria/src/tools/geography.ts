import { getSupabase } from '../services/supabase.js';
import { Location } from '../types/world.js';

/**
 * Get location by ID or name
 */
export async function getLocation(args: {
  id?: string;
  name?: string;
}): Promise<Location | null> {
  const supabase = getSupabase();

  if (!args.id && !args.name) {
    throw new Error('Must provide either id or name');
  }

  let query = supabase.from('locations').select('*');

  if (args.id) {
    query = query.eq('id', args.id);
  } else if (args.name) {
    query = query.eq('name', args.name);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch location: ${error.message}`);
  }

  return data as Location;
}

/**
 * List locations near coordinates
 */
export async function listLocationsNearby(args: {
  x: number;
  y: number;
  radius: number;
  campaign_seed?: string;
}): Promise<Location[]> {
  const supabase = getSupabase();

  // Calculate bounding box
  const minX = args.x - args.radius;
  const maxX = args.x + args.radius;
  const minY = args.y - args.radius;
  const maxY = args.y + args.radius;

  let query = supabase
    .from('locations')
    .select('*')
    .gte('position_x', minX)
    .lte('position_x', maxX)
    .gte('position_y', minY)
    .lte('position_y', maxY);

  if (args.campaign_seed) {
    query = query.eq('campaign_seed', args.campaign_seed);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list locations: ${error.message}`);
  }

  return data as Location[];
}

/**
 * Get region information
 */
export async function getRegion(args: {
  id?: string;
  name?: string;
}): Promise<any | null> {
  const supabase = getSupabase();

  if (!args.id && !args.name) {
    throw new Error('Must provide either id or name');
  }

  let query = supabase.from('world_regions').select('*');

  if (args.id) {
    query = query.eq('id', args.id);
  } else if (args.name) {
    query = query.eq('name', args.name);
  }

  const { data, error } = await query.single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch region: ${error.message}`);
  }

  return data;
}
