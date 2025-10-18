import { Buffer } from 'node:buffer';
import { setTimeout as sleep } from 'node:timers/promises';
import type { PostgrestError } from '@supabase/supabase-js';
import { getActiveStyleConfig } from './styleConfig';
import {
  cacheGeneratedImage,
  checkImageCache,
  checkPendingRequest,
  createAssetRequest,
  generateHash,
  updateAssetRequestStatus
} from './assetCache';
import { supabaseServiceClient } from './supabaseClient';
import type {
  ImageGenerationParams,
  ImageGenerationResult,
  ImageDimensions,
  StyleConfig
} from '../types';

const ensureFetch = async (): Promise<typeof fetch> => {
  if (typeof fetch !== 'undefined') {
    return fetch;
  }

  const nodeFetch = await import('node-fetch');
  return nodeFetch.default as unknown as typeof fetch;
};

const buildImagePrompt = (
  userPrompt: string,
  contextType: ImageGenerationParams['contextType'],
  context: Record<string, unknown>,
  styleConfig: StyleConfig
): string => {
  const imageStyle = styleConfig.imageStyle;

  // For character portraits, prioritize user prompt (contains character details)
  if (contextType === 'character_portrait') {
    const styleHint = imageStyle.characterStyle || imageStyle.basePrompt;
    const negativePrompt = imageStyle.negativePrompt ? `. Negative: ${imageStyle.negativePrompt}` : '';
    return `${userPrompt}. Style: ${styleHint}${negativePrompt}`;
  }

  // For other types, prepend style as before
  let stylePrompt = imageStyle.basePrompt;

  if (contextType === 'location_banner' && imageStyle.environmentStyle) {
    stylePrompt += `, ${imageStyle.environmentStyle}`;
  } else if (contextType === 'item_icon' && imageStyle.itemStyle) {
    stylePrompt += `, ${imageStyle.itemStyle}`;
  } else if (contextType === 'biome_tile' && 'biome' in context && imageStyle.biomeStyles) {
    const biomeStyle = imageStyle.biomeStyles[context.biome as string];
    if (biomeStyle) {
      stylePrompt += `, ${biomeStyle}`;
    }
  }

  const negativePrompt = imageStyle.negativePrompt ? ` Negative prompt: ${imageStyle.negativePrompt}` : '';
  return `${stylePrompt}. ${userPrompt}.${negativePrompt}`;
};

