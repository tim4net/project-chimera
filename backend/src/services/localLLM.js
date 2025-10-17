const axios = require('axios');

const localLLMHostnames = process.env.LOCAL_LLM_HOSTNAMES.split(',');
const localLLMApiKeys = process.env.LOCAL_LLM_API_KEYS.split(',');

const localLLMModel = process.env.LOCAL_LLM_MODEL;

const generateNarration = async (prompt) => {
  for (let i = 0; i < localLLMHostnames.length; i++) {
    try {
      const response = await axios.post(
        `${localLLMHostnames[i]}/v1/completions`,
        {
          model: localLLMModel,
          prompt,
          max_tokens: 150,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localLLMApiKeys[i]}`,
          },
        }
      );
      return response.data.choices[0].text;
    } catch (error) {
      console.error(`Error generating narration from local LLM at ${localLLMHostnames[i]}:`, error);
    }
  }
  return null;
};

module.exports = { generateNarration };
