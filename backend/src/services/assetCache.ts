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
    console.error('Error caching generated image:', error);
    throw new Error('Failed to cache generated image');
  }

  return data as GeneratedImageRow;
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

export const cleanupStaleRequests = async (): Promise<void> => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { error } = await supabaseServiceClient
    .from('asset_requests')
    .delete()
    .in('status', ['pending', 'processing'])
    .lt('started_at', oneHourAgo);

  if (error) {
    console.error('Error cleaning up stale requests:', error);
  }
};
