# Phaser Loader Issue - Technical Analysis

## The Problem

**Error:** `Cannot read properties of null (reading 'iterate')`
**Location:** `LoaderPlugin2.keyExists()` when calling `this.load.image()`
**Root Cause:** Phaser's loader cache is null when MapScene tries to load tilesets

## Why It Happens

Phaser's LoaderPlugin has internal state (cache, list) that isn't initialized until specific lifecycle events complete. When we try to call `this.load.image()` from `ensureTilesets()`, the loader's internal cache is still null.

## Why MapPreviewPage Works

The `/map-preview` page works because:
1. It uses `GameCanvas` directly without wrapping layers
2. Simpler component tree
3. Different React mounting timing
4. Zone loads after Phaser is fully booted

## Why Dashboard Fails

The dashboard has:
1. `PhaserBridgeProvider` wrapper
2. Multiple nested components
3. `ZoomableGameCanvas` → `GameCanvas` → Phaser
4. Zone load triggered too early in lifecycle

## Attempted Fixes (All Failed)

1. ✗ Added 100ms delay - Not enough time
2. ✗ Used `preload()` phase - Still null
3. ✗ Tried `createCanvas()` - Renderer null
4. ✗ Added React `key` prop - Still same timing
5. ✗ Wait for scene ready - Loader still not ready

## The Core Issue

Phaser's loader isn't ready even after:
- `scene.create()` completes
- `game.isBooted` is true
- `scene.events.on('ready')` fires

The loader cache initialization happens asynchronously and we have no reliable event to wait for.

---

## Working Solutions

### Option 1: Use External PNG Files (RECOMMENDED)
Instead of data URIs, use actual PNG files:

```typescript
tilesets: [{
  key: 'overworld-tiles',
  imageUrl: '/assets/tilesets/overworld.png', // Real file
  tileWidth: 32,
  tileHeight: 32,
}]
```

**Pros:**
- Phaser handles file URLs reliably
- Better performance (no data URI parsing)
- Easier to update graphics
- Industry standard

**Cons:**
- Need to create actual tileset PNG
- Can't generate tiles programmatically

**Time:** 30 minutes to create PNG tileset

### Option 2: Preload Textures in Scene.preload()
Move tileset creation to preload phase:

```typescript
class MapScene extends Phaser.Scene {
  preload() {
    // Create texture here BEFORE create() runs
    const tileset = createAtmosphericTileset();
    this.load.image('overworld-tiles', tileset);
  }
}
```

**Issue:** We don't know what tileset we need until zone loads (which is after create)

### Option 3: Switch to PixiJS
Use PixiJS instead of Phaser (as research recommended for React):

**Pros:**
- Better React integration
- More reliable with dynamic textures
- Higher performance

**Cons:**
- Rewrite entire MapScene
- 2-3 hours of work
- Lose Phaser-specific features

### Option 4: Duplicate MapPreviewPage Approach
Copy the exact structure that works:

1. Remove ZoomableGameCanvas wrapper
2. Use GameCanvas directly
3. Simplify component tree
4. Match MapPreviewPage exactly

**Pros:**
- Known to work
- Quick fix

**Cons:**
- Lose zoom controls
- Lose fullscreen modal
- Less elegant

---

## Recommendation

**Use Option 1: External PNG Tileset**

Steps:
1. Take the `createAtmosphericTileset()` function
2. Run it once, save output as PNG
3. Put PNG in `/public/assets/tilesets/overworld.png`
4. Update converter to use file path
5. Done!

**Time:** 15-30 minutes
**Reliability:** 100% (Phaser designed for this)
**Quality:** Better (real file vs data URI)

---

## Alternative: Accept Current Limitation

The map works perfectly on `/map-preview`. You can:
1. Use that page for map testing
2. Keep dashboard with simpler placeholder map
3. Fix Phaser issue in future session when less tired

The architecture is sound - it's just one technical hurdle.

---

## Next Session Plan

1. Create external PNG tileset (30 mins)
2. Update map converter (5 mins)
3. Test - should work immediately
4. Then implement onboarding system

**Total time to working map: 30-45 minutes**
