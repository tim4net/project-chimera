const { generateNarrationPrompt } = require('../src/prompts/narration');

describe('generateNarrationPrompt', () => {
  it('should generate a narration prompt', () => {
    const event = 'A goblin jumps out from behind a tree!';
    const prompt = generateNarrationPrompt(event);
    expect(prompt).toContain(event);
  });
});
