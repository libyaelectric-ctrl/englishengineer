# Data Retention Policy

## Overview

This policy defines how EngineerOS handles user data retention, deletion, and privacy compliance in accordance with GDPR and KVKK regulations.

## Data Categories and Retention Periods

### User Account Data

| Data Type | Retention | Deletion Method | Legal Basis |
|-----------|-----------|-----------------|-------------|
| User profile (name, email) | Account lifetime + 30 days | Automated purge | Contract |
| Authentication data | Account lifetime + 30 days | Automated purge | Contract |
| User preferences | Account lifetime + 30 days | Automated purge | Contract |

### Learning Data

| Data Type | Retention | Deletion Method | Legal Basis |
|-----------|-----------|-----------------|-------------|
| Vocabulary progress | Account lifetime + 30 days | Automated purge | Contract |
| Grammar exercises | Account lifetime + 30 days | Automated purge | Contract |
| AI conversation history | 90 days | Automated purge | Legitimate interest |
| Writing submissions | Account lifetime + 30 days | Automated purge | Contract |

### Billing Data

| Data Type | Retention | Deletion Method | Legal Basis |
|-----------|-----------|-----------------|-------------|
| Subscription records | 7 years | Manual review | Legal obligation |
| Payment receipts | 7 years | Manual review | Legal obligation |
| Invoice data | 7 years | Manual review | Legal obligation |

### System Data

| Data Type | Retention | Deletion Method | Legal Basis |
|-----------|-----------|-----------------|-------------|
| Audit logs | 1 year | Automated purge | Legitimate interest |
| Error logs | 90 days | Automated purge | Legitimate interest |
| Performance metrics | 90 days | Automated purge | Legitimate interest |

## Automated Data Deletion

### Account Deletion Process

When a user requests account deletion:

1. **Immediate:**
   - Disable account (soft delete)
   - Remove from active queries

2. **Within 7 days:**
   - Delete user profile
   - Delete learning data
   - Delete AI conversation history
   - Delete workspace data

3. **Within 30 days:**
   - Purge from backups (next backup cycle)
   - Remove from audit logs (anonymize)

4. **Retained (legal obligation):**
   - Billing records (7 years)
   - Payment receipts (7 years)

### Implementation

```sql
-- Soft delete user
UPDATE auth.users SET 
  raw_app_meta_data = raw_app_meta_data || '{"deleted": true}'::jsonb,
  deleted_at = NOW()
WHERE id = 'user_id';

-- Schedule hard delete (7 days later)
-- Use pg_cron or application-level scheduler
```

## User Rights (GDPR/KVKK)

### Right to Access
Users can request a copy of their data:
- **Endpoint:** `GET /api/user/data-export`
- **Response:** JSON file with all user data
- **Timeline:** Within 30 days

### Right to Rectification
Users can update their data:
- **Endpoint:** `PUT /api/user/profile`
- **Immediate:** Updates applied

### Right to Erasure
Users can request data deletion:
- **Endpoint:** `DELETE /api/user/account`
- **Timeline:** Completed within 30 days
- **Exceptions:** Billing data retained for legal compliance

### Right to Portability
Users can export their data:
- **Endpoint:** `GET /api/user/data-export`
- **Format:** JSON (machine-readable)

## Data Processing Agreement

### Third-Party Processors

| Processor | Purpose | Location | DPA Status |
|-----------|---------|----------|------------|
| Supabase | Database hosting | EU/US | Signed |
| Stripe | Payment processing | US (EU office) | Signed |
| Vercel | Frontend hosting | Global | Signed |
| Railway | Backend hosting | US | Signed |
| Anthropic | AI services | US | Signed |
| Upstash | Rate limiting | Global | Signed |

### Data Transfer Mechanisms

- **EU-US:** Standard Contractual Clauses (SCCs)
- **Encryption:** TLS 1.3 in transit, AES-256 at rest
- **Access control:** Role-based access with audit logging

## Compliance Checklist

- [ ] Privacy policy published
- [ ] Cookie consent implemented
- [ ] Data processing agreements signed
- [ ] Data export functionality implemented
- [ ] Account deletion functionality implemented
- [ ] Audit logging active
- [ ] Encryption at rest enabled
- [ ] Encryption in transit enforced
- [ ] Access controls implemented
- [ ] Incident response plan documented

## Monitoring and Auditing

### Quarterly Reviews
- Review data retention compliance
- Verify deletion procedures
- Update policy as needed
- Document any changes

### Annual Audit
- Full compliance audit
- Third-party review (if required)
- Update privacy policy
- Train team on changes

## Contact

For data protection inquiries:
- **Email:** privacy@engineeros.app
- **Response time:** Within 72 hours
