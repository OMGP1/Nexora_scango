export interface PaymentGatewayAdapter {
  createPaymentIntent(amount: number, currency: string, metadata: any): Promise<any>;
  refundPayment(gatewayRef: string, amount: number): Promise<any>;
  validateWebhookSignature(payload: any, signature: string): boolean;
}
