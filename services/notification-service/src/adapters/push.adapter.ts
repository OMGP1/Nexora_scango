import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class PushAdapter {
  private readonly logger = new Logger(PushAdapter.name);

  send(customerId: string, message: string) {
    if (!customerId) return;
    this.logger.log(`[MOCK PUSH to ${customerId}]: ${message}`);
  }
}
