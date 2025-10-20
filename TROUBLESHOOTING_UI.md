# UI Not Showing - Troubleshooting Guide

## The Code IS Integrated

I verified these changes are in your codebase:

```bash
# DashboardPage.tsx line 7-10:
import { PhaserBridgeProvider, usePhaserBridge } from '../contexts/PhaserBridgeProvider';
import GameCanvas from '../components/GameCanvas';
import { BiomeGenerator } from '../game/generation/BiomeGenerator';
import { convertProcGenToZone } from '../utils/mapConverters';

# DashboardPage.tsx line 437-440:
<GameCanvas
  initialZone={currentZone}
  style={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
/>

# DashboardPage.tsx line 467-469:
<PhaserBridgeProvider>
  <DashboardPageInner />
</PhaserBridgeProvider>
```

## Why You're Not Seeing It

### Most Likely Causes:

1. **Browser Cache**
   - Your browser is showing the old cached version
   - Solution: Hard refresh (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)

2. **Not on Dashboard Page**
   - The integration is in `/dashboard` route
   - Solution: Navigate to the dashboard after login

3. **React Runtime Error**
   - Something crashes before rendering the map
   - Solution: Check browser console (F12)

---

## Step-by-Step Debugging

### 1. Verify Dev Server
```bash
# Check it's running
curl http://localhost:3000/
# Should return HTML with <title>Nuaibria</title>
```
✅ **VERIFIED** - Dev server running on port 3000

### 2. Hard Refresh Browser
```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R
Or: Open DevTools → Right-click refresh → Empty Cache and Hard Reload
```

### 3. Check Browser Console
```
F12 → Console tab
Look for errors mentioning:
- "GameCanvas"
- "Phaser"
- "BiomeGenerator"
- "PhaserBridge"
```

### 4. Verify You're Logged In
```
1. Go to http://localhost:3000/
2. Login with your account
3. Navigate to /dashboard
4. You should see 3 columns
```

### 5. Check Network Tab
```
F12 → Network tab
Look for:
- /assets/tilesets/dungeon-tiles.png (should load)
- Any 404 errors
```

---

## What Should Appear

**Before:**
```
┌──────────────┬────────────────┬──────────────┐
│  Stats       │  Colored Grid  │  Chat        │
│              │  11x11 squares │              │
└──────────────┴────────────────┴──────────────┘
```

**After (what you should see now):**
```
┌──────────────┬────────────────┬──────────────┐
│  Stats       │  Phaser Canvas │  Chat        │
│              │  Pixel art map │              │
│  HP: 20/20   │  [8x8 tiles]  │  Chronicler  │
│  XP: 0       │  Trees, grass  │              │
│  Pos: (40,30)│  Player: ●    │  > messages  │
└──────────────┴────────────────┴──────────────┘
```

The map should be **500px tall** with **Kenney pixel art** tiles.

---

## Quick Diagnostic

Run this in browser console (F12):
```javascript
// Check if components loaded
console.log('GameCanvas:', window.location.pathname);
console.log('React version:', React.version);

// Check for Phaser
console.log('Phaser loaded:', typeof Phaser !== 'undefined');

// Check for errors
console.log('Errors:', performance.getEntriesByType('error'));
```

---

## If Still Not Showing

### Check these files exist:
```bash
ls -la frontend/src/components/GameCanvas.tsx
ls -la frontend/src/contexts/PhaserBridgeProvider.tsx
ls -la frontend/src/game/scenes/MapScene.ts
ls -la frontend/src/hooks/usePhaserGame.ts
```

✅ **ALL VERIFIED** - Files exist

### Force complete rebuild:
```bash
cd frontend
rm -rf node_modules/.vite dist
npm run build
npm run dev
```

### Check route in App.tsx:
```bash
grep -A5 "route.*dashboard" frontend/src/App.tsx
```

---

## Most Common Issue: BROWSER CACHE

**Solution:**
1. Open DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Navigate to /dashboard

---

## Verify Integration

Check these specific lines in DashboardPage.tsx:
```bash
sed -n '7,10p' frontend/src/pages/DashboardPage.tsx
sed -n '437,440p' frontend/src/pages/DashboardPage.tsx
sed -n '467,469p' frontend/src/pages/DashboardPage.tsx
```

Should show:
- Line 7-10: PhaserBridge imports
- Line 437-440: GameCanvas component
- Line 467-469: PhaserBridgeProvider wrapper

**Next:** Try hard refresh + clear cache. If still nothing, share browser console errors.
