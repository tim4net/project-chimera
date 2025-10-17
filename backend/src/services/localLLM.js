/**
 * Local LLM service (stub - to be implemented)
 */

async function generateText(prompt, options = {}) {
  console.log('[LocalLLM] Not implemented, throwing error to fall back to Gemini');
  throw new Error('Local LLM not yet implemented - will fall back to Gemini');
}

module.exports = {
  generateText
};
