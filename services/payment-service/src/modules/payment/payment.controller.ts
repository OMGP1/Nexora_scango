import { Controller, Post, Get, Param, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/v1')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('sessions/:id/payment/intent')
  async createIntent(
    @Param('id') sessionId: string,
    @Body('method') method?: string,
    @Body('customer_id') customerId?: string
  ) {
    const data = await this.paymentService.createIntent(sessionId, method || 'card', customerId || 'guest');
    return { success: true, data };
  }

  @Post('payment/webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string
  ) {
    if (process.env.NODE_ENV === 'production' && (!signature || signature === 'mock-signature')) {
      throw new Error('Invalid signature in production');
    }
    return this.paymentService.handleWebhook(payload, signature || 'mock-signature');
  }

  @Get('sessions/:id/receipt')
  async getReceipt(@Param('id') sessionId: string) {
    const data = await this.paymentService.getReceipt(sessionId);
    return { success: true, data };
  }

  @Post('payment/:id/refund')
  async refundPayment(@Param('id') paymentId: string) {
    const data = await this.paymentService.refundPayment(paymentId);
    return data;
  }

  // ── Customer receipts ──────────────────────────────

  @Get('customers/:customerId/receipts')
  async getCustomerReceipts(@Param('customerId') customerId: string) {
    const data = await this.paymentService.getCustomerReceipts(customerId);
    return { success: true, data };
  }

  @Get('customers/:customerId/receipts/:receiptId')
  async getCustomerReceiptById(
    @Param('customerId') customerId: string,
    @Param('receiptId') receiptId: string
  ) {
    const data = await this.paymentService.getCustomerReceiptById(customerId, receiptId);
    return { success: true, data };
  }

  // ── Counter payment ────────────────────────────────

  @Post('payment/counter/verify')
  async verifyCounterPayment(
    @Body('otp') otp: string,
    @Body('session_id') sessionId: string
  ) {
    const data = await this.paymentService.verifyCounterPayment(sessionId, otp);
    return { success: true, data };
  }
  @Post('payment/exit-pass/validate')
  async validateExitPass(@Body('token') token: string) {
    const data = await this.paymentService.validateExitPass(token);
    return { success: true, data };
  }
}
