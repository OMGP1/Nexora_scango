import { Injectable, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';

@Injectable()
export class WeightCheckService {
  private redisClient: Redis;

  constructor(@Inject('DB_POOL') private pool: Pool) {
    this.redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });
  }

  async checkWeight(_sessionId: string, storeId: string, laneCode: string, expectedWeightG: number): Promise<{ passed: boolean; delta_g: number; tolerance_g: number; scale_reading_g: number | null }> {
    const scaleKey = `scale:latest:${storeId}:${laneCode}`;
    const reading = await this.redisClient.get(scaleKey);
    
    if (!reading) {
      return { passed: false, delta_g: 0, tolerance_g: 0, scale_reading_g: null };
    }

    const scale_reading_g = parseFloat(reading);

    const policyRes = await this.pool.query(
      `SELECT * FROM weight_tolerance_policy WHERE scope = 'GLOBAL' LIMIT 1`
    );
    
    let tolerance_pct = 3.50;
    let tolerance_flat_g = 15;
    
    if (policyRes.rows.length > 0) {
      tolerance_pct = parseFloat(policyRes.rows[0].tolerance_pct);
      tolerance_flat_g = parseInt(policyRes.rows[0].tolerance_flat_g, 10);
    }

    const effectiveTolerance = Math.max(tolerance_flat_g, Math.round(expectedWeightG * tolerance_pct / 100));
    const delta = Math.abs(scale_reading_g - expectedWeightG);

    return {
      passed: delta <= effectiveTolerance,
      delta_g: delta,
      tolerance_g: effectiveTolerance,
      scale_reading_g,
    };
  }
}

