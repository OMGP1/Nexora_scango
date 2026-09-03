import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '003_risk_aggregates',
    sql: `
      CREATE TABLE IF NOT EXISTS risk_aggregates (
        session_id VARCHAR(50) PRIMARY KEY,
        store_id VARCHAR(50) NOT NULL,
        base_score NUMERIC(5,2) DEFAULT 0,
        telemetry_score NUMERIC(5,2) DEFAULT 0,
        weight_mismatch_score NUMERIC(5,2) DEFAULT 0,
        final_risk_score NUMERIC(5,2) DEFAULT 0,
        tier VARCHAR(10) DEFAULT 'BRONZE' CHECK (tier IN ('BRONZE', 'SILVER', 'GOLD')),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );
    `
  }
];
