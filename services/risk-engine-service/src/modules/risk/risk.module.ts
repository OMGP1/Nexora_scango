import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { Kafka } from 'kafkajs';
import { RiskController } from './risk.controller';
import { RiskService } from './risk.service';

@Global()
@Module({
  controllers: [RiskController],
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: () => {
        return new Pool({
          connectionString: process.env.DATABASE_URL || 'postgres://scango:scango_dev_pass@localhost:5434/scango_risk',
        });
      },
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
      },
    },
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async () => {
        const kafka = new Kafka({
          clientId: 'risk-engine-service',
          brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
        });
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
    },
    RiskService,
  ],
  exports: ['DB_POOL', 'REDIS_CLIENT', 'KAFKA_PRODUCER', RiskService],
})
export class RiskModule {}

