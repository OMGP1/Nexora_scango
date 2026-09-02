# Pilot Store Configuration

This document outlines the configuration parameters for the Phase 1 Pilot deployment of ScanGo at the Pilot Hypermarket (STORE_001).

## Store Identification
- **Store ID**: STORE_001
- **Name**: ScanGo Pilot Hypermarket
- **Region**: North
- **Timezone**: Asia/Kolkata

## Feature Flags
- `self_scan_enabled`: **true** (Only enabled for this specific store)

## Verification & Loss Prevention (LP)
During the pilot, we are operating with conservative verification thresholds to maximize data gathering and minimize potential shrink.

- **Green Tier (Low Risk)**: score <= 0.2
- **Amber Tier (Medium Risk)**: 0.2 < score <= 0.5
- **Red Tier (High Risk)**: score > 0.5
- **Random Sampling Rate**: 20% (0.20)

*Note: These are significantly tighter than the expected production thresholds (Green: < 20, Amber: < 80) to ensure high visibility for LP associates during the pilot.*

## Operational Parameters
- **Session Timeout**: 60 minutes
- **Operating Hours**: 08:00 - 22:00

## Contact
For any configuration changes during the pilot, escalate to the Engineering Ops team.
