# Supabase CLI Database Module

This module provides a complete replacement for MCP-based Supabase integration, using direct CLI commands and type-safe database access.

## Features

- ✅ **Type-safe database operations** (select, insert, update, delete)
- ✅ **Raw SQL query execution**
- ✅ **Migration management**
- ✅ **Schema push/pull**
- ✅ **TypeScript type generation**
- ✅ **Error handling and validation**
- ✅ **Connection string management**
- ✅ **Database backups**

## Installation

The module is already integrated into the CLI. No additional installation needed.

## Environment Setup

Ensure your `.env` file contains:

```bash
SUPABASE_PROJECT_REF=your_project_ref
SUPABASE_API_KEY=your_api_key
SUPABASE_DB_URL=postgresql://user:password@host/database
```

## Usage Examples

### 1. Database Client (TypeScript)

```typescript
import { db } from './db';

// Select data
const users = await db.select('users', ['id', 'name', 'email'], { active: true });
console.log(users.data);

// Insert data
const result = await db.insert('users', {
  name: 'John',
  email: 'john@example.com',
  active: true
});

// Update data
await db.update('users',
  { active: false },
  { id: 123 }
);

// Delete data
await db.delete('users', { inactive: true });

// Raw SQL
const raw = await db.query('SELECT * FROM users LIMIT 10');

// List tables
const tables = await db.listTables();

// Describe table structure
const schema = await db.describeTable('users');
```

### 2. CLI Commands (Command Line)

```bash
# List all tables
npx ts-node cli/src/index.ts db list-tables

# Describe schema
npx ts-node cli/src/index.ts db describe-schema

# Create migration
npx ts-node cli/src/index.ts db create-migration "add_user_roles"

# Apply migrations
npx ts-node cli/src/index.ts db apply-migrations

# Push schema
npx ts-node cli/src/index.ts db push-schema

# Pull schema
npx ts-node cli/src/index.ts db pull-schema

# Generate TypeScript types
npx ts-node cli/src/index.ts db generate-types "./types/database.ts"

# Get database status
npx ts-node cli/src/index.ts db status
```

### 3. Direct SQL Execution

```typescript
import { db } from './db';

// Execute raw SQL with proper escaping
const result = await db.query(`
  SELECT u.id, u.name, COUNT(q.id) as quest_count
  FROM users u
  LEFT JOIN quests q ON u.id = q.user_id
  GROUP BY u.id, u.name
  ORDER BY quest_count DESC
`);
```

## API Reference

### SupabaseClient

#### Methods

- `query<T>(sql: string, options?: QueryOptions): Promise<ExecutionResult<T[]>>`
  - Execute raw SQL query

- `select<T>(table: string, columns?: string[], where?: Record<string, any>, options?: QueryOptions): Promise<ExecutionResult<T[]>>`
  - Select data from table

- `insert<T>(table: string, data: Record<string, any> | Record<string, any>[], options?: QueryOptions): Promise<ExecutionResult<T[]>>`
  - Insert data into table

- `update<T>(table: string, data: Record<string, any>, where: Record<string, any>, options?: QueryOptions): Promise<ExecutionResult<T[]>>`
  - Update data in table

- `delete<T>(table: string, where: Record<string, any>, options?: QueryOptions): Promise<ExecutionResult<{ rows: number }>>`
  - Delete data from table

- `listTables(): Promise<ExecutionResult<string[]>>`
  - List all tables

- `describeTable(table: string): Promise<ExecutionResult>`
  - Get table structure and columns

### SupabaseCLI

#### Methods

- `listMigrations(options?: CLICommandOptions): string`
- `createMigration(name: string, options?: CLICommandOptions): string`
- `applyMigrations(options?: CLICommandOptions): string`
- `pushSchema(options?: CLICommandOptions): string`
- `pullSchema(options?: CLICommandOptions): string`
- `getStatus(options?: CLICommandOptions): string`
- `startLocal(options?: CLICommandOptions): string`
- `stopLocal(options?: CLICommandOptions): string`
- `linkProject(projectRef: string, options?: CLICommandOptions): string`
- `generateTypes(outputPath: string, options?: CLICommandOptions): string`
- `listTables(options?: CLICommandOptions): string`
- `executeSql(sql: string, options?: CLICommandOptions): string`
- `getConnectionString(): string`
- `createBackup(options?: CLICommandOptions): string`
- `listBackups(options?: CLICommandOptions): string`

