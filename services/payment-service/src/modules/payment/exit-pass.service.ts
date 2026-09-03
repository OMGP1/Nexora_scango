import { Injectable, BadRequestException } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ExitPassService {
  private redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
  }

  async generateExitPass(sessionId: string, paymentId: string, storeId: string): Promise<string> {
    const token = uuidv4();
    const payload = {
      session_id: sessionId,
      payment_id: paymentId,
      store_id: storeId,
      generated_at: new Date().toISOString()
    };
    
    // TTL 30 minutes (1800 seconds)
    await this.redis.set(`exit_pass:${token}`, JSON.stringify(payload), 'EX', 1800);
    return token;
  }
  async validateExitPass(token: string): Promise<any> {
    // Read the token data
    const dataStr = await this.redis.get(`exit_pass:${token}`);
    if (!dataStr) {
      throw new BadRequestException('Invalid or expired exit pass');
    }

    // Single-use guarantee: atomically delete it so it can't be reused
    const deleted = await this.redis.del(`exit_pass:${token}`);
    if (deleted !== 1) {
      throw new BadRequestException('Exit pass already used');
    }

    return JSON.parse(dataStr);
  }
}
