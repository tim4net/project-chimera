const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Cache for active style config to avoid repeated DB queries
let cachedStyle = null;
let cacheTimestamp = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get the currently active style configuration
 * @returns {Promise<Object>} Active style configuration
 */
async function getActiveStyleConfig() {
  // Return cached config if still valid
  if (cachedStyle && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedStyle;
  }

  const { data, error } = await supabase
    .from('style_versions')
    .select('*')
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching active style config:', error);
    throw new Error('Failed to load style configuration');
  }

  // Update cache
  cachedStyle = data.style_config;
  cacheTimestamp = Date.now();

  return data.style_config;
}

/**
 * Invalidate the style config cache (call when style is updated)
 */
function invalidateStyleCache() {
  cachedStyle = null;
  cacheTimestamp = null;
}

/**
 * Get all style versions
 * @returns {Promise<Array>} All style versions
 */
async function getAllStyleVersions() {
  const { data, error } = await supabase
    .from('style_versions')
    .select('id, version_name, description, is_active, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching style versions:', error);
    throw new Error('Failed to load style versions');
  }

  return data;
}

/**
 * Create a new style version
 * @param {Object} styleData - Style version data
 * @returns {Promise<Object>} Created style version
 */
async function createStyleVersion(styleData) {
  const { data, error } = await supabase
    .from('style_versions')
    .insert(styleData)
    .select()
    .single();

  if (error) {
    console.error('Error creating style version:', error);
    throw new Error('Failed to create style version');
  }

  return data;
}

/**
 * Set a style version as active (deactivates all others)
 * @param {string} versionId - ID of the style version to activate
 * @returns {Promise<Object>} Updated style version
 */
async function setActiveStyle(versionId) {
  // Deactivate all styles
  await supabase
    .from('style_versions')
    .update({ is_active: false })
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Update all

  // Activate the specified style
  const { data, error } = await supabase
    .from('style_versions')
    .update({ is_active: true })
    .eq('id', versionId)
    .select()
    .single();

  if (error) {
    console.error('Error setting active style:', error);
    throw new Error('Failed to set active style');
  }

  // Invalidate cache
  invalidateStyleCache();

  return data;
}

module.exports = {
  getActiveStyleConfig,
  invalidateStyleCache,
  getAllStyleVersions,
  createStyleVersion,
  setActiveStyle
};
