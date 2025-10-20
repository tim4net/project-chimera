# Image Generation Errors - Root Cause Analysis & Fix Plan

## 🔍 Problem Identified

### Error: Duplicate Key Violation
```
code: '23505'
message: 'duplicate key value violates unique constraint "asset_requests_request_hash_key"'
details: 'Key (request_hash)=(image|...) already exists.'
```

### Root Cause

**Location:** `/srv/nuaibria/backend/src/services/imageGeneration.ts:377`

**The Bug:**
1. Client requests image generation
2. Code checks if image exists in cache → Not found
3. Code checks for pending request → Not found  
4. Code creates new `asset_request` record (line 377)
5. Image generation **FAILS** midway through
6. Record remains in database with status='pending'
7. Client retries → Cache check fails → Pending check **SHOULD** find it but doesn't
8. Code tries to create **DUPLICATE** asset_request → Database rejects (unique constraint)

**Why Pending Check Fails:**
```typescript
// Line 371: checkPendingRequest
const pending = await checkPendingRequest(`image|${promptHash}`);
```

If the previous request crashed/failed, it may still be 'pending' or 'processing' but the check doesn't find it (possible race condition or the status wasn't updated).

---

## 🛠️ Fix Plan

### Solution: Upsert Pattern with Better Error Handling

#### Change 1: Use Try-Catch on Insert with Fallback to Existing
**File:** `/srv/nuaibria/backend/src/services/assetCache.ts`
**Function:** `createAssetRequest()`

```typescript
export const createAssetRequest = async (
  requestHash: string,
  requestType: AssetRequestRow['request_type']
): Promise<AssetRequestRow> => {
  try {
    const { data, error } = await supabaseServiceClient
      .from('asset_requests')
      .insert({
        request_hash: requestHash,
        request_type: requestType,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      // Check if error is duplicate key (23505)
      if (error.code === '23505') {
        console.warn('[AssetCache] Request already exists, fetching existing:', requestHash);
        // Fetch the existing request instead
        const existing = await getExistingRequest(requestHash);
        if (existing) return existing;
      }
      
      console.error('Error creating asset request:', error);
      throw new Error('Failed to create asset request');
    }

    return data as AssetRequestRow;
  } catch (error) {
    console.error('[AssetCache] createAssetRequest failed:', error);
    throw error;
  }
};

// NEW HELPER FUNCTION
const getExistingRequest = async (requestHash: string): Promise<AssetRequestRow | null> => {
  const { data } = await supabaseServiceClient
    .from('asset_requests')
    .select('*')
    .eq('request_hash', requestHash)
    .single();
  
  return data as AssetRequestRow | null;
};
```

#### Change 2: Add Cleanup of Stale Requests
**File:** `/srv/nuaibria/backend/src/services/assetCache.ts`

Add function to clean up old pending requests:

```typescript
export const cleanupStaleRequests = async (olderThanMinutes: number = 30): Promise<number> => {
  const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000).toISOString();
  
  const { data, error } = await supabaseServiceClient
    .from('asset_requests')
    .update({ status: 'failed' })
    .in('status', ['pending', 'processing'])
    .lt('created_at', cutoff)
    .select();

  if (error) {
    console.error('[AssetCache] Cleanup failed:', error);
    return 0;
  }

  return data?.length || 0;
};
```

#### Change 3: Call Cleanup on Server Start
**File:** `/srv/nuaibria/backend/src/server.ts`

```typescript
import { cleanupStaleRequests } from './services/assetCache';

// After app setup, before listen
cleanupStaleRequests(30).then(count => {
  console.log(`[Startup] Cleaned up ${count} stale asset requests`);
});
```

#### Change 4: Improve Error Handling in generateImage
**File:** `/srv/nuaibria/backend/src/services/imageGeneration.ts:377`

```typescript
// Replace line 377
let request: AssetRequestRow;
try {
  request = await createAssetRequest(`image|${promptHash}`, 'image');
} catch (createError) {
  // If create fails due to duplicate, check if we can use the existing one
  const existing = await checkPendingRequest(`image|${promptHash}`);
  if (existing) {
    console.log('[ImageGen] Using existing pending request');
    return pollForCompletion(existing.id, promptHash, 'image');
  }
  throw createError; // Re-throw if not duplicate key issue
}
```

---

## ✅ Benefits of This Fix

1. **No Crashes** - Gracefully handles duplicate keys
2. **No Re-generation** - Uses existing cached images when available
3. **Self-Healing** - Cleans up stale requests automatically
4. **Idempotent** - Multiple requests for same image won't cause errors
5. **Better Logging** - Clear messages about what's happening

---

## 🧪 Testing Plan

1. Trigger image generation
2. Kill the request midway (simulate failure)
3. Retry same image request → Should not error
4. Verify existing request is reused or new one is created properly

---

## 📋 Implementation Checklist

- [ ] Update `createAssetRequest()` with duplicate key handling
- [ ] Add `getExistingRequest()` helper function
- [ ] Add `cleanupStaleRequests()` function
- [ ] Call cleanup on server startup
- [ ] Update `generateImage()` error handling
- [ ] Test with actual image generation failures
- [ ] Verify no duplicate key errors occur

---

**Estimated Time:** 30 minutes
**Priority:** HIGH (currently blocking character creation with portraits)
**Impact:** Eliminates all duplicate key errors permanently
