import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { HttpService } from '@nestjs/axios';
import { Kafka } from 'kafkajs';
import { createKafkaClient } from '@scango/kafka';
import { firstValueFrom } from 'rxjs';
import { StripeAdapter } from './adapters/stripe.adapter';
import { ExitPassService } from './exit-pass.service';

@Injectable()
export class PaymentService {
  private kafkaProducer: any;

  constructor(
    @Inject('DB_POOL') private pool: Pool,
    private httpService: HttpService,
    private gatewayAdapter: StripeAdapter,
    private exitPassService: ExitPassService
  ) {
    const kafka = createKafkaClient({
      clientId: 'payment-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  private async getSessionBill(sessionId: string) {
    try {
      const cartUrl = process.env.CART_SERVICE_URL || 'http://localhost:3003/api/v1/sessions';
      const res = await firstValueFrom(this.httpService.get(`${cartUrl}/${sessionId}/bill`));
      return res.data.data;
    } catch (e) {
      throw new NotFoundException('Failed to fetch bill from Cart Service');
    }
  }

  async createIntent(sessionId: string) {
    // 1. Fetch current bill
    const bill = await this.getSessionBill(sessionId);
    const amount = bill.bill_summary.grand_total;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // 2. Check for existing intent (Idempotency)
    const existingRes = await this.pool.query(
      `SELECT * FROM payments WHERE session_id = $1 AND status IN ('intent_created', 'processing')`,
      [sessionId]
    );

    if (existingRes.rows.length > 0) {
      return existingRes.rows[0];
    }

    // 3. Create Gateway Intent
    const intent = await this.gatewayAdapter.createPaymentIntent(amount, 'INR', { sessionId });

    // 4. Save to DB
    const dbRes = await this.pool.query(
      `INSERT INTO payments (session_id, amount, gateway_ref, status)
       VALUES ($1, $2, $3, 'intent_created') RETURNING *`,
      [sessionId, amount, intent.id]
    );

    const payment = dbRes.rows[0];
    return {
      payment_id: payment.payment_id,
      client_secret: intent.client_secret,
      amount: payment.amount,
      currency: 'INR'
    };
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.gatewayAdapter.validateWebhookSignature(payload, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    const gatewayRef = payload.data?.object?.id || payload.gateway_ref; // Adapt based on actual gateway struct
    if (!gatewayRef) throw new BadRequestException('Missing gateway ref');

    const paymentRes = await this.pool.query(
      `SELECT * FROM payments WHERE gateway_ref = $1 AND status != 'confirmed'`,
      [gatewayRef]
    );

    if (paymentRes.rows.length === 0) {
      // Already processed or not found
      return { received: true };
    }

    const payment = paymentRes.rows[0];

    if (payload.type === 'payment_intent.succeeded' || payload.status === 'succeeded') {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN');
        
        await client.query(
          `UPDATE payments SET status = 'confirmed', paid_at = CURRENT_TIMESTAMP WHERE payment_id = $1`,
          [payment.payment_id]
        );

        // Generate sequential receipt ID (placeholder for when we implement the DB logic for receipts)
        // const seqRes = await client.query(`SELECT nextval('receipt_seq')`);
        
        // We will store receiptNo alongside payment for now
        // wait, the schema doesn't have receiptNo. We can just add it dynamically on GET /receipt.

        await client.query('COMMIT');

        // Generate Exit Pass
        const exitPassToken = await this.exitPassService.generateExitPass(payment.session_id, payment.payment_id, 'STORE001');

        // Publish event
        await this.kafkaProducer.send({
          topic: 'payment.confirmed',
          messages: [{ value: JSON.stringify({
            payment_id: payment.payment_id,
            session_id: payment.session_id,
            amount: payment.amount,
            customer_id: payload.customer_id || 'guest',
            exit_pass: exitPassToken
          }) }]
        });

      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
    } else if (payload.type === 'payment_intent.payment_failed' || payload.status === 'failed') {
      await this.pool.query(
        `UPDATE payments SET status = 'failed' WHERE payment_id = $1`,
        [payment.payment_id]
      );
      await this.kafkaProducer.send({
        topic: 'payment.failed',
        messages: [{ value: JSON.stringify({ session_id: payment.session_id, payment_id: payment.payment_id }) }]
      });
    }

    return { received: true };
  }

  async getReceipt(sessionId: string) {
    const paymentRes = await this.pool.query(
      `SELECT * FROM payments WHERE session_id = $1 AND status = 'confirmed' ORDER BY paid_at DESC LIMIT 1`,
      [sessionId]
    );

    if (paymentRes.rows.length === 0) {
      throw new NotFoundException('No confirmed payment found for session');
    }

    const payment = paymentRes.rows[0];
    const bill = await this.getSessionBill(sessionId);

    // Mock receipt seq for now
    const receiptNo = `SCANGO-STORE001-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${payment.payment_id.split('-')[0].toUpperCase()}`;

    // Normally we'd fetch the exit pass from Redis if it's still alive.
    // If not alive, the customer can't exit.
    
    return {
      receipt_no: receiptNo,
      store_info: {
        store_id: 'STORE001',
        name: 'ScanGo Supermarket',
        address: '123 Main St, Bangalore, India'
      },
      timestamp: payment.paid_at,
      payment_details: {
        payment_id: payment.payment_id,
        method: payment.method,
        gateway_ref: payment.gateway_ref
      },
      bill_summary: bill.bill_summary,
      items: bill.items,
      exit_pass_hint: 'Check Redis for exit_pass token mapping to this session'
    };
  }

  async refundPayment(paymentId: string) {
    // RBAC check would be handled by middleware
    const res = await this.pool.query(`SELECT * FROM payments WHERE payment_id = $1 AND status = 'confirmed'`, [paymentId]);
    if (res.rows.length === 0) {
      throw new BadRequestException('Payment not found or not confirmed');
    }

    const payment = res.rows[0];
    await this.gatewayAdapter.refundPayment(payment.gateway_ref, payment.amount);

    await this.pool.query(
      `UPDATE payments SET status = 'refunded' WHERE payment_id = $1`,
      [paymentId]
    );

    await this.pool.query(
      `INSERT INTO refunds (payment_id, amount, reason_code) VALUES ($1, $2, $3)`,
      [paymentId, payment.amount, 'customer_request']
    );

    await this.kafkaProducer.send({
      topic: 'payment.refunded',
      messages: [{ value: JSON.stringify({ session_id: payment.session_id, payment_id: paymentId, amount: payment.amount }) }]
    });

    return { success: true, message: 'Refunded' };
  }
}
