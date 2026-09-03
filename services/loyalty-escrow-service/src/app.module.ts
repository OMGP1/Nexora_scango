import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HealthController } from './health.controller';
import { EscrowModule } from './modules/escrow/escrow.module';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    EscrowModule,
  ],
  controllers: [HealthController],
  providers: [
    {
      provide: 'DB_POOL',
      useFactory: (configService: ConfigService) => {
        return new Pool({
          connectionString: configService.get<string>('DATABASE_URL') || 'postgres://scango:scango_dev_pass@localhost:5434/scango_escrow',
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
        return new Kafka({
          clientId: 'loyalty-escrow-service',
          brokers: (configService.get<string>('KAFKA_BROKERS') || 'localhost:9092').split(','),
        });
      },
      inject: [ConfigService],
    },
    {
      provide: 'KAFKA_PRODUCER',
      useFactory: async (kafka: Kafka) => {
        const producer = kafka.producer();
        await producer.connect();
        return producer;
      },
      inject: ['KAFKA_CLIENT'],
    }
  ],
  exports: ['DB_POOL', 'REDIS_CLIENT', 'KAFKA_CLIENT', 'KAFKA_PRODUCER'],
})
export class AppModule {}

