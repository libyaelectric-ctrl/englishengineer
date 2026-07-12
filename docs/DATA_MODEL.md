# Data Model

## Overview

EngineerOS uses Supabase (PostgreSQL) as the primary database. This document describes the data model, relationships, and design decisions.

## Database Tables

### Core Tables

#### `subscription_status`

Stores user subscription and billing information.

| Column                   | Type        | Description                                      |
| ------------------------ | ----------- | ------------------------------------------------ |
| `user_id`                | uuid (PK)   | Supabase auth user ID                            |
| `plan_id`                | text        | Plan identifier (free, pro, team)                |
| `status`                 | text        | Subscription status (active, canceled, past_due) |
| `current_period_end`     | timestamptz | Current billing period end                       |
| `cancel_at_period_end`   | boolean     | Whether subscription cancels at period end       |
| `stripe_customer_id`     | text        | Stripe customer ID                               |
| `stripe_subscription_id` | text        | Stripe subscription ID                           |
| `updated_at`             | timestamptz | Last update timestamp                            |
| `source`                 | text        | Creation source (checkout, webhook, manual)      |
| `topup_credits`          | integer     | Additional AI credits from top-ups               |

#### `stripe_processed_events`

Idempotency tracking for Stripe webhooks.

| Column            | Type        | Description                                   |
| ----------------- | ----------- | --------------------------------------------- |
| `stripe_event_id` | text (PK)   | Stripe event ID                               |
| `event_type`      | text        | Event type (e.g., checkout.session.completed) |
| `processed_at`    | timestamptz | Processing timestamp                          |
| `metadata`        | jsonb       | Additional event metadata                     |

#### `workspaces`

User workspaces for organizing learning content.

| Column       | Type        | Description           |
| ------------ | ----------- | --------------------- |
| `id`         | uuid (PK)   | Workspace ID          |
| `user_id`    | uuid (FK)   | Owner user ID         |
| `name`       | text        | Workspace name        |
| `created_at` | timestamptz | Creation timestamp    |
| `updated_at` | timestamptz | Last update timestamp |

#### `audit_logs`

System audit trail for compliance and debugging.

| Column      | Type        | Description                                |
| ----------- | ----------- | ------------------------------------------ |
| `id`        | text (PK)   | Log entry ID                               |
| `timestamp` | timestamptz | Event timestamp                            |
| `user_id`   | text        | User who performed action                  |
| `action`    | text        | Action type                                |
| `details`   | jsonb       | Action details                             |
| `severity`  | text        | Log level (info, warning, error, critical) |

### Learning Data Tables

#### `vocabulary_progress`

Tracks vocabulary learning progress per user.

| Column            | Type        | Description                                          |
| ----------------- | ----------- | ---------------------------------------------------- |
| `user_id`         | uuid (PK)   | User ID                                              |
| `word`            | text (PK)   | Vocabulary word                                      |
| `status`          | text        | Learning status (new, learning, mastered, due_today) |
| `next_review_at`  | timestamptz | Next spaced repetition review                        |
| `correct_count`   | integer     | Correct answer count                                 |
| `incorrect_count` | integer     | Incorrect answer count                               |
| `created_at`      | timestamptz | First seen timestamp                                 |
| `updated_at`      | timestamptz | Last practice timestamp                              |

#### `ai_conversations`

Stores AI assistant conversation history.

| Column       | Type        | Description                 |
| ------------ | ----------- | --------------------------- |
| `id`         | uuid (PK)   | Conversation ID             |
| `user_id`    | uuid (FK)   | User ID                     |
| `messages`   | jsonb       | Conversation messages array |
| `created_at` | timestamptz | Conversation start          |
| `updated_at` | timestamptz | Last message timestamp      |

## Entity Relationship Diagram

```
┌─────────────────────┐
│      auth.users      │
│  (Supabase Auth)    │
└──────────┬──────────┘
           │
           │ 1:1
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│ subscription_status │      │   stripe_processed   │
│                    │      │       _events        │
│ - user_id (PK)     │      │ - stripe_event_id(PK)│
│ - plan_id          │      │ - event_type         │
│ - status           │      │ - processed_at       │
│ - stripe_*         │      │ - metadata           │
└─────────────────────┘      └─────────────────────┘

           │
           │ 1:N
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│     workspaces      │      │  vocabulary_progress │
│                    │      │                    │
│ - id (PK)          │      │ - user_id (PK)      │
│ - user_id (FK)     │      │ - word (PK)         │
│ - name             │      │ - status            │
└─────────────────────┘      │ - next_review_at    │
           │                 └─────────────────────┘
           │ 1:N
           ▼
┌─────────────────────┐      ┌─────────────────────┐
│   ai_conversations  │      │     audit_logs       │
│                    │      │                    │
│ - id (PK)          │      │ - id (PK)           │
│ - user_id (FK)     │      │ - timestamp         │
│ - messages         │      │ - user_id           │
│ - created_at       │      │ - action            │
└─────────────────────┘      │ - severity          │
                             └─────────────────────┘
```

## Row Level Security (RLS) Policies

### `subscription_status`

```sql
-- Users can read their own subscription
CREATE POLICY "Users read own subscription" ON subscription_status
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/update (webhook handler)
CREATE POLICY "Service role manages subscriptions" ON subscription_status
  FOR ALL USING (auth.role() = 'service_role');
```

### `workspaces`

```sql
-- Users can CRUD their own workspaces
CREATE POLICY "Users manage own workspaces" ON workspaces
  FOR ALL USING (auth.uid() = user_id);
```

### `audit_logs`

```sql
-- Only service role can write
CREATE POLICY "Service role writes audit logs" ON audit_logs
  FOR INSERT WITH CHECK (true);

-- Admin users can read
CREATE POLICY "Admins read audit logs" ON audit_logs
  FOR SELECT USING (
    auth.uid() = user_id OR
    auth.jwt()->>'role' = 'admin'
  );
```

## Design Decisions

1. **UUID Primary Keys:** Used for all user-facing tables to prevent ID enumeration attacks.

2. **Service Role for Webhooks:** Stripe webhooks use service role to bypass RLS, as webhook events don't have user context.

3. **Idempotent Upserts:** All writes use `ON CONFLICT` to prevent duplicate processing.

4. **JSONB for Flexible Data:** `messages` and `metadata` use JSONB for schema flexibility while maintaining query capability.

5. **Soft Deletes:** User account deletion uses soft delete to maintain referential integrity for billing records.

## Migration Strategy

- Migrations are managed via Supabase CLI
- All migrations are version-controlled in `supabase/migrations/`
- Zero-downtime migrations preferred
- Backward-compatible changes only

## Backup Considerations

- See [BACKUP_POLICY.md](./BACKUP_POLICY.md)
- Critical tables: `subscription_status`, `workspaces`, `vocabulary_progress`
- Audit logs retained for compliance
