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
  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);
  const requestHash = `image|${promptHash}`;
  const pending = await checkPendingRequest(requestHash);

  if (pending) {
    console.log(`[ImageGen] Request already pending, waiting...`);
    return await pollForCompletion(pending.id, promptHash, 'image');
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
 * Generate with local image model (Stable Diffusion via Windows GPU server)
 */
async function generateWithLocalLLM(prompt, dimensions) {
  const localEndpoint = process.env.LOCAL_IMAGE_MODEL_ENDPOINT;
  const localModel = process.env.LOCAL_IMAGE_MODEL_NAME || 'stable-diffusion';
  const apiType = process.env.LOCAL_IMAGE_API_TYPE || 'automatic1111'; // automatic1111, comfyui, or openai

  if (!localEndpoint) {
    throw new Error('LOCAL_IMAGE_MODEL_ENDPOINT not configured');
  }

  console.log(`[ImageGen] Attempting local generation with ${localModel} (${apiType} API)...`);

  try {
    const fetch = (await import('node-fetch')).default;

    if (apiType === 'automatic1111') {
      // Automatic1111 WebUI API format
      const response = await fetch(`${localEndpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
          width: dimensions.width,
          height: dimensions.height,
          steps: 20,
          cfg_scale: 7,
          sampler_name: 'DPM++ 2M Karras',
          batch_size: 1,
          n_iter: 1
        }),
        timeout: 120000 // 2 minute timeout for local generation
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Automatic1111 API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Response contains array of base64 images
      if (data.images && data.images[0]) {
        const buffer = Buffer.from(data.images[0], 'base64');
        console.log(`[ImageGen] ✓ Local generation successful (A1111): ${buffer.length} bytes`);
        return buffer;
      }

      throw new Error('Automatic1111 response missing image data');

    } else if (apiType === 'comfyui') {
      // ComfyUI workflow API (simplified)
      throw new Error('ComfyUI API integration not yet implemented. Use Automatic1111 or OpenAI format.');

    } else {
      // OpenAI-compatible API format (for LM Studio, Ollama with image plugins)
      const response = await fetch(`${localEndpoint}/images/generations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: localModel,
          prompt: prompt,
          n: 1,
          size: `${dimensions.width}x${dimensions.height}`
        }),
        timeout: 60000 // 1 minute timeout
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      // Handle both base64 and URL responses
      if (data.data && data.data[0]) {
        if (data.data[0].b64_json) {
          const buffer = Buffer.from(data.data[0].b64_json, 'base64');
          console.log(`[ImageGen] ✓ Local generation successful (OpenAI): ${buffer.length} bytes`);
          return buffer;
        } else if (data.data[0].url) {
          const imageResponse = await fetch(data.data[0].url);
          const arrayBuffer = await imageResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          console.log(`[ImageGen] ✓ Local generation successful (OpenAI): ${buffer.length} bytes`);
          return buffer;
        }
      }

      throw new Error('OpenAI API response missing image data');
    }
  } catch (error) {
    console.error(`[ImageGen] ⚠ Local image generation failed, falling back to cloud:`, error.message);
    // Log to server for monitoring local model issues
    await logImageGenerationFallback('local', 'cloud', error.message, prompt);
    throw error;
  }
}

/**
 * Generate with Gemini/Imagen using Pollinations.ai (free, no API key needed)
 */
async function generateWithGemini(prompt, dimensions, tier) {
  console.log(`[ImageGen] Generating with Pollinations.ai...`);

  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Pollinations.ai provides free AI image generation
      // URL format: https://image.pollinations.ai/prompt/{prompt}?width={w}&height={h}
      const encodedPrompt = encodeURIComponent(prompt);
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true`;

      console.log(`[ImageGen] Attempt ${attempt}/${maxRetries}: Fetching from Pollinations...`);

      const fetch = (await import('node-fetch')).default;
      const response = await fetch(url, {
        timeout: 120000 // 2 minute timeout per attempt
      });

      if (!response.ok) {
        throw new Error(`Pollinations API returned ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[ImageGen] ✓ Generated image: ${buffer.length} bytes`);
      return buffer;
    } catch (error) {
      lastError = error;
      console.error(`[ImageGen] Attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = attempt * 2000; // Exponential backoff
        console.log(`[ImageGen] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error(`[ImageGen] All ${maxRetries} attempts failed`);
  throw lastError;
}

/**
 * Create a simple colored placeholder (last resort fallback)
 */
function createPlaceholderImage(dimensions) {
  // Simple gradient PNG placeholder
  const svg = `
    <svg width="${dimensions.width}" height="${dimensions.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#0a0e1a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#1a1f2e;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#252b3d;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)"/>
      <text x="50%" y="50%" text-anchor="middle" fill="#d4af37" font-family="Arial" font-size="16" opacity="0.5">
        Generating...
      </text>
    </svg>
  `;
  return Buffer.from(svg);
}

/**
 * Upload image to Supabase Storage
 */
async function uploadToStorage(imageBuffer, fileName, contentType = 'image/png') {
  const { data, error } = await supabase.storage
    .from('generated-assets')
    .upload(fileName, imageBuffer, {
      contentType: contentType,
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
async function pollForCompletion(requestId, promptHash, requestType) {
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
          .eq('prompt_hash', promptHash)
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

/**
 * Log image generation fallback events for monitoring
 */
async function logImageGenerationFallback(fromProvider, toProvider, reason, prompt) {
  try {
    await supabase
      .from('image_generation_logs')
      .insert({
        from_provider: fromProvider,
        to_provider: toProvider,
        fallback_reason: reason,
        prompt_preview: prompt.substring(0, 200),
        occurred_at: new Date().toISOString()
      });

    console.log(`[ImageGen] 📊 Logged fallback: ${fromProvider} → ${toProvider}`);
  } catch (error) {
    // Don't fail the image generation if logging fails
    console.error('[ImageGen] Failed to log fallback:', error.message);
  }
}

module.exports = {
  generateImage
};
