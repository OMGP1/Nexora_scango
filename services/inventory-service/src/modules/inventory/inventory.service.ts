import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(@Inject('DB_POOL') private pool: Pool) {}

  async getInventory(storeId: string, sku: string) {
    const res = await this.pool.query(
      `SELECT available_qty, reserved_qty FROM inventory_snapshot WHERE store_id = $1 AND sku = $2`,
      [storeId, sku]
    );
    if (res.rows.length === 0) {
      return { store_id: storeId, sku, available_qty: 0, reserved_qty: 0 };
    }
    return { store_id: storeId, sku, ...res.rows[0] };
  }

  async isEventProcessed(eventId: string): Promise<boolean> {
    const res = await this.pool.query(
      `INSERT INTO processed_events (event_id) VALUES ($1) ON CONFLICT (event_id) DO NOTHING RETURNING event_id`,
      [eventId]
    );
    return res.rows.length === 0;
  }

  async reserveItem(eventId: string, storeId: string, sku: string, quantity: number, sessionId: string) {
    if (await this.isEventProcessed(eventId)) {
      this.logger.debug(`Event ${eventId} already processed. Skipping.`);
      return;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      
      const res = await client.query(
        `UPDATE inventory_snapshot 
         SET available_qty = available_qty - $1, reserved_qty = reserved_qty + $1, last_updated = CURRENT_TIMESTAMP
         WHERE store_id = $2 AND sku = $3 RETURNING available_qty`,
        [quantity, storeId, sku]
      );

      if (res.rows.length > 0 && res.rows[0].available_qty < 0) {
        this.logger.warn(`Insufficient inventory for store ${storeId} sku ${sku}`);
        // In v1, we still allow negative ATP.
      }

      await client.query(
        `INSERT INTO inventory_ledger (store_id, sku, movement_type, quantity_delta, session_id)
         VALUES ($1, $2, 'RESERVED', $3, $4)`,
        [storeId, sku, quantity, sessionId]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async releaseItem(eventId: string, storeId: string, sku: string, quantity: number, sessionId: string) {
    if (await this.isEventProcessed(eventId)) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE inventory_snapshot 
         SET available_qty = available_qty + $1, reserved_qty = reserved_qty - $1, last_updated = CURRENT_TIMESTAMP
         WHERE store_id = $2 AND sku = $3`,
        [quantity, storeId, sku]
      );

      await client.query(
        `INSERT INTO inventory_ledger (store_id, sku, movement_type, quantity_delta, session_id)
         VALUES ($1, $2, 'RELEASED', $3, $4)`,
        [storeId, sku, -quantity, sessionId]
      );

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async releaseSession(eventId: string, sessionId: string) {
    if (await this.isEventProcessed(eventId)) return;

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // Find all RESERVED entries for this session that aren't counteracted by RELEASED or SOLD
      const res = await client.query(
        `SELECT store_id, sku, SUM(quantity_delta) as net_reserved
         FROM inventory_ledger
         WHERE session_id = $1 AND movement_type IN ('RESERVED', 'RELEASED', 'SOLD')
         GROUP BY store_id, sku
         HAVING SUM(CASE WHEN movement_type = 'RESERVED' THEN quantity_delta 
                         WHEN movement_type = 'RELEASED' THEN quantity_delta
                         WHEN movement_type = 'SOLD' THEN -quantity_delta ELSE 0 END) > 0`,
        [sessionId]
      );

      for (const row of res.rows) {
        const qty = row.net_reserved;
        await client.query(
          `UPDATE inventory_snapshot 
           SET available_qty = available_qty + $1, reserved_qty = reserved_qty - $1, last_updated = CURRENT_TIMESTAMP
           WHERE store_id = $2 AND sku = $3`,
          [qty, row.store_id, row.sku]
        );

        await client.query(
          `INSERT INTO inventory_ledger (store_id, sku, movement_type, quantity_delta, session_id)
           VALUES ($1, $2, 'RELEASED', $3, $4)`,
          [row.store_id, row.sku, -qty, sessionId]
        );
      }

      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async confirmSale(eventId: string, sessionId: string, storeId: string, erpAdapter: any) {
     if (await this.isEventProcessed(eventId)) return;

     const client = await this.pool.connect();
     try {
       await client.query('BEGIN');
 
       // Find all RESERVED entries for this session
       const res = await client.query(
         `SELECT sku, SUM(quantity_delta) as net_reserved
          FROM inventory_ledger
          WHERE session_id = $1 AND movement_type IN ('RESERVED', 'RELEASED')
          GROUP BY sku
          HAVING SUM(quantity_delta) > 0`,
         [sessionId]
       );
 
       for (const row of res.rows) {
         const qty = row.net_reserved;
         
         // Only decrement reserved_qty, available_qty was already decremented at reservation
         await client.query(
           `UPDATE inventory_snapshot 
            SET reserved_qty = reserved_qty - $1, last_updated = CURRENT_TIMESTAMP
            WHERE store_id = $2 AND sku = $3`,
           [qty, storeId, row.sku]
         );
 
         await client.query(
           `INSERT INTO inventory_ledger (store_id, sku, movement_type, quantity_delta, session_id)
            VALUES ($1, $2, 'SOLD', $3, $4)`,
           [storeId, row.sku, qty, sessionId]
         );

         erpAdapter.recordSale(storeId, row.sku, qty);
       }
 
       await client.query('COMMIT');
     } catch (e) {
       await client.query('ROLLBACK');
       throw e;
     } finally {
       client.release();
     }
  }
}
