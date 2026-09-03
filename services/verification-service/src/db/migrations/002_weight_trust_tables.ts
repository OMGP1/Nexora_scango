import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '002_weight_trust_tables',
    sql: `
      CREATE TABLE IF NOT EXISTS user_trust_tier (
        user_id VARCHAR(50) PRIMARY KEY,
        tier VARCHAR(10) DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE','SILVER','GOLD')),
        clean_exit_count INT DEFAULT 0,
        audit_fail_count INT DEFAULT 0,
        audit_rate_pct NUMERIC(5,2) DEFAULT 10.00,
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS weight_tolerance_policy (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        scope VARCHAR(20) DEFAULT 'GLOBAL' CHECK (scope IN ('GLOBAL','CATEGORY')),
        category_id VARCHAR(50) NULL,
        tolerance_pct NUMERIC(5,2) DEFAULT 3.50,
        tolerance_flat_g INT DEFAULT 15
      );

      CREATE TABLE IF NOT EXISTS exit_scale_device (
        id UUID PRIMARY KEY,
        store_id VARCHAR(50),
        lane_code VARCHAR(10),
        edge_gateway_id VARCHAR(64),
        last_calibrated_at TIMESTAMPTZ,
        calibration_drift_g SMALLINT DEFAULT 0,
        status VARCHAR(12) DEFAULT 'ONLINE' CHECK (status IN ('ONLINE','OFFLINE','DEGRADED')),
        UNIQUE(store_id, lane_code)
      );

      INSERT INTO weight_tolerance_policy (id, scope, tolerance_pct, tolerance_flat_g) 
      VALUES (gen_random_uuid(), 'GLOBAL', 3.50, 15) 
      ON CONFLICT DO NOTHING;
    `,
  },
];
