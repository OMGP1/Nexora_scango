// =====================================================
// @scango/common — Configuration Loader
// Environment variable loading with Zod validation
// =====================================================

import { z } from 'zod';
import dotenv from 'dotenv';

// Load .env files
dotenv.config();

// ── Base Config Schema ─────────────────────────────

export const baseConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
});

// ── PostgreSQL Config ──────────────────────────────

export const postgresConfigSchema = z.object({
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_USER: z.string().default('scango'),
  POSTGRES_PASSWORD: z.string().default('scango_dev_pass'),
  POSTGRES_DB: z.string(),
});

// ── Redis Config ───────────────────────────────────

export const redisConfigSchema = z.object({
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
});

// ── MongoDB Config ─────────────────────────────────

export const mongoConfigSchema = z.object({
  MONGO_URI: z.string().default('mongodb://scango:scango_dev_pass@localhost:27017/scango_catalog?authSource=admin'),
});

// ── Kafka Config ───────────────────────────────────

export const kafkaConfigSchema = z.object({
  KAFKA_BROKERS: z.string().default('localhost:9092'),
  KAFKA_CLIENT_ID: z.string(),
  KAFKA_GROUP_ID: z.string().optional(),
});

// ── MinIO Config ───────────────────────────────────

export const minioConfigSchema = z.object({
  MINIO_ENDPOINT: z.string().default('localhost'),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_ACCESS_KEY: z.string().default('scango_minio'),
  MINIO_SECRET_KEY: z.string().default('scango_minio_pass'),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_BUCKET_EVIDENCE: z.string().default('scango-evidence'),
  MINIO_BUCKET_RECEIPTS: z.string().default('scango-receipts'),
});

// ── JWT Config ─────────────────────────────────────

export const jwtConfigSchema = z.object({
  JWT_SECRET: z.string().default('scango-dev-jwt-secret-change-in-production'),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),
});

// ── Service Ports ──────────────────────────────────

export const SERVICE_PORTS = {
  API_GATEWAY: 3000,
  IDENTITY_SERVICE: 3001,
  SESSION_SERVICE: 3002,
  CATALOG_SERVICE: 3003,
  CART_SERVICE: 3004,
  INVENTORY_SERVICE: 3005,
  VERIFICATION_SERVICE: 3006,
  PAYMENT_SERVICE: 3007,
  PROMO_SERVICE: 3008,
  NOTIFICATION_SERVICE: 3009,
  AUDIT_SERVICE: 3010,
  ANALYTICS_SERVICE: 3011,
  // v2 services
  SCALE_GATEWAY_SERVICE: 3016,
  TELEMETRY_INGEST_SERVICE: 3017,
  RISK_ENGINE_SERVICE: 3018,
  LOYALTY_ESCROW_SERVICE: 3019,
  RMN_SERVICE: 3020,
  ERP_SYNC_SERVICE: 3021,
} as const;

// ── MQTT Config (v2) ──────────────────────────────

export const mqttConfigSchema = z.object({
  MQTT_BROKER_URL: z.string().default('mqtt://localhost:1883'),
  MQTT_CLIENT_ID: z.string().optional(),
});

// ── Config Loader ──────────────────────────────────

export function loadConfig<T extends z.ZodTypeAny>(schema: T): z.infer<T> {
  const result = schema.safeParse(process.env);
  if (!result.success) {
    const formatted = result.error.format();
    console.error('❌ Configuration validation failed:', JSON.stringify(formatted, null, 2));
    throw new Error(`Configuration validation failed: ${result.error.message}`);
  }
  return result.data;
}

