# Map Visibility Debug Guide

## If You Can't See the Map

### What You Should See:
- **Left:** Character stats panel
- **Center:** Chat interface (wide)
- **Right:** Minimap with Phaser canvas

### Common Issues:

1. **Browser Cache**
   - Press Ctrl+Shift+R (hard refresh)
   - Or: F12 → Network tab → Disable cache → Refresh

2. **Still Loading**
   - Map generates on first load (takes 1-2 seconds)
   - Check for "Loading..." or "Generating map..." text

3. **Console Errors**
   - Press F12
   - Check Console tab
   - Look for red errors mentioning "MapScene" or "Phaser"

4. **Wrong Page**
   - Make sure you're on `/dashboard` not `/`
   - Must be logged in
   - Character must exist

5. **Map Not in View**
   - Scroll down if needed
   - Check right sidebar for "Map" panel
   - Look for minimap (300px tall box)

---

## What to Check

### Browser Console (F12 → Console):
Look for:
- "Phaser v3.90.0" - Should appear (means Phaser loaded)
- NO errors about "iterate" or "renderer" (those are fixed)
- "[MapScene] Failed to load zone" - If you see this, there's still an issue

### Network Tab (F12 → Network):
Check for:
- Requests to `/api/maps/...` or `/api/world/...`
- 200 OK status (good) vs 404/500 (bad)
- No failed tileset loads

### Elements Tab (F12 → Elements):
Search for:
- `<canvas` - Should exist if Phaser rendered
- `data-scene="MapScene"` - Should be present
- Check if canvas has width/height

---

## Quick Tests

### Test 1: Does Map Preview Work?
Navigate to: `http://localhost:3000/map-preview`

If this works but dashboard doesn't:
- Issue is specific to dashboard integration
- Not a fundamental Phaser problem

### Test 2: Is Character Loaded?
Check dashboard left panel:
- Do you see HP, XP, Position?
- If no character data, that's the issue

### Test 3: Is Phaser Loading?
Open console, type:
```javascript
typeof Phaser
```
Should return: "object"

If returns "undefined": Phaser not loaded

---

## What the Map Looks Like

**Minimap (right sidebar):**
- Black canvas background
- Detailed pixel art tiles:
  - Grey stone paths/plaza
  - Green grass (varied tones)
  - Dark green trees
  - Brown walls (buildings)
- Blue tunic character sprite
- Zoom controls in top-right (+ - 1:1 ⊞)

**If you see a black box:**
- Map canvas exists but hasn't rendered
- Check console for errors

**If you see nothing:**
- Component didn't mount
- Check if `currentZone` is null

---

## Tell Me What You See

**Please check:**
1. Are you on `/dashboard`?
2. Do you see the chat interface in center?
3. Do you see a "Map" panel on the right?
4. What's in that panel - black box, loading text, or nothing?
5. Any red errors in console (F12)?

This will help me pinpoint the exact issue!

---

## Quick Fix Attempts

### If Black Canvas:
The canvas rendered but scene didn't load.
- Check console for errors
- Verify currentZone is not null

### If "Loading..." Forever:
Zone generation is stuck.
- Check network tab for API errors
- Verify HybridWorldGenerator works

### If Nothing At All:
Component didn't render.
- Verify imports in DashboardPage
- Check React component tree in DevTools

**Let me know what you see and I'll fix it!**
