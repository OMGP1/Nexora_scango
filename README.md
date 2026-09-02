# 🛒 ScanGo — Smart Self-Scanning Checkout System

Enterprise-grade web application enabling customers to scan products with their smartphone as they shop, view a live running bill, and complete fast checkout with AI-assisted verification.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌─────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │ Customer App │  │ Associate Console│  │ Admin Portal  │  │
│  │  (PWA :5173) │  │     (:5174)      │  │   (:5175)     │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────┬────────┘  │
└─────────┼───────────────────┼───────────────────┼────────────┘
          │                   │                   │
          └───────────────────┼───────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   API Gateway     │
                    │     (:3000)       │
                    └─────────┬─────────┘
                              │
     ┌─────────┬──────┬───────┼───────┬──────┬──────────┐
     ▼         ▼      ▼       ▼       ▼      ▼          ▼
 Identity  Session  Catalog  Cart  Payment Verify  + 5 more
 (:3001)  (:3002)  (:3003) (:3004) (:3007) (:3006)  services
     │         │      │       │       │      │
     ▼         ▼      ▼       ▼       ▼      ▼
 PostgreSQL  Redis  MongoDB  Kafka  MinIO  OpenSearch
```

## Prerequisites

- **Node.js** ≥ 20.0.0
- **npm** ≥ 10.0.0
- **Docker** & **Docker Compose** (for infrastructure services)

## Quick Start

```bash
# 1. Clone and enter the project
cd scango

# 2. Copy environment variables
cp .env.example .env

# 3. Start infrastructure (PostgreSQL, Redis, MongoDB, Kafka, OpenSearch, MinIO)
docker compose up -d

# 4. Install dependencies
npm install

# 5. Start all services in development mode
npm run dev
```

## Service Port Map

| Service              | Port | Type       |
|---------------------|------|------------|
| API Gateway         | 3000 | Proxy      |
| Identity Service    | 3001 | NestJS     |
| Session Service     | 3002 | NestJS     |
| Catalog Service     | 3003 | NestJS     |
| Cart Service        | 3004 | NestJS     |
| Inventory Service   | 3005 | NestJS     |
| Verification Service| 3006 | NestJS     |
| Payment Service     | 3007 | NestJS     |
| Promo Service       | 3008 | NestJS     |
| Notification Service| 3009 | NestJS     |
| Audit Service       | 3010 | NestJS     |
| Analytics Service   | 3011 | NestJS     |
| Customer App        | 5173 | React/Vite |
| Associate Console   | 5174 | React/Vite |
| Admin Portal        | 5175 | React/Vite |

## Infrastructure Ports

| Service      | Port      |
|-------------|-----------|
| PostgreSQL  | 5432      |
| Redis       | 6379      |
| MongoDB     | 27017     |
| Kafka       | 9092      |
| OpenSearch  | 9200      |
| MinIO API   | 9000      |
| MinIO Console| 9001     |

## Project Structure

```
scango/
├── apps/                       # Frontend applications
│   ├── customer-app/           # Shopper PWA (React + Vite)
│   ├── associate-console/      # Staff/LP console (React + Vite)
│   └── admin-portal/           # Enterprise admin (React + Vite)
├── services/                   # Backend microservices
│   ├── api-gateway/            # Reverse proxy & auth enforcement
│   ├── identity-service/       # Auth, RBAC, user management
│   ├── session-service/        # Session lifecycle
│   ├── catalog-service/        # Product catalog (MongoDB)
│   ├── cart-service/           # Cart & billing engine
│   ├── inventory-service/      # Inventory sync (Kafka consumer)
│   ├── verification-service/   # AI verification & risk scoring
│   ├── payment-service/        # Payment orchestration
│   ├── promo-service/          # Promotions & loyalty
│   ├── notification-service/   # In-app & SMS/push notifications
│   ├── audit-service/          # Immutable audit log
│   └── analytics-service/      # KPI aggregation & reporting
├── packages/                   # Shared libraries
│   ├── common/                 # Types, errors, logger, config, utils
│   ├── db/                     # PostgreSQL pool & migration runner
│   ├── redis/                  # Redis client factory
│   ├── kafka/                  # Kafka producer/consumer wrappers
│   ├── test-utils/             # Shared test helpers
│   └── ui/                     # React component library & design system
├── infra/                      # Database init scripts
├── scripts/                    # Scaffold & utility scripts
├── docker-compose.yml          # Local infrastructure
├── turbo.json                  # Turborepo pipeline config
└── .github/workflows/ci.yml   # CI pipeline
```

## Available Commands

```bash
npm run dev          # Start all services + apps in dev mode
npm run build        # Build all packages
npm run lint         # Lint all packages
npm run typecheck    # Type-check all packages
npm run test         # Run all unit tests
npm run docker:up    # Start infrastructure containers
npm run docker:down  # Stop infrastructure containers
npm run db:migrate   # Run database migrations (all services)
npm run seed         # Seed development data (all services)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, PWA |
| Backend | NestJS (TypeScript), Express |
| Databases | PostgreSQL 16, MongoDB 7, Redis 7 |
| Event Bus | Apache Kafka (KRaft) |
| Search | OpenSearch 2.x |
| Object Storage | MinIO (S3-compatible) |
| Monorepo | Turborepo + npm workspaces |
| CI/CD | GitHub Actions |

## Documentation

- [PRD/TRD Specification](../Smart_Self_Scanning_Checkout_System.md)
- [Implementation Plan](../ScanGo_Implementation_Plan.md)

---

Built with ❤️ by the ScanGo Engineering Team
