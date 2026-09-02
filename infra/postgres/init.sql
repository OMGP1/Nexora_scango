-- =====================================================
-- ScanGo — PostgreSQL Initialization Script
-- Creates all service-specific databases
-- =====================================================

CREATE DATABASE scango_identity;
CREATE DATABASE scango_sessions;
CREATE DATABASE scango_cart;
CREATE DATABASE scango_payments;
CREATE DATABASE scango_audit;
CREATE DATABASE scango_inventory;
CREATE DATABASE scango_verification;
CREATE DATABASE scango_promo;
CREATE DATABASE scango_analytics;

-- Grant full privileges to the scango user on all databases
GRANT ALL PRIVILEGES ON DATABASE scango_identity TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_sessions TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_cart TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_payments TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_audit TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_inventory TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_verification TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_promo TO scango;
GRANT ALL PRIVILEGES ON DATABASE scango_analytics TO scango;
