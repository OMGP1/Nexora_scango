import { createPool, query } from '@scango/db';
import { createLogger, loadConfig, postgresConfigSchema } from '@scango/common';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });
const logger = createLogger('identity-seed');

async function seed() {
  const config = loadConfig(postgresConfigSchema);
  const pool = createPool({
    host: config.POSTGRES_HOST,
    port: config.POSTGRES_PORT,
    user: config.POSTGRES_USER,
    password: config.POSTGRES_PASSWORD,
    database: 'scango_identity',
    max: 1,
  });

  try {
    logger.info('Starting identity database seed...');

    // 1. Create default pilot store
    const storeId = 'STORE_001';
    const storeConfig = {
      self_scan_enabled: true,
      verification_thresholds: {
        green_max: 0.2, // very conservative
        amber_max: 0.5,
      },
      sampling_rate: 0.20,
      session_timeout_minutes: 60,
      operating_hours: { start: '08:00', end: '22:00' }
    };

    await query(pool, `
      INSERT INTO stores (store_id, name, region, timezone, config_flags)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (store_id) DO UPDATE SET name = $2, config_flags = $5
    `, [storeId, 'ScanGo Pilot Hypermarket', 'North', 'Asia/Kolkata', storeConfig]);

    logger.info('Default store created');

    // 2. Create enterprise admin
    const adminEmail = 'admin@scango.local';
    const adminPass = await bcrypt.hash('Admin@123!', 10);

    await query(pool, `
      INSERT INTO users (email, password_hash, name, role, store_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [adminEmail, adminPass, 'System Administrator', 'admin', null]);

    // 3. Create store manager
    const managerEmail = 'manager1@scango.local';
    const managerPass = await bcrypt.hash('Store@123!', 10);

    await query(pool, `
      INSERT INTO users (email, password_hash, name, role, store_id)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
    `, [managerEmail, managerPass, 'Store Manager One', 'store_manager', storeId]);

    logger.info('Default users created');
    logger.info('Seed completed successfully.');

  } catch (err) {
    logger.error({ err }, 'Seed failed');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
