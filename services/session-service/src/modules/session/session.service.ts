import { Injectable, ConflictException, NotFoundException, Inject } from '@nestjs/common';
import { Pool } from 'pg';
import Redis from 'ioredis';
import { Kafka } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SessionService {
  private redis: Redis;
  private kafkaProducer: any;

  constructor(@Inject('DB_POOL') private pool: Pool) {
    this.redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redis.on('error', (err) => console.error('Redis connect error:', err));
    
    const kafka = new Kafka({
      clientId: 'session-service',
      brokers: [process.env.KAFKA_BROKER || 'localhost:9092'],
    });
    this.kafkaProducer = kafka.producer();
    this.kafkaProducer.connect().catch((err: any) => console.error('Kafka connect error', err));
  }

  private generateJoinCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private async publishEvent(topic: string, payload: any) {
    try {
      await this.kafkaProducer.send({
        topic,
        messages: [{ value: JSON.stringify(payload) }],
      });
    } catch (err) {
      console.error(`Failed to publish event ${topic}`, err);
    }
  }

  async createSession(storeId: string, customerId: string | null, type: string, deviceFingerprint: string) {
    // Enforce single active session per device
    const deviceKey = `device_session:${deviceFingerprint}`;
    const existingSession = await this.redis.get(deviceKey);
    if (existingSession) {
      throw new ConflictException({ message: 'Active session already exists for this device', sessionId: existingSession });
    }

    const sessionId = uuidv4();
    const joinCode = this.generateJoinCode();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 mins

    const sessionState = {
      session_id: sessionId,
      store_id: storeId,
      customer_id: customerId,
      customer_type: type,
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: expiresAt.toISOString(),
      join_code: joinCode,
      devices: [deviceFingerprint],
    };

    // Postgres
    await this.pool.query(
      `INSERT INTO sessions (session_id, store_id, customer_id, customer_type, status, expires_at, device_fingerprint, join_code, devices)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [sessionId, storeId, customerId, type, 'active', expiresAt, deviceFingerprint, joinCode, JSON.stringify(sessionState.devices)]
    );

    // Redis
    await this.redis.set(`session:${sessionId}`, JSON.stringify(sessionState), 'EX', 30 * 60);
    await this.redis.set(deviceKey, sessionId, 'EX', 30 * 60);

    // Kafka
    await this.publishEvent('session.created', sessionState);

    return { success: true, data: sessionState };
  }

  async getSession(sessionId: string) {
    const cached = await this.redis.get(`session:${sessionId}`);
    if (cached) {
      return { success: true, data: JSON.parse(cached), source: 'cache' };
    }

    const result = await this.pool.query('SELECT * FROM sessions WHERE session_id = $1', [sessionId]);
    if (result.rowCount === 0) {
      throw new NotFoundException('Session not found');
    }

    return { success: true, data: result.rows[0], source: 'db' };
  }

  async pauseSession(sessionId: string) {
    const { data: session } = await this.getSession(sessionId);
    if (session.status !== 'active') {
      throw new ConflictException('Session is not active');
    }

    session.status = 'paused';
    session.paused_at = new Date().toISOString();

    await this.redis.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 30 * 60);
    await this.pool.query('UPDATE sessions SET status = $1, paused_at = $2 WHERE session_id = $3', ['paused', session.paused_at, sessionId]);
    await this.publishEvent('session.paused', session);

    return { success: true, data: session };
  }

  async resumeSession(sessionId: string) {
    const { data: session } = await this.getSession(sessionId);
    if (session.status !== 'paused') {
      throw new ConflictException('Session is not paused');
    }

    session.status = 'active';
    session.paused_at = null;
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    session.expires_at = expiresAt.toISOString();

    await this.redis.set(`session:${sessionId}`, JSON.stringify(session), 'EX', 30 * 60);
    await this.pool.query('UPDATE sessions SET status = $1, paused_at = NULL, expires_at = $2 WHERE session_id = $3', ['active', expiresAt, sessionId]);
    
    // Update all device keys TTL
    for (const d of session.devices || []) {
      await this.redis.expire(`device_session:${d}`, 30 * 60);
    }

    await this.publishEvent('session.resumed', session);

    return { success: true, data: session };
  }

  async abandonSession(sessionId: string) {
    const { data: session } = await this.getSession(sessionId);
    
    session.status = 'abandoned';
    await this.redis.del(`session:${sessionId}`);
    
    for (const d of session.devices || []) {
      await this.redis.del(`device_session:${d}`);
    }

    await this.pool.query('UPDATE sessions SET status = $1 WHERE session_id = $2', ['abandoned', sessionId]);
    await this.publishEvent('session.abandoned', { session_id: sessionId });

    return { success: true };
  }

  async joinSession(joinCode: string, deviceFingerprint: string) {
    const result = await this.pool.query('SELECT * FROM sessions WHERE join_code = $1 AND status = $2', [joinCode, 'active']);
    if (result.rowCount === 0) {
      throw new NotFoundException('Active session with join code not found');
    }

    const session = result.rows[0];
    const devices = session.devices || [];
    if (!devices.includes(deviceFingerprint)) {
      devices.push(deviceFingerprint);
      await this.pool.query('UPDATE sessions SET devices = $1 WHERE session_id = $2', [JSON.stringify(devices), session.session_id]);
      
      const cached = await this.redis.get(`session:${session.session_id}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        parsed.devices = devices;
        await this.redis.set(`session:${session.session_id}`, JSON.stringify(parsed), 'KEEPTTL');
      }

      await this.redis.set(`device_session:${deviceFingerprint}`, session.session_id, 'EX', 30 * 60);
    }

    return { success: true, data: { session_id: session.session_id } };
  }
  async listSessions(storeId: string, verificationStatus?: string) {
    let query = `
      SELECT * FROM sessions 
      WHERE store_id = $1 AND status IN ('active', 'checkout')
    `;
    const params: any[] = [storeId];
    
    if (verificationStatus) {
      query += ` AND verification_status = $2`;
      params.push(verificationStatus);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.pool.query(query, params);
    
    // Map database snake_case to API camelCase / expected fields
    return result.rows.map(row => ({
      id: row.session_id,
      store_id: row.store_id,
      customer_id: row.customer_id,
      status: row.status.toUpperCase(),
      created_at: row.created_at,
      item_count: row.item_count || 0,
      total_value: row.total_value || 0,
      verification_status: row.verification_status?.toUpperCase() || 'NOT_REQUIRED'
    }));
  }
}
