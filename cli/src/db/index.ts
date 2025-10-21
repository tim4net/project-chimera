/**
 * Database Module
 * Supabase CLI-based database access without MCP
 */

export { SupabaseClient, db } from './supabaseClient';
export { SupabaseCLI, cli } from './cliCommands';
export { DatabaseCLI } from './commands';
export type { QueryOptions, ExecutionResult } from './supabaseClient';
export type { CLICommandOptions } from './cliCommands';
