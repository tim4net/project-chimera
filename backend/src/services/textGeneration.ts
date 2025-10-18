import { setTimeout as sleep } from 'node:timers/promises';
import { getActiveStyleConfig } from './styleConfig';
import {
  cacheGeneratedText,
  checkPendingRequest,
  checkTextCache,
  createAssetRequest,
  generateHash,
  updateAssetRequestStatus
} from './assetCache';
import { supabaseServiceClient } from './supabaseClient';
import { generateText as geminiGenerate } from './gemini';
import { generateText as localGenerate } from './localLLM';
import type {
  TextGenerationParams,
  TextGenerationResult,
  TextType
} from '../types';

const buildTextPrompt = (
  userPrompt: string,
  textType: TextType,
  context: Record<string, unknown>,
  _styleConfig: unknown
): string => {
  const tone = getToneForTextType(textType);

  let systemPrompt = 'You are a dungeon master narrating a dark fantasy RPG inspired by Baldur\'s Gate 3. ';
  systemPrompt += `Tone: ${tone}. `;
  systemPrompt += 'Style: Rich, atmospheric, dramatic but not overwrought. Avoid cliches. ';

  if (textType === 'narration') {
    systemPrompt += 'Focus on sensory details, mood, and player agency. Keep it concise (2-3 sentences). ';
  } else if (textType === 'description') {
    systemPrompt += 'Provide vivid, evocative descriptions. Include specific details. 1-2 paragraphs max. ';
  } else if (textType === 'dialogue') {
    systemPrompt += 'Write natural dialogue that reveals character. Include body language. ';
  } else if (textType === 'flavor') {
    systemPrompt += 'Brief, punchy flavor text. One sentence, make it memorable. ';
  }

  if (Object.keys(context).length > 0) {
    systemPrompt += `\n\nContext: ${JSON.stringify(context)}`;
  }

  return `${systemPrompt}\n\n${userPrompt}`;
};

const getToneForTextType = (textType: TextType): string => {
  const tones: Record<TextType, string> = {
    narration: 'immersive, present-tense, engaging',
    description: 'detailed, atmospheric, mysterious',
    dialogue: 'natural, character-driven, purposeful',
    quest_text: 'clear, motivating, hints at deeper story',
    flavor: 'punchy, memorable, slightly ominous'
  };

  return tones[textType] ?? 'engaging, atmospheric';
};

const decideLLM = (textType: TextType, forceGemini?: boolean): 'gemini_pro' | 'local_llm' => {
  if (forceGemini) {
    return 'gemini_pro';
  }

  const geminiTypes: TextType[] = ['quest_text', 'dialogue'];
  if (geminiTypes.includes(textType)) {
    return 'gemini_pro';
  }

  return 'local_llm';
};

const getMaxTokensForType = (textType: TextType): number => {
  const limits: Record<TextType, number> = {
    narration: 150,
    description: 300,
    dialogue: 200,
    quest_text: 400,
    flavor: 50
  };

  return limits[textType] ?? 200;
};

const generateWithLLM = async (
  prompt: string,
  llmType: 'gemini_pro' | 'local_llm',
  textType: TextType
): Promise<string> => {
  try {
    if (llmType === 'gemini_pro') {
      return await geminiGenerate(prompt, {
        temperature: 0.8,
        maxTokens: getMaxTokensForType(textType)
      });
    }

    return await localGenerate(prompt, {
      temperature: 0.7,
      maxTokens: getMaxTokensForType(textType)
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[TextGen] ${llmType} failed:`, message);

    if (llmType === 'local_llm') {
      console.info('[TextGen] Falling back to Gemini');
      return geminiGenerate(prompt, {
        temperature: 0.8,
        maxTokens: getMaxTokensForType(textType)
      });
    }

    throw error;
  }
};

const pollForCompletion = async (
  requestId: string,
  contextKey: string,
  textType: TextType
): Promise<TextGenerationResult> => {
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
      const cachedResult = await checkTextCache(contextKey, textType);
      if (cachedResult) {
        return {
          content: cachedResult.content,
          cached: true,
          llmUsed: cachedResult.llm_used as 'gemini_pro' | 'local_llm',
          metadata: { generatedAt: cachedResult.created_at }
        };
      }
    } else if (data?.status === 'failed') {
      throw new Error('Text generation failed');
    }
  }

  throw new Error('Text generation timed out');
};

const getStyleVersionId = async (): Promise<string | null> => {
  const { data } = await supabaseServiceClient
    .from('style_versions')
    .select('id')
    .eq('is_active', true)
    .single();

  return (data ?? null)?.id ?? null;
};

export const generateText = async ({
  contextKey,
  textType,
  prompt,
  context = {},
  useGemini = false
}: TextGenerationParams): Promise<TextGenerationResult> => {
  const cached = await checkTextCache(contextKey, textType);
  if (cached) {
    return {
      content: cached.content,
      cached: true,
      llmUsed: cached.llm_used as 'gemini_pro' | 'local_llm',
      metadata: { generatedAt: cached.created_at }
    };
  }

  const requestHash = generateHash(`text|${contextKey}|${textType}`);
  const pending = await checkPendingRequest(requestHash);

  if (pending) {
    return pollForCompletion(pending.id, contextKey, textType);
  }

  const request = await createAssetRequest(requestHash, 'text');

  try {
    const styleConfig = await getActiveStyleConfig();
    const styleVersionId = await getStyleVersionId();
    const fullPrompt = buildTextPrompt(prompt, textType, context, styleConfig);
    const llmToUse = decideLLM(textType, useGemini);

    console.info(`[TextGen] Generating with ${llmToUse}: ${contextKey}`);
    const generatedContent = await generateWithLLM(fullPrompt, llmToUse, textType);

    await cacheGeneratedText({
      contextKey,
      textType,
      content: generatedContent,
      context,
      styleVersionId,
      llmUsed: llmToUse
    });

    await updateAssetRequestStatus(request.id, 'completed');

    return {
      content: generatedContent,
      cached: false,
      llmUsed: llmToUse,
      metadata: { generatedAt: new Date().toISOString() }
    };
  } catch (error) {
    await updateAssetRequestStatus(request.id, 'failed');
    throw error;
  }
};

export const batchGenerateText = async (
  requests: TextGenerationParams[]
): Promise<Array<TextGenerationResult | { error: string; contextKey: string }>> => {
  const results = await Promise.all(
    requests.map(async request => {
      try {
        return await generateText(request);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return { error: message, contextKey: request.contextKey };
      }
    })
  );

  return results;
};

export default generateText;