### DatabaseCLI

High-level interface wrapping both client and CLI:

- `describeSchema(): Promise<CommandResult>`
- `select(table: string, options?: SelectOptions): Promise<CommandResult>`
- `insert(table: string, data: any): Promise<CommandResult>`
- `update(table: string, data: any, where: any): Promise<CommandResult>`
- `delete(table: string, where: any): Promise<CommandResult>`
- `query(sql: string): Promise<CommandResult>`
- `listMigrations(): Promise<CommandResult>`
- `createMigration(name: string): Promise<CommandResult>`
- `applyMigrations(): Promise<CommandResult>`
- `pushSchema(): Promise<CommandResult>`
- `pullSchema(): Promise<CommandResult>`
- `getStatus(): Promise<CommandResult>`
- `generateTypes(outputPath: string): Promise<CommandResult>`
- `listTables(): Promise<CommandResult>`

## Types

### QueryOptions
```typescript
interface QueryOptions {
  format?: 'json' | 'csv' | 'text';
  limit?: number;
  offset?: number;
}
```

### ExecutionResult
```typescript
interface ExecutionResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  rows?: number;
  duration?: number;
}
```

### CLICommandOptions
```typescript
interface CLICommandOptions {
  json?: boolean;
  verbose?: boolean;
  dry?: boolean;
}
```

### CommandResult
```typescript
interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}
```

## Error Handling

All methods return a `success` flag and error message:

```typescript
const result = await db.select('users');

if (!result.success) {
  console.error('Query failed:', result.error);
} else {
  console.log(`Retrieved ${result.rows} rows`);
  console.log(result.data);
}
```

## Advanced Usage

### Transactions

For transactions, use raw SQL:

```typescript
const result = await db.query(`
  BEGIN;
  UPDATE users SET balance = balance - 100 WHERE id = 1;
  UPDATE users SET balance = balance + 100 WHERE id = 2;
  COMMIT;
`);
```

### Bulk Operations

Insert multiple records:

```typescript
const users = [
  { name: 'Alice', email: 'alice@example.com' },
  { name: 'Bob', email: 'bob@example.com' },
  { name: 'Charlie', email: 'charlie@example.com' }
];

const result = await db.insert('users', users);
console.log(`Inserted ${result.rows} users`);
```

### Filtering with WHERE Clauses

```typescript
// Simple equality
const active = await db.select('users', ['*'], { active: true });

// Multiple conditions (AND)
const filtered = await db.select('users', ['*'], {
  active: true,
  role: 'admin'
});

// Complex queries (use raw SQL)
const complex = await db.query(`
  SELECT * FROM users
  WHERE (role = 'admin' OR role = 'moderator')
  AND active = true
`);
```

## Migration Workflow

1. **Create a migration:**
   ```bash
   npx ts-node cli/src/index.ts db create-migration "add_new_column"
   ```

2. **Edit the generated migration file** in `backend/migrations/`

3. **Apply the migration:**
   ```bash
   npx ts-node cli/src/index.ts db apply-migrations
   ```

4. **Generate updated TypeScript types:**
   ```bash
   npx ts-node cli/src/index.ts db generate-types "./types/database.ts"
   ```

## Troubleshooting

### Connection Issues

Verify environment variables:
```bash
echo $SUPABASE_PROJECT_REF
echo $SUPABASE_API_KEY
```

### SQL Injection Prevention

The module automatically escapes SQL strings:
```typescript
// Safe - user input is escaped
await db.select('users', ['*'], { email: userInput });

// For raw SQL, use parameterized queries when possible
await db.query(`
  SELECT * FROM users WHERE email = $1
  -- For parameterized queries, consult Supabase docs
`);
```

### Performance Optimization

Use `limit` and `offset` for pagination:
```typescript
const page = 1;
const pageSize = 20;

const result = await db.select('users', ['*'], {}, {
  limit: pageSize,
  offset: (page - 1) * pageSize
});
```

## Migration from MCP

### Before (MCP):
```typescript
// Using mcp__supabase__execute_sql, etc.
```

### After (CLI-based):
```typescript
import { db, cli } from './db';

// All operations now use the CLI module
const result = await db.select('users');
```

Simply replace MCP calls with the equivalent database module calls. No functionality is lost.

## Support

For issues or questions, refer to:
- [Supabase CLI Docs](https://supabase.com/docs/guides/cli)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- Project CLAUDE.md
