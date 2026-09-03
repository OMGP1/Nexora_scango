import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigService } from '@nestjs/config';
import { Kafka } from 'kafkajs';
import Redis from 'ioredis';
import { ErpService } from './erp.service';
import { ErpController } from './erp.controller';
import { ErpConsumer } from './erp.consumer';

@Module({
  controllers: [ErpController],
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: (configService: ConfigService) => {
        return new Pool({
          connectionString: configService.get<string>('DATABASE_URL') || 'postgres://scango:scango_dev_pass@localhost:5434/scango_erp',
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'REDIS_CLIENT',
      useFactory: (configService: ConfigService) => {
        return new Redis(configService.get<string>('REDIS_URL') || 'redis://localhost:6379');
      },
      inject: [ConfigService],
    },
    {
      provide: 'KAFKA_CLIENT',
      useFactory: (configService: ConfigService) => {
        const kafka = new Kafka({
          clientId: 'erp-sync-service',
          brokers: (configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
        });
        return kafka;
      },
      inject: [ConfigService],
    },
    ErpService,
    ErpConsumer,
  ],
  exports: [ErpService],
})
export class ErpModule {}

