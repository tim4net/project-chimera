# Viewport-Based Fetching Testing Guide

## Quick Testing Instructions

### 1. Test Without Viewport (Current Default Behavior)

```bash
# Start the backend
cd backend && npm run dev

# In another terminal, test the endpoint
curl -X GET "http://localhost:3000/api/strategic-map/testseed123" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
- Returns all tiles for the campaign
- Server logs: `[FogOfWar] Fetched N tiles (campaign bounds: N total)`

### 2. Test With Viewport (New Capability)

```bash
# Test with viewport parameters
curl -X GET "http://localhost:3000/api/strategic-map/testseed123?minX=-50&maxX=50&minY=-50&maxY=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**
- Returns only tiles within the specified viewport
- Server logs:
  ```
  [FogOfWar] Fetching tiles in viewport: x[-50, 50] y[-50, 50]
  [FogOfWar] Fetched M tiles (campaign bounds: N total)
  [StrategicMap] Using viewport bounds: { minX: -50, maxX: 50, ... }
  ```
  Where M << N (viewport tiles much less than total tiles)

### 3. Test Invalid Viewport (Validation)

```bash
# Test with invalid parameters (minX > maxX)
curl -X GET "http://localhost:3000/api/strategic-map/testseed123?minX=50&maxX=-50&minY=-50&maxY=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Behavior:**
- Falls back to fetching all tiles
- Server logs: `[StrategicMap] Invalid viewport parameters, fetching all tiles`

### 4. Test Missing Parameters (Partial Viewport)

```bash
# Test with only some viewport parameters
curl -X GET "http://localhost:3000/api/strategic-map/testseed123?minX=-50&maxX=50" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Behavior:**
- Falls back to fetching all tiles (requires all 4 parameters)
- No viewport logs

## Performance Testing

### Create Test Campaign with Many Tiles

```typescript
// Run this in a Node.js REPL or create a test script
const { revealTilesInRadius } = require('./backend/src/services/fogOfWarService');

// Reveal a large area (50x50 = 2500 tiles)
for (let x = -25; x <= 25; x++) {
  for (let y = -25; y <= 25; y++) {
    await revealTilesInRadius('perf-test-seed', x, y, 5, 'test-character-id');
  }
}
```

### Compare Response Times

```bash
# Benchmark without viewport (fetches all ~2500 tiles)
time curl -X GET "http://localhost:3000/api/strategic-map/perf-test-seed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o /dev/null -s

# Benchmark with viewport (fetches ~100 tiles)
time curl -X GET "http://localhost:3000/api/strategic-map/perf-test-seed?minX=-5&maxX=5&minY=-5&maxY=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -o /dev/null -s
```

**Expected Results:**
- Without viewport: 1-3 seconds for 2500 tiles
- With viewport: <500ms for 100 tiles
- **5-10x improvement in response time**

### Compare Response Sizes

```bash
# Check response size without viewport
curl -X GET "http://localhost:3000/api/strategic-map/perf-test-seed" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --compressed \
  -o response_all.json \
  -w "Size: %{size_download} bytes\n"

# Check response size with viewport
curl -X GET "http://localhost:3000/api/strategic-map/perf-test-seed?minX=-5&maxX=5&minY=-5&maxY=5" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  --compressed \
  -o response_viewport.json \
  -w "Size: %{size_download} bytes\n"

# Compare sizes
ls -lh response_*.json
```

**Expected Results:**
- response_all.json: ~250-500 KB
- response_viewport.json: ~10-25 KB
- **90-95% reduction in response size**

## Frontend Testing

### Enable Viewport Fetching

1. Open `frontend/src/components/StrategicMap.tsx`
2. Uncomment lines 71-83 (viewport calculation code)
3. Uncomment import on line 10:
   ```typescript
   import { calculateViewportBounds, buildViewportUrl } from '../utils/mapViewport';
   ```
4. Rebuild frontend: `npm run build --prefix frontend`

### Monitor Network Tab

1. Open browser DevTools → Network tab
2. Navigate to Strategic Map
3. Filter for `strategic-map` requests
4. Observe:
   - Initial request: `GET /api/strategic-map/seed123?minX=...&maxX=...`
   - Subsequent requests when panning/zooming
   - Response sizes (should be <100 KB)

