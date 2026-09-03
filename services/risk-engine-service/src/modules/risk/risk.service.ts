import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Pool } from 'pg';
import { Redis } from 'ioredis';
import { Producer } from 'kafkajs';

@Injectable()
export class RiskService {
  constructor(
    @Inject('DB_POOL') private readonly dbPool: Pool,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    @Inject('KAFKA_PRODUCER') private readonly kafkaProducer: Producer,
  ) {}

  async calculateTier(sessionId: string) {
    // Fetch user trust tier from Redis (default: 'BRONZE')
    const trustTier = await this.redis.get(`trust:tier:session:${sessionId}`) || 'BRONZE';

    // Dampening based on trust tier
    let dampening = 1.0;
    if (trustTier === 'SILVER') dampening = 0.7;
    if (trustTier === 'GOLD') dampening = 0.4;

    // Fetch telemetry scores from PostgreSQL
    const res = await this.dbPool.query(
      `SELECT cadence, motion_gap, deletion, dwell_basket_ratio, scale_delta_g 
       FROM session_risk_aggregate 
       WHERE session_id = $1`,
      [sessionId]
    );

    if (res.rowCount === 0) {
      throw new NotFoundException(`Session telemetry not found for session ${sessionId}`);
    }

    const telemetry = res.rows[0];
    const cadence = parseFloat(telemetry.cadence) || 0;
    const motionGap = parseFloat(telemetry.motion_gap) || 0;
    const deletion = parseFloat(telemetry.deletion) || 0;
    const dwellBasketRatio = parseFloat(telemetry.dwell_basket_ratio) || 0;
    const scaleDeltaG = parseFloat(telemetry.scale_delta_g) || 0;

    // Base score calculation
    // Weighted formula (base 100 max risk): cadence(0.25) + motionGap(0.30) + deletion(0.20) + dwellRatio(0.10) + scaleDelta(0.15)
    const rawScore = (cadence * 0.25) + (motionGap * 0.30) + (deletion * 0.20) + (dwellBasketRatio * 0.10) + (scaleDeltaG * 0.15);

    // Apply trust tier dampening
    let finalRiskScore = rawScore * dampening;

    // Determine Tier (Tier 3 = highest risk, Tier 1 = lowest risk)
    // Thresholds: score > 0.7 OR scaleDelta >= 100g -> Tier 3; score > 0.3 -> Tier 2; else -> Tier 1.
    let finalTier = 1;
    const signalFlags = [];

    if (finalRiskScore > 0.7 || scaleDeltaG >= 100) {
      finalTier = 3;
      if (scaleDeltaG >= 100) signalFlags.push('SCALE_DELTA_HIGH');
      if (finalRiskScore > 0.7) signalFlags.push('HIGH_RISK_SCORE');
    } else if (finalRiskScore > 0.3) {
      finalTier = 2;
      signalFlags.push('MEDIUM_RISK_SCORE');
    }

    // Update the database
    await this.dbPool.query(
      `UPDATE session_risk_aggregate 
       SET final_risk_score = $1, final_tier = $2 
       WHERE session_id = $3`,
      [finalRiskScore, finalTier, sessionId]
    );

    // Publish Kafka event
    const payload = {
      session_id: sessionId,
      tier: finalTier,
      risk_score: finalRiskScore,
      signal_flags: signalFlags,
    };

    await this.kafkaProducer.send({
      topic: 'risk.score.updated.v1',
      messages: [{ value: JSON.stringify(payload) }],
    });

    return payload;
  }
}
