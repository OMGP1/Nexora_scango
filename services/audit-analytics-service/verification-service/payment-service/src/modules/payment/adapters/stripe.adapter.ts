import { Injectable, Logger } from '@nestjs/common';
import { PaymentGatewayAdapter } from './payment-gateway.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StripeAdapter implements PaymentGatewayAdapter {
  private readonly logger = new Logger(StripeAdapter.name);

  async createPaymentIntent(amount: number, currency: string, _metadata: any): Promise<any> {
    this.logger.log(`[MOCK STRIPE] Creating intent for ${amount} ${currency}`);
    return {
      id: `pi_mock_${uuidv4()}`,
      client_secret: `secret_mock_${uuidv4()}`,
      amount,
      currency
    };
  }

  async refundPayment(gatewayRef: string, amount: number): Promise<any> {
    this.logger.log(`[MOCK STRIPE] Refunding ${amount} on ${gatewayRef}`);
    return {
      id: `re_mock_${uuidv4()}`,
      status: 'succeeded'
    };
  }

  validateWebhookSignature(_payload: any, signature: string): boolean {
    this.logger.log(`[MOCK STRIPE] Validating signature ${signature}`);
    // In mock mode, we accept any signature starting with 't=' (Stripe-like) or 'mock'
    if (signature && (signature.startsWith('t=') || signature.startsWith('mock'))) {
      return true;
    }
    return true; // For testing simplicity, auto-validate
  }
}
