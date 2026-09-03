import { MigrationFile } from '@scango/db';

export const migrations: MigrationFile[] = [
  {
    name: '002_rename_points_to_coins',
    sql: `
      ALTER TABLE loyalty_accounts RENAME COLUMN points_balance TO coins_balance;
      ALTER TABLE loyalty_accounts RENAME COLUMN lifetime_points TO lifetime_coins;
    `
  }
];
