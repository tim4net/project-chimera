import crypto from 'crypto';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabaseServiceClient } from './supabaseClient';
import type {
  AssetRequestRow,
  GeneratedImageRow,
  GeneratedTextRow
} from '../types/database';
import type { ImageDimensions, ImageGenerationParams, TextGenerationParams } from '../types';

export const generateHash = (content: string): string => {
  return crypto.createHash('sha256').update(content).digest('hex');
};

const handleNotFound = <T>(error: PostgrestError | null, data: T | null): T | null => {
  if (error && error.code !== 'PGRST116') {
    console.error('Supabase query error:', error);
    return null;
  }

  return data;
};

export const checkImageCache = async (
  prompt: string,
  dimensions: ImageDimensions,
  contextType: ImageGenerationParams['contextType']
): Promise<GeneratedImageRow | null> => {
  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);

  const { data, error } = await supabaseServiceClient
    .from('generated_images')
    .select('*')
    .eq('prompt_hash', promptHash)
    .single();

  return handleNotFound(error, data as GeneratedImageRow | null);
};

export const checkTextCache = async (
  contextKey: string,
  textType: TextGenerationParams['textType']
): Promise<GeneratedTextRow | null> => {
  const { data, error } = await supabaseServiceClient
    .from('generated_text')
    .select('*')
    .eq('context_key', contextKey)
    .eq('text_type', textType)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return handleNotFound(error, data as GeneratedTextRow | null);
};

export const cacheGeneratedImage = async (imageData: {
  prompt: string;
  imageUrl: string;
  dimensions: ImageDimensions;
  contextType: ImageGenerationParams['contextType'];
  styleVersionId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<GeneratedImageRow> => {
  const { prompt, imageUrl, dimensions, contextType, styleVersionId, metadata } = imageData;
  const cacheKey = `${prompt}|${dimensions.width}x${dimensions.height}|${contextType}`;
  const promptHash = generateHash(cacheKey);

  try {
    const { data, error } = await supabaseServiceClient
      .from('generated_images')
      .insert({
        prompt_hash: promptHash,
        context_type: contextType,
        image_url: imageUrl,
        prompt,
        style_version_id: styleVersionId ?? null,
        dimensions,
        metadata: metadata ?? {}
      })
      .select()
      .single();

    if (error) {
      console.warn('Error caching generated image (continuing without cache):', error);
      // Return a dummy object to continue processing
      return {
        id: 'dummy',
        request_id: null,
        prompt,
        context_type: contextType,
        image_url: imageUrl,
        dimensions: dimensions as any,
        metadata,
        created_at: new Date().toISOString(),
        expires_at: new Date().toISOString()
      } as any;
    }

    return data as GeneratedImageRow;
  } catch (err) {
    console.warn('Failed to cache generated image (continuing without cache):', err);
    // Return a dummy object to continue processing
    return {
      id: 'dummy',
      request_id: null,
      prompt,
      context_type: contextType,
      image_url: imageUrl,
      dimensions: dimensions as any,
      metadata,
      created_at: new Date().toISOString(),
      expires_at: new Date().toISOString()
    } as any;
  }
};

export const cacheGeneratedText = async (textData: {
  contextKey: string;
  textType: TextGenerationParams['textType'];
  content: string;
  context?: Record<string, unknown>;
  styleVersionId?: string | null;
  llmUsed: string;
}): Promise<GeneratedTextRow> => {
  const { contextKey, textType, content, context, styleVersionId, llmUsed } = textData;

  const { data, error } = await supabaseServiceClient
    .from('generated_text')
    .insert({
      context_key: contextKey,
      text_type: textType,
      content,
      context: context ?? {},
      style_version_id: styleVersionId ?? null,
      llm_used: llmUsed
    })
    .select()
    .single();

  if (error) {
    console.error('Error caching generated text:', error);
    throw new Error('Failed to cache generated text');
  }

  return data as GeneratedTextRow;
};

export const checkPendingRequest = async (requestHash: string): Promise<AssetRequestRow | null> => {
  const { data, error } = await supabaseServiceClient
    .from('asset_requests')
    .select('*')
    .eq('request_hash', requestHash)
    .in('status', ['pending', 'processing'])
    .single();

  return handleNotFound(error, data as AssetRequestRow | null);
};

const getExistingRequest = async (requestHash: string): Promise<AssetRequestRow | null> => {
  const { data } = await supabaseServiceClient
    .from('asset_requests')
    .select('*')
    .eq('request_hash', requestHash)
    .single();

  return data as AssetRequestRow | null;
};

export const createAssetRequest = async (
  requestHash: string,
  requestType: AssetRequestRow['request_type']
): Promise<AssetRequestRow> => {
  const { data, error } = await supabaseServiceClient
    .from('asset_requests')
    .insert({
      request_hash: requestHash,
      request_type: requestType,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    // Handle duplicate key error gracefully
    if (error.code === '23505') {
      console.warn('[AssetCache] Request already exists, fetching existing:', requestHash);
      const existing = await getExistingRequest(requestHash);
      if (existing) return existing;
    }

    console.error('Error creating asset request:', error);
    throw new Error('Failed to create asset request');
  }

  return data as AssetRequestRow;
};

export const updateAssetRequestStatus = async (
  requestId: string,
  status: AssetRequestRow['status']
): Promise<AssetRequestRow> => {
  const { data, error } = await supabaseServiceClient
    .from('asset_requests')
    .update({ status })
    .eq('id', requestId)
    .select()
    .single();

  if (error) {
    console.error('Error updating asset request status:', error);
    throw new Error('Failed to update asset request status');
  }

  return data as AssetRequestRow;
};

export const cleanupStaleRequests = async (olderThanMinutes: number = 30): Promise<number> => {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();

  const { data, error } = await supabaseServiceClient
    .from('asset_requests')
    .update({ status: 'failed' })
    .in('status', ['pending', 'processing'])
    .lt('started_at', cutoff)
    .select();

  if (error) {
    console.error('[AssetCache] Cleanup failed:', error);
    return 0;
  }

  const count = data?.length || 0;
  if (count > 0) {
    console.log(`[AssetCache] Marked ${count} stale requests as failed (older than ${olderThanMinutes} minutes)`);
  }
  return count;
};
