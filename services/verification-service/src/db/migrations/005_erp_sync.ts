import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '005_erp_sync',
    sql: `
      CREATE TABLE IF NOT EXISTS erp_sync_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id VARCHAR(50) NOT NULL,
        store_id VARCHAR(50) NOT NULL,
        erp_type VARCHAR(20) NOT NULL,
        payload TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'QUEUED'
          CHECK (status IN ('QUEUED', 'SENT', 'SUCCESS', 'FAILED')),
        error_message TEXT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  },
];
