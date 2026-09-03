import { Injectable, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Pool } from 'pg';
import { createKafkaClient } from '@scango/kafka';

@Injectable()
export class SessionExpiryJob {
  private kafkaProducer: any;

  constructor(@Inject('DB_POOL') private pool: Pool) {
    const kafka = createKafkaClient({
      clientId: 'session-expiry-job',
      brokers: [process.env.KAFKA_BROKERS || process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    try {
      const result = await this.pool.query(
        `UPDATE sessions 
         SET status = 'expired' 
         WHERE (status = 'active' OR status = 'paused') 
           AND expires_at < NOW() 
         RETURNING session_id`
      );

      for (const row of result.rows) {
        // Publish expiry event
        await this.kafkaProducer.send({
          topic: 'session.expired',
          messages: [{ value: JSON.stringify({ session_id: row.session_id }) }],
        });
        console.log(`Session ${row.session_id} expired.`);
      }
    } catch (err) {
      console.error('Error in session expiry job', err);
    }
  }
}
