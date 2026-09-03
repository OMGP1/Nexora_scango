import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Pool } from 'pg';
import { HttpService } from '@nestjs/axios';
import { Kafka } from 'kafkajs';
import { createKafkaClient } from '@scango/kafka';
import { firstValueFrom } from 'rxjs';
import { StripeAdapter } from './adapters/stripe.adapter';
import { ExitPassService } from './exit-pass.service';
import * as crypto from 'crypto';

@Injectable()
export class PaymentService {
  private kafkaProducer: any;
  private readonly COUNTER_SECRET = process.env.COUNTER_PAYMENT_SECRET || 'scango-counter-secret-key-2024';

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

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private generateCounterToken(sessionId: string, amount: number, otp: string): string {
    const timestamp = Date.now();
    const payload = `${sessionId}:${amount}:${otp}:${timestamp}`;
    const hmac = crypto.createHmac('sha256', this.COUNTER_SECRET).update(payload).digest('hex');
    return Buffer.from(JSON.stringify({ sessionId, amount, otp, timestamp, hmac })).toString('base64');
  }

  async createIntent(sessionId: string, method: string = 'card', customerId: string = 'guest') {
    const bill = await this.getSessionBill(sessionId);
    const amount = bill.bill_summary.grand_total;

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    // Check for existing intent (Idempotency)
    const existingRes = await this.pool.query(
      `SELECT * FROM payments WHERE session_id = $1 AND status IN ('intent_created', 'processing')`,
      [sessionId]
    );

    if (existingRes.rows.length > 0) {
      const existing = existingRes.rows[0];
      // If requesting counter and one already exists, return it
      if (method === 'counter' && existing.method === 'counter') {
        return {
          payment_id: existing.payment_id,
          method: 'counter',
          otp: existing.counter_otp,
          counter_token: existing.counter_token,
          amount: existing.amount,
        };
      }
      // If same method, return existing
      if (existing.method === method) {
        return existing;
      }
      // Different method requested — void old one and create new
      await this.pool.query(
        `UPDATE payments SET status = 'voided' WHERE payment_id = $1`,
        [existing.payment_id]
      );
    }

    if (method === 'counter') {
      // Generate OTP + HMAC token for counter payment
      const otp = this.generateOtp();
      const counterToken = this.generateCounterToken(sessionId, amount, otp);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min TTL

      const dbRes = await this.pool.query(
        `INSERT INTO payments (session_id, amount, method, status, customer_id, counter_otp, counter_token, counter_expires_at)
         VALUES ($1, $2, 'counter', 'intent_created', $3, $4, $5, $6) RETURNING *`,
        [sessionId, amount, customerId, otp, counterToken, expiresAt]
      );

      const payment = dbRes.rows[0];
      return {
        payment_id: payment.payment_id,
        method: 'counter',
        otp,
        counter_token: counterToken,
        amount: payment.amount,
        expires_at: expiresAt.toISOString(),
      };
    }

    // UPI or Card — create gateway intent
    const intent = await this.gatewayAdapter.createPaymentIntent(amount, 'INR', { sessionId });

    const dbRes = await this.pool.query(
      `INSERT INTO payments (session_id, amount, method, gateway_ref, status, customer_id)
       VALUES ($1, $2, $3, $4, 'intent_created', $5) RETURNING *`,
      [sessionId, amount, method, intent.id, customerId]
    );

    const payment = dbRes.rows[0];
    return {
      payment_id: payment.payment_id,
      client_secret: intent.client_secret,
      gateway_ref: intent.id,
      amount: payment.amount,
      method,
      currency: 'INR',
    };
  }

