/**
 * Local LLM service (stub - to be implemented)
 * Falls back to Gemini when called
 */

async function generateText(prompt, options = {}) {
  console.log('[LocalLLM] Not yet implemented, throwing error to trigger Gemini fallback');
  throw new Error('Local LLM not configured - using Gemini fallback');
}

module.exports = {
  generateText
};
