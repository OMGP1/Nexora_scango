import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class SmsAdapter {
  private readonly logger = new Logger(SmsAdapter.name);

  send(customerId: string, message: string) {
    if (!customerId) return;
    this.logger.log(`[MOCK SMS to ${customerId}]: ${message}`);
  }
}
