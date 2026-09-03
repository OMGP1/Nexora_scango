import { createPool } from '@scango/db';
import * as fs from 'fs';
import * as path from 'path';

async function seed() {
  const pool = createPool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    user: process.env.POSTGRES_USER || 'scango',
    password: process.env.POSTGRES_PASSWORD || 'scango_dev_pass',
    database: 'scango_inventory',
  });

  const productsPath = path.join(__dirname, '../../catalog-service/src/fixtures/products.json');
  const products = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

  const storeId = 'STORE001';

  for (const product of products) {
    await pool.query(
      `INSERT INTO inventory_snapshot (store_id, sku, available_qty, reserved_qty)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (store_id, sku) DO NOTHING`,
      [storeId, product.sku, 100, 0] // 100 units seed
    );
  }

  console.log(`Seeded ${products.length} products with 100 units each for store ${storeId}.`);
  await pool.end();
}

seed().catch(console.error);
