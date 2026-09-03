import { createPool, runMigrations } from '@scango/db';
import { createLogger, loadConfig, postgresConfigSchema } from '@scango/common';
import { migrations as migration1 } from './db/migrations/001_initial_promo_schema';
import { migrations as migration2 } from './db/migrations/002_rename_points_to_coins';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const logger = createLogger('promo-migrate');

async function migrate() {
  const config = loadConfig(postgresConfigSchema);
  const pool = createPool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: 'scango_promo',
    max: 1,
  });

  try {
    logger.info('Starting promo database migrations...');
    await runMigrations(pool, [...migration1, ...migration2]);
    logger.info('Migrations completed successfully.');
  } catch (err) {
    logger.error({ err }, 'Migration failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
