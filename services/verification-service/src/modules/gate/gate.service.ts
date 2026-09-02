import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';
import { VerificationService } from '../verification/verification.service';

@Injectable()
export class GateService {
  private redis: Redis;
  private kafkaProducer: any;
  private readonly logger = new Logger(GateService.name);

  constructor(private verificationService: VerificationService) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    const kafka = new Kafka({
      clientId: 'verification-service-gate',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  async scanExitPass(token: string) {
    // 1. Retrieve exit pass from Redis
    const passData = await this.redis.get(`exit_pass:${token}`);
    if (!passData) {
      throw new BadRequestException('Invalid or expired Exit Pass');
    }

    const payload = JSON.parse(passData);
    const sessionId = payload.session_id;

    // 2. Check Verification Tier
    const verification = await this.verificationService.getTier(sessionId);
    
    // In a real system, RED means staff must resolve it before gate opens. 
    // We'll simulate that GREEN or AMBER (random audit check passed) can exit.
    if (verification.tier === 'RED') {
      this.logger.warn(`Gate blocked for session ${sessionId} - Tier: RED`);
      await this.kafkaProducer.send({
        topic: 'gate.blocked',
        messages: [{ value: JSON.stringify({ session_id: sessionId, reason: 'VERIFICATION_RED' }) }]
      });
      return { success: false, action: 'BLOCK', message: 'Please wait for staff assistance' };
    }

    // 3. Open Gate
    this.logger.log(`Gate opened for session ${sessionId}`);
    await this.kafkaProducer.send({
      topic: 'gate.open',
      messages: [{ value: JSON.stringify({ session_id: sessionId, store_id: payload.store_id }) }]
    });

    // Destroy token so it can't be reused
    await this.redis.del(`exit_pass:${token}`);

    return { success: true, action: 'OPEN', message: 'Thank you for shopping at ScanGo!' };
  }
}
