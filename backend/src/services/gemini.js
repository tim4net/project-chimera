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

module.exports = {
  generateOnboardingScene,
};