  async handleWebhook(payload: any, signature: string) {
    if (!this.gatewayAdapter.validateWebhookSignature(payload, signature)) {
      throw new BadRequestException('Invalid signature');
    }

    const gatewayRef = payload.data?.object?.id || payload.gateway_ref;
    if (!gatewayRef) throw new BadRequestException('Missing gateway ref');

    const paymentRes = await this.pool.query(
      `SELECT * FROM payments WHERE gateway_ref = $1 AND status != 'confirmed'`,
      [gatewayRef]
    );

    if (paymentRes.rows.length === 0) {
      return { received: true };
    }

    const payment = paymentRes.rows[0];

    if (payload.type === 'payment_intent.succeeded' || payload.status === 'succeeded') {
      await this.confirmPaymentAndSaveReceipt(payment, payload.customer_id);
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

  async verifyCounterPayment(sessionId: string, otp: string) {
    const res = await this.pool.query(
      `SELECT * FROM payments WHERE session_id = $1 AND method = 'counter' AND status = 'intent_created'`,
      [sessionId]
    );

    if (res.rows.length === 0) {
      throw new NotFoundException('No pending counter payment found for this session');
    }

    const payment = res.rows[0];

    // Check expiry
    if (payment.counter_expires_at && new Date(payment.counter_expires_at) < new Date()) {
      await this.pool.query(
        `UPDATE payments SET status = 'failed' WHERE payment_id = $1`,
        [payment.payment_id]
      );
      throw new BadRequestException('Counter payment has expired');
    }

    // Verify OTP
    if (payment.counter_otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    // Confirm payment
    await this.confirmPaymentAndSaveReceipt(payment, payment.customer_id || 'guest');

    return { confirmed: true, payment_id: payment.payment_id };
  }

  private async confirmPaymentAndSaveReceipt(payment: any, customerId?: string) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      await client.query(
        `UPDATE payments SET status = 'confirmed', paid_at = CURRENT_TIMESTAMP WHERE payment_id = $1`,
        [payment.payment_id]
      );

      // Fetch bill for receipt
      const bill = await this.getSessionBill(payment.session_id);

      // Generate receipt number
      const seqRes = await client.query(`SELECT nextval('receipt_seq')`);
      const seqNum = seqRes.rows[0].nextval;
      const receiptNo = `SCANGO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(seqNum).padStart(6, '0')}`;

      // Generate Exit Pass
      const exitPassToken = await this.exitPassService.generateExitPass(
        payment.session_id,
        payment.payment_id,
        'STORE001'
      );

      // Save receipt
      await client.query(
        `INSERT INTO receipts (receipt_no, session_id, customer_id, store_id, items_json, bill_summary_json, payment_method, payment_id, exit_pass_token)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          receiptNo,
          payment.session_id,
          customerId || payment.customer_id || 'guest',
          'STORE001',
          JSON.stringify(bill.items),
          JSON.stringify(bill.bill_summary),
          payment.method || 'card',
          payment.payment_id,
          exitPassToken,
        ]
      );

      await client.query('COMMIT');

      // Publish event
      await this.kafkaProducer.send({
        topic: 'payment.confirmed',
        messages: [{ value: JSON.stringify({
          payment_id: payment.payment_id,
          session_id: payment.session_id,
          amount: payment.amount,
          customer_id: customerId || 'guest',
          exit_pass: exitPassToken
        }) }]
      });

      // Tell session-service to complete the session
      try {
        const sessionUrl = process.env.SESSION_SERVICE_URL || 'http://session-service:3002/api/v1/sessions';
        await firstValueFrom(this.httpService.post(`${sessionUrl}/${payment.session_id}/complete`));
      } catch (err) {
        // Just log the error, don't fail the payment confirmation
        console.error('Failed to mark session as completed', err);
      }

    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async getReceipt(sessionId: string) {
    // Try receipts table first
    const receiptRes = await this.pool.query(
      `SELECT * FROM receipts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [sessionId]
    );

    if (receiptRes.rows.length > 0) {
      const r = receiptRes.rows[0];
      return {
        receipt_no: r.receipt_no,
        store_info: {
          store_id: r.store_id,
          name: 'ScanGo Supermarket',
          address: '123 Main St, Bangalore, India'
        },
        timestamp: r.created_at,
        payment_details: {
          payment_id: r.payment_id,
          method: r.payment_method,
        },
        bill_summary: r.bill_summary_json,
        items: r.items_json,
        exit_pass_hint: r.exit_pass_token || 'No exit pass',
      };
    }

    // Fallback: generate from payment + cart (legacy)
    const paymentRes = await this.pool.query(
      `SELECT * FROM payments WHERE session_id = $1 AND status = 'confirmed' ORDER BY paid_at DESC LIMIT 1`,
      [sessionId]
    );

    if (paymentRes.rows.length === 0) {
      throw new NotFoundException('No confirmed payment found for session');
    }

    const payment = paymentRes.rows[0];
    const bill = await this.getSessionBill(sessionId);
    const receiptNo = `SCANGO-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${payment.payment_id.split('-')[0].toUpperCase()}`;

    return {
      receipt_no: receiptNo,
      store_info: { store_id: 'STORE001', name: 'ScanGo Supermarket', address: '123 Main St, Bangalore, India' },
      timestamp: payment.paid_at,
      payment_details: { payment_id: payment.payment_id, method: payment.method, gateway_ref: payment.gateway_ref },
      bill_summary: bill.bill_summary,
      items: bill.items,
      exit_pass_hint: 'Check Redis for exit_pass token',
    };
  }

  async getCustomerReceipts(customerId: string) {
    const res = await this.pool.query(
      `SELECT receipt_id, receipt_no, store_id, bill_summary_json, payment_method, created_at
       FROM receipts WHERE customer_id = $1 ORDER BY created_at DESC`,
      [customerId]
    );
    return res.rows.map(r => ({
      receipt_id: r.receipt_id,
      receipt_no: r.receipt_no,
      store_id: r.store_id,
      total: r.bill_summary_json?.grand_total || 0,
      item_count: r.bill_summary_json?.item_count || 0,
      payment_method: r.payment_method,
      date: r.created_at,
    }));
  }

  async getCustomerReceiptById(customerId: string, receiptId: string) {
    const res = await this.pool.query(
      `SELECT * FROM receipts WHERE customer_id = $1 AND receipt_id = $2`,
      [customerId, receiptId]
    );
    if (res.rows.length === 0) {
      throw new NotFoundException('Receipt not found');
    }
    const r = res.rows[0];
    return {
      receipt_no: r.receipt_no,
      store_info: { store_id: r.store_id, name: 'ScanGo Supermarket', address: '123 Main St, Bangalore, India' },
      timestamp: r.created_at,
      payment_details: { payment_id: r.payment_id, method: r.payment_method },
      bill_summary: r.bill_summary_json,
      items: r.items_json,
      exit_pass_hint: r.exit_pass_token || 'No exit pass',
    };
  }

  async refundPayment(paymentId: string) {
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
  async validateExitPass(token: string) {
    const payload = await this.exitPassService.validateExitPass(token);
    
    try {
      const receipt = await this.getReceipt(payload.session_id);
      if (receipt && receipt.items) {
        const items = typeof receipt.items === 'string' ? JSON.parse(receipt.items) : receipt.items;
        
        const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3010/api/v1/inventory';
        
        for (const item of items) {
          const sku = item.sku || item.id;
          if (!sku) continue;
          
          try {
            await firstValueFrom(this.httpService.post(`${inventoryUrl}/${payload.store_id || 'STORE001'}/adjust`, {
              sku: sku,
              quantity: -Math.abs(item.quantity || 1),
              reason: 'SALE',
              adjusted_by: 'exit_pass_validation'
            }));
          } catch (e) {
            console.error(`Failed to deduct inventory for sku ${sku}:`, e);
          }
        }
      }
    } catch (err) {
      console.error('Failed to process inventory deduction during exit pass validation', err);
    }
    
    return payload;
  }
}
