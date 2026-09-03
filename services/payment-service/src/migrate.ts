import { createPool, runMigrations } from '@scango/db';
import { createLogger } from '@scango/common';
import { migrations as m001 } from './db/migrations/001_initial_payment_schema';
import { migrations as m002 } from './db/migrations/002_receipts_table';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const logger = createLogger('payment-migrate');
const migrations = [...m001, ...m002];

async function migrate() {
  const pool = createPool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || "5432"),
    user: process.env.POSTGRES_USER || 'scango',
    password: process.env.POSTGRES_PASSWORD || 'scango_dev_pass',
    database: 'scango_payment',
    max: 1,
  });

  try {
    logger.info('Starting payment database migrations...');
    await runMigrations(pool, migrations);
    logger.info('Migrations completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Migration failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
