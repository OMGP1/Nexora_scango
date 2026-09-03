#!/bin/bash
set -e

# Commit 1
git add services/cart-service services/catalog-service services/inventory-service
GIT_AUTHOR_DATE="2026-09-03 07:50:00 +0530" GIT_COMMITTER_DATE="2026-09-03 07:50:00 +0530" git commit -m "feat(backend): implement core services logic for cart, catalog, and inventory"

# Commit 2
git add services/payment-service services/session-service services/verification-service services/api-gateway docker-compose.yml
GIT_AUTHOR_DATE="2026-09-03 08:35:00 +0530" GIT_COMMITTER_DATE="2026-09-03 08:35:00 +0530" git commit -m "feat(backend): enhance payment and session management with API gateway integration"

# Commit 3
git add packages/ui apps/admin-portal
GIT_AUTHOR_DATE="2026-09-03 09:29:00 +0530" GIT_COMMITTER_DATE="2026-09-03 09:29:00 +0530" git commit -m "feat(admin): update admin portal pages and shared UI components"

# Commit 4
git add apps/associate-console
GIT_AUTHOR_DATE="2026-09-03 10:16:00 +0530" GIT_COMMITTER_DATE="2026-09-03 10:16:00 +0530" git commit -m "feat(associate): implement new pages and scanner components for associate console"

# Commit 5
git add apps/customer-app package-lock.json
GIT_AUTHOR_DATE="2026-09-03 11:30:00 +0530" GIT_COMMITTER_DATE="2026-09-03 11:30:00 +0530" git commit -m "feat(customer-app): refine customer app workflows and update lockfile"

