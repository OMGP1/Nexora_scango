import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_promo_schema',
    sql: `
      CREATE TABLE IF NOT EXISTS promotions (
        promo_code VARCHAR(50) PRIMARY KEY,
        type VARCHAR(20) NOT NULL CHECK (type IN ('PERCENTAGE', 'FLAT', 'BUY_X_GET_Y', 'CATEGORY')),
        discount_value NUMERIC(10, 2) NOT NULL,
        min_basket_value NUMERIC(10, 2) DEFAULT 0,
        usage_limit INT DEFAULT NULL,
        used_count INT DEFAULT 0,
        applicable_categories JSONB DEFAULT '[]',
        applicable_skus JSONB DEFAULT '[]',
        valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        valid_to TIMESTAMP WITH TIME ZONE,
        loyalty_only BOOLEAN DEFAULT FALSE
      );

      CREATE TABLE IF NOT EXISTS loyalty_accounts (
        customer_id VARCHAR(50) PRIMARY KEY,
        points_balance INT DEFAULT 0,
        lifetime_points INT DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `,
  },
];
