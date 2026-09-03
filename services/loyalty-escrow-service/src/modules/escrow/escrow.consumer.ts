import { Injectable, OnModuleInit, OnModuleDestroy, Inject, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { EscrowService } from './escrow.service';

@Injectable()
export class EscrowConsumer implements OnModuleInit, OnModuleDestroy {
  private consumer: Consumer;
  private readonly logger = new Logger(EscrowConsumer.name);

  constructor(
    @Inject('KAFKA_CLIENT') private readonly kafka: Kafka,
    private readonly escrowService: EscrowService,
  ) {
    this.consumer = this.kafka.consumer({ groupId: 'loyalty-escrow-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'item.scanned', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          if (!message.value) return;
          const payload = JSON.parse(message.value.toString());
          
          if (topic === 'item.scanned') {
            const sessionId = payload.sessionId;
            if (sessionId) {
              await this.escrowService.accruePoints(sessionId, 10);
            }
          }
        } catch (err) {
          this.logger.error('Error processing Kafka message', err);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
