import { supabaseServiceClient } from './supabaseClient';
import type { StyleConfig } from '../types';
import type { StyleVersionRow } from '../types/database';

let cachedStyle: StyleConfig | null = null;
let cacheTimestamp: number | null = null;
const CACHE_TTL = 5 * 60 * 1000;

// Default style configuration for when database table is unavailable
const DEFAULT_STYLE_CONFIG: StyleConfig = {
  imageStyle: {
    basePrompt: 'High quality fantasy digital art, detailed, atmospheric lighting',
    characterStyle: 'Character portrait, fantasy art style, dramatic lighting',
    environmentStyle: 'Lush fantasy landscape, atmospheric',
    itemStyle: 'Fantasy item, detailed, icon style',
    biomeStyles: {
      forest: 'Enchanted forest, mystical atmosphere',
      mountain: 'Mountain peaks, snow-capped, grand vista',
      ocean: 'Coastal scene, waves, maritime fantasy',
      desert: 'Sandy dunes, oasis, desert fantasy'
    },
    negativePrompt: 'blurry, low quality, watermark, text'
  }
};

export const getActiveStyleConfig = async (): Promise<StyleConfig> => {
  if (cachedStyle && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedStyle;
  }

  try {
    const { data, error } = await supabaseServiceClient
      .from('style_versions')
      .select('*')
      .eq('is_active', true)
      .single();

    if (error) {
      console.warn('Error fetching active style config (using default):', error);
      cachedStyle = DEFAULT_STYLE_CONFIG;
      cacheTimestamp = Date.now();
      return cachedStyle;
    }

    cachedStyle = (data as StyleVersionRow).style_config;
    cacheTimestamp = Date.now();

    return cachedStyle;
  } catch (err) {
    console.warn('Failed to load style configuration, using default:', err);
    cachedStyle = DEFAULT_STYLE_CONFIG;
    cacheTimestamp = Date.now();
    return cachedStyle;
  }
};

export const invalidateStyleCache = (): void => {
  cachedStyle = null;
  cacheTimestamp = null;
};

export const getAllStyleVersions = async (): Promise<StyleVersionRow[]> => {
  const { data, error } = await supabaseServiceClient
    .from('style_versions')
    .select('id, version_name, description, is_active, created_at, style_config')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching style versions:', error);
    throw new Error('Failed to load style versions');
  }

  return data as StyleVersionRow[];
};

export const createStyleVersion = async (styleData: Partial<StyleVersionRow>): Promise<StyleVersionRow> => {
  const { data, error } = await supabaseServiceClient
    .from('style_versions')
    .insert(styleData)
    .select()
    .single();

  if (error) {
    console.error('Error creating style version:', error);
    throw new Error('Failed to create style version');
  }

  invalidateStyleCache();
  return data as StyleVersionRow;
};

export const setActiveStyle = async (versionId: string): Promise<StyleVersionRow> => {
  await supabaseServiceClient
    .from('style_versions')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000');

  const { data, error } = await supabaseServiceClient
    .from('style_versions')
    .update({ is_active: true })
    .eq('id', versionId)
    .select()
    .single();

  if (error) {
    console.error('Error setting active style:', error);
    throw new Error('Failed to set active style');
  }

  invalidateStyleCache();
  return data as StyleVersionRow;
};
