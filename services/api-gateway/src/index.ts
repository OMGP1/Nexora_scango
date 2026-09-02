import './tracing';
// =====================================================
// ScanGo API Gateway — Express Reverse Proxy
// Routes /api/v1/* to backend microservices
// =====================================================

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { v4 as uuidv4 } from 'uuid';
import * as jwt from 'jsonwebtoken';
import { createLogger, SERVICE_PORTS, JwtPayload } from '@scango/common';

const logger = createLogger('api-gateway');
const PORT = process.env.API_GATEWAY_PORT || SERVICE_PORTS.API_GATEWAY;

const app = express();

// ── Global Middleware ──────────────────────────────

// CORS
app.use(cors({
  origin: (origin, callback) => {
    // Allow any localhost port in development
    if (!origin || origin.startsWith('http://localhost:')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
}));

// Request ID injection
app.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || uuidv4();
  next();
});

// Request logging
app.use(morgan(':method :url :status :response-time ms - :req[x-request-id]'));

// ── Security Headers ───────────────────────────────

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// ── Auth Middleware (JWT Validation & RBAC) ──────────

const JWT_SECRET = process.env.JWT_SECRET || 'scango-dev-jwt-secret-change-in-production';

app.use('/api/v1', (req, res, next) => {
  // Skip auth for health endpoints and auth routes
  if (req.path.includes('/health') || req.path.startsWith('/auth')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token && typeof req.query.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Missing or invalid token' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Inject user context headers
    req.headers['x-user-id'] = payload.sub;
    if (payload.role) req.headers['x-user-role'] = payload.role;
    if (payload.store_id) req.headers['x-store-id'] = payload.store_id;

    // Basic RBAC for admin routes
    if (req.path.startsWith('/admin')) {
      if (payload.type !== 'staff' || (payload.role !== 'admin' && payload.role !== 'store_manager')) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'Admin access required' });
      }
    }

    next();
  } catch (err) {
    logger.warn({ err }, 'Invalid JWT');
    return res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'Invalid or expired token' });
  }
});

// ── Gateway Health Check ───────────────────────────

app.get('/health', (_req, res) => {
  res.json({
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ── Service Route Mapping ──────────────────────────

const BACKEND_HOST = process.env.BACKEND_HOST || '127.0.0.1';

interface RouteConfig {
  prefix: string;
  target: string;
  service: string;
}

const routes: RouteConfig[] = [
  // Auth & Identity
  { prefix: '/api/v1/auth',      target: `http://${BACKEND_HOST}:${SERVICE_PORTS.IDENTITY_SERVICE}`, service: 'identity-service' },
  { prefix: '/api/v1/admin/users', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.IDENTITY_SERVICE}`, service: 'identity-service' },
  { prefix: '/api/v1/admin/roles', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.IDENTITY_SERVICE}`, service: 'identity-service' },
  { prefix: '/api/v1/admin/stores', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.IDENTITY_SERVICE}`, service: 'identity-service' },

  // Sessions
  { prefix: '/api/v1/sessions',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.SESSION_SERVICE}`, service: 'session-service' },

  // Catalog & Products
  { prefix: '/api/v1/products',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.CATALOG_SERVICE}`, service: 'catalog-service' },
  { prefix: '/api/v1/categories', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.CATALOG_SERVICE}`, service: 'catalog-service' },

  // Cart / Billing (scoped under sessions)
  // These routes need special handling — they match /api/v1/sessions/{id}/items, /bill, /promo
  // The session-scoped cart routes are proxied to the cart service

  // Inventory
  { prefix: '/api/v1/inventory', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.INVENTORY_SERVICE}`, service: 'inventory-service' },

  // Verification
  { prefix: '/api/v1/verify',   target: `http://${BACKEND_HOST}:${SERVICE_PORTS.VERIFICATION_SERVICE}`, service: 'verification-service' },
  { prefix: '/api/v1/admin/verification', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.VERIFICATION_SERVICE}`, service: 'verification-service' },

  // Payments
  { prefix: '/api/v1/payment',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PAYMENT_SERVICE}`, service: 'payment-service' },

  // Promotions & Loyalty
  { prefix: '/api/v1/promo',    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PROMO_SERVICE}`, service: 'promo-service' },
  { prefix: '/api/v1/loyalty',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PROMO_SERVICE}`, service: 'promo-service' },

  // Notifications
  { prefix: '/api/v1/notifications', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.NOTIFICATION_SERVICE}`, service: 'notification-service' },

  // Audit
  { prefix: '/api/v1/audit',    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.AUDIT_SERVICE}`, service: 'audit-service' },

  // Analytics
  { prefix: '/api/v1/admin/analytics', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.ANALYTICS_SERVICE}`, service: 'analytics-service' },
];

// ── Cart-scoped session routes (special routing) ───
// These must be defined BEFORE the catch-all /api/v1/sessions
app.use(
  /^\/api\/v1\/sessions\/[^\/]+\/(items|bill|promo)(\/.*)?$/,
  createProxyMiddleware({
    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.CART_SERVICE}`,
    changeOrigin: true,
    pathRewrite: (_path, req: any) => req.originalUrl,
  })
);

