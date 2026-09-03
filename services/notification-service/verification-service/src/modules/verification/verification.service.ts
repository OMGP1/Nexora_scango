import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { HttpService } from '@nestjs/axios';
import { createKafkaClient } from '@scango/kafka';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VerificationService {
  private kafkaProducer: any;

  constructor(
    @Inject('DB_POOL') private pool: Pool,
    private httpService: HttpService
  ) {
    const kafka = createKafkaClient({
      clientId: 'verification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  async getTier(sessionId: string) {
    const res = await this.pool.query(
      `SELECT * FROM verification_logs WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );
    if (res.rows.length === 0) {
      return { tier: 'UNKNOWN' };
    }
    return res.rows[0];
  }

  async computeTier(sessionId: string, customerId: string) {
    // 1. Fetch cart data
    let cartData: any;
    try {
      const cartUrl = process.env.CART_SERVICE_URL || 'http://localhost:3003/api/v1/sessions';
      const res = await firstValueFrom(this.httpService.get(`${cartUrl}/${sessionId}/bill`));
      cartData = res.data.data;
    } catch (e) {
      throw new NotFoundException('Failed to fetch cart data');
    }

    // 2. Rule-based Risk Engine
    let score = 100; // 100 is safest (GREEN)
    let tier = 'GREEN';
    const reasons = [];

    const items = cartData.items || [];
    if (items.length > 15) {
      score -= 20;
      reasons.push('High item count');
    }

    if (cartData.bill_summary.grand_total > 5000) {
      score -= 30;
      reasons.push('High value transaction');
    }

    // specific categories like alcohol would reduce score
    const hasAlcohol = items.some((item: any) => item.sku.startsWith('ALC'));
    if (hasAlcohol) {
      score -= 50;
      reasons.push('Contains restricted category');
    }

    if (score >= 80) tier = 'GREEN';
    else if (score >= 40) tier = 'AMBER';
    else tier = 'RED';

    // 3. Save to DB
    const dbRes = await this.pool.query(
      `INSERT INTO verification_logs (session_id, customer_id, score, tier, status, reasons)
       VALUES ($1, $2, $3, $4, 'PENDING', $5) RETURNING *`,
      [sessionId, customerId, score, tier, JSON.stringify(reasons)]
    );

    const logId = dbRes.rows[0].log_id;

    // Simulate async gate/AI check delay (e.g. 5 seconds)
    setTimeout(async () => {
      const finalStatus = tier === 'RED' ? 'HELD' : 'CLEARED';
      await this.pool.query(
        `UPDATE verification_logs SET status = $1 WHERE log_id = $2`,
        [finalStatus, logId]
      );

      // 4. Publish Event
      await this.kafkaProducer.send({
        topic: 'verification.tier_assigned',
        messages: [{ value: JSON.stringify({
          session_id: sessionId,
          customer_id: customerId,
          tier,
          score,
          status: finalStatus
        }) }]
      });
    }, 5000);

    return dbRes.rows[0];
  }
}
