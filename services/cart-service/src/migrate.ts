import { createPool, runMigrations } from '@scango/db';
import { createLogger } from '@scango/common';
import { migrations } from './db/migrations/001_initial_cart_schema';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const logger = createLogger('cart-migrate');

async function migrate() {
  const pool = createPool({
    host: 'localhost', // Run locally using host mapped port
    port: 5433,
    user: 'scango',
    password: 'scango_dev_pass',
    database: 'scango_cart',
    max: 1,
  });

  try {
    logger.info('Starting cart database migrations...');
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
