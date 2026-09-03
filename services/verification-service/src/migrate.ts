import { Pool } from 'pg';
import { runMigrations } from '@scango/db';
import { migrations as migrations1 } from './db/migrations/001_initial_verification_schema';
import { migrations as migrations2 } from './db/migrations/002_weight_trust_tables';
import { migrations as migrations3 } from './db/migrations/003_risk_aggregates';
import { migrations as migrations4 } from './db/migrations/004_loyalty_escrow';
import { migrations as migrations5 } from './db/migrations/005_erp_sync';
import { loadConfig, postgresConfigSchema } from '@scango/common';
import * as dotenv from 'dotenv';
import pino from 'pino';

dotenv.config({ path: '../../.env' });
const logger = pino();

async function main() {
  const config = loadConfig(postgresConfigSchema);
  const pool = new Pool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: 'scango_verification',
  });

  try {
    logger.info('Starting verification database migrations...');
    await runMigrations(pool, [...migrations1, ...migrations2, ...migrations3, ...migrations4, ...migrations5]);
    logger.info('Migrations completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Migration failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

