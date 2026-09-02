// =====================================================
// @scango/redis — Redis Client Factory
// =====================================================

import Redis from 'ioredis';
import { createLogger, Logger } from '@scango/common';

const logger: Logger = createLogger('scango-redis');

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Create a Redis client instance
 */
export function createRedisClient(config: RedisConfig): Redis {
  const client = new Redis({
    host: config.host,
    port: config.port,
    password: config.password,
    db: config.db ?? 0,
    keyPrefix: config.keyPrefix,
    retryStrategy: (times: number) => {
      if (times > 10) {
        logger.error('Redis connection retry limit exceeded');
        return null;
      }
      return Math.min(times * 200, 5000);
    },
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
    lazyConnect: false,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('ready', () => logger.info('Redis ready'));
  client.on('error', (err) => logger.error({ err }, 'Redis error'));
  client.on('close', () => logger.warn('Redis connection closed'));
  client.on('reconnecting', () => logger.info('Redis reconnecting'));

  return client;
}

/**
 * Health check: verify Redis is responsive
 */
export async function redisHealthCheck(client: Redis): Promise<boolean> {
  try {
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  }
}

/**
 * Set a JSON value with optional TTL
 */
export async function setJson(client: Redis, key: string, value: unknown, ttlSeconds?: number): Promise<void> {
  const serialized = JSON.stringify(value);
  if (ttlSeconds) {
    await client.setex(key, ttlSeconds, serialized);
  } else {
    await client.set(key, serialized);
  }
}

/**
 * Get and parse a JSON value
 */
export async function getJson<T>(client: Redis, key: string): Promise<T | null> {
  const data = await client.get(key);
  if (!data) return null;
  return JSON.parse(data) as T;
}

// Re-export Redis type
export { Redis } from 'ioredis';
