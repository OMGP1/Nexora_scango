import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { InventoryService } from './inventory.service';
import { ErpAdapter } from './erp.adapter';

@Injectable()
export class InventoryConsumer implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(InventoryConsumer.name);
  private consumer: any;
  private readonly storeId = 'STORE001'; // Default for pilot

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly erpAdapter: ErpAdapter
  ) {
    const kafka = new Kafka({
      clientId: 'inventory-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = kafka.consumer({ groupId: 'inventory-sync-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    const topics = [
      'item.scanned',
      'item.removed',
      'item.updated',
      'session.expired',
      'session.abandoned',
      'payment.confirmed'
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }: any) => {
        const payload = JSON.parse(message.value.toString());
        // We need an eventId for idempotency. Using offset+partition as fallback if not in payload
        const eventId = payload.event_id || `${topic}-${partition}-${message.offset}`;

        try {
          switch (topic) {
            case 'item.scanned':
              await this.inventoryService.reserveItem(eventId, this.storeId, payload.sku, payload.quantity, payload.session_id);
              break;
            case 'item.removed':
              await this.inventoryService.releaseItem(eventId, this.storeId, payload.sku, payload.quantity, payload.session_id);
              break;
            case 'session.expired':
            case 'session.abandoned':
              await this.inventoryService.releaseSession(eventId, payload.session_id);
              break;
            case 'payment.confirmed':
              await this.inventoryService.confirmSale(eventId, payload.session_id, this.storeId, this.erpAdapter);
              break;
            default:
              this.logger.warn(`Unhandled topic: ${topic}`);
          }
        } catch (e) {
          this.logger.error(`Error processing event ${eventId} on topic ${topic}`, e);
          // In a production system, we might DLQ this or retry. Throwing lets Kafka retry based on config.
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }
}
