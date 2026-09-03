import { Injectable, Inject, Logger } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Producer } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EscrowService {
  private readonly logger = new Logger(EscrowService.name);

  constructor(
    @Inject('DB_POOL') private readonly dbPool: Pool,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('KAFKA_PRODUCER') private readonly kafkaProducer: Producer,
    private readonly configService: ConfigService,
  ) {
    this.ensureTableExists();
  }

  private async ensureTableExists() {
    const query = `
      CREATE TABLE IF NOT EXISTS loyalty_escrow (
        session_id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
        points_pending NUMERIC NOT NULL DEFAULT 0,
        points_multiplier NUMERIC NOT NULL DEFAULT 1.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;
    try {
      await this.dbPool.query(query);
      this.logger.log('loyalty_escrow table verified.');
    } catch (err) {
      this.logger.error('Failed to create table', err);
    }
  }

  async initSession(sessionId: string, userId: string) {
    let trustTier = await this.redis.get(`user_trust_tier:${userId}`);
    if (!trustTier) {
      trustTier = 'BRONZE';
    }

    let multiplier = 1.0;
    if (trustTier === 'SILVER') multiplier = 1.25;
    if (trustTier === 'GOLD') multiplier = 1.5;

    const query = `
      INSERT INTO loyalty_escrow (session_id, user_id, status, points_pending, points_multiplier)
      VALUES ($1, $2, 'PENDING', 0, $3)
      ON CONFLICT (session_id) DO NOTHING
      RETURNING *
    `;
    const result = await this.dbPool.query(query, [sessionId, userId, multiplier]);
    
    return result.rows[0] || { sessionId, status: 'EXISTING' };
  }

  async accruePoints(sessionId: string, basePoints: number) {
    const selectQuery = `SELECT points_multiplier FROM loyalty_escrow WHERE session_id = $1`;
    const res = await this.dbPool.query(selectQuery, [sessionId]);
    if (res.rowCount === 0) {
      this.logger.warn(`Session ${sessionId} not found for accruing points`);
      return;
    }

    const multiplier = parseFloat(res.rows[0].points_multiplier);
    const pointsToAdd = basePoints * multiplier;

    const updateQuery = `
      UPDATE loyalty_escrow 
      SET points_pending = points_pending + $2, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1 AND status = 'PENDING'
      RETURNING *
    `;
    await this.dbPool.query(updateQuery, [sessionId, pointsToAdd]);
    this.logger.log(`Accrued ${pointsToAdd} points to session ${sessionId}`);
  }

  async resolveEscrow(sessionId: string, outcome: string) {
    const selectQuery = `SELECT * FROM loyalty_escrow WHERE session_id = $1`;
    const res = await this.dbPool.query(selectQuery, [sessionId]);
    
    if (res.rowCount === 0) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const session = res.rows[0];
    if (session.status !== 'PENDING') {
      throw new Error(`Session ${sessionId} is already resolved`);
    }

    // Auto-releases for Tier 1 (cleared), manual for Tier 2/3 (audited).
    const newStatus = outcome === 'passed' ? 'RELEASED' : 'FORFEITED';

    const updateQuery = `
      UPDATE loyalty_escrow
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE session_id = $1
      RETURNING *
    `;
    const updated = await this.dbPool.query(updateQuery, [sessionId, newStatus]);

    if (newStatus === 'RELEASED') {
      try {
        const promoServiceUrl = this.configService.get<string>('PROMO_SERVICE_URL') || 'http://localhost:3015';
        await axios.post(`${promoServiceUrl}/api/v1/promo/credit`, {
          userId: session.user_id,
          coins: parseFloat(session.points_pending),
          reason: 'loyalty_escrow_release'
        });
      } catch (err) {
        this.logger.error('Failed to call Promo Service to credit coins', err);
      }
    }

    const eventPayload = {
      sessionId: session.session_id,
      userId: session.user_id,
      pointsPending: parseFloat(session.points_pending),
      status: newStatus,
      timestamp: new Date().toISOString()
    };

    await this.kafkaProducer.send({
      topic: 'loyalty.escrow.v1',
      messages: [{ value: JSON.stringify(eventPayload) }]
    });

    return updated.rows[0];
  }
}
