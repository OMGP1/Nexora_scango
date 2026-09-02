import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_inventory_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS inventory_snapshot (
        store_id VARCHAR(50) NOT NULL,
        sku VARCHAR(100) NOT NULL,
        available_qty NUMERIC(10, 3) NOT NULL DEFAULT 0,
        reserved_qty NUMERIC(10, 3) NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (store_id, sku)
      );

      CREATE TABLE IF NOT EXISTS inventory_ledger (
        ledger_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id VARCHAR(50) NOT NULL,
        sku VARCHAR(100) NOT NULL,
        movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('RESERVED', 'RELEASED', 'SOLD', 'ADJUSTMENT')),
        quantity_delta NUMERIC(10, 3) NOT NULL,
        session_id UUID,
        recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX idx_ledger_store_sku ON inventory_ledger(store_id, sku);
      CREATE INDEX idx_ledger_session ON inventory_ledger(session_id);

      CREATE TABLE IF NOT EXISTS processed_events (
        event_id VARCHAR(100) PRIMARY KEY,
        processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];
