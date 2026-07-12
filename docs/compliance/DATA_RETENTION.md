# Data Retention Policy

## 1. Purpose
This policy outlines how long EngineerOS stores different types of data to comply with GDPR, KVKK, and efficient database management practices, while respecting user privacy.

## 2. Retention Schedules

### 2.1. Active User Data
- **Description:** Profiles, vocabulary progress, AI conversation history.
- **Retention Period:** Kept indefinitely as long as the user account remains active.

### 2.2. Deleted Accounts (Soft vs. Hard Delete)
- **Soft Deletion:** When a user deletes their account, their PII (Personally Identifiable Information) is obfuscated, and `is_deleted` is flagged in the database.
- **Hard Deletion:** 30 days post-deletion request, a background job permanently erases the user's data from active tables.

### 2.3. Audit Logs and Activity Timelines
- **Description:** Auth logs, sign-in attempts, administrative actions.
- **Retention Period:** 1 Year. After 365 days, audit logs are rotated out of the primary transactional database and archived in cold storage if necessary for compliance, or permanently deleted.

### 2.4. Payment and Billing Data
- **Description:** Subscription history, invoice metadata (Processed via Stripe).
- **Retention Period:** 7 Years to comply with financial reporting laws. Note: EngineerOS does not store raw credit card numbers. All PCI-DSS compliance is delegated to Stripe.

## 3. Data Disposal Protocol
Data surpassing its retention schedule will be securely destroyed. For database records, this means a permanent `DELETE` command that cascades through foreign keys, ensuring no orphaned PII remains.
