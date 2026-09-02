import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_session_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id VARCHAR(50) NOT NULL,
        customer_id VARCHAR(255),
        customer_type VARCHAR(50) NOT NULL, -- 'guest', 'loyalty'
        status VARCHAR(50) NOT NULL, -- 'active', 'paused', 'expired', 'abandoned', 'completed'
        started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        paused_at TIMESTAMP WITH TIME ZONE,
        device_fingerprint VARCHAR(255),
        join_code VARCHAR(10) UNIQUE,
        devices JSONB NOT NULL DEFAULT '[]',
        has_age_restricted_items BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_sessions_store_id ON sessions(store_id);
      CREATE INDEX idx_sessions_status ON sessions(status);
      CREATE INDEX idx_sessions_join_code ON sessions(join_code);
    `,
  },
];
