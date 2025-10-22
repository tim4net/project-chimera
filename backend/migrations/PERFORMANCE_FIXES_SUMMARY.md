# Database Performance Fixes Summary

**Date:** 2025-10-22
**Applied by:** Claude Code (Haiku model)

## Overview
Three critical database performance issues were identified and resolved through migrations applied to the Supabase PostgreSQL database. These fixes improve query performance and reduce redundant database operations.

---

## Task 1: Remove Duplicate Index on dm_conversations

### Issue
The `dm_conversations` table had two identical indexes on the same columns:
- `dm_conversations_character_id_created_at_idx` (kept)
- `idx_dm_conversations_character_time` (removed)

Both indexes were defined as: `(character_id, created_at DESC)`

### Impact
- Duplicate indexes waste storage space
- Updates to the table require maintaining both indexes unnecessarily
- Query planner confusion when choosing between identical indexes

### Migration Applied
**File:** `20251022002000_drop_duplicate_dm_conversations_index.sql`

```sql
DROP INDEX IF EXISTS idx_dm_conversations_character_time;
```

### Verification
Remaining indexes on `dm_conversations`:
- `dm_conversations_pkey` (primary key on id)
- `dm_conversations_character_id_created_at_idx` (character_id, created_at DESC)
- `idx_dm_conversations_character_id` (character_id)
- `idx_dm_conversations_created_at` (created_at DESC)

---

## Task 2: Consolidate Duplicate RLS Policies on dm_conversations

### Issue
The `dm_conversations` table had duplicate Row-Level Security (RLS) policies:
- "Select own character conversations" and "Users can view own character conversations" (duplicates)
- "Insert own character conversations" and "Users can insert own character conversations" (duplicates)

### Impact
- Duplicate policies are evaluated twice for each query
- Increased policy evaluation overhead
- Maintenance confusion with multiple policies for same purpose

### Migration Applied
**File:** `20251022002008_consolidate_dm_conversations_rls_policies.sql`

```sql
-- Drop duplicate SELECT policy
DROP POLICY IF EXISTS "Users can view own character conversations" ON dm_conversations;

-- Drop duplicate INSERT policy
DROP POLICY IF EXISTS "Users can insert own character conversations" ON dm_conversations;
```

### Verification
Remaining policies on `dm_conversations`:
- "Select own character conversations" (SELECT)
- "Insert own character conversations" (INSERT)
- "Delete own character conversations" (DELETE)

---

## Task 3: Fix Auth RLS Initplan Issues

### Issue
Multiple tables had inefficient RLS policies that called `auth.uid()` directly in policy expressions. PostgreSQL would re-evaluate `auth.uid()` for every row being checked, causing significant performance overhead.

**Affected tables:**
- characters
- character_inventory
- dm_conversations
- quests
- secrets
- character_proficiencies
- character_explored_chunks
- character_rolls
- threat_encounters
- character_quests

### Impact
- **Before:** `auth.uid()` evaluated once per row (N evaluations for N rows)
- **After:** `(SELECT auth.uid())` evaluated once per query (1 evaluation total)
- Significant performance improvement for queries scanning multiple rows
- Reduced database CPU usage

### Migration Applied
**File:** `20251022002034_fix_auth_uid_initplan_issues.sql`

All policies were updated to wrap `auth.uid()` calls in subqueries. Examples:

**Before:**
```sql
CREATE POLICY "Select own characters"
ON characters FOR SELECT
USING (auth.uid() = user_id);
```

**After:**
```sql
CREATE POLICY "Select own characters"
ON characters FOR SELECT
USING ((SELECT auth.uid()) = user_id);
```

### Affected Policies by Table

#### characters (4 policies)
- Select own characters
- Insert own characters
- Update own characters
- Delete own characters

#### character_inventory (1 policy)
- Users manage own inventory

#### dm_conversations (3 policies)
- Select own character conversations
- Insert own character conversations
- Delete own character conversations

#### quests (1 policy)
- Users read own quests

#### secrets (1 policy)
- Users see their character's known secrets

#### character_proficiencies (1 policy)
- Users see own character proficiencies

#### character_explored_chunks (1 policy)
- Users can manage explored chunks for their own characters

#### character_rolls (1 policy)
- Users can view rolls for their own characters

#### threat_encounters (1 policy)
- Users can view own threat encounters

#### character_quests (2 policies)
- Users can view own quests
- Users can update own quests

**Total policies updated:** 16 policies across 10 tables

### Verification
All policies now properly use `(SELECT auth.uid())` instead of direct `auth.uid()` calls. Example verification:

```sql
-- characters table
qual: "(( SELECT auth.uid() AS uid) = user_id)"

-- dm_conversations table
qual: "(EXISTS ( SELECT 1
   FROM characters
  WHERE ((characters.id = dm_conversations.character_id)
     AND (characters.user_id = ( SELECT auth.uid() AS uid)))))"

-- character_inventory table
qual: "(character_id IN ( SELECT characters.id
   FROM characters
  WHERE (characters.user_id = ( SELECT auth.uid() AS uid))))"
```

---

## Performance Impact Summary

### Storage Optimization
- Removed 1 duplicate index, saving storage space and write overhead

### Policy Evaluation Efficiency
- Removed 2 duplicate RLS policies, reducing policy evaluation time

### Query Performance Improvement
- Fixed 16 RLS policies across 10 tables to eliminate initplan issues
- **Expected improvement:** 10-100x faster for queries scanning multiple rows
- Reduced database CPU usage for all authenticated queries

---

## Migration Files Created

1. `/srv/project-chimera/backend/migrations/20251022002000_drop_duplicate_dm_conversations_index.sql`
2. `/srv/project-chimera/backend/migrations/20251022002008_consolidate_dm_conversations_rls_policies.sql`
3. `/srv/project-chimera/backend/migrations/20251022002034_fix_auth_uid_initplan_issues.sql`

All migrations have been successfully applied to the Supabase database.

---

## Testing Recommendations

After applying these fixes, verify the following:

1. **Functional Testing**
   - Test character creation, viewing, updating, and deletion
   - Test conversation history retrieval
   - Test inventory management
   - Test quest viewing and updates

2. **Performance Testing**
   - Compare query execution times before/after (use `EXPLAIN ANALYZE`)
   - Monitor database CPU usage
   - Check slow query logs

3. **Security Testing**
   - Verify users can only access their own data
   - Confirm RLS policies still enforce proper authorization
   - Test edge cases (no auth, invalid character_id, etc.)

---

## References

- PostgreSQL RLS Performance: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Supabase RLS Best Practices: https://supabase.com/docs/guides/auth/row-level-security
- PostgreSQL Initplan Issues: https://wiki.postgresql.org/wiki/Slow_Query_Questions#Subplan_explosion
