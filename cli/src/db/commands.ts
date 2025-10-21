import { db, SupabaseClient } from './supabaseClient';
import { cli, SupabaseCLI } from './cliCommands';

interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Database CLI Command Interface
 * Provides structured commands for database operations
 */
export class DatabaseCLI {
  private client: SupabaseClient;
  private cli: SupabaseCLI;

  constructor() {
    this.client = db;
    this.cli = cli;
  }

  /**
   * List all tables with their structure
   */
  async describeSchema(): Promise<CommandResult> {
    try {
      const tables = await this.client.listTables();
      if (!tables.success) {
        return { success: false, message: tables.error || 'Failed to list tables' };
      }

      const descriptions: any[] = [];
      for (const table of tables.data || []) {
        const desc = await this.client.describeTable(table);
        descriptions.push({
          table,
          columns: desc.data
        });
      }

      return {
        success: true,
        message: `Found ${descriptions.length} tables`,
        data: descriptions
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Run a SELECT query
   */
  async select(
    table: string,
    options?: { where?: Record<string, any>; limit?: number; columns?: string[] }
  ): Promise<CommandResult> {
    try {
      const result = await this.client.select(
        table,
        options?.columns || ['*'],
        options?.where,
        { limit: options?.limit }
      );

      if (!result.success) {
        return { success: false, message: result.error || 'Query failed' };
      }

      return {
        success: true,
        message: `Retrieved ${result.rows} rows`,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Insert data
   */
  async insert(
    table: string,
    data: Record<string, any> | Record<string, any>[]
  ): Promise<CommandResult> {
    try {
      const result = await this.client.insert(table, data);

      if (!result.success) {
        return { success: false, message: result.error || 'Insert failed' };
      }

      return {
        success: true,
        message: `Inserted ${result.rows} rows`,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Update data
   */
  async update(
    table: string,
    data: Record<string, any>,
    where: Record<string, any>
  ): Promise<CommandResult> {
    try {
      const result = await this.client.update(table, data, where);

      if (!result.success) {
        return { success: false, message: result.error || 'Update failed' };
      }

      return {
        success: true,
        message: `Updated ${result.rows} rows`,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Delete data
   */
  async delete(table: string, where: Record<string, any>): Promise<CommandResult> {
    try {
      const result = await this.client.delete(table, where);

      if (!result.success) {
        return { success: false, message: result.error || 'Delete failed' };
      }

      return {
        success: true,
        message: `Deleted ${(result.data as any).rows} rows`,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Execute raw SQL
   */
  async query(sql: string): Promise<CommandResult> {
    try {
      const result = await this.client.query(sql);

      if (!result.success) {
        return { success: false, message: result.error || 'Query failed' };
      }

      return {
        success: true,
        message: `Query executed in ${result.duration}ms`,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Migrations
   */
  async listMigrations(): Promise<CommandResult> {
    try {
      const output = this.cli.listMigrations({ verbose: false });
      return {
        success: true,
        message: 'Migrations listed',
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async createMigration(name: string): Promise<CommandResult> {
    try {
      const output = this.cli.createMigration(name, { verbose: true });
      return {
        success: true,
        message: `Migration created: ${name}`,
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async applyMigrations(): Promise<CommandResult> {
    try {
      const output = this.cli.applyMigrations({ verbose: true });
      return {
        success: true,
        message: 'Migrations applied',
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Schema Operations
   */
  async pushSchema(): Promise<CommandResult> {
    try {
      const output = this.cli.pushSchema({ verbose: true });
      return {
        success: true,
        message: 'Schema pushed',
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  async pullSchema(): Promise<CommandResult> {
    try {
      const output = this.cli.pullSchema({ verbose: true });
      return {
        success: true,
        message: 'Schema pulled',
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Get database info
   */
  async getStatus(): Promise<CommandResult> {
    try {
      const output = this.cli.getStatus({ verbose: false });
      return {
        success: true,
        message: 'Status retrieved',
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Generate TypeScript types
   */
  async generateTypes(outputPath: string): Promise<CommandResult> {
    try {
      const output = this.cli.generateTypes(outputPath, { verbose: true });
      return {
        success: true,
        message: `Types generated to ${outputPath}`,
        data: output
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * List all tables
   */
  async listTables(): Promise<CommandResult> {
    try {
      const result = await this.client.listTables();
      return {
        success: result.success,
        message: result.success
          ? `Found ${result.data?.length} tables`
          : result.error || 'Failed to list tables',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

export default new DatabaseCLI();
