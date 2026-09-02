import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '001_initial_schema',
    sql: `
      -- Stores Table
      CREATE TABLE IF NOT EXISTS stores (
        store_id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        region VARCHAR(100) NOT NULL,
        timezone VARCHAR(100) NOT NULL,
        config_flags JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Users (Staff) Table
      CREATE TABLE IF NOT EXISTS users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        store_id VARCHAR(50) REFERENCES stores(store_id) ON DELETE SET NULL,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Customers Table (Registered customers via OAuth/Loyalty)
      CREATE TABLE IF NOT EXISTS customers (
        customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        loyalty_id VARCHAR(100) UNIQUE,
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        name VARCHAR(255),
        auth_type VARCHAR(50) NOT NULL, -- 'guest', 'loyalty', 'oauth'
        trust_profile JSONB NOT NULL DEFAULT '{"score": 50, "total_sessions": 0, "verified_sessions": 0, "incidents": 0}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes
      CREATE INDEX idx_users_email ON users(email);
      CREATE INDEX idx_users_store_id ON users(store_id);
      CREATE INDEX idx_customers_loyalty_id ON customers(loyalty_id);
      CREATE INDEX idx_customers_phone ON customers(phone);
    `,
  },
];