### Monitor Console

1. Open browser DevTools → Console
2. Look for logs:
   ```
   [StrategicMap] Fetching viewport: { minX: -50, maxX: 50, ... }
   [StrategicMap] Large dataset: 5500 tiles. Consider enabling viewport-based fetching...
   ```

## Database Testing

### Check Query Performance

```sql
-- Enable query timing
\timing on

-- Simulate query without viewport (slow)
SELECT tile_x, tile_y, visibility_state
FROM world_fog
WHERE campaign_seed = 'perf-test-seed';

-- Simulate query with viewport (fast)
SELECT tile_x, tile_y, visibility_state
FROM world_fog
WHERE campaign_seed = 'perf-test-seed'
  AND tile_x >= -5 AND tile_x <= 5
  AND tile_y >= -5 AND tile_y <= 5;
```

**Expected Results:**
- Without viewport: 100-500ms for 10,000 rows
- With viewport: <10ms for 100 rows
- **10-50x improvement in query time**

### Verify Index Usage

```sql
-- Check if indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'world_fog';

-- Explain query plan (should use index scan)
EXPLAIN ANALYZE
SELECT tile_x, tile_y, visibility_state
FROM world_fog
WHERE campaign_seed = 'perf-test-seed'
  AND tile_x >= -5 AND tile_x <= 5
  AND tile_y >= -5 AND tile_y <= 5;
```

**Expected Plan:**
- Index Scan using idx_world_fog_viewport (or similar)
- Cost: ~10-50 (low)
- NOT Seq Scan (sequential scan = bad)

### Add Recommended Index

```sql
-- Create composite index for optimal viewport queries
CREATE INDEX idx_world_fog_viewport
ON world_fog(campaign_seed, tile_x, tile_y);

-- Verify index was created
\d world_fog
```

## Load Testing

### Simulate 10,000+ Tile Campaign

```bash
# Create a script to populate test data
cat > populate_test_campaign.js << 'EOF'
const { revealTilesInRadius } = require('./backend/dist/services/fogOfWarService');

async function populate() {
  const seed = 'load-test-10k';
  const characterId = 'test-char-id';

  // Reveal 100x100 grid = 10,000 tiles
  for (let x = -50; x < 50; x += 10) {
    for (let y = -50; y < 50; y += 10) {
      await revealTilesInRadius(seed, x, y, 10, characterId);
      console.log(`Revealed area (${x}, ${y})`);
    }
  }

  console.log('Population complete!');
}

populate().catch(console.error);
EOF

# Run population script
node populate_test_campaign.js
```

### Benchmark Performance

```bash
# Test endpoint with 10,000 tiles
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/strategic-map/load-test-10k?minX=-20&maxX=20&minY=-20&maxY=20"
```

**Expected Results:**
- 100 requests in <10 seconds
- No errors or timeouts
- Consistent response times (<500ms p95)

## Troubleshooting

### Issue: "Invalid viewport parameters" in logs

**Cause:** Query parameters are not properly formatted
**Fix:** Ensure all 4 parameters (minX, maxX, minY, maxY) are integers

### Issue: Response still includes all tiles

**Cause:** Viewport parameter not being parsed
**Fix:** Check that query string is properly formatted: `?minX=-50&maxX=50&minY=-50&maxY=50`

### Issue: Slow queries even with viewport

**Cause:** Missing database indexes
**Fix:** Add composite index on (campaign_seed, tile_x, tile_y)

### Issue: Tiles disappear when panning in frontend

**Cause:** Viewport buffer too small
**Fix:** Increase `bufferMultiplier` in `mapViewport.ts` (default is 2)

## Success Criteria

- ✅ API accepts viewport parameters
- ✅ Response includes only tiles in viewport
- ✅ Query time reduced by 10x+
- ✅ Response size reduced by 90%+
- ✅ No errors or crashes with large datasets
- ✅ Backward compatible (works without viewport)
- ✅ Frontend can pan/zoom smoothly
- ✅ Database indexes being used efficiently

## Next Steps After Testing

1. Monitor production logs for viewport usage patterns
2. Tune buffer multiplier based on user behavior
3. Consider tile caching for further optimization
4. Add viewport to initial load for campaigns > 10,000 tiles
5. Implement progressive loading (center first, expand outward)
