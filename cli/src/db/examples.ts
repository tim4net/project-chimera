/**
 * Database Module Usage Examples
 * Demonstrates common patterns and operations
 */

import { db, cli } from './index';
import DatabaseCLI from './commands';

// ============================================================================
// EXAMPLE 1: Basic SELECT Operations
// ============================================================================

export async function exampleSelectOperations() {
  console.log('\n=== SELECT Examples ===\n');

  // Get all users
  const allUsers = await db.select('users');
  console.log('All users:', allUsers);

  // Select specific columns
  const userNames = await db.select('users', ['id', 'name', 'email']);
  console.log('User names:', userNames);

  // Select with WHERE clause
  const activeUsers = await db.select('users', ['*'], { active: true });
  console.log('Active users:', activeUsers);

  // Select with pagination
  const paginatedUsers = await db.select('users', ['*'], {}, { limit: 10, offset: 0 });
  console.log('First 10 users:', paginatedUsers);
}

// ============================================================================
// EXAMPLE 2: INSERT Operations
// ============================================================================

export async function exampleInsertOperations() {
  console.log('\n=== INSERT Examples ===\n');

  // Insert single record
  const singleUser = await db.insert('users', {
    name: 'Alice',
    email: 'alice@example.com',
    active: true,
    created_at: new Date()
  });
  console.log('Inserted user:', singleUser);

  // Insert multiple records
  const multipleUsers = await db.insert('users', [
    { name: 'Bob', email: 'bob@example.com', active: true },
    { name: 'Charlie', email: 'charlie@example.com', active: false },
    { name: 'Diana', email: 'diana@example.com', active: true }
  ]);
  console.log('Inserted users:', multipleUsers);

  // Insert with JSON data
  const userWithMetadata = await db.insert('users', {
    name: 'Eve',
    email: 'eve@example.com',
    metadata: { preferences: { theme: 'dark', notifications: true } }
  });
  console.log('User with metadata:', userWithMetadata);
}

// ============================================================================
// EXAMPLE 3: UPDATE Operations
// ============================================================================

export async function exampleUpdateOperations() {
  console.log('\n=== UPDATE Examples ===\n');

  // Update single field
  const updated = await db.update('users', { active: false }, { id: 1 });
  console.log('Updated user:', updated);

  // Update multiple fields
  const multiUpdate = await db.update(
    'users',
    { active: true, updated_at: new Date() },
    { role: 'admin' }
  );
  console.log('Updated admin users:', multiUpdate);

  // Update with complex WHERE
  const complexUpdate = await db.query(`
    UPDATE users
    SET active = false
    WHERE last_login < NOW() - INTERVAL '30 days'
    RETURNING *
  `);
  console.log('Deactivated inactive users:', complexUpdate);
}

// ============================================================================
// EXAMPLE 4: DELETE Operations
// ============================================================================

export async function exampleDeleteOperations() {
  console.log('\n=== DELETE Examples ===\n');

  // Delete single record
  const deleted = await db.delete('users', { id: 999 });
  console.log('Deleted records:', deleted);

  // Delete multiple records with condition
  const multiDelete = await db.delete('users', { active: false, role: 'guest' });
  console.log('Deleted guest accounts:', multiDelete);
}

// ============================================================================
// EXAMPLE 5: Raw SQL Queries
// ============================================================================

export async function exampleRawQueries() {
  console.log('\n=== Raw SQL Examples ===\n');

  // Simple query
  const simple = await db.query('SELECT COUNT(*) as total FROM users');
  console.log('Total users:', simple);

  // Complex JOIN query
  const joinQuery = await db.query(`
    SELECT
      u.id,
      u.name,
      COUNT(q.id) as quest_count,
      AVG(q.reward) as avg_reward
    FROM users u
    LEFT JOIN quests q ON u.id = q.user_id
    GROUP BY u.id, u.name
    ORDER BY quest_count DESC
  `);
  console.log('User quest stats:', joinQuery);

  // Aggregation query
  const stats = await db.query(`
    SELECT
      DATE_TRUNC('day', created_at) as day,
      COUNT(*) as new_users,
      SUM(CASE WHEN active THEN 1 ELSE 0 END) as active_count
    FROM users
    GROUP BY DATE_TRUNC('day', created_at)
    ORDER BY day DESC
  `);
  console.log('Daily stats:', stats);

  // Window function example
  const ranked = await db.query(`
    SELECT
      id,
      name,
      level,
      ROW_NUMBER() OVER (ORDER BY level DESC) as rank
    FROM users
    LIMIT 10
  `);
  console.log('Top players:', ranked);
}

// ============================================================================
// EXAMPLE 6: Schema Inspection
// ============================================================================

