const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateOnboardingScene(character) {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

  const prompt = `Generate a short, exciting onboarding scene for a new D&D character.

  Character Details:
  - Name: ${character.name}
  - Race: ${character.race}
  - Class: ${character.class}

  Scene:`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error('Error generating content from Gemini:', error);
    return 'You awaken in a strange place...'; // Fallback content
  }
}

async function generateText(prompt, options = {}) {
  const model = genAI.getGenerativeModel({
    model: 'gemini-pro',
    generationConfig: {
      temperature: options.temperature || 0.8,
      maxOutputTokens: options.maxTokens || 200
    }
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return await response.text();
  } catch (error) {
    console.error('Error generating text from Gemini:', error);
    throw error;
  }
}

// Note: Gemini doesn't have built-in image generation via the API
// For now, we'll use a placeholder. Real implementation would use:
// - Imagen API (Google Cloud)
// - Stable Diffusion API
// - DALL-E API
// - Or local Stable Diffusion
async function generateImage(prompt, dimensions = { width: 512, height: 512 }) {
  console.log('[Gemini] Image generation requested:', prompt);
  console.log('[Gemini] Note: Using placeholder - implement Imagen or SD API for real images');

  // Return null to indicate not implemented
  // The imageGeneration service will fall back to placeholder
  return null;
}

module.exports = {
  generateOnboardingScene,
  generateText,
  generateImage
};
