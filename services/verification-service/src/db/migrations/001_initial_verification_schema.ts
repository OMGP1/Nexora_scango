import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_verification_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS verification_logs (
        log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        customer_id VARCHAR(255),
        score NUMERIC(5, 2) NOT NULL,
        tier VARCHAR(20) NOT NULL CHECK (tier IN ('GREEN', 'AMBER', 'RED')),
        status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CLEARED', 'HELD')),
        reasons JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];
