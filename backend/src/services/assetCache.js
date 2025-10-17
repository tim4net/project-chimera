const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Generate a hash for cache lookup
 * @param {string} content - Content to hash
 * @returns {string} SHA-256 hash
 */
function generateHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Check if an image already exists in cache
 * @param {string} prompt - Image generation prompt
 * @param {Object} dimensions - {width, height}
 * @param {string} contextType - Type of image
 * @returns {Promise<Object|null>} Cached image data or null
 */
async function checkImageCache(prompt, dimensions, contextType) {
  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);

  const { data, error } = await supabase
    .from('generated_images')
    .select('*')
    .eq('prompt_hash', promptHash)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
    console.error('Error checking image cache:', error);
    return null;
  }

  return data;
}

/**
 * Check if text already exists in cache
 * @param {string} contextKey - Unique context key
 * @param {string} textType - Type of text
 * @returns {Promise<Object|null>} Cached text data or null
 */
async function checkTextCache(contextKey, textType) {
  const { data, error } = await supabase
    .from('generated_text')
    .select('*')
    .eq('context_key', contextKey)
    .eq('text_type', textType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking text cache:', error);
    return null;
  }

  return data;
}

/**
 * Store generated image in cache
 * @param {Object} imageData - Image data to cache
 * @returns {Promise<Object>} Cached image record
 */
async function cacheGeneratedImage(imageData) {
  const { prompt, imageUrl, dimensions, contextType, styleVersionId, metadata } = imageData;

  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);

  const { data, error } = await supabase
    .from('generated_images')
    .insert({
      prompt_hash: promptHash,
      context_type: contextType,
      image_url: imageUrl,
      prompt: prompt,
      style_version_id: styleVersionId,
      dimensions: dimensions,
      metadata: metadata || {}
    })
    .select()
    .single();

  if (error) {
    console.error('Error caching generated image:', error);
    throw new Error('Failed to cache generated image');
  }

  return data;
}

/**
 * Store generated text in cache
 * @param {Object} textData - Text data to cache
 * @returns {Promise<Object>} Cached text record
 */
async function cacheGeneratedText(textData) {
  const { contextKey, textType, content, context, styleVersionId, llmUsed } = textData;

  const { data, error } = await supabase
    .from('generated_text')
    .insert({
      context_key: contextKey,
      text_type: textType,
      content: content,
      context: context || {},
      style_version_id: styleVersionId,
      llm_used: llmUsed
    })
    .select()
    .single();

  if (error) {
    console.error('Error caching generated text:', error);
    throw new Error('Failed to cache generated text');
  }

  return data;
}

/**
 * Check if an asset generation request is already pending
 * @param {string} requestHash - Hash of the request
 * @returns {Promise<Object|null>} Pending request or null
 */
async function checkPendingRequest(requestHash) {
  const { data, error } = await supabase
    .from('asset_requests')
    .select('*')
    .eq('request_hash', requestHash)
    .in('status', ['pending', 'processing'])
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking pending request:', error);
    return null;
  }

  return data;
}

/**
 * Create a new asset generation request
 * @param {string} requestHash - Hash of the request
 * @param {string} requestType - 'image' or 'text'
 * @returns {Promise<Object>} Created request record
 */
async function createAssetRequest(requestHash, requestType) {
  const { data, error } = await supabase
    .from('asset_requests')
    .insert({
      request_type: requestType,
      request_hash: requestHash,
      status: 'processing'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating asset request:', error);
    throw new Error('Failed to create asset request');
  }

  return data;
}

/**
 * Update asset request status
 * @param {string} requestId - Request ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated request record
 */
async function updateAssetRequestStatus(requestId, status) {
  const updateData = { status };

  if (status === 'completed' || status === 'failed') {
    updateData.completed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('asset_requests')
    .update(updateData)
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating asset request:', error);
    throw new Error('Failed to update asset request');
  }

  return data;
}

/**
 * Clean up stale asset requests (called periodically)
 * @returns {Promise<void>}
 */
async function cleanupStaleRequests() {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { error } = await supabase
    .from('asset_requests')
    .delete()
    .in('status', ['pending', 'processing'])
    .lt('started_at', oneHourAgo);

  if (error) {
    console.error('Error cleaning up stale requests:', error);
  }
}

module.exports = {
  generateHash,
  checkImageCache,
  checkTextCache,
  cacheGeneratedImage,
  cacheGeneratedText,
  checkPendingRequest,
  createAssetRequest,
  updateAssetRequestStatus,
  cleanupStaleRequests
};
