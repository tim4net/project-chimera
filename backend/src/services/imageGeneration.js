const { getActiveStyleConfig } = require('./styleConfig');
const {
  checkImageCache,
  cacheGeneratedImage,
  checkPendingRequest,
  createAssetRequest,
  updateAssetRequestStatus,
  generateHash
} = require('./assetCache');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Generate an image with intelligent caching and LLM routing
 * @param {Object} params - Generation parameters
 * @param {string} params.prompt - User prompt for the image
 * @param {Object} params.dimensions - {width, height}
 * @param {string} params.contextType - Type: 'character_portrait', 'location_banner', etc.
 * @param {Object} params.context - Additional context (character name, biome, etc.)
 * @returns {Promise<string>} Image URL
 */
async function generateImage({ prompt, dimensions, contextType, context = {} }) {
  // Step 1: Check cache first
  const cached = await checkImageCache(prompt, dimensions, contextType);
  if (cached) {
    console.log(`[ImageGen] Cache hit for: ${prompt.substring(0, 50)}...`);
    return {
      imageUrl: cached.image_url,
      cached: true,
      metadata: cached.metadata
    };
  }

  // Step 2: Check if already being generated
  const requestHash = generateHash(`image|${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`);
  const pending = await checkPendingRequest(requestHash);

  if (pending) {
    console.log(`[ImageGen] Request already pending, waiting...`);
    return await pollForCompletion(pending.id, requestHash, 'image');
  }

  // Step 3: Create request lock
  const request = await createAssetRequest(requestHash, 'image');

  try {
    // Step 4: Get active style configuration
    const styleConfig = await getActiveStyleConfig();
    const styleVersionId = await getStyleVersionId();

    // Step 5: Build full prompt with style injection
    const fullPrompt = buildImagePrompt(prompt, contextType, context, styleConfig);

    console.log(`[ImageGen] Generating new image: ${fullPrompt.substring(0, 100)}...`);

    // Step 6: Try generation pipeline (Local -> Gemini)
    const imageBuffer = await tryGenerationPipeline(fullPrompt, dimensions, styleConfig);

    // Step 7: Upload to Supabase Storage
    const fileName = `${contextType}/${Date.now()}_${generateHash(prompt).substring(0, 16)}.png`;
    const storedUrl = await uploadToStorage(imageBuffer, fileName);

    // Step 8: Cache the result
    await cacheGeneratedImage({
      prompt,
      imageUrl: storedUrl,
      dimensions,
      contextType,
      styleVersionId,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'placeholder', // Will be updated when real generation is implemented
        contextProvided: Object.keys(context)
      }
    });

    // Step 9: Mark request as completed
    await updateAssetRequestStatus(request.id, 'completed');

    return {
      imageUrl: storedUrl,
      cached: false,
      metadata: { generatedAt: new Date().toISOString() }
    };
  } catch (error) {
    console.error('[ImageGen] Generation failed:', error);
    await updateAssetRequestStatus(request.id, 'failed');
    throw error;
  }
}

/**
 * Build complete image prompt with style injection
 */
function buildImagePrompt(userPrompt, contextType, context, styleConfig) {
  const imageStyle = styleConfig.imageStyle;
  let stylePrompt = imageStyle.basePrompt;

  // Add context-specific style
  if (contextType === 'character_portrait' && imageStyle.characterStyle) {
    stylePrompt += `, ${imageStyle.characterStyle}`;
  } else if (contextType === 'location_banner' && imageStyle.environmentStyle) {
    stylePrompt += `, ${imageStyle.environmentStyle}`;
  } else if (contextType === 'item_icon' && imageStyle.itemStyle) {
    stylePrompt += `, ${imageStyle.itemStyle}`;
  } else if (contextType === 'biome_tile' && context.biome && imageStyle.biomeStyles) {
    const biomeStyle = imageStyle.biomeStyles[context.biome];
    if (biomeStyle) {
      stylePrompt += `, ${biomeStyle}`;
    }
  }

  return `${stylePrompt}. ${userPrompt}. Negative prompt: ${imageStyle.negativePrompt}`;
}

/**
 * Try generation pipeline: Local LLM first, then Gemini
 */
async function tryGenerationPipeline(prompt, dimensions, styleConfig) {
  const priority = (process.env.IMAGE_GENERATION_PRIORITY || 'LOCAL,GOOGLE_FREE,GOOGLE_PAID').split(',');

  for (const provider of priority) {
    try {
      switch (provider.trim()) {
        case 'LOCAL':
          return await generateWithLocalLLM(prompt, dimensions);
        case 'GOOGLE_FREE':
          return await generateWithGemini(prompt, dimensions, 'free');
        case 'GOOGLE_PAID':
          return await generateWithGemini(prompt, dimensions, 'paid');
        default:
          console.warn(`[ImageGen] Unknown provider: ${provider}`);
      }
    } catch (error) {
      console.warn(`[ImageGen] ${provider} failed, trying next provider:`, error.message);
      continue;
    }
  }

  throw new Error('All image generation providers failed');
}

/**
 * Generate with local LLM (placeholder - to be implemented with actual local model)
 */
async function generateWithLocalLLM(prompt, dimensions) {
  // TODO: Implement local LLM image generation
  // For now, throw error to fall through to next provider
  throw new Error('Local LLM not yet implemented');
}

/**
 * Generate with Gemini Imagen (placeholder - to be implemented with actual API)
 */
async function generateWithGemini(prompt, dimensions, tier) {
  // TODO: Implement Gemini Imagen generation
  // For now, return a placeholder
  console.log(`[ImageGen] Using Gemini ${tier} for generation (placeholder)`);

  // Return placeholder image buffer
  return createPlaceholderImage(dimensions);
}

/**
 * Create a placeholder image buffer
 */
function createPlaceholderImage(dimensions) {
  // Simple SVG placeholder
  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#1a1f2e"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#d4af37" font-family="Arial" font-size="20">
        ${dimensions.width}x${dimensions.height}
      </text>
    </svg>
  `;
  return Buffer.from(svg);
}

/**
 * Upload image to Supabase Storage
 */
async function uploadToStorage(imageBuffer, fileName) {
  const { data, error } = await supabase.storage
    .from('generated-assets')
    .upload(fileName, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '31536000', // 1 year
      upsert: false
    });

  if (error) {
    console.error('[ImageGen] Storage upload failed:', error);
    throw new Error('Failed to upload image to storage');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('generated-assets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

/**
 * Poll for completion of a pending request
 */
async function pollForCompletion(requestId, requestHash, requestType) {
  const maxAttempts = 30; // 30 seconds total
  const interval = 1000; // 1 second

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));

    // Check if completed
    const { data } = await supabase
      .from('asset_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (data && data.status === 'completed') {
      // Fetch the cached result
      if (requestType === 'image') {
        const { data: cachedData } = await supabase
          .from('generated_images')
          .select('*')
          .eq('prompt_hash', requestHash.split('|')[1]) // Extract prompt hash
          .single();

        if (cachedData) {
          return {
            imageUrl: cachedData.image_url,
            cached: true,
            metadata: cachedData.metadata
          };
        }
      }
    } else if (data && data.status === 'failed') {
      throw new Error('Asset generation failed');
    }
  }

  throw new Error('Asset generation timed out');
}

/**
 * Get the current style version ID
 */
async function getStyleVersionId() {
  const { data } = await supabase
    .from('style_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  return data?.id || null;
}

module.exports = {
  generateImage
};
