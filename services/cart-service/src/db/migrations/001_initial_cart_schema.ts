import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_cart_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS cart_items (
        cart_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id UUID NOT NULL,
        sku VARCHAR(100) NOT NULL,
        quantity NUMERIC(10, 3) NOT NULL,
        weight NUMERIC(10, 3),
        unit_price NUMERIC(10, 2) NOT NULL,
        line_total NUMERIC(10, 2) NOT NULL,
        tax_rate NUMERIC(10, 2) NOT NULL,
        tax_amount NUMERIC(10, 2) NOT NULL,
        requires_assisted_verification BOOLEAN DEFAULT false,
        scan_source VARCHAR(50) DEFAULT 'camera',
        scanned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        removed_at TIMESTAMP WITH TIME ZONE
      );

      CREATE INDEX idx_cart_items_session_id ON cart_items(session_id);
      CREATE INDEX idx_cart_items_sku ON cart_items(sku);
    `,
  },
];
