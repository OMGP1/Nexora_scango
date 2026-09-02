// =====================================================
// @scango/db — PostgreSQL Connection Pool Factory
// =====================================================

import { Pool, PoolConfig, QueryResult } from 'pg';
import { createLogger, Logger } from '@scango/common';

const logger: Logger = createLogger('scango-db');

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  max?: number;           // max pool connections (default 20)
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

/**
 * Create a PostgreSQL connection pool
 */
export function createPool(config: DbConfig): Pool {
  const poolConfig: PoolConfig = {
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    max: config.max ?? 20,
    idleTimeoutMillis: config.idleTimeoutMillis ?? 30000,
    connectionTimeoutMillis: config.connectionTimeoutMillis ?? 5000,
  };

  const pool = new Pool(poolConfig);

  pool.on('connect', () => {
    logger.debug({ database: config.database }, 'New client connected to PostgreSQL');
  });

  pool.on('error', (err: Error) => {
    logger.error({ err, database: config.database }, 'Unexpected PostgreSQL pool error');
  });

  return pool;
}

/**
 * Execute a query with logging
 */
export async function query(pool: Pool, sql: string, params?: unknown[]): Promise<QueryResult> {
  const start = Date.now();
  try {
    const result = await pool.query(sql, params);
    const duration = Date.now() - start;
    logger.debug({ sql: sql.substring(0, 100), duration, rows: result.rowCount }, 'Query executed');
    return result;
  } catch (err) {
    const duration = Date.now() - start;
    logger.error({ err, sql: sql.substring(0, 100), duration }, 'Query failed');
    throw err;
  }
}

/**
 * Health check: verify pool can connect
 */
export async function healthCheck(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query('SELECT 1 as ok');
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}

/**
 * Simple migration runner — executes SQL files in order
 */
export async function runMigrations(pool: Pool, migrations: MigrationFile[]): Promise<void> {
  // Ensure migrations tracking table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT NOW()
    )
  `);

  const executed = await pool.query('SELECT name FROM _migrations ORDER BY id');
  const executedNames = new Set(executed.rows.map((r: { name: string }) => r.name));

  for (const migration of migrations) {
    if (!executedNames.has(migration.name)) {
      logger.info({ migration: migration.name }, 'Running migration');
      await pool.query(migration.sql);
      await pool.query('INSERT INTO _migrations (name) VALUES ($1)', [migration.name]);
      logger.info({ migration: migration.name }, 'Migration completed');
    }
  }
}

export interface MigrationFile {
  name: string;
  sql: string;
}

// Re-export pg types
export { Pool, PoolClient, QueryResult } from 'pg';
