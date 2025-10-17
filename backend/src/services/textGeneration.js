const { getActiveStyleConfig } = require('./styleConfig');
const {
  checkTextCache,
  cacheGeneratedText,
  checkPendingRequest,
  createAssetRequest,
  updateAssetRequestStatus,
  generateHash
} = require('./assetCache');
const { generateText: geminiGenerate } = require('./gemini');
const { generateText: localGenerate } = require('./localLLM');

/**
 * Generate text with intelligent caching and LLM routing
 * @param {Object} params - Generation parameters
 * @param {string} params.contextKey - Unique cache key
 * @param {string} params.textType - 'narration', 'description', 'dialogue', 'quest_text', 'flavor'
 * @param {string} params.prompt - Generation prompt
 * @param {Object} params.context - Additional context variables
 * @param {boolean} params.useGemini - Force use of Gemini (for high-quality content)
 * @returns {Promise<Object>} Generated text and metadata
 */
async function generateText({ contextKey, textType, prompt, context = {}, useGemini = false }) {
  // Step 1: Check cache first
  const cached = await checkTextCache(contextKey, textType);
  if (cached) {
    console.log(`[TextGen] Cache hit for: ${contextKey}`);
    return {
      content: cached.content,
      cached: true,
      llmUsed: cached.llm_used,
      metadata: { generatedAt: cached.created_at }
    };
  }

  // Step 2: Check if already being generated
  const requestHash = generateHash(`text|${contextKey}|${textType}`);
  const pending = await checkPendingRequest(requestHash);

  if (pending) {
    console.log(`[TextGen] Request already pending, waiting...`);
    return await pollForCompletion(pending.id, contextKey, textType);
  }

  // Step 3: Create request lock
  const request = await createAssetRequest(requestHash, 'text');

  try {
    // Step 4: Get active style configuration
    const styleConfig = await getActiveStyleConfig();
    const styleVersionId = await getStyleVersionId();

    // Step 5: Build full prompt with style injection
    const fullPrompt = buildTextPrompt(prompt, textType, context, styleConfig);

    // Step 6: Determine which LLM to use
    const llmToUse = decideLLM(textType, useGemini);

    console.log(`[TextGen] Generating with ${llmToUse}: ${contextKey}`);

    // Step 7: Generate text
    const generatedContent = await generateWithLLM(fullPrompt, llmToUse, textType);

    // Step 8: Cache the result
    await cacheGeneratedText({
      contextKey,
      textType,
      content: generatedContent,
      context,
      styleVersionId,
      llmUsed: llmToUse
    });

    // Step 9: Mark request as completed
    await updateAssetRequestStatus(request.id, 'completed');

    return {
      content: generatedContent,
      cached: false,
      llmUsed: llmToUse,
      metadata: { generatedAt: new Date().toISOString() }
    };
  } catch (error) {
    console.error('[TextGen] Generation failed:', error);
    await updateAssetRequestStatus(request.id, 'failed');
    throw error;
  }
}

/**
 * Build complete text prompt with style injection
 */
function buildTextPrompt(userPrompt, textType, context, styleConfig) {
  const tone = getToneForTextType(textType);

  let systemPrompt = `You are a dungeon master narrating a dark fantasy RPG inspired by Baldur's Gate 3. `;
  systemPrompt += `Tone: ${tone}. `;
  systemPrompt += `Style: Rich, atmospheric, dramatic but not overwrought. Avoid cliches. `;

  if (textType === 'narration') {
    systemPrompt += `Focus on sensory details, mood, and player agency. Keep it concise (2-3 sentences). `;
  } else if (textType === 'description') {
    systemPrompt += `Provide vivid, evocative descriptions. Include specific details. 1-2 paragraphs max. `;
  } else if (textType === 'dialogue') {
    systemPrompt += `Write natural dialogue that reveals character. Include body language. `;
  } else if (textType === 'flavor') {
    systemPrompt += `Brief, punchy flavor text. One sentence, make it memorable. `;
  }

  // Add context variables
  if (Object.keys(context).length > 0) {
    systemPrompt += `\n\nContext: ${JSON.stringify(context)}`;
  }

  return `${systemPrompt}\n\n${userPrompt}`;
}

/**
 * Get appropriate tone for text type
 */
function getToneForTextType(textType) {
  const tones = {
    narration: 'immersive, present-tense, engaging',
    description: 'detailed, atmospheric, mysterious',
    dialogue: 'natural, character-driven, purposeful',
    quest_text: 'clear, motivating, hints at deeper story',
    flavor: 'punchy, memorable, slightly ominous'
  };
  return tones[textType] || 'engaging, atmospheric';
}

/**
 * Decide which LLM to use based on text type and flags
 */
function decideLLM(textType, forceGemini) {
  if (forceGemini) return 'gemini_pro';

  // Use Gemini for high-quality creative content
  const geminiTypes = ['quest_text', 'dialogue'];
  if (geminiTypes.includes(textType)) {
    return 'gemini_pro';
  }

  // Use local LLM for routine narration and descriptions
  return 'local_llm';
}

/**
 * Generate text with specified LLM
 */
async function generateWithLLM(prompt, llmType, textType) {
  try {
    if (llmType === 'gemini_pro') {
      return await geminiGenerate(prompt, {
        temperature: 0.8,
        maxTokens: getMaxTokensForType(textType)
      });
    } else if (llmType === 'local_llm') {
      return await localGenerate(prompt, {
        temperature: 0.7,
        maxTokens: getMaxTokensForType(textType)
      });
    }
  } catch (error) {
    console.error(`[TextGen] ${llmType} failed:`, error.message);

    // Fallback: if local fails, try Gemini
    if (llmType === 'local_llm') {
      console.log('[TextGen] Falling back to Gemini');
      return await geminiGenerate(prompt, {
        temperature: 0.8,
        maxTokens: getMaxTokensForType(textType)
      });
    }

    throw error;
  }
}

/**
 * Get max tokens based on text type
 */
function getMaxTokensForType(textType) {
  const limits = {
    narration: 150,
    description: 300,
    dialogue: 200,
    quest_text: 400,
    flavor: 50
  };
  return limits[textType] || 200;
}

/**
 * Poll for completion of a pending request
 */
async function pollForCompletion(requestId, contextKey, textType) {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const maxAttempts = 30; // 30 seconds
  const interval = 1000; // 1 second

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, interval));

    const { data } = await supabase
      .from('asset_requests')
      .select('status')
      .eq('id', requestId)
      .single();

    if (data && data.status === 'completed') {
      // Fetch cached result
      const cachedResult = await checkTextCache(contextKey, textType);
      if (cachedResult) {
        return {
          content: cachedResult.content,
          cached: true,
          llmUsed: cachedResult.llm_used,
          metadata: { generatedAt: cachedResult.created_at }
        };
      }
    } else if (data && data.status === 'failed') {
      throw new Error('Text generation failed');
    }
  }

  throw new Error('Text generation timed out');
}

/**
 * Get the current style version ID
 */
async function getStyleVersionId() {
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
  );

  const { data } = await supabase
    .from('style_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  return data?.id || null;
}

/**
 * Batch generate text for multiple contexts (optimization)
 */
async function batchGenerateText(requests) {
  const results = await Promise.all(
    requests.map(req => generateText(req).catch(err => ({
      error: err.message,
      contextKey: req.contextKey
    })))
  );

  return results;
}

module.exports = {
  generateText,
  batchGenerateText
};
