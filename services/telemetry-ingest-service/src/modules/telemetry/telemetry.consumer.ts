import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka, Consumer } from 'kafkajs';
import { TelemetryService } from './telemetry.service';

@Injectable()
export class TelemetryConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly kafka: Kafka;
  private readonly consumer: Consumer;
  private readonly logger = new Logger(TelemetryConsumer.name);

  constructor(private readonly telemetryService: TelemetryService) {
    this.kafka = new Kafka({
      clientId: 'telemetry-ingest-service',
      brokers: (process.env.KAFKA_BROKERS || 'kafka:9092').split(','),
    });
    this.consumer = this.kafka.consumer({ groupId: 'telemetry-ingest-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    await this.consumer.subscribe({ topic: 'telemetry.scan.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'telemetry.motion.v1', fromBeginning: false });
    await this.consumer.subscribe({ topic: 'item.removed', fromBeginning: false });

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;

          const payload = JSON.parse(value);

          switch (topic) {
            case 'telemetry.scan.v1':
              await this.telemetryService.processScanEvent(payload);
              break;
            case 'telemetry.motion.v1':
              await this.telemetryService.processMotionEvent(payload);
              break;
            case 'item.removed':
              await this.telemetryService.processDeletionEvent(payload);
              break;
            default:
              this.logger.warn(`Received message from unknown topic: ${topic}`);
          }
        } catch (error) {
          this.logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });
    
    this.logger.log('TelemetryConsumer started and subscribed to topics.');
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
