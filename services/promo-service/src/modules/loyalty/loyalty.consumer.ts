import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createKafkaClient } from '@scango/kafka';
import { LoyaltyService } from './loyalty.service';

@Injectable()
export class LoyaltyConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(LoyaltyConsumer.name);
  private consumer: any;

  constructor(private readonly loyaltyService: LoyaltyService) {
    const kafka = createKafkaClient({
      clientId: 'promo-service',
      brokers: [process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = kafka.consumer({ groupId: 'promo-loyalty-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'payment.confirmed', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        const payload = JSON.parse(message.value.toString());
        try {
          if (topic === 'payment.confirmed') {
            const customerId = payload.customer_id || 'guest';
            const amountSpent = payload.amount || 0;
            await this.loyaltyService.accruePoints(customerId, amountSpent);
          }
        } catch (e) {
          this.logger.error(`Error processing event on topic ${topic}`, e);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
