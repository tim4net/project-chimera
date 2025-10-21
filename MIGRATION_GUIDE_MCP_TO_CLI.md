# Migration Guide: MCP to Supabase CLI Skill

Complete guide for migrating from MCP-based Supabase operations to the new CLI Skill.

## Overview

The new **Supabase CLI Skill** completely replaces MCP integration with:
- Direct CLI commands
- Type-safe TypeScript interface
- Better error handling
- Complete CRUD operations
- Migration support

## Key Changes

### What Changed

| Old Way (MCP) | New Way (CLI Skill) |
|---|---|
| `mcp__supabase__*` functions | `import { db } from './cli/src/db'` |
| Limited operations | Full CRUD + migrations + schema |
| Generic errors | Detailed error messages |
| No type safety | Full TypeScript support |
| No examples | 12+ real-world examples |

### What Stays the Same

- Database schema remains unchanged
- All existing data is preserved
- Supabase credentials stay the same
- Environment variables work as before

## Step-by-Step Migration

### Step 1: Verify Setup

Ensure your `.env` file has:
```bash
SUPABASE_PROJECT_REF=your_project_id
SUPABASE_API_KEY=your_api_key
SUPABASE_DB_URL=postgresql://user:password@host/database
```

### Step 2: Import the New Module

Replace any MCP imports with:

```typescript
// OLD
// using mcp__supabase__* functions directly

// NEW
import { db } from './cli/src/db';
// or for high-level interface
import DatabaseCLI from './cli/src/db/commands';
```

### Step 3: Update Operations

#### SELECT Operations

**Old (MCP):**
```typescript
// Not directly possible with MCP
```

**New (CLI Skill):**
```typescript
import { db } from './cli/src/db';

const users = await db.select('users', ['id', 'name', 'email']);
if (users.success) {
  console.log(users.data);
}
```

#### INSERT Operations

**Old (MCP):**
```typescript
// Limited support
```

**New (CLI Skill):**
```typescript
const result = await db.insert('users', {
  name: 'Alice',
  email: 'alice@example.com',
  active: true
});

// Batch insert
const results = await db.insert('users', [
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
]);
```

#### UPDATE Operations

**Old (MCP):**
```typescript
// Not supported
```

**New (CLI Skill):**
```typescript
const result = await db.update('users',
  { active: false },
  { id: 123 }
);
```

#### DELETE Operations

**Old (MCP):**
```typescript
// Not supported
```

**New (CLI Skill):**
```typescript
const result = await db.delete('users', { id: 123 });
```

#### Raw SQL

**Old (MCP):**
```typescript
// Limited support
```

**New (CLI Skill):**
```typescript
const result = await db.query(`
  SELECT u.id, COUNT(q.id) as quest_count
  FROM users u
  LEFT JOIN quests q ON u.id = q.user_id
  GROUP BY u.id
`);
```

### Step 4: Error Handling

**Old Style:**
```typescript
// Generic errors
try {
  // operation
} catch (e) {
  console.error('Operation failed');
}
```

**New Style:**
```typescript
const result = await db.select('users');

if (!result.success) {
  console.error(`Query failed: ${result.error}`);
} else {
  console.log(`Retrieved ${result.rows} rows`);
}
```

Or with try-catch:
```typescript
try {
  const result = await db.select('users');
  if (!result.success) throw new Error(result.error);
  // Use result.data
} catch (error) {
  console.error('Failed:', error);
}
```

## Migration Checklist

- [ ] Review current MCP usage in your codebase
- [ ] Update `.env` with Supabase CLI credentials
- [ ] Install Supabase CLI: `npm install -g supabase`
- [ ] Replace imports: `import { db } from './cli/src/db'`
- [ ] Update all database operations to use new API
- [ ] Update error handling to check `result.success`
- [ ] Test all operations with sample data
- [ ] Run test suite
- [ ] Update documentation
- [ ] Deploy with confidence!

## Common Patterns

### Pattern 1: Simple Query with Error Handling

**Old:**
```typescript
// Not easily supported
```

**New:**
```typescript
async function getActiveUsers() {
  const result = await db.select('users', ['id', 'name'], { active: true });

  if (!result.success) {
    throw new Error(`Failed to get users: ${result.error}`);
  }

  return result.data;
}
```

### Pattern 2: Pagination

**Old:**
```typescript
// Complex to implement
```

**New:**
```typescript
async function getPagedUsers(page: number, pageSize: number = 20) {
  return db.select('users', ['*'], {}, {
    limit: pageSize,
    offset: (page - 1) * pageSize
  });
}
```

### Pattern 3: Transactions

**Old:**
```typescript
// Not supported
```

**New:**
```typescript
async function transferBalance(fromId: number, toId: number, amount: number) {
  return db.query(`
    BEGIN;
    UPDATE users SET balance = balance - $1 WHERE id = $2;
    UPDATE users SET balance = balance + $1 WHERE id = $3;
    COMMIT;
  `);
}
```

### Pattern 4: Batch Insert

**Old:**
```typescript
// Would require multiple inserts
```

**New:**
```typescript
async function createUsers(users: UserData[]) {
  return db.insert('users', users);
}
```

## File-by-File Migration

### Backend Routes

**Location:** `backend/src/routes/*.ts`

```typescript
// OLD
// Using external data sources

// NEW
import { db } from '../../../cli/src/db';

export async function getCharacters(req, res) {
  const result = await db.select('characters', ['*'], { user_id: req.user.id });

  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }

  res.json(result.data);
}
```

### Services

