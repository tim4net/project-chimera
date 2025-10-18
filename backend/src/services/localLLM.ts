export const generateText = async (
  _prompt: string,
  _options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> => {
  console.warn('[LocalLLM] Not yet implemented, triggering Gemini fallback');
  throw new Error('Local LLM not configured - using Gemini fallback');
};

export default {
  generateText
};
