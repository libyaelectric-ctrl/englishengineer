# Backup Policy

## 1. Objective
To protect against data loss and ensure compliance with disaster recovery targets (RPO), EngineerOS enforces a strict automated backup policy across all persistent storage mediums.

## 2. Supabase (PostgreSQL) Backups
Our primary database is hosted on Supabase and follows their managed backup infrastructure:
- **Daily Automated Backups:** Full database snapshots are taken automatically every 24 hours.
- **Retention Period:** Backups are retained for 7 days (or 30 days depending on the pro plan) on a rolling basis.
- **Point-in-Time Recovery (PITR):** WAL (Write-Ahead Logging) is enabled, allowing restoration to any exact minute within the retention period.

## 3. Infrastructure & Source Code Backups
- All source code and Infrastructure as Code (IaC) templates are hosted on GitHub.
- Any change is strictly version-controlled.
- Code repositories are replicated across GitHub's global infrastructure.

## 4. Testing Backups
- **Frequency:** Quarterly (Once every 3 months).
- **Process:** Engineering will restore a recent database snapshot to an isolated staging environment and run an automated script (`npm run verify:learning-data`) to ensure data integrity and usability.
- **Logging:** Restoration tests will be logged in `docs/compliance/restore_tests.md`.
