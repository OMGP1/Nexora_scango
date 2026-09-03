import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '002_add_weight_columns',
    sql: `ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS expected_weight_g INT DEFAULT NULL;`,
  },
];
