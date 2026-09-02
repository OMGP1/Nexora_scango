import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsKpi } from './analytics-kpi.entity';
import { Kafka } from 'kafkajs';

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private consumer: any;
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    @InjectRepository(AnalyticsKpi)
    private kpiRepo: Repository<AnalyticsKpi>
  ) {
    this.kafka = new Kafka({
      clientId: 'analytics-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.consumer = this.kafka.consumer({ groupId: 'analytics-group' });
  }

  async onModuleInit() {
    await this.consumer.connect();
    
    const topics = ['session.started', 'verification.held', 'payment.confirmed'];
    for (const topic of topics) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }: any) => {
        try {
          const payload = JSON.parse(message.value.toString());
          await this.processEvent(topic, payload);
        } catch (error) {
          this.logger.error(`Error processing analytics message from ${topic}`, error);
        }
      },
    });
  }

  async onModuleDestroy() {
    await this.consumer.disconnect();
  }

  private async processEvent(topic: string, payload: any) {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    const storeId = payload.store_id || 'store_1';

    let kpi = await this.kpiRepo.findOne({ where: { date: today, store_id: storeId } });
    if (!kpi) {
      kpi = this.kpiRepo.create({ date: today, store_id: storeId });
    }

    if (topic === 'session.started') {
      kpi.sessions_started += 1;
    } else if (topic === 'verification.held') {
      kpi.verification_holds += 1;
    } else if (topic === 'payment.confirmed') {
      kpi.sessions_completed += 1;
      kpi.revenue_total = Number(kpi.revenue_total) + Number(payload.amount_paid || 0);
    }

    await this.kpiRepo.save(kpi);
  }

  async getKpis() {
    return this.kpiRepo.find({ order: { date: 'DESC' }, take: 1 });
  }
}
