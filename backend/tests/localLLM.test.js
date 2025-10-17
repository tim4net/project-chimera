process.env.LOCAL_LLM_HOSTNAMES = 'http://localhost:1234';
process.env.LOCAL_LLM_API_KEYS = 'test-key';
process.env.LOCAL_LLM_MODEL = 'text-davinci-003';

const axios = require('axios');
const MockAdapter = require('axios-mock-adapter');
const { generateNarration } = require('../src/services/localLLM');

describe('generateNarration', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(axios);
    process.env.LOCAL_LLM_HOSTNAMES = 'http://localhost:1234';
    process.env.LOCAL_LLM_API_KEYS = 'test-key';
    process.env.LOCAL_LLM_MODEL = 'text-davinci-003';
  });

  afterEach(() => {
    mock.restore();
  });

  it('should generate narration from the local LLM', async () => {
    const prompt = 'This is a test prompt.';
    const narration = 'This is a test narration.';
    const localLLMHostname = process.env.LOCAL_LLM_HOSTNAMES.split(',')[0];

    mock.onPost(`${localLLMHostname}/v1/completions`).reply(200, {
      choices: [{ text: narration }],
    });

    const result = await generateNarration(prompt);

    expect(result).toEqual(narration);
  });

  it('should return null if there is an error', async () => {
    const prompt = 'This is a test prompt.';
    const localLLMHostname = process.env.LOCAL_LLM_HOSTNAMES.split(',')[0];

    mock.onPost(`${localLLMHostname}/v1/completions`).reply(500);

    const result = await generateNarration(prompt);

    expect(result).toBeNull();
  });
});
