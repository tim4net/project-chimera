/**
 * Database Module Type Definitions
 * Type-safe interfaces for all database operations
 */

/**
 * Options for query execution
 */
export interface QueryOptions {
  /**
   * Output format for results
   * @default 'json'
   */
  format?: 'json' | 'csv' | 'text';

  /**
   * Maximum number of rows to return
   */
  limit?: number;

  /**
   * Number of rows to skip (for pagination)
   */
  offset?: number;

  /**
   * Query timeout in milliseconds
   */
  timeout?: number;

  /**
   * Enable verbose logging
   */
  verbose?: boolean;
}

/**
 * Result of a database operation
 */
export interface ExecutionResult<T = any> {
  /**
   * Whether the operation succeeded
   */
  success: boolean;

  /**
   * Returned data (if successful)
   */
  data?: T;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Number of rows affected/returned
   */
  rows?: number;

  /**
   * Execution time in milliseconds
   */
  duration?: number;

  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Options for CLI command execution
 */
export interface CLICommandOptions {
  /**
   * Output format (JSON for parsing, text for display)
   */
  json?: boolean;

  /**
   * Enable verbose output
   */
  verbose?: boolean;

  /**
   * Dry run - show what would be executed without actually running
   */
  dry?: boolean;

  /**
   * Working directory for command execution
   */
  cwd?: string;

  /**
   * Custom environment variables
   */
  env?: Record<string, string>;

  /**
   * Command timeout in milliseconds
   */
  timeout?: number;
}

/**
 * High-level command result
 */
export interface CommandResult {
  /**
   * Whether the command succeeded
   */
  success: boolean;

  /**
   * Human-readable message
   */
  message: string;

  /**
   * Command output/data
   */
  data?: any;

  /**
   * Execution time in milliseconds
   */
  duration?: number;
}

/**
 * Database table column metadata
 */
export interface ColumnMetadata {
  /**
   * Column name
   */
  name: string;

  /**
   * PostgreSQL data type
   */
  dataType: string;

  /**
   * Whether NULL is allowed
   */
  isNullable: boolean;

  /**
   * Default value expression
   */
  defaultValue?: string;

  /**
   * Whether column is part of primary key
   */
  isPrimaryKey?: boolean;

  /**
   * Whether column has a unique constraint
   */
  isUnique?: boolean;

  /**
   * Foreign key reference
   */
  foreignKey?: {
    table: string;
    column: string;
  };
}

/**
 * Database table metadata
 */
export interface TableMetadata {
  /**
   * Table name
   */
  name: string;

  /**
   * Table schema (usually 'public')
   */
  schema: string;

  /**
   * Number of rows in table
   */
  rowCount: number;

  /**
   * Table columns
   */
  columns: ColumnMetadata[];

  /**
   * Table indexes
   */
  indexes?: string[];

  /**
   * Table constraints
   */
  constraints?: string[];
}

/**
 * Migration metadata
 */
export interface Migration {
  /**
   * Migration ID/timestamp
   */
  id: string;

  /**
   * Migration name
   */
  name: string;

  /**
   * When migration was created
   */
  createdAt: Date;

  /**
   * When migration was applied (if applicable)
   */
  appliedAt?: Date;

  /**
   * Migration status
   */
  status: 'pending' | 'applied' | 'failed';

  /**
   * SQL content
   */
  content?: string;
}

/**
 * Transaction state
 */
export interface Transaction {
  /**
   * Transaction ID
   */
  id: string;

  /**
   * Transaction status
   */
  status: 'active' | 'committed' | 'rolled_back';

  /**
   * When transaction started
   */
  startedAt: Date;

  /**
   * Number of queries in transaction
   */
  queryCount: number;
}

/**
 * Backup metadata
 */
export interface Backup {
  /**
   * Backup ID
   */
  id: string;

  /**
   * Backup name
   */
  name: string;

  /**
   * When backup was created
   */
  createdAt: Date;

  /**
   * Backup size in bytes
   */
  size: number;

  /**
   * Backup location/path
   */
  location: string;
}

/**
 * Database connection info
 */
export interface ConnectionInfo {
  /**
   * Database host
   */
  host: string;

  /**
   * Database port
   */
  port: number;

  /**
   * Database name
   */
  database: string;

  /**
   * Database user
   */
  user: string;

  /**
   * Connection string (password redacted)
   */
  connectionString: string;

  /**
   * SSL mode
   */
  sslMode?: 'require' | 'prefer' | 'allow' | 'disable';

  /**
   * Additional connection options
   */
  options?: Record<string, string>;
}

/**
 * Database statistics
 */
export interface DatabaseStats {
  /**
   * Total number of tables
   */
  tableCount: number;

  /**
   * Total number of records across all tables
   */
  totalRecords: number;

  /**
   * Total database size in bytes
   */
  totalSize: number;

  /**
   * Per-table statistics
   */
  tables: Array<{
    name: string;
    rowCount: number;
    size: number;
  }>;

  /**
   * Cache statistics
   */
  cache?: {
    hitRate: number;
    missRate: number;
  };
}

/**
 * Select operation options
 */
export interface SelectOptions extends QueryOptions {
  /**
   * Columns to select (default: ['*'])
   */
  columns?: string[];

  /**
   * WHERE conditions
   */
  where?: Record<string, any>;

  /**
   * ORDER BY clause
   */
  orderBy?: string;

  /**
   * GROUP BY columns
   */
  groupBy?: string[];

  /**
   * HAVING clause for groups
   */
  having?: string;

  /**
   * Distinct results
   */
  distinct?: boolean;
}

/**
 * Insert operation result
 */
export interface InsertResult<T = any> extends ExecutionResult<T[]> {
  /**
   * IDs of inserted records (if applicable)
   */
  ids?: (string | number)[];
}

/**
 * Update operation result
 */
export interface UpdateResult<T = any> extends ExecutionResult<T[]> {
  /**
   * Number of records updated
   */
  updated?: number;
}

/**
 * Delete operation result
 */
export interface DeleteResult extends ExecutionResult {
  /**
   * Number of records deleted
   */
  deleted?: number;
}

/**
 * Query operation result
 */
export interface QueryResult<T = any> extends ExecutionResult<T[]> {
  /**
   * Query statistics
   */
  stats?: {
    planningTime: number;
    executionTime: number;
    rowsExamined: number;
  };
}
