import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '002_receipts_table',
    sql: `
      CREATE TABLE IF NOT EXISTS receipts (
        receipt_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        receipt_no VARCHAR(100) UNIQUE NOT NULL,
        session_id UUID NOT NULL,
        customer_id VARCHAR(100) NOT NULL,
        store_id VARCHAR(50) NOT NULL,
        items_json JSONB NOT NULL,
        bill_summary_json JSONB NOT NULL,
        payment_method VARCHAR(30) NOT NULL DEFAULT 'card',
        payment_id UUID REFERENCES payments(payment_id),
        exit_pass_token TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_receipts_customer ON receipts(customer_id);
      CREATE INDEX IF NOT EXISTS idx_receipts_session ON receipts(session_id);

      ALTER TABLE payments ADD COLUMN IF NOT EXISTS customer_id VARCHAR(100);
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS counter_otp VARCHAR(10);
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS counter_token TEXT;
      ALTER TABLE payments ADD COLUMN IF NOT EXISTS counter_expires_at TIMESTAMP WITH TIME ZONE;
    `,
  },
];
