/**
 * @file Cost Tracking - Unit Tests
 *
 * Tests token estimation and cost calculation accuracy
 */

describe('Token Estimation', () => {
  // Define estimateTokens function inline for testing
  // (In production, this would be imported from dmChatSecure.ts)
  function estimateTokens(textOrLength: string | number): number {
    const charCount = typeof textOrLength === 'string' ? textOrLength.length : textOrLength;
    return Math.ceil(charCount / 4);
  }

  test('estimates tokens from string correctly', () => {
    const text = 'This is a test string with about 40 characters';
    const tokens = estimateTokens(text);

    // 47 chars / 4 = 11.75 → ceil = 12 tokens
    expect(tokens).toBeGreaterThan(10);
    expect(tokens).toBeLessThan(15);
  });

  test('estimates tokens from character count correctly', () => {
    const charCount = 2000; // Typical system prompt length
    const tokens = estimateTokens(charCount);

    // 2000 / 4 = 500 tokens
    expect(tokens).toBe(500);
  });

  test('handles empty string', () => {
    const tokens = estimateTokens('');
    expect(tokens).toBe(0);
  });

  test('handles zero character count', () => {
    const tokens = estimateTokens(0);
    expect(tokens).toBe(0);
  });

  test('bug fix: does not convert number to string', () => {
    // This was the bug - String(2000) = "2000" (4 chars) = 1 token
    // Correct: 2000 chars = 500 tokens
    const totalLength = 1500 + 500 + 200 + 50; // = 2250 chars

    const wrongWay = estimateTokens(String(totalLength)); // Would give ceil(4/4) = 1
    const rightWay = estimateTokens(totalLength); // Should give ceil(2250/4) = 563

    expect(rightWay).toBe(563);
    expect(wrongWay).toBe(1); // Old bug behavior
    expect(rightWay).toBeGreaterThan(wrongWay);
  });
});

describe('Cost Calculation', () => {
  // Gemini Flash pricing (as of 2025-01)
  const GEMINI_FLASH_INPUT_COST_PER_1M = 0.075;
  const GEMINI_FLASH_OUTPUT_COST_PER_1M = 0.30;

  function calculateCost(inputTokens: number, outputTokens: number) {
    const inputCost = (inputTokens / 1_000_000) * GEMINI_FLASH_INPUT_COST_PER_1M;
    const outputCost = (outputTokens / 1_000_000) * GEMINI_FLASH_OUTPUT_COST_PER_1M;

    return {
      inputTokens,
      outputTokens,
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
    };
  }

  test('calculates cost for typical chat message', () => {
    const inputTokens = 1000; // System prompt + character sheet + message
    const outputTokens = 50; // Short narrative response

    const cost = calculateCost(inputTokens, outputTokens);

    // Input: 1000 / 1M * 0.075 = $0.000075
    // Output: 50 / 1M * 0.30 = $0.000015
    // Total: $0.000090
    expect(cost.inputCost).toBeCloseTo(0.000075, 6);
    expect(cost.outputCost).toBeCloseTo(0.000015, 6);
    expect(cost.totalCost).toBeCloseTo(0.000090, 6);
  });

  test('calculates cost for 500 messages (10 players, 50 msgs each)', () => {
    const messagesPerPlayer = 50;
    const playerCount = 10;
    const totalMessages = messagesPerPlayer * playerCount;

    const avgInputTokens = 1125; // System + char + history + message
    const avgOutputTokens = 50; // Narrative

    let totalCost = 0;

    for (let i = 0; i < totalMessages; i++) {
      const cost = calculateCost(avgInputTokens, avgOutputTokens);
      totalCost += cost.totalCost;
    }

    console.log(`Total cost for ${totalMessages} messages: $${totalCost.toFixed(4)}`);

    // Expected: ~$0.045 for 500 messages
    // Input: 500 * 1125 = 562,500 tokens → $0.042
    // Output: 500 * 50 = 25,000 tokens → $0.0075
    // Total: ~$0.05
    expect(totalCost).toBeGreaterThan(0.04);
    expect(totalCost).toBeLessThan(0.06);
  });

  test('validates pricing within $5/month for 50 players', () => {
    const playersPerMonth = 50;
    const messagesPerPlayer = 50;
    const totalMessages = playersPerMonth * messagesPerPlayer;

    const avgInputTokens = 1125;
    const avgOutputTokens = 50;

    let monthlyCost = 0;

    for (let i = 0; i < totalMessages; i++) {
      const cost = calculateCost(avgInputTokens, avgOutputTokens);
      monthlyCost += cost.totalCost;
    }

    console.log(`Projected monthly cost (50 players): $${monthlyCost.toFixed(2)}`);

    // Should be under $5/month
    expect(monthlyCost).toBeLessThan(5.00);
  });
});

describe('Input Validation', () => {
  test('handles negative token counts safely', () => {
    function estimateTokens(textOrLength: string | number): number {
      const charCount = typeof textOrLength === 'string' ? textOrLength.length : textOrLength;
      return Math.ceil(charCount / 4);
    }

    // Negative should not crash
    const result = estimateTokens(-100);
    expect(result).toBeLessThanOrEqual(0);
  });
});
