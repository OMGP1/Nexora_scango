import { Pool } from 'pg';

async function seed() {
  const pool = new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5433'),
    user: process.env.POSTGRES_USER || 'scango',
    password: process.env.POSTGRES_PASSWORD || 'scango_dev_pass',
    database: 'scango_promo',
  });

  const promos = [
    { code: 'SAVE10', type: 'PERCENTAGE', value: 10, min: 0, loyalty: false },
    { code: 'FLAT50', type: 'FLAT', value: 50, min: 500, loyalty: false },
    { code: 'LOYALTY_SPECIAL', type: 'FLAT', value: 100, min: 1000, loyalty: true },
    { code: 'EXPIRED_CODE', type: 'FLAT', value: 10, min: 0, loyalty: false, expired: true }
  ];

  for (const p of promos) {
    const validTo = p.expired ? "CURRENT_TIMESTAMP - INTERVAL '1 day'" : "CURRENT_TIMESTAMP + INTERVAL '30 days'";
    await pool.query(
      `INSERT INTO promotions (promo_code, type, discount_value, min_basket_value, usage_limit, loyalty_only, valid_to)
       VALUES ($1, $2, $3, $4, 1000, $5, ${validTo})
       ON CONFLICT (promo_code) DO NOTHING`,
      [p.code, p.type, p.value, p.min, p.loyalty]
    );
  }

  await pool.query(
    `INSERT INTO loyalty_accounts (customer_id, points_balance, lifetime_points)
     VALUES ('guest', 500, 500)
     ON CONFLICT (customer_id) DO NOTHING`
  );

  console.log('Seeded promotions and loyalty accounts.');
  await pool.end();
}

seed().catch(console.error);
