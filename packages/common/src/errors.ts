// =====================================================
// @scango/common — Application Errors
// Structured error classes for consistent API responses
// =====================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      success: false,
      error: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

// ── Specific Error Classes ─────────────────────────

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND',
    );
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details);
    this.name = 'ConflictError';
  }
}

export class DuplicateScanError extends ConflictError {
  constructor(barcode: string) {
    super(`Duplicate scan detected for barcode '${barcode}'. Please wait a moment before re-scanning.`, { barcode });
    this.name = 'DuplicateScanError';
  }
}

export class SessionExpiredError extends AppError {
  constructor(sessionId: string) {
    super(`Session '${sessionId}' has expired`, 410, 'SESSION_EXPIRED');
    this.name = 'SessionExpiredError';
  }
}

export class PaymentError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 402, 'PAYMENT_ERROR', details);
    this.name = 'PaymentError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(service: string) {
    super(`${service} is currently unavailable. Please try again.`, 503, 'SERVICE_UNAVAILABLE');
    this.name = 'ServiceUnavailableError';
  }
}
