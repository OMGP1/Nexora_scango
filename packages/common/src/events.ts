// =====================================================
// @scango/common — Kafka Event Topic Constants
// All event topics used across the ScanGo system
// =====================================================

export const KAFKA_TOPICS = {
  // Session lifecycle events
  SESSION_CREATED: 'session.created',
  SESSION_PAUSED: 'session.paused',
  SESSION_RESUMED: 'session.resumed',
  SESSION_EXPIRED: 'session.expired',
  SESSION_ABANDONED: 'session.abandoned',
  SESSION_COMPLETED: 'session.completed',
  SESSION_HELP_REQUESTED: 'session.help_requested',

  // Cart / item events
  ITEM_SCANNED: 'item.scanned',
  ITEM_UPDATED: 'item.updated',
  ITEM_REMOVED: 'item.removed',

  // Inventory events
  ITEM_SOFT_RESERVED: 'item.soft-reserved',
  ITEM_RESERVATION_RELEASED: 'item.reservation-released',
  ITEM_SOLD: 'item.sold',
  INVENTORY_INSUFFICIENT: 'inventory.insufficient',

  // Payment events
  PAYMENT_INTENT_CREATED: 'payment.intent_created',
  PAYMENT_CONFIRMED: 'payment.confirmed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Verification events
  VERIFICATION_INITIATED: 'verification.initiated',
  VERIFICATION_CLEARED: 'verification.cleared',
  VERIFICATION_HELD: 'verification.held',
  VERIFICATION_ESCALATED: 'verification.escalated',

  // Audit events (catch-all)
  AUDIT_EVENT: 'audit.event',

  // Notification triggers
  NOTIFICATION_SEND: 'notification.send',
} as const;

export type KafkaTopic = (typeof KAFKA_TOPICS)[keyof typeof KAFKA_TOPICS];

// ── Kafka Event Payloads ───────────────────────────

export interface BaseKafkaEvent {
  event_id: string;
  event_type: KafkaTopic;
  timestamp: string;
  store_id: string;
  session_id: string;
}

export interface ItemScannedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.ITEM_SCANNED;
  sku: string;
  barcode: string;
  quantity: number;
  weight: number | null;
  line_total: number;
}

export interface ItemRemovedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.ITEM_REMOVED;
  sku: string;
  quantity: number;
  cart_item_id: string;
}

export interface ItemUpdatedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.ITEM_UPDATED;
  sku: string;
  old_quantity: number;
  new_quantity: number;
  cart_item_id: string;
}

export interface SessionCreatedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.SESSION_CREATED;
  customer_id: string | null;
  customer_type: 'guest' | 'loyalty';
  device_fingerprint: string;
}

export interface SessionExpiredEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.SESSION_EXPIRED;
}

export interface SessionAbandonedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.SESSION_ABANDONED;
}

export interface PaymentConfirmedEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.PAYMENT_CONFIRMED;
  payment_id: string;
  amount: number;
  currency: string;
  method: string;
}

export interface VerificationHeldEvent extends BaseKafkaEvent {
  event_type: typeof KAFKA_TOPICS.VERIFICATION_HELD;
  verification_id: string;
  tier: string;
  risk_score: number;
  evidence_ids: string[];
}
