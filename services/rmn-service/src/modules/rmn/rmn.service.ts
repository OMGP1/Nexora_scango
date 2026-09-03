import { Injectable, Inject, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { Kafka, Producer } from 'kafkajs';

@Injectable()
export class RmnService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;

  constructor(@Inject('DB_POOL') private readonly dbPool: Pool) {
    this.kafka = new Kafka({
      clientId: 'rmn-service',
      brokers: process.env.KAFKA_BROKERS ? process.env.KAFKA_BROKERS.split(',') : ['localhost:9092'],
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }

  async getAds(sku?: string, categoryId?: string) {
    // Attempt to fetch from DB first
    try {
      let query = 'SELECT id, title, description, sku, category_id, discount_percentage FROM campaigns WHERE active = true';
      const params: any[] = [];

      if (sku) {
        params.push(sku);
        query += ` AND sku = $${params.length}`;
      } else if (categoryId) {
        params.push(categoryId);
        query += ` AND category_id = $${params.length}`;
      }

      query += ' LIMIT 10';

      const result = await this.dbPool.query(query, params);
      
      if (result.rows && result.rows.length > 0) {
        return result.rows;
      }
    } catch (error) {
      console.warn('DB fetch failed or table does not exist, falling back to mock ads', error);
    }

    // Mock fallback
    return [
      {
        id: 'ad_1',
        title: 'Coke Special',
        description: 'Buy 2 get 1 free on Coke',
        sku: '1234567890',
        categoryId: 'beverages',
        discountPercentage: 33,
      },
      {
        id: 'ad_2',
        title: 'Lays Offer',
        description: '10% off Lays',
        sku: '0987654321',
        categoryId: 'snacks',
        discountPercentage: 10,
      }
    ].filter(ad => {
      if (sku) return ad.sku === sku;
      if (categoryId) return ad.categoryId === categoryId;
      return true;
    });
  }

  async logImpression(adId: string, sessionId: string) {
    const payload = {
      adId,
      sessionId,
      timestamp: new Date().toISOString(),
    };

    await this.producer.send({
      topic: 'rmn.impression.v1',
      messages: [{ value: JSON.stringify(payload) }],
    });

    return { success: true };
  }
}
