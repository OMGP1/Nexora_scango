import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { SmsAdapter } from '../../adapters/sms.adapter';
import { PushAdapter } from '../../adapters/push.adapter';

@Injectable()
export class NotificationService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: any;
  private producer: any;
  private redisPub: Redis;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private smsAdapter: SmsAdapter,
    private pushAdapter: PushAdapter
  ) {
    this.kafka = new Kafka({
      clientId: 'notification-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'notification-group' });
    this.producer = this.kafka.producer();
    this.redisPub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async onModuleInit() {
    await this.producer.connect();
    await this.consumer.connect();

    // Subscribe to all notification-relevant topics
    const topics = [
      'session.expired',
      'verification.tier_assigned',
      'gate.blocked',
      'payment.confirmed',
      'payment.failed',
      'inventory.insufficient'
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        try {
          const payload = JSON.parse(message.value.toString());
          await this.handleEvent(topic, payload);
        } catch (error) {
          this.logger.error(`Error processing message from topic ${topic}`, error);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
    await this.producer.disconnect();
    this.redisPub.quit();
  }

  private async handleEvent(topic: string, payload: any) {
    const sessionId = payload.session_id;
    if (!sessionId) return;

    let notification: any = null;

    switch (topic) {
      case 'session.expired':
        notification = { type: 'warning', message: 'Your session has expired.' };
        break;
      case 'verification.tier_assigned':
        if (payload.status === 'HELD') {
          notification = { type: 'warning', message: 'A quick check is needed. An associate is on their way.' };
          this.smsAdapter.send(payload.customer_id, notification.message);
        } else if (payload.status === 'CLEARED') {
          notification = { type: 'success', message: 'Verification cleared!' };
        }
        break;
      case 'gate.blocked':
        notification = { type: 'error', message: 'Exit Gate Blocked. Please seek assistance.' };
        break;
      case 'payment.confirmed':
        notification = { type: 'success', message: 'Payment confirmed successfully!' };
        this.pushAdapter.send(payload.customer_id, notification.message);
        break;
      case 'payment.failed':
        notification = { type: 'error', message: 'Payment failed. Please try again.' };
        break;
      case 'inventory.insufficient':
        notification = { type: 'warning', message: `Item ${payload.sku} is out of stock.` };
        break;
    }

    if (notification) {
      this.logger.log(`Publishing notification for session ${sessionId}: ${notification.message}`);
      // Publish to Redis channel so SSE stream can pick it up
      await this.redisPub.publish(`notifications:${sessionId}`, JSON.stringify(notification));
    }
  }

  async requestHelp(sessionId: string) {
    this.logger.log(`Help requested for session ${sessionId}`);
    await this.producer.send({
      topic: 'session.help_requested',
      messages: [{ value: JSON.stringify({ session_id: sessionId, timestamp: new Date().toISOString() }) }]
    });

    // Optionally notify the customer app that help is on the way
    await this.redisPub.publish(`notifications:${sessionId}`, JSON.stringify({
      type: 'info',
      message: 'Help request sent. An associate is on the way.'
    }));
  }
}
