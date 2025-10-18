import { GoogleGenerativeAI, type GenerativeModel } from '@google/generative-ai';

interface CharacterSummary {
  name: string;
  race: string;
  class: string;
}

const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const getModel = (modelName: string): GenerativeModel => {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  return genAI.getGenerativeModel({ model: modelName });
};

export const generateOnboardingScene = async (character: CharacterSummary): Promise<string> => {
  const prompt = `Generate a short, exciting onboarding scene for a new D&D character.

Character Details:
- Name: ${character.name}
- Race: ${character.race}
- Class: ${character.class}

Scene:`;

  try {
    const model = getModel('gemini-pro');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    return 'You awaken in a strange place...';
  }
};

export const generateText = async (
  prompt: string,
  options: { temperature?: number; maxTokens?: number } = {}
): Promise<string> => {
  try {
    const model = getModel('gemini-pro');
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: options.temperature ?? 0.8,
        maxOutputTokens: options.maxTokens ?? 200
      }
    });
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating text from Gemini:', error);
    throw error;
  }
};

export const generateImage = async (
  prompt: string,
  dimensions: { width: number; height: number } = { width: 512, height: 512 }
): Promise<null> => {
  // TODO: Replace placeholder once Gemini image generation is implemented; currently returns null.
  console.info('[Gemini] Image generation requested:', prompt, dimensions);
  console.info('[Gemini] Placeholder implementation. Configure Imagen or Stable Diffusion for real images.');
  return null;
};

export default {
  generateOnboardingScene,
  generateText,
  generateImage
};
