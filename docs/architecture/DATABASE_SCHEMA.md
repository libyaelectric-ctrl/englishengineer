# Database Schema

## Overview

PostgreSQL database managed by Supabase with Row Level Security (RLS).

## Tables

### Core Tables

#### profiles
User profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | User ID (references auth.users) |
| display_name | text | User's display name |
| avatar_url | text | Profile picture URL |
| discipline | text | Engineering discipline |
| study_time_minutes | integer | Daily study goal |
| created_at | timestamptz | Account creation time |
| updated_at | timestamptz | Last profile update |

#### user_settings
User preferences and settings.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (PK) | User ID |
| theme | text | UI theme (light/dark) |
| language | text | Preferred language |
| notifications_enabled | boolean | Email notifications |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

### Learning Tables

#### vocabulary_reviews
Vocabulary learning progress.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Review ID |
| user_id | uuid (FK) | User ID |
| vocabulary_id | text | Vocabulary item ID |
| correct | boolean | Whether answer was correct |
| quality | integer | Quality of response (0-5) |
| spaced_repetition | jsonb | SRS algorithm data |
| reviewed_at | timestamptz | Review timestamp |

#### grammar_progress
Grammar lesson progress.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Progress ID |
| user_id | uuid (FK) | User ID |
| rule_id | text | Grammar rule ID |
| status | text | learning/learned/mastered |
| correct_count | integer | Correct answers |
| fail_count | integer | Failed attempts |
| last_practiced_at | timestamptz | Last practice time |

#### assessment_snapshots
Placement test results.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Snapshot ID |
| user_id | uuid (FK) | User ID |
| level | text | CEFR level |
| score | integer | Test score |
| created_at | timestamptz | Test completion time |

### Billing Tables

#### subscription_status
User subscription information.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (PK) | User ID |
| plan_id | text | Current plan |
| status | text | Subscription status |
| stripe_customer_id | text | Stripe customer ID |
| stripe_subscription_id | text | Stripe subscription ID |
| current_period_end | timestamptz | Billing period end |
| cancel_at_period_end | boolean | Cancel scheduled |
| topup_credits | integer | Extra AI credits |
| updated_at | timestamptz | Last update |

#### billing_customers
Stripe customer mapping.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid (PK) | User ID |
| stripe_customer_id | text | Stripe customer ID |
| billing_email | text | Billing email |
| created_at | timestamptz | Creation time |
| updated_at | timestamptz | Last update |

#### stripe_processed_events
Webhook event deduplication.

| Column | Type | Description |
|--------|------|-------------|
| event_id | text (PK) | Stripe event ID |
| processed_at | timestamptz | Processing time |

### Content Tables

#### listening_content
Listening exercise content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Content ID |
| level | text | CEFR level |
| title | text | Exercise title |
| audio_url | text | Audio file URL |
| transcript | text | Full transcript |
| created_at | timestamptz | Creation time |

#### reading_content
Reading exercise content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Content ID |
| level | text | CEFR level |
| title | text | Article title |
| content | text | Full text |
| created_at | timestamptz | Creation time |

### Organization Tables

#### organizations
Team/company organizations.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Organization ID |
| name | text | Organization name |
| slug | text | URL-friendly name |
| owner_id | uuid (FK) | Owner user ID |
| plan | text | Organization plan |
| created_at | timestamptz | Creation time |

#### organization_members
Organization membership.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Membership ID |
| org_id | uuid (FK) | Organization ID |
| user_id | uuid (FK) | User ID |
| role | text | owner/admin/member |
| joined_at | timestamptz | Join time |

### Audit Tables

#### audit_logs
System audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid (PK) | Log ID |
| user_id | uuid (FK) | User ID |
| action | text | Action performed |
| resource_type | text | Resource type |
| resource_id | text | Resource ID |
| metadata | jsonb | Additional data |
| created_at | timestamptz | Action time |

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_vocabulary_reviews_user ON vocabulary_reviews(user_id, reviewed_at DESC);
CREATE INDEX idx_grammar_progress_user ON grammar_progress(user_id, status);
CREATE INDEX idx_subscription_status_user ON subscription_status(user_id, status);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_assessment_snapshots_user ON assessment_snapshots(user_id, created_at DESC);
```

## Row Level Security (RLS)

All tables have RLS enabled with policies:

- Users can only read/write their own data
- Organization members can read shared data
- Service role has full access for backend operations

## Migrations

Migrations are in `supabase/migrations/` directory. Always:
1. Create migration with timestamp prefix
2. Test locally before applying
3. Verify RLS policies are correct
