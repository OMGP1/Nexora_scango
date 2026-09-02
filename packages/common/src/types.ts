// =====================================================
// @scango/common — Shared Domain Types
// Matches the data model defined in PRD/TRD Section B.4
// =====================================================

// ── Store ──────────────────────────────────────────

export interface Store {
  store_id: string;
  name: string;
  region: string;
  timezone: string;
  config_flags: StoreConfigFlags;
  created_at: Date;
  updated_at: Date;
}

export interface StoreConfigFlags {
  self_scan_enabled: boolean;
  verification_thresholds: {
    green_max: number;   // risk_score < this → Tier 1 Green
    amber_max: number;   // risk_score < this → Tier 2 Amber; >= this → Tier 3 Red
  };
  sampling_rate: number;         // 0–1, minimum random Tier 2 rate
  session_timeout_minutes: number;
  operating_hours: {
    start: string;  // "08:00"
    end: string;    // "22:00"
  };
}

// ── Customer ───────────────────────────────────────

export interface Customer {
  customer_id: string;
  loyalty_id: string | null;
  phone: string | null;
  email: string | null;
  name: string | null;
  auth_type: CustomerAuthType;
  trust_profile: TrustProfile;
  created_at: Date;
  updated_at: Date;
}

export type CustomerAuthType = 'guest' | 'loyalty' | 'oauth';

export interface TrustProfile {
  score: number;           // 0–100, higher = more trusted
  total_sessions: number;
  verified_sessions: number;
  incidents: number;
}

// ── Session ────────────────────────────────────────

export interface Session {
  session_id: string;
  store_id: string;
  customer_id: string | null;
  status: SessionStatus;
  started_at: Date;
  expires_at: Date;
  paused_at: Date | null;
  device_fingerprint: string;
  join_code: string;
  devices: DeviceInfo[];
  customer_type: 'guest' | 'loyalty';
  has_age_restricted_items: boolean;
}

export type SessionStatus =
  | 'active'
  | 'paused'
  | 'verification_pending'
  | 'verification_hold'
  | 'payment_pending'
  | 'completed'
  | 'expired'
  | 'abandoned';

export interface DeviceInfo {
  device_fingerprint: string;
  joined_at: Date;
  user_agent: string;
}

// ── Product ────────────────────────────────────────

export interface Product {
  sku: string;
  barcode: string;
  name: string;
  description: string;
  unit_price: number;
  tax_class: TaxClass;
  is_weight_based: boolean;
  is_age_restricted: boolean;
  category_id: string;
  image_url: string;
  uom: string;           // "unit", "kg", "g", "l", "ml"
}

export type TaxClass = 'GST_0' | 'GST_5' | 'GST_12' | 'GST_18' | 'GST_28';

// ── Category ───────────────────────────────────────

export interface Category {
  category_id: string;
  name: string;
  parent_category_id: string | null;
}

// ── Cart Item ──────────────────────────────────────

export interface CartItem {
  cart_item_id: string;
  session_id: string;
  sku: string;
  name: string;
  image_url: string;
  unit_price: number;
  quantity: number;
  weight: number | null;
  line_total: number;
  tax_rate: number;
  tax_amount: number;
  tax_class: TaxClass;
  scanned_at: Date;
  scan_source: 'camera' | 'manual';
  requires_assisted_verification: boolean;
  removed_at: Date | null;
}

// ── Bill Summary ───────────────────────────────────

export interface BillSummary {
  subtotal: number;
  discount: number;
  tax_total: number;
  grand_total: number;
  item_count: number;
  applied_promo: AppliedPromo | null;
}

export interface AppliedPromo {
  promo_code: string;
  type: string;
  discount_value: number;
}

// ── Verification ───────────────────────────────────

export interface Verification {
  verification_id: string;
  session_id: string;
  tier: VerificationTier;
  risk_score: number;
  outcome: VerificationOutcome;
  evaluated_at: Date;
  resolved_at: Date | null;
  resolved_by: string | null;
  reason_code: string | null;
  notes: string | null;
}

export type VerificationTier = 'green' | 'amber' | 'red';
export type VerificationOutcome =
  | 'pending'
  | 'verified_auto'
  | 'held'
  | 'cleared_manual'
  | 'escalated';

// ── Evidence ───────────────────────────────────────

export interface Evidence {
  evidence_id: string;
  verification_id: string;
  type: 'image' | 'weight_delta' | 'item_count_delta';
  storage_uri: string;
  metadata: Record<string, unknown>;
  created_at: Date;
}

// ── Payment ────────────────────────────────────────

export interface Payment {
  payment_id: string;
  session_id: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  gateway_ref: string | null;
  status: PaymentStatus;
  paid_at: Date | null;
  created_at: Date;
}

export type PaymentMethod = 'upi' | 'credit_card' | 'debit_card' | 'net_banking' | 'wallet' | 'loyalty_points' | 'cash';
export type PaymentStatus = 'intent_created' | 'processing' | 'confirmed' | 'failed' | 'refunded' | 'voided';

// ── Refund ─────────────────────────────────────────

export interface Refund {
  refund_id: string;
  payment_id: string;
  amount: number;
  reason_code: string;
  initiated_by: string;
  created_at: Date;
}

// ── Promotion ──────────────────────────────────────

export interface Promotion {
  promo_code: string;
  type: PromoType;
  rules: PromoRules;
  valid_from: Date;
  valid_to: Date;
  usage_limit: number | null;
  used_count: number;
  min_basket_value: number;
  applicable_categories: string[];
  applicable_skus: string[];
  loyalty_only: boolean;
}

export type PromoType = 'percentage' | 'flat' | 'buy_x_get_y' | 'category_discount';

export interface PromoRules {
  discount_value: number;           // percentage (0–100) or flat amount
  max_discount: number | null;      // cap for percentage discounts
  buy_quantity?: number;            // buy_x_get_y: buy X
  get_quantity?: number;            // buy_x_get_y: get Y free
}

// ── Audit Event ────────────────────────────────────

export interface AuditEvent {
  event_id: string;
  session_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  occurred_at: Date;
  hash: string;
}

// ── Inventory Ledger ───────────────────────────────

export interface InventoryLedger {
  ledger_id: string;
  store_id: string;
  sku: string;
  movement_type: InventoryMovementType;
  quantity_delta: number;
  session_id: string | null;
  event_id: string;
  recorded_at: Date;
}

export type InventoryMovementType = 'RESERVED' | 'RELEASED' | 'SOLD' | 'ADJUSTMENT';

export interface InventorySnapshot {
  store_id: string;
  sku: string;
  available_qty: number;
  reserved_qty: number;
  last_updated: Date;
}

// ── User (Staff) ───────────────────────────────────

export interface User {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  store_id: string | null;     // null for enterprise-wide admin
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export type UserRole =
  | 'admin'
  | 'store_manager'
  | 'associate'
  | 'lp_officer'
  | 'support_agent'
  | 'auditor';

// ── JWT Payload ────────────────────────────────────

export interface JwtPayload {
  sub: string;                   // user_id or customer_id
  type: 'guest' | 'customer' | 'staff';
  role?: UserRole;
  store_id?: string;
  session_id?: string;
  loyalty_id?: string;
  iat: number;
  exp: number;
}

// ── API Response Wrappers ──────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  details?: unknown;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}
