# ScanGo - Smart Self-Scanning Checkout System
## Detailed Feature Flow & Research Document

**Date:** September 2026
**Purpose:** This document serves as a comprehensive, structured breakdown of the ScanGo platform as implemented. It details the precise feature flows across all three frontend applications and the underlying microservices architecture. It is designed to be used for research, onboarding, and architectural reference.

---

## 1. System Architecture & Tech Stack Summary

The ScanGo platform is built as a cloud-native, event-driven ecosystem. 
- **Frontend Apps:** Built with React 18, Vite, and TypeScript. They act as PWAs for seamless mobile experiences.
- **Backend Services:** Built with NestJS (TypeScript) utilizing a microservices pattern.
- **Databases:** PostgreSQL (transactional), MongoDB (catalog documents), Redis (session/cart state cache).
- **Event Bus:** Apache Kafka for asynchronous processing (inventory soft-reserves, audits, analytics).
- **Proxy:** API Gateway (Kong/Express) for AuthN/Z and routing.

---

## 2. Core Feature Flows (Structured Application Breakdown)

### 2.1 Customer App Flow (The Shopper Journey)
*Target Users: Store Customers*

1. **Entry & Onboarding (`EntryPage.tsx`, `LoginPage.tsx`)**
   - **QR Scan Initiation:** The user scans a QR code at the store entrance to trigger the web app without needing an app store download.
   - **Authentication:** Users can log in using Firebase/Identity service or proceed as a guest.
   - **Session Creation:** A unique `session_id` is created in Redis, mapping the device fingerprint, store ID, and timestamp.

2. **Scanning & Shopping (`ScanPage.tsx`)**
   - **Camera Integration:** Uses HTML5 camera API (`html5-qrcode`) to scan barcodes in real-time.
   - **Product Lookup:** The barcode is sent to the `catalog-service` to retrieve pricing, tax, and age-restriction flags.
   - **Live Bill Updates:** The item is added to the `cart-service`. A soft reservation event is emitted to Kafka (`inventory-service`) to prevent overselling.

3. **Cart Management (`CartPage.tsx`)**
   - **Live Calculations:** Subtotal, applicable taxes (GST), and discounts are instantly re-calculated.
   - **Mutations:** Users can increment/decrement quantities or remove items (which releases the soft inventory reservation).
   - **Promotions:** Users can apply loyalty or coupon codes validated by the `promo-service`.

4. **Checkout & Payment (`CheckoutPage.tsx`)**
   - **Payment Orchestration:** Integration with the `payment-service` to handle UPI, Credit/Debit, or wallets.
   - **Finalization:** Upon success, a hard inventory decrement is executed.

5. **Risk Scoring & Exit Verification (`VerificationPage.tsx`, `ReceiptPage.tsx`)**
   - **AI Risk Assessment:** The `verification-service` analyzes basket value, velocity, and user trust score to assign an exit tier:
     - *Tier 1 (Green):* Digital receipt issued immediately.
     - *Tier 2 (Amber):* Prompted for AI Gate Check (camera/scale mismatch check).
     - *Tier 3 (Red):* High-risk/Age-restricted; flags nearest associate.
   - **Exit Pass:** A single-use Exit QR is generated for scanning at the physical gate.

---

### 2.2 Associate Console Flow (In-Store Operations)
*Target Users: Store Floor Associates, Loss Prevention (LP) Officers*

1. **Authentication (`LoginPage.tsx`)**
   - Staff login mapped to specific Store IDs with RBAC enforced.

2. **Live Floor View (`SessionsListPage.tsx`)**
   - **Real-time Monitoring:** Displays active shopper sessions on the floor.
   - **Color Coding:** Red (Assisted Verification needed), Amber (Gate Mismatch), Green (Scanning normally).

3. **Exception Management (`VerificationQueuePage.tsx`, `ScanAndVerifyPage.tsx`)**
   - **Held Sessions:** Associates receive alerts for Tier 3 customers or AI Gate mismatches.
   - **Handheld Verification:** The associate scans the customer's cart or digital receipt to cross-check items.
   - **Disposition:** Associates can *Clear* (approve exit) or *Escalate* (void transaction / log incident), demanding a mandatory reason code.

4. **Inventory Adjustments (`InventoryPage.tsx`)**
   - Live view of stock availability and recent soft-reserves.
   - Ability to manually override or sync items due to damage/shrinkage.

5. **Shift Dashboard (`DashboardPage.tsx`)**
   - Operational widgets showing peak hours, active queues, and exception rates.

---

### 2.3 Admin Portal Flow (Enterprise Management)
*Target Users: Central IT, Merchandisers, Regional Managers*

1. **Enterprise Dashboard & System Health (`DashboardPage.tsx`, `SystemHealthPage.tsx`)**
   - **Analytics Rollup:** Aggregated KPIs including self-scan adoption rate, average checkout time reduction, and shrinkage alerts.
   - **Microservices Health:** Active monitoring of Kafka lags, DB connections, and API latency.

2. **Catalog & Pricing Central (`CatalogPage.tsx`)**
   - **Master Data:** CRUD operations on the central MongoDB product catalog.
   - **Propagations:** Price changes pushed instantly to active store caches.

3. **Store & Risk Configuration (`StoreConfigPage.tsx`)**
   - **Feature Flags:** Toggle self-scan on/off per store or during specific risk hours.
   - **Tiering Thresholds:** Dynamically adjust the AI Verification risk thresholds (e.g., forcing 20% random Tier 2 checks on weekends).

4. **Inventory Ledger (`InventoryPage.tsx`)**
   - Global view of physical versus systemic inventory discrepancies across the multi-store network.

---

## 3. Data & Interaction Models (Research Deep-Dive)

### 3.1 The "Soft-Reserve" Concurrency Model
To solve the race condition of multiple shoppers scanning the final unit of a high-demand SKU:
- **Scan Event:** `ItemScanned` -> `cart-service` adds to cart -> Publishes to Kafka.
- **Inventory Consumer:** `inventory-service` reads event, places a temporary "hold" lock in PostgreSQL for the session's duration.
- **Timeout/Removal:** If session expires (>30m) or user removes item, a `ReserveReleased` event frees the stock.
- **Purchase:** Payment confirms -> `ItemSold` event converts the soft-reserve to a hard ERP deduction.

### 3.2 Dynamic Risk Model (The Verification Engine)
To maintain shrinkage at `≤0.3%` while reducing labor by `40%`:
- **Inputs:** `customer_trust_score` (historical clean exits), `basket_anomaly_score` (rapid scanning, high-risk items like alcohol), and `store_randomization_rate`.
- **Output Matrix:** 
  - `Risk < 0.3` -> **Auto-Clear (Tier 1)**
  - `Risk 0.3 - 0.7` -> **Hardware Check (Tier 2)**
  - `Risk > 0.7` or `Age Restricted` -> **Human Override Required (Tier 3)**

### 3.3 Offline Resilience & State Sync
- The customer PWA leverages local `IndexedDB` caching for the cart state.
- If store Wi-Fi drops, the user can continue scanning.
- Upon reconnection, a synchronization payload is dispatched to `session-service` resolving timestamps via conflict-free logic (last-write-wins per item-line).

---
*End of Document. Used for architectural audits and enterprise deployment planning.*
