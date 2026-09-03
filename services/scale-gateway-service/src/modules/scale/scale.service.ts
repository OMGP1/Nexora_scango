import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { Kafka, Producer } from 'kafkajs';

export interface ScaleReading {
  store_id: string;
  lane_code: string;
  gross_weight_g: number;
  reading_ts: string;
  stable: boolean;
}

@Injectable()
export class ScaleService implements OnModuleInit, OnModuleDestroy {
  private redisClient: Redis;
  private kafkaProducer: Producer;

  constructor() {
    this.redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const kafka = new Kafka({
      clientId: 'scale-gateway-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
    });
    this.kafkaProducer = kafka.producer();
  }

  async onModuleInit() {
    await this.kafkaProducer.connect();
  }

  async onModuleDestroy() {
    await this.redisClient.quit();
    await this.kafkaProducer.disconnect();
  }

  async storeReading(storeId: string, laneCode: string, reading: ScaleReading): Promise<void> {
    const key = `scale:latest:${storeId}:${laneCode}`;
    await this.redisClient.setex(key, 60, JSON.stringify(reading));

    if (reading.stable) {
      await this.kafkaProducer.send({
        topic: 'scale.reading.v1',
        messages: [
          {
            key: `${storeId}:${laneCode}`,
            value: JSON.stringify(reading),
          },
        ],
      });
    }
  }

  async getLatestReading(storeId: string, laneCode: string): Promise<ScaleReading | null> {
    const key = `scale:latest:${storeId}:${laneCode}`;
    const data = await this.redisClient.get(key);
    if (!data) return null;

    try {
      return JSON.parse(data) as ScaleReading;
    } catch (e) {
      return null;
    }
  }
}