**Location:** `backend/src/services/*.ts`

```typescript
// OLD
// Database operations scattered or missing

// NEW
import { db } from '../../cli/src/db';

export class CharacterService {
  async getCharacter(id: number) {
    const result = await db.select('characters', ['*'], { id });
    return result.success ? result.data?.[0] : null;
  }

  async createCharacter(data: CharacterData) {
    return db.insert('characters', data);
  }

  async updateCharacter(id: number, data: Partial<CharacterData>) {
    return db.update('characters', data, { id });
  }
}
```

### CLI Commands

**Location:** `cli/src/index.ts`

```typescript
// Already integrated!
import { DatabaseCLI } from './db/commands';

const dbCli = new DatabaseCLI();

// Available commands
await dbCli.describeSchema();
await dbCli.select('table_name');
await dbCli.insert('table_name', data);
await dbCli.listTables();
```

### Tests

**Location:** `backend/src/__tests__/*.ts`

```typescript
// OLD
// Mocking or skipping database tests

// NEW
import { db } from '../../cli/src/db';

describe('Character Service', () => {
  it('should create a character', async () => {
    const result = await db.insert('characters', {
      name: 'Test Hero',
      user_id: 1
    });

    expect(result.success).toBe(true);
    expect(result.rows).toBe(1);
  });
});
```

## Breaking Changes

### None! ✅

The new CLI Skill adds functionality without breaking existing code. You can migrate gradually.

## Compatibility Matrix

| Feature | MCP | CLI Skill | Status |
|---------|-----|-----------|--------|
| SELECT | Limited | ✅ Full | Use CLI Skill |
| INSERT | Limited | ✅ Full | Use CLI Skill |
| UPDATE | ❌ No | ✅ Full | Use CLI Skill |
| DELETE | ❌ No | ✅ Full | Use CLI Skill |
| Raw SQL | ❌ No | ✅ Full | Use CLI Skill |
| Migrations | ❌ No | ✅ Full | Use CLI Skill |
| Schema Info | Limited | ✅ Full | Use CLI Skill |
| Type Safety | ❌ No | ✅ Full | Use CLI Skill |
| Error Handling | Generic | ✅ Detailed | Use CLI Skill |

## Troubleshooting

### Issue: "Cannot find module"

**Solution:**
```bash
# Ensure file exists at cli/src/db/index.ts
ls -la cli/src/db/
```

### Issue: "Connection refused"

**Solution:**
```bash
# Check environment variables
echo $SUPABASE_PROJECT_REF
echo $SUPABASE_API_KEY

# Update .env if needed
```

### Issue: "SQL syntax error"

**Solution:**
- Strings are auto-escaped, but table/column names aren't
- Use proper PostgreSQL syntax
- Check the error message from `result.error`

### Issue: "Timeout"

**Solution:**
```typescript
// Use limit for large queries
const result = await db.select('large_table', ['*'], {}, {
  limit: 1000
});
```

## Performance Tips

1. **Use indexes** on frequently queried columns
2. **Batch inserts** instead of individual inserts
3. **Limit columns** in SELECT queries
4. **Use pagination** for large datasets
5. **Cache results** when appropriate

## Testing Migration

### Unit Test Template

```typescript
import { db } from '../cli/src/db';

describe('Database CLI Migration', () => {
  it('should select from users table', async () => {
    const result = await db.select('users', ['id'], {}, { limit: 1 });
    expect(result.success).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const result = await db.select('nonexistent_table');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });

  it('should execute raw SQL', async () => {
    const result = await db.query('SELECT 1 as test');
    expect(result.success).toBe(true);
  });
});
```

### Integration Test Template

```typescript
import { db } from '../cli/src/db';

describe('Database Operations', () => {
  const testData = { email: 'test@example.com', name: 'Test' };

  it('should CRUD operations', async () => {
    // Create
    const created = await db.insert('users', testData);
    expect(created.success).toBe(true);
    const userId = created.data?.[0].id;

    // Read
    const read = await db.select('users', ['*'], { id: userId });
    expect(read.success).toBe(true);

    // Update
    const updated = await db.update('users', { name: 'Updated' }, { id: userId });
    expect(updated.success).toBe(true);

    // Delete
    const deleted = await db.delete('users', { id: userId });
    expect(deleted.success).toBe(true);
  });
});
```

## Timeline

- **Immediate**: Use CLI Skill for new code
- **Week 1**: Migrate high-priority operations
- **Week 2**: Migrate remaining operations
- **Week 3**: Deprecate MCP usage
- **Week 4**: Remove MCP references

## Support

- **Documentation**: `cli/src/db/README.md`
- **Examples**: `cli/src/db/examples.ts`
- **Types**: `cli/src/db/types.ts`
- **API Reference**: `SUPABASE_CLI_SKILL.md`

## FAQ

**Q: Do I need to change my database schema?**
A: No, all existing tables and data are preserved.

**Q: Can I use both MCP and CLI Skill?**
A: Yes, you can migrate gradually. Both can coexist during transition.

**Q: What about performance?**
A: CLI Skill is generally faster as it eliminates intermediate layers.

**Q: Are there any breaking changes?**
A: No, this is purely additive. Existing code continues to work.

**Q: How do I handle transactions?**
A: Use raw SQL queries with BEGIN/COMMIT as shown in the examples.

**Q: What about prepared statements?**
A: Strings are auto-escaped. Use raw SQL for complex parameterized queries.

---

**Migration Status**: Ready for adoption
**Last Updated**: 2025-10-21
