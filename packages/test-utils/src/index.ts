// =====================================================
// @scango/test-utils — Shared Test Helpers
// =====================================================

import { Pool } from 'pg';
import { generateId } from '@scango/common';

/**
 * Create a test database pool pointing at a test-specific DB
 */
export function createTestPool(database: string): Pool {
  return new Pool({
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'scango',
    password: process.env.POSTGRES_PASSWORD || 'scango_dev_pass',
    database,
    max: 5,
  });
}

/**
 * Clean all rows from specified tables (for test teardown)
 */
export async function cleanTables(pool: Pool, tables: string[]): Promise<void> {
  for (const table of tables) {
    await pool.query(`DELETE FROM ${table}`);
  }
}

/**
 * Generate a mock JWT token payload for testing
 */
export function mockGuestJwt(storeId?: string) {
  return {
    sub: generateId(),
    type: 'guest' as const,
    store_id: storeId || generateId(),
    session_id: generateId(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
}

export function mockStaffJwt(role: string = 'admin', storeId?: string) {
  return {
    sub: generateId(),
    type: 'staff' as const,
    role,
    store_id: storeId || generateId(),
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  };
}

/**
 * Mock Kafka producer for unit tests
 */
export function createMockKafkaProducer() {
  const messages: Array<{ topic: string; event: unknown }> = [];
  return {
    send: async ({ topic, messages: msgs }: { topic: string; messages: Array<{ value: string }> }) => {
      for (const msg of msgs) {
        messages.push({ topic, event: JSON.parse(msg.value) });
      }
    },
    connect: async () => {},
    disconnect: async () => {},
    getMessages: () => messages,
    clear: () => { messages.length = 0; },
  };
}

/**
 * Wait for a condition to be true (polling helper)
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeoutMs: number = 5000,
  intervalMs: number = 100,
): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error(`waitFor timed out after ${timeoutMs}ms`);
}