app.use(
  /^\/api\/v1\/sessions\/[^\/]+\/(payment|receipt)(\/.*)?$/,
  createProxyMiddleware({
    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PAYMENT_SERVICE}`,
    changeOrigin: true,
    pathRewrite: (_path, req: any) => req.originalUrl,
  })
);

app.use(
  /^\/api\/v1\/sessions\/[^\/]+\/verify(\/.*)?$/,
  createProxyMiddleware({
    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.VERIFICATION_SERVICE}`,
    changeOrigin: true,
    pathRewrite: (_path, req: any) => req.originalUrl,
  })
);

app.use(
  /^\/api\/v1\/sessions\/[^\/]+\/(notifications|help)(\/.*)?$/,
  createProxyMiddleware({
    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.NOTIFICATION_SERVICE}`,
    changeOrigin: true,
    pathRewrite: (_path, req: any) => req.originalUrl,
  })
);

// Register general proxy routes
for (const route of routes) {
  app.use(
    route.prefix,
    createProxyMiddleware({
      target: route.target,
      changeOrigin: true,
      timeout: 30000,
      proxyTimeout: 30000,
      pathRewrite: (_path, req: any) => req.originalUrl,
      on: {
        proxyReq: (proxyReq, req: any) => {
          // Forward request ID
          const requestId = (req.headers['x-request-id'] as string) || uuidv4();
          proxyReq.setHeader('X-Request-ID', requestId);
          logger.debug({ path: req.url, target: route.service, requestId }, 'Proxying request');
        },
        error: (err, _req: any, res: any) => {
          logger.error({ err, service: route.service }, 'Proxy error');
          if ('writeHead' in res && typeof res.writeHead === 'function') {
            (res as express.Response).status(503).json({
              success: false,
              error: 'SERVICE_UNAVAILABLE',
              message: `${route.service} is currently unavailable`,
              statusCode: 503,
            });
          }
        },
      },
    }),
  );
}

// Fallback for all other /api/v1/sessions routes
app.use(
  '/api/v1/sessions',
  createProxyMiddleware({
    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.SESSION_SERVICE}`,
    changeOrigin: true,
    pathRewrite: (_path, req: any) => req.originalUrl,
  })
);

// ── Per-service health proxy ───────────────────────

const serviceHealthRoutes = [
  { path: '/api/v1/identity-service/health', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.IDENTITY_SERVICE}` },
  { path: '/api/v1/session-service/health',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.SESSION_SERVICE}` },
  { path: '/api/v1/catalog-service/health',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.CATALOG_SERVICE}` },
  { path: '/api/v1/cart-service/health',     target: `http://${BACKEND_HOST}:${SERVICE_PORTS.CART_SERVICE}` },
  { path: '/api/v1/inventory-service/health', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.INVENTORY_SERVICE}` },
  { path: '/api/v1/verification-service/health', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.VERIFICATION_SERVICE}` },
  { path: '/api/v1/payment-service/health',  target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PAYMENT_SERVICE}` },
  { path: '/api/v1/promo-service/health',    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.PROMO_SERVICE}` },
  { path: '/api/v1/notification-service/health', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.NOTIFICATION_SERVICE}` },
  { path: '/api/v1/audit-service/health',    target: `http://${BACKEND_HOST}:${SERVICE_PORTS.AUDIT_SERVICE}` },
  { path: '/api/v1/analytics-service/health', target: `http://${BACKEND_HOST}:${SERVICE_PORTS.ANALYTICS_SERVICE}` },
];

for (const route of serviceHealthRoutes) {
  app.use(route.path, createProxyMiddleware({ target: route.target, changeOrigin: true, pathRewrite: { [route.path]: '/health' } }));
}

// ── 404 Fallback ───────────────────────────────────

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'Route not found',
    statusCode: 404,
  });
});

// ── Start Server ───────────────────────────────────

app.listen(PORT, () => {
  logger.info({ port: PORT, routes: routes.length }, 'API Gateway is running');
});
