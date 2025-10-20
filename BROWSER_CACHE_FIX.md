# Browser Cache Issue - How to Fix

## The Problem

Your browser cached the old broken JavaScript bundle (`index-BG-blRYJ.js`).

Even though the code is fixed, your browser keeps loading the old file from cache.

---

## Solution: Force Clear Cache

### Method 1: Incognito/Private Window
**Easiest way to bypass cache:**

1. Open **Incognito/Private window**:
   - Chrome: Ctrl+Shift+N
   - Firefox: Ctrl+Shift+P
   - Edge: Ctrl+Shift+N

2. Navigate to: `http://localhost:3000`
3. Login
4. Go to dashboard
5. **Map should work!**

### Method 2: DevTools Hard Reload

1. **Open DevTools:** Press F12
2. **Right-click the refresh button** (while DevTools open)
3. Select: **"Empty Cache and Hard Reload"**
4. Wait for page to reload
5. Check console - should see new bundle name (not index-BG-blRYJ.js)

### Method 3: Clear All Site Data

1. F12 → Application tab (Chrome) / Storage tab (Firefox)
2. Click "Clear site data" or "Clear storage"
3. Check: Cookies, Cache, Local storage
4. Click "Clear data"
5. Close DevTools
6. Refresh page

### Method 4: Manual Cache Clear

**Chrome:**
1. F12 → Network tab
2. Check "Disable cache" checkbox
3. Keep DevTools open
4. Refresh page

**Firefox:**
1. F12 → Network tab
2. Click settings gear icon
3. Check "Disable HTTP cache"
4. Refresh page

---

## How to Verify It Worked

**After clearing cache, check console:**

**Old (broken):**
```
index-BG-blRYJ.js:562  Phaser v3.90.0
index-BG-blRYJ.js:6460 [MapScene] Failed...
```

**New (fixed):**
```
index-XXXXXXXX.js:562  Phaser v3.90.0  ← Different hash!
(No MapScene errors)
```

**Look for different bundle hash** - that means new code loaded!

---

## Why This Happens

Vite generates bundles with content hashes (e.g., `index-BG-blRYJ.js`).

Browsers aggressively cache these because the hash should only change when content changes.

But during development, you need to force refresh to bypass cache.

---

## Quick Test

**Try the map preview page:**
`http://localhost:3000/map-preview`

If THIS works but dashboard doesn't → confirmed browser cache issue.

---

**Use Incognito mode - fastest way to bypass cache!**
