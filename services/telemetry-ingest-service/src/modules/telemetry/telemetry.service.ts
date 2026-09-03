import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';

@Injectable()
export class TelemetryService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor(
    @Inject('DB_POOL') private readonly dbPool: Pool
  ) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://redis:6379');
  }

  async processScanEvent(payload: any) {
    const { sessionId, timestamp, eventData } = payload;
    if (!sessionId) return;
    
    // Example: tracking scan events cadence
    await this.redis.zadd(`cadence:${sessionId}`, timestamp || Date.now(), JSON.stringify(eventData));
    
    // Calculate a dummy cadence anomaly score
    const score = Math.random() * 10;
    
    await this.dbPool.query(`
      INSERT INTO session_risk_aggregate (session_id, cadence_anomaly_score, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id) DO UPDATE
      SET cadence_anomaly_score = EXCLUDED.cadence_anomaly_score, updated_at = NOW()
    `, [sessionId, score]);
  }

  async processMotionEvent(payload: any) {
    const { sessionId, timestamp, eventData } = payload;
    if (!sessionId) return;

    await this.redis.zadd(`motion:${sessionId}`, timestamp || Date.now(), JSON.stringify(eventData));
    
    const score = Math.random() * 10;

    await this.dbPool.query(`
      INSERT INTO session_risk_aggregate (session_id, motion_gap_score, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id) DO UPDATE
      SET motion_gap_score = EXCLUDED.motion_gap_score, updated_at = NOW()
    `, [sessionId, score]);
  }

  async processDeletionEvent(payload: any) {
    const { sessionId, timestamp, eventData } = payload;
    if (!sessionId) return;

    await this.redis.zadd(`deletion:${sessionId}`, timestamp || Date.now(), JSON.stringify(eventData));
    
    const score = Math.random() * 10;

    await this.dbPool.query(`
      INSERT INTO session_risk_aggregate (session_id, deletion_score, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (session_id) DO UPDATE
      SET deletion_score = EXCLUDED.deletion_score, updated_at = NOW()
    `, [sessionId, score]);
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
