import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditEvent } from './audit-event.entity';
import { Kafka } from 'kafkajs';
import * as crypto from 'crypto';

@Injectable()
export class AuditService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: any;
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditEvent)
    private auditRepo: Repository<AuditEvent>
  ) {
    this.kafka = new Kafka({
      clientId: 'audit-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'audit-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    const topics = [
      'session.started', 
      'session.expired',
      'cart.item_added',
      'cart.item_removed',
      'verification.tier_assigned',
      'verification.held',
      'verification.cleared',
      'payment.confirmed',
      'payment.failed',
      'gate.passed'
    ];

    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        try {
          const payload = JSON.parse(message.value.toString());
          await this.logEvent(topic, payload);
        } catch (error) {
          this.logger.error(`Error processing audit message from ${topic}`, error);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async logEvent(eventType: string, payload: any) {
    const lastEvent = await this.auditRepo.findOne({
      where: {},
      order: { occurred_at: 'DESC' }
    });

    const previousHash = lastEvent ? lastEvent.hash : '0000000000000000000000000000000000000000000000000000000000000000';
    
    const hashData = `${previousHash}${eventType}${JSON.stringify(payload)}`;
    const currentHash = crypto.createHash('sha256').update(hashData).digest('hex');

    const auditEvent = this.auditRepo.create({
      session_id: payload.session_id,
      event_type: eventType,
      payload,
      previous_hash: previousHash,
      hash: currentHash
    });

    await this.auditRepo.save(auditEvent);
    this.logger.log(`Audit log written: ${eventType} for session ${payload.session_id}`);
  }

  async getSessionTrail(sessionId: string) {
    return this.auditRepo.find({
      where: { session_id: sessionId },
      order: { occurred_at: 'ASC' }
    });
  }
}