const tryGenerationPipeline = async (
  prompt: string,
  dimensions: ImageDimensions,
  styleConfig: StyleConfig,
  contextType?: string
): Promise<Buffer> => {
  const priority = (process.env.IMAGE_GENERATION_PRIORITY ?? 'LOCAL,GOOGLE_FREE,GOOGLE_PAID')
    .split(',')
    .map(provider => provider.trim());

  for (const provider of priority) {
    try {
      switch (provider) {
        case 'LOCAL':
          return await generateWithLocalLLM(prompt, dimensions);
        case 'GOOGLE_FREE':
          return await generateWithGemini(prompt, dimensions, 'free', contextType);
        case 'GOOGLE_PAID':
          return await generateWithGemini(prompt, dimensions, 'paid', contextType);
        default:
          console.warn(`[ImageGen] Unknown provider: ${provider}`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`[ImageGen] ${provider} failed, trying next provider: ${message}`);
    }
  }

  throw new Error('All image generation providers failed');
};

const generateWithLocalLLM = async (prompt: string, dimensions: ImageDimensions): Promise<Buffer> => {
  const localEndpoint = process.env.LOCAL_IMAGE_MODEL_ENDPOINT;
  const localModel = process.env.LOCAL_IMAGE_MODEL_NAME ?? 'stable-diffusion';
  const apiType = process.env.LOCAL_IMAGE_API_TYPE ?? 'automatic1111';

  if (!localEndpoint) {
    throw new Error('LOCAL_IMAGE_MODEL_ENDPOINT not configured');
  }

  console.info(`[ImageGen] Attempting local generation with ${localModel} (${apiType} API)...`);

  try {
    const fetchFn = await ensureFetch();

    if (apiType === 'automatic1111') {
      const response = await fetchFn(`${localEndpoint}/sdapi/v1/txt2img`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy',
          width: dimensions.width,
          height: dimensions.height,
          steps: 20,
          cfg_scale: 7,
          sampler_name: 'DPM++ 2M Karras',
          batch_size: 1,
          n_iter: 1
        }),
        signal: AbortSignal.timeout(120_000)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Automatic1111 API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json() as { images?: string[] };
      if (data.images?.[0]) {
        const buffer = Buffer.from(data.images[0], 'base64');
        console.info(`[ImageGen] Local generation successful (A1111): ${buffer.length} bytes`);
        return buffer;
      }

      throw new Error('Automatic1111 response missing image data');
    }

    if (apiType === 'comfyui') {
      throw new Error('ComfyUI API integration not yet implemented. Use Automatic1111 or OpenAI format.');
    }

    const response = await fetchFn(`${localEndpoint}/images/generations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: localModel,
        prompt,
        n: 1,
        size: `${dimensions.width}x${dimensions.height}`
      }),
      signal: AbortSignal.timeout(60_000)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json() as { data?: Array<{ b64_json?: string; url?: string }> };
    const imagePayload = data.data?.[0];

    if (imagePayload?.b64_json) {
      const buffer = Buffer.from(imagePayload.b64_json, 'base64');
      console.info(`[ImageGen] Local generation successful (OpenAI): ${buffer.length} bytes`);
      return buffer;
    }

    if (imagePayload?.url) {
      const imageResponse = await fetchFn(imagePayload.url);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.info(`[ImageGen] Local generation successful (OpenAI): ${buffer.length} bytes`);
      return buffer;
    }

    throw new Error('OpenAI API response missing image data');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[ImageGen] Local image generation failed:', message);
    await logImageGenerationFallback('local', 'cloud', message, prompt);
    throw error;
  }
};

const generateWithGemini = async (
  prompt: string,
  dimensions: ImageDimensions,
  tier: 'free' | 'paid',
  contextType?: string
): Promise<Buffer> => {
  console.info(`[ImageGen] Generating with Pollinations.ai (optimized for speed)...`);

  // Select best model based on task:
  // - flux: Best for character portraits (detailed, photorealistic)
  // - turbo: Fast for UI elements and icons
  // - Default: Good balance for landscapes/banners
  let model = 'flux'; // Default to best quality
  if (contextType === 'item_icon' || contextType === 'biome_tile') {
    model = 'turbo'; // Faster for simple graphics
  } else if (contextType === 'character_portrait') {
    model = 'flux'; // Best for detailed portraits
  } // location_banner uses default flux

  const maxRetries = 2; // Reduced from 3 for faster failure
  let lastError: unknown;
  const fetchFn = await ensureFetch();

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const encodedPrompt = encodeURIComponent(prompt);
      // Use selected model with seed for cache busting
      const url = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${dimensions.width}&height=${dimensions.height}&nologo=true&enhance=true&model=${model}&seed=${Date.now()}`;
      console.info(`[ImageGen] Attempt ${attempt}/${maxRetries}: Fetching (${model.toUpperCase()})...`);

      // Reduced timeout from 120s to 45s for faster response
      const response = await fetchFn(url, {
        signal: AbortSignal.timeout(45_000),
        headers: {
          'User-Agent': 'Project-Chimera/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`Pollinations API returned ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      console.info(`[ImageGen] ✓ Generated image (${buffer.length} bytes) in attempt ${attempt}`);
      return buffer;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[ImageGen] Attempt ${attempt} failed: ${message}`);
      if (attempt < maxRetries) {
        const delay = 1000; // Fixed 1s delay instead of exponential backoff
        console.info(`[ImageGen] Retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Image generation failed');
};

const createPlaceholderImage = (dimensions: ImageDimensions): Buffer => {
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
};

const uploadToStorage = async (
  imageBuffer: Buffer,
  fileName: string,
  contentType: string = 'image/png'
): Promise<string> => {
  const { data, error } = await supabaseServiceClient.storage
    .from('generated-assets')
    .upload(fileName, imageBuffer, {
      contentType,
      cacheControl: '31536000',
      upsert: false
    });

  if (error) {
    console.error('[ImageGen] Storage upload failed:', error);
    throw new Error('Failed to upload image to storage');
  }

  const { data: urlData } = supabaseServiceClient.storage
    .from('generated-assets')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
};

const pollForCompletion = async (
  requestId: string,
  promptHash: string,
  requestType: 'image'
): Promise<ImageGenerationResult> => {
  const maxAttempts = 30;
  const interval = 1000;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    await sleep(interval);

    const { data } = await supabaseServiceClient
      .from('asset_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (data?.status === 'completed') {
      if (requestType === 'image') {
        const { data: cachedData } = await supabaseServiceClient
          .from('generated_images')
          .select('*')
          .eq('prompt_hash', promptHash)
          .single();

        if (cachedData) {
          return {
            imageUrl: cachedData.image_url,
            cached: true,
            metadata: cachedData.metadata ?? {}
          };
        }
      }
    } else if (data?.status === 'failed') {
      throw new Error('Asset generation failed');
    }
  }

  throw new Error('Asset generation timed out');
};

const getStyleVersionId = async (): Promise<string | null> => {
  const { data } = await supabaseServiceClient
    .from('style_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  return (data ?? null)?.id ?? null;
};

const logImageGenerationFallback = async (
  fromProvider: string,
  toProvider: string,
  reason: string,
  prompt: string
): Promise<void> => {
  try {
    await supabaseServiceClient
      .from('image_generation_logs')
      .insert({
        from_provider: fromProvider,
        to_provider: toProvider,
        fallback_reason: reason,
        prompt_preview: prompt.substring(0, 200),
        occurred_at: new Date().toISOString()
      });
  } catch (error) {
    const message = (error as PostgrestError | Error | undefined)?.message ?? 'Unknown error';
    console.error('[ImageGen] Failed to log fallback:', message);
  }
};

export const generateImage = async ({
  prompt,
  dimensions,
  contextType,
  context = {}
}: ImageGenerationParams): Promise<ImageGenerationResult> => {
  const cached = await checkImageCache(prompt, dimensions, contextType);
  if (cached) {
    return {
      imageUrl: cached.image_url,
      cached: true,
      metadata: cached.metadata ?? {}
    };
  }

  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);
  const pending = await checkPendingRequest(`image|${promptHash}`);

  if (pending) {
    return pollForCompletion(pending.id, promptHash, 'image');
  }

  const request = await createAssetRequest(`image|${promptHash}`, 'image');

  try {
    const styleConfig = await getActiveStyleConfig();
    const styleVersionId = await getStyleVersionId();
    const fullPrompt = buildImagePrompt(prompt, contextType, context, styleConfig);

    console.info(`[ImageGen] Generating image: ${fullPrompt.substring(0, 100)}...`);

    let imageBuffer: Buffer;

    try {
      imageBuffer = await tryGenerationPipeline(fullPrompt, dimensions, styleConfig, contextType);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[ImageGen] Generation pipeline failed, using placeholder:', message);
      imageBuffer = createPlaceholderImage(dimensions);
    }

    const fileName = `${contextType}/${Date.now()}_${generateHash(prompt).substring(0, 16)}.png`;
    const storedUrl = await uploadToStorage(imageBuffer, fileName);

    await cacheGeneratedImage({
      prompt,
      imageUrl: storedUrl,
      dimensions,
      contextType,
      styleVersionId,
      metadata: {
        generatedAt: new Date().toISOString(),
        model: 'placeholder',
        contextProvided: Object.keys(context)
      }
    });

    await updateAssetRequestStatus(request.id, 'completed');

    return {
      imageUrl: storedUrl,
      cached: false,
      metadata: { generatedAt: new Date().toISOString() }
    };
  } catch (error) {
    await updateAssetRequestStatus(request.id, 'failed');
    throw error;
  }
};

export default generateImage;
