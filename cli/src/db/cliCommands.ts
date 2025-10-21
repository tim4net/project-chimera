import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface CLICommandOptions {
  json?: boolean;
  verbose?: boolean;
  dry?: boolean;
}

/**
 * Supabase CLI Command Executor
 * Direct wrapper around supabase CLI for database operations
 */
export class SupabaseCLI {
  private projectRef: string;
  private apiKey: string;

  constructor() {
    this.projectRef = process.env.SUPABASE_PROJECT_REF || '';
    this.apiKey = process.env.SUPABASE_API_KEY || '';

    if (!this.projectRef || !this.apiKey) {
      this.loadEnv();
    }
  }

  private loadEnv() {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');

      for (const line of lines) {
        if (line.startsWith('SUPABASE_PROJECT_REF=')) {
          this.projectRef = line.replace('SUPABASE_PROJECT_REF=', '').trim();
        } else if (line.startsWith('SUPABASE_API_KEY=')) {
          this.apiKey = line.replace('SUPABASE_API_KEY=', '').trim();
        }
      }
    }
  }

  /**
   * Execute a supabase CLI command
   */
  private execCommand(command: string, options: CLICommandOptions = {}): string {
    try {
      const env = { ...process.env };
      if (this.projectRef) env.SUPABASE_PROJECT_REF = this.projectRef;
      if (this.apiKey) env.SUPABASE_API_KEY = this.apiKey;

      if (options.dry) {
        console.log(`[DRY RUN] ${command}`);
        return '';
      }

      const output = execSync(command, { env, encoding: 'utf-8' });
      if (options.verbose) {
        console.log(`[CLI] ${command}`);
        console.log(output);
      }
      return output;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (options.verbose) {
        console.error(`[ERROR] ${command}: ${message}`);
      }
      throw error;
    }
  }

  /**
   * List all migrations
   */
  listMigrations(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase migration list', options);
  }

  /**
   * Create a new migration
   */
  createMigration(name: string, options: CLICommandOptions = {}): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const migrationName = `${timestamp}_${name}`;
    return this.execCommand(`supabase migration new "${migrationName}"`, options);
  }

  /**
   * Apply migrations
   */
  applyMigrations(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase migration up', options);
  }

  /**
   * Push schema changes
   */
  pushSchema(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase push', options);
  }

  /**
   * Pull remote schema
   */
  pullSchema(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase pull', options);
  }

  /**
   * Get project status
   */
  getStatus(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase status', options);
  }

  /**
   * Start local development server
   */
  startLocal(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase start', options);
  }

  /**
   * Stop local development server
   */
  stopLocal(options: CLICommandOptions = {}): string {
    return this.execCommand('supabase stop', options);
  }

  /**
   * Link to remote project
   */
  linkProject(projectRef: string, options: CLICommandOptions = {}): string {
    return this.execCommand(`supabase link --project-ref "${projectRef}"`, options);
  }

  /**
   * Generate TypeScript types
   */
  generateTypes(outputPath: string, options: CLICommandOptions = {}): string {
    return this.execCommand(
      `supabase gen types typescript --project-ref "${this.projectRef}" > "${outputPath}"`,
      options
    );
  }

  /**
   * List tables
   */
  listTables(options: CLICommandOptions = {}): string {
    return this.execCommand(
      `supabase db tables --project-ref "${this.projectRef}"`,
      options
    );
  }

  /**
   * Execute raw SQL via psql
   */
  executeSql(sql: string, options: CLICommandOptions = {}): string {
    // This requires psql to be installed and configured
    const escapedSql = sql.replace(/"/g, '\\"');
    return this.execCommand(
      `supabase db execute --project-ref "${this.projectRef}" "${escapedSql}"`,
      options
    );
  }

  /**
   * Get database connection string
   */
  getConnectionString(): string {
    try {
      return this.execCommand(
        `supabase connection-string --project-ref "${this.projectRef}"`
      );
    } catch (error) {
      return '';
    }
  }

  /**
   * Create a backup
   */
  createBackup(options: CLICommandOptions = {}): string {
    return this.execCommand(
      `supabase db backup --project-ref "${this.projectRef}"`,
      options
    );
  }

  /**
   * List backups
   */
  listBackups(options: CLICommandOptions = {}): string {
    return this.execCommand(
      `supabase db backups --project-ref "${this.projectRef}"`,
      options
    );
  }
}

export const cli = new SupabaseCLI();
