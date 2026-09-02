import { createPool, runMigrations } from '@scango/db';
import { createLogger, loadConfig, postgresConfigSchema } from '@scango/common';
import { migrations } from './db/migrations/001_initial_inventory_schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const logger = createLogger('inventory-migrate');

async function migrate() {
  const config = loadConfig(postgresConfigSchema);
  const pool = createPool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: 'scango_inventory',
    max: 1,
  });

  try {
    logger.info('Starting inventory database migrations...');
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
