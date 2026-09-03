import { Injectable, Inject, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class ErpService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ErpService.name);
  private producer: Producer;

  constructor(
    @Inject('DB_POOL') private readonly dbPool: Pool,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka,
  ) {
    this.producer = this.kafkaClient.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
    this.logger.log('Kafka producer connected');
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
    await this.dbPool.end();
    this.redisClient.disconnect();
  }

  async queueSync(sessionId: string, storeId: string, billSummary: any) {
    this.logger.log(`Queueing ERP sync for session ${sessionId} and store ${storeId}`);
    
    // Generate Tally XML Payload
    const tallyXml = `
      <ENVELOPE>
        <HEADER>
          <TALLYREQUEST>Import Data</TALLYREQUEST>
        </HEADER>
        <BODY>
          <IMPORTDATA>
            <REQUESTDATA>
              <TALLYMESSAGE>
                <VOUCHER VCHTYPE="Sales" ACTION="Create">
                  <VOUCHERNUMBER>${sessionId}</VOUCHERNUMBER>
                  <AMOUNT>${billSummary.total || 0}</AMOUNT>
                </VOUCHER>
              </TALLYMESSAGE>
            </REQUESTDATA>
          </IMPORTDATA>
        </BODY>
      </ENVELOPE>
    `.trim();

    // Generate Marg SQL Payload
    const margSql = `INSERT INTO Sales (SessionId, StoreId, TotalAmount) VALUES ('${sessionId}', '${storeId}', ${billSummary.total || 0});`;

    const client = await this.dbPool.connect();
    let syncId: string;

    try {
      await client.query('BEGIN');
      const result = await client.query(
        'INSERT INTO erp_sync_log (session_id, store_id, status, tally_payload, marg_payload) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [sessionId, storeId, 'QUEUED', tallyXml, margSql]
      );
      syncId = result.rows[0].id;
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      this.logger.error(`Failed to insert erp_sync_log: ${error.message}`);
      throw error;
    } finally {
      client.release();
    }

    // Publish to Kafka
    const payload = {
      syncId,
      sessionId,
      storeId,
      erp_type: 'ALL',
      tallyXml,
      margSql,
      timestamp: new Date().toISOString(),
    };

    await this.producer.send({
      topic: 'erp.sync.v1',
      messages: [{ value: JSON.stringify(payload) }],
    });

    this.logger.log(`Published erp.sync.v1 event for syncId ${syncId}`);
    return { syncId, status: 'QUEUED' };
  }

  async updateStatus(syncId: string, status: string, error?: string) {
    this.logger.log(`Updating syncId ${syncId} to status ${status}`);
    const query = 'UPDATE erp_sync_log SET status = $1, error_message = $2, updated_at = NOW() WHERE id = $3';
    await this.dbPool.query(query, [status, error || null, syncId]);
  }

  async getStatus(sessionId: string) {
    const result = await this.dbPool.query(
      'SELECT id, session_id, store_id, status, error_message, created_at, updated_at FROM erp_sync_log WHERE session_id = $1 ORDER BY created_at DESC',
      [sessionId]
    );
    return result.rows;
  }
}
