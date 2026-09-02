import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_payment_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS payments (
        payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        method VARCHAR(50) DEFAULT 'stripe',
        gateway_ref VARCHAR(255),
        status VARCHAR(50) NOT NULL CHECK (status IN ('intent_created', 'processing', 'confirmed', 'failed', 'refunded', 'voided')),
        paid_at TIMESTAMP WITH TIME ZONE
      );

      CREATE TABLE IF NOT EXISTS refunds (
        refund_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        payment_id UUID NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        reason_code VARCHAR(100),
        refunded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE SEQUENCE IF NOT EXISTS receipt_seq START 1;
    `,
  },
];
