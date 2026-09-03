import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Inject } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { ErpService } from './erp.service';

@Injectable()
export class ErpConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ErpConsumer.name);
  private consumer: Consumer;

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: Kafka,
    private readonly erpService: ErpService,
  ) {
    this.consumer = this.kafkaClient.consumer({ groupId: 'erp-sync-service-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'payment.confirmed', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (value) {
            const payload = JSON.parse(value);
            this.logger.log(`Received payment.confirmed event for session ${payload.sessionId}`);
            await this.handlePaymentConfirmed(payload);
          }
        } catch (error) {
          this.logger.error(`Error processing message from ${topic}: ${error.message}`);
        }
      },
    });

    this.logger.log('Kafka consumer connected and listening to payment.confirmed');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async handlePaymentConfirmed(payload: any) {
    const { sessionId, storeId, billSummary } = payload;
    if (sessionId && storeId && billSummary) {
      await this.erpService.queueSync(sessionId, storeId, billSummary);
    } else {
      this.logger.warn('Received payment.confirmed event with missing required fields');
    }
  }
}
