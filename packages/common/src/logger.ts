// =====================================================
// @scango/common — Structured Logger (Pino)
// JSON-formatted logging with correlation IDs
// =====================================================

import pino from 'pino';

export interface LogContext {
  service?: string;
  trace_id?: string;
  session_id?: string;
  store_id?: string;
  user_id?: string;
  request_id?: string;
}

export function createLogger(serviceName: string, level: string = 'info'): pino.Logger {
  return pino({
    name: serviceName,
    level: level,
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level: (label: string) => ({ level: label }),
      bindings: () => ({ service: serviceName }),
    },
    transport:
      process.env.NODE_ENV !== 'production'
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
  });
}

export function childLogger(
  logger: pino.Logger,
  context: LogContext,
): pino.Logger {
  return logger.child(context);
}

export type Logger = pino.Logger;