export async function exampleSchemaInspection() {
  console.log('\n=== Schema Examples ===\n');

  // List all tables
  const tables = await db.listTables();
  console.log('Tables:', tables);

  // Describe table structure
  const schema = await db.describeTable('users');
  console.log('Users table schema:', schema);

  // Use DatabaseCLI for high-level schema operations
  const dbCli = new DatabaseCLI();
  const fullSchema = await dbCli.describeSchema();
  console.log('Full schema:', fullSchema);
}

// ============================================================================
// EXAMPLE 7: Migrations
// ============================================================================

export async function exampleMigrations() {
  console.log('\n=== Migration Examples ===\n');

  const dbCli = new DatabaseCLI();

  // List existing migrations
  const migrations = await dbCli.listMigrations();
  console.log('Migrations:', migrations);

  // Create new migration
  const newMigration = await dbCli.createMigration('add_user_profiles');
  console.log('Created migration:', newMigration);

  // Apply migrations
  const applied = await dbCli.applyMigrations();
  console.log('Applied migrations:', applied);
}

// ============================================================================
// EXAMPLE 8: Schema Operations
// ============================================================================

export async function exampleSchemaOperations() {
  console.log('\n=== Schema Operations ===\n');

  const dbCli = new DatabaseCLI();

  // Get status
  const status = await dbCli.getStatus();
  console.log('DB Status:', status);

  // Generate TypeScript types
  const types = await dbCli.generateTypes('./src/types/database.ts');
  console.log('Generated types:', types);

  // Push schema changes
  const pushed = await dbCli.pushSchema();
  console.log('Schema pushed:', pushed);

  // Pull schema
  const pulled = await dbCli.pullSchema();
  console.log('Schema pulled:', pulled);
}

// ============================================================================
// EXAMPLE 9: Error Handling
// ============================================================================

export async function exampleErrorHandling() {
  console.log('\n=== Error Handling ===\n');

  // Handle failed operations
  const result = await db.select('nonexistent_table');

  if (!result.success) {
    console.error('Query failed:', result.error);
  } else {
    console.log('Success!', result.data);
  }

  // Wrap in try-catch for CLI operations
  try {
    const migrations = cli.listMigrations({ verbose: true });
    console.log('Migrations:', migrations);
  } catch (error) {
    console.error('CLI error:', error);
  }
}

// ============================================================================
// EXAMPLE 10: Transactions (Raw SQL)
// ============================================================================

export async function exampleTransactions() {
  console.log('\n=== Transaction Examples ===\n');

  // Simple transaction
  const transaction = await db.query(`
    BEGIN;
    INSERT INTO users (name, email, active)
    VALUES ('Frank', 'frank@example.com', true);
    INSERT INTO user_metadata (user_id, key, value)
    SELECT id, 'created_via', 'batch_import'
    FROM users WHERE email = 'frank@example.com';
    COMMIT;
  `);
  console.log('Transaction result:', transaction);

  // Rollback on error
  const safeTx = await db.query(`
    BEGIN;
    UPDATE users SET balance = balance - 100 WHERE id = 1;
    UPDATE users SET balance = balance + 100 WHERE id = 2;
    -- If anything fails above, the entire transaction is rolled back
    COMMIT;
  `);
  console.log('Safe transaction:', safeTx);
}

// ============================================================================
// EXAMPLE 11: Batch Operations
// ============================================================================

export async function exampleBatchOperations() {
  console.log('\n=== Batch Operations ===\n');

  // Batch insert (most efficient)
  const users = Array.from({ length: 1000 }, (_, i) => ({
    name: `User${i}`,
    email: `user${i}@example.com`,
    active: i % 2 === 0
  }));

  const inserted = await db.insert('users', users);
  console.log(`Inserted ${inserted.rows} users`);

  // Batch update with raw SQL
  const updated = await db.query(`
    UPDATE users
    SET active = true
    WHERE created_at > NOW() - INTERVAL '7 days'
      AND active = false
  `);
  console.log('Batch update complete');
}

// ============================================================================
// EXAMPLE 12: Pagination Pattern
// ============================================================================

export async function examplePagination() {
  console.log('\n=== Pagination Pattern ===\n');

  const pageSize = 20;
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const result = await db.select(
      'users',
      ['id', 'name', 'email'],
      { active: true },
      { limit: pageSize, offset: page * pageSize }
    );

    if (result.success && result.data && result.data.length > 0) {
      console.log(`Page ${page}:`, result.data);
      page++;
      hasMore = result.data.length === pageSize;
    } else {
      hasMore = false;
    }
  }
}

// ============================================================================
// Main: Run all examples
// ============================================================================

export async function runAllExamples() {
  try {
    await exampleSelectOperations();
    await exampleInsertOperations();
    await exampleUpdateOperations();
    await exampleDeleteOperations();
    await exampleRawQueries();
    await exampleSchemaInspection();
    await exampleSchemaOperations();
    await exampleErrorHandling();
    console.log('\n✅ All examples completed!');
  } catch (error) {
    console.error('Example error:', error);
  }
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}
