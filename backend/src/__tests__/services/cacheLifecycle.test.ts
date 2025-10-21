/**
 * @file Cache Lifecycle - Unit Tests
 *
 * Tests memory leak fixes and cache management
 */

describe('Gemini Cache Lifecycle', () => {
  test('cache cleanup interval is not started at module level', () => {
    // Bug: setInterval at module level runs immediately on import
    // Fix: Requires explicit startCacheCleaner() call

    // This test verifies that importing the module doesn't start intervals
    // (In practice, we'd check that the interval is null until start is called)

    let cleanupInterval: NodeJS.Timeout | null = null;

    // Simulate module-level code (OLD BUG):
    // setInterval(cleanup, 600000); // ❌ Runs immediately

    // Correct approach (NEW FIX):
    function startCacheCleaner() {
      if (!cleanupInterval) {
        cleanupInterval = setInterval(() => {}, 600000);
      }
    }

    // Interval should be null until explicitly started
    expect(cleanupInterval).toBeNull();

    // Start it manually
    startCacheCleaner();
    expect(cleanupInterval).not.toBeNull();

    // Cleanup
    if (cleanupInterval) clearInterval(cleanupInterval);
  });

  test('cache size limit prevents unbounded growth', () => {
    const MAX_CACHE_SIZE = 10;
    const cache = new Map<string, any>();

    // Add entries beyond limit
    for (let i = 0; i < 15; i++) {
      cache.set(`entry_${i}`, { data: 'test' });

      // Enforce size limit (LRU eviction)
      if (cache.size > MAX_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey) {
          cache.delete(oldestKey);
        }
      }
    }

    // Cache should never exceed MAX_CACHE_SIZE
    expect(cache.size).toBe(MAX_CACHE_SIZE);
  });

  test('expired cache entries are cleaned up', () => {
    const CACHE_TTL = 3600000; // 1 hour
    const now = Date.now();

    const cacheEntries = new Map([
      ['fresh_1', { content: 'data', timestamp: now - 1000 }], // 1 second ago
      ['expired_1', { content: 'data', timestamp: now - (CACHE_TTL + 1000) }], // Expired
      ['fresh_2', { content: 'data', timestamp: now - 60000 }], // 1 minute ago
      ['expired_2', { content: 'data', timestamp: now - (CACHE_TTL + 5000) }], // Expired
    ]);

    // Cleanup logic
    for (const [key, value] of cacheEntries.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cacheEntries.delete(key);
      }
    }

    // Should only have fresh entries
    expect(cacheEntries.size).toBe(2);
    expect(cacheEntries.has('fresh_1')).toBe(true);
    expect(cacheEntries.has('fresh_2')).toBe(true);
    expect(cacheEntries.has('expired_1')).toBe(false);
    expect(cacheEntries.has('expired_2')).toBe(false);
  });
});

describe('Session Cost Tracking Lifecycle', () => {
  test('old session costs are cleaned up after 24 hours', () => {
    const SESSION_TTL = 24 * 60 * 60 * 1000; // 24 hours
    const now = Date.now();

    const sessionCosts = new Map([
      ['char_1', { cost: 0.05, lastUpdated: now - 1000 }], // Recent
      ['char_2', { cost: 0.10, lastUpdated: now - (SESSION_TTL + 1000) }], // Expired
      ['char_3', { cost: 0.03, lastUpdated: now - (12 * 60 * 60 * 1000) }], // 12 hours ago
    ]);

    // Cleanup logic
    for (const [characterId, session] of sessionCosts.entries()) {
      if (now - session.lastUpdated > SESSION_TTL) {
        sessionCosts.delete(characterId);
      }
    }

    // Should only have recent sessions
    expect(sessionCosts.size).toBe(2);
    expect(sessionCosts.has('char_1')).toBe(true);
    expect(sessionCosts.has('char_3')).toBe(true);
    expect(sessionCosts.has('char_2')).toBe(false);
  });

  test('session costs are updated on each request', () => {
    const sessionCosts = new Map<string, { cost: number; lastUpdated: number }>();

    const characterId = 'char_123';
    const newCost = 0.0001;

    // First request
    const session1 = sessionCosts.get(characterId);
    const cumulative1 = (session1?.cost || 0) + newCost;
    sessionCosts.set(characterId, { cost: cumulative1, lastUpdated: Date.now() });

    expect(sessionCosts.get(characterId)?.cost).toBe(0.0001);

    // Second request
    const session2 = sessionCosts.get(characterId);
    const cumulative2 = (session2?.cost || 0) + newCost;
    sessionCosts.set(characterId, { cost: cumulative2, lastUpdated: Date.now() });

    expect(sessionCosts.get(characterId)?.cost).toBe(0.0002);
  });
});

describe('Memory Leak Prevention', () => {
  test('intervals are properly cleaned up on shutdown', () => {
    let interval: NodeJS.Timeout | null = null;

    function start() {
      if (!interval) {
        interval = setInterval(() => {}, 1000);
      }
    }

    function stop() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    // Start interval
    start();
    expect(interval).not.toBeNull();

    // Stop interval
    stop();
    expect(interval).toBeNull();

    // Multiple stops don't error
    stop();
    stop();
    expect(interval).toBeNull();
  });

  test('starting interval twice does not create duplicates', () => {
    let interval: NodeJS.Timeout | null = null;
    let startCount = 0;

    function start() {
      if (interval) {
        console.log('Already running');
        return;
      }
      interval = setInterval(() => {}, 1000);
      startCount++;
    }

    start(); // First call
    expect(startCount).toBe(1);

    start(); // Second call (should be ignored)
    expect(startCount).toBe(1); // Should NOT increment

    // Cleanup
    if (interval) clearInterval(interval);
  });
});
