// =====================================================
// @scango/common — Utility Functions
// =====================================================

import { v4 as uuidv4 } from 'uuid';

/**
 * Generate a new UUID v4
 */
export function generateId(): string {
  return uuidv4();
}

/**
 * Generate a 6-character alphanumeric join code for multi-device sessions
 */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Calculate expiry timestamp from now + minutes
 */
export function expiresIn(minutes: number): Date {
  return new Date(Date.now() + minutes * 60 * 1000);
}

/**
 * Check if a date is in the past
 */
export function isExpired(date: Date): boolean {
  return new Date(date) < new Date();
}

/**
 * Round a number to 2 decimal places (for currency)
 */
export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Delay execution for a specified duration (ms)
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simple retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000,
): Promise<T> {
  let lastError: Error | undefined;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        const backoff = baseDelayMs * Math.pow(2, attempt);
        await delay(backoff);
      }
    }
  }
  throw lastError;
}

/**
 * Tax rate lookup from tax class
 */
export const TAX_RATES: Record<string, number> = {
  GST_0: 0.0,
  GST_5: 0.05,
  GST_12: 0.12,
  GST_18: 0.18,
  GST_28: 0.28,
};

export function getTaxRate(taxClass: string): number {
  return TAX_RATES[taxClass] ?? 0;
}
