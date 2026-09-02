# ScanGo Rollback Runbook

This document details the procedures for rolling back components of the ScanGo system in the event of a critical failure during or after the pilot deployment.

## 1. Feature Flag Rollback (Disable Self-Scan)

If a critical issue occurs that impacts the customer experience or poses a significant LP risk, the fastest remediation is to disable self-scan for the store.

**Procedure:**
1. Access the `scango_identity` database.
2. Execute the following query:
   ```sql
   UPDATE stores
   SET config_flags = jsonb_set(config_flags, '{self_scan_enabled}', 'false'::jsonb)
   WHERE store_id = 'STORE_001';
   ```
3. The Identity Service will serve this flag to the frontend on the next session start, gracefully blocking new sessions.

## 2. Service Deployment Rollback

If a new version of a microservice introduces a regression, roll back the Kubernetes deployment to the previous stable tag.

**Procedure:**
1. Identify the failing deployment: `kubectl get deployments`
2. Rollback using `kubectl rollout undo`:
   ```bash
   kubectl rollout undo deployment/<service-name>
   ```
3. Monitor the rollout status:
   ```bash
   kubectl rollout status deployment/<service-name>
   ```

## 3. Database Restore

In the event of data corruption, a restore from the latest automated snapshot is required.

**Procedure (PostgreSQL):**
1. Locate the latest `pg_dump` backup file in the S3 backup bucket.
2. Stop the application services (or scale deployments to 0) to prevent writes during restore:
   ```bash
   kubectl scale deployment --all --replicas=0
   ```
3. Drop and recreate the corrupted database (e.g., `scango_cart`).
4. Restore using `pg_restore`:
   ```bash
   pg_restore -U scango -d scango_cart -1 backup.dump
   ```
5. Scale the deployments back up to 1.

## 4. Fallback to Assisted Checkout

If the entire ScanGo system is unresponsive (e.g., major network partition):
1. Store staff should direct all active ScanGo customers to the dedicated Assisted Checkout lanes.
2. Associates should apologize for the inconvenience and rescan the physical items at the POS.
3. No action is required in the ScanGo system as abandoned sessions will automatically expire after 60 minutes, releasing any soft-reserved inventory.
