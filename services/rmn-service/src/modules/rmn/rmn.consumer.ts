import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';

@Injectable()
export class RmnConsumer implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: Consumer;

  constructor() {
    this.kafka = new Kafka({
      clientId: 'rmn-service-consumer',
      brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'rmn-analytics-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'rmn.impression.v1', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        const payload = JSON.parse(message.value.toString());
        console.log(`[RMN Analytics] Logged impression for Ad ${payload.adId} in Session ${payload.sessionId}`);
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
