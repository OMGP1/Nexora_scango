import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '004_loyalty_escrow',
    sql: `
      CREATE TABLE IF NOT EXISTS loyalty_escrow (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(50) NOT NULL,
        user_id VARCHAR(50) NOT NULL,
        points_pending INT NOT NULL DEFAULT 0,
        points_multiplier NUMERIC(5,2) NOT NULL DEFAULT 1.00,
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
          CHECK (status IN ('PENDING', 'RELEASED', 'FORFEITED')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        resolved_at TIMESTAMPTZ NULL
      );
    `,
  },
];
