import { Controller, Post, Get, Param, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';

@Controller('api/v1')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('sessions/:id/payment/intent')
  async createIntent(@Param('id') sessionId: string) {
    const data = await this.paymentService.createIntent(sessionId);
    return { success: true, data };
  }

  @Post('payment/webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('stripe-signature') signature: string
  ) {
    // In test mode, signature might be omitted or passed in custom header
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
}
