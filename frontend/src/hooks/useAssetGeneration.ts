import { useState, useEffect } from 'react';

interface ImageGenerationParams {
  prompt: string;
  dimensions: { width: number; height: number };
  contextType: 'character_portrait' | 'location_banner' | 'item_icon' | 'biome_tile' | 'ui_element';
  context?: Record<string, any>;
}

interface ImageResult {
  imageUrl: string | null;
  cached: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for generating AI images with caching
 */
export function useImageGeneration(params: ImageGenerationParams | null): ImageResult {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params) return;

    const generateImage = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use relative URL - Vite proxy will forward to backend
        const response = await fetch('/api/assets/image', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(180000) // 3 minute timeout
        });

        if (!response.ok) {
          const statusText = `${response.status} ${response.statusText}`;
          console.warn(`[useImageGeneration] Failed with ${statusText}, using fallback`);
          setError(`Image generation failed (${statusText})`);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[useImageGeneration] Received:', data);
        setImageUrl(data.imageUrl);
        setCached(data.cached);
        setError(null);
      } catch (err: any) {
        // Suppress specific browser errors
        if (err?.message?.includes('Receiving end does not exist')) {
          console.warn('[useImageGeneration] Browser extension error (harmless), using fallback');
          return;
        }
        console.warn('[useImageGeneration] Error (will use fallback):', err?.message || err);
        setError(err?.message || 'Image generation failed');
      } finally {
        setLoading(false);
      }
    };

    generateImage();
  }, [params?.prompt, params?.contextType]);

  return { imageUrl, cached, loading, error };
}

interface TextGenerationParams {
  contextKey: string;
  textType: 'narration' | 'description' | 'dialogue' | 'quest_text' | 'flavor';
  prompt: string;
  context?: Record<string, any>;
  useGemini?: boolean;
}

interface TextResult {
  content: string | null;
  cached: boolean;
  loading: boolean;
  error: string | null;
  llmUsed?: string;
}

/**
 * Hook for generating AI text with caching
 */
export function useTextGeneration(params: TextGenerationParams | null): TextResult {
  const [content, setContent] = useState<string | null>(null);
  const [cached, setCached] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [llmUsed, setLlmUsed] = useState<string>();

  useEffect(() => {
    if (!params) return;

    const generateText = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use relative URL - Vite proxy will forward to backend
        const response = await fetch('/api/assets/text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params)
        });

        if (!response.ok) {
          throw new Error('Text generation failed');
        }

        const data = await response.json();
        setContent(data.content);
        setCached(data.cached);
        setLlmUsed(data.llmUsed);
      } catch (err: any) {
        console.error('[useTextGeneration] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    generateText();
  }, [params?.contextKey]);

  return { content, cached, loading, error, llmUsed };
}
