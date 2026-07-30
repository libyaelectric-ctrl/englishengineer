# Data Dictionary

## User Management

### User ID

- **Type:** UUID
- **Source:** Supabase Auth (auth.users.id)
- **Format:** Standard UUID v4
- **Example:** `550e8400-e29b-41d4-a716-446655440000`

### Display Name

- **Type:** Text
- **Length:** 2-100 characters
- **Allowed:** Letters, numbers, spaces, hyphens, underscores
- **Example:** `John Engineer`

### Email

- **Type:** Text
- **Format:** RFC 5322 compliant
- **Uniqueness:** Guaranteed by Supabase Auth
- **Example:** `john@engineering.com`

## Learning Data

### CEFR Level

- **Type:** Text
- **Allowed Values:** A1, A2, B1, B2, C1, C2
- **Description:** Common European Framework of Reference for Languages
- **Example:** `B2`

### Spaced Repetition Quality

- **Type:** Integer
- **Range:** 0-5
- **Meaning:**
  - 0: Complete blackout
  - 1: Incorrect response
  - 2: Incorrect response, but remembered
  - 3: Correct with hesitation
  - 4: Correct with thought
  - 5: Perfect recall

### Vocabulary Status

- **Type:** Text
- **Allowed Values:** new, learning, mastered, struggling
- **Transitions:**
  - new → learning (first review)
  - learning → mastered (3+ correct)
  - learning → struggling (2+ incorrect)
  - mastered → struggling (1 incorrect)

## Billing Data

### Plan ID

- **Type:** Text
- **Allowed Values:** free, pro, team, enterprise
- **Features by Plan:**
  - free: 3 AI requests/day, basic vocabulary
  - pro: Unlimited AI, all features
  - team: Team analytics, admin
  - enterprise: Custom, SSO, SLA

### Subscription Status

- **Type:** Text
- **Allowed Values:** active, canceled, past_due, trialing, unpaid
- **Stripe Mapping:** Maps to Stripe subscription.status

### Stripe Customer ID

- **Type:** Text
- **Format:** `cus_` prefix + alphanumeric
- **Example:** `cus_1234567890abcdef`

## Content Data

### Difficulty Level

- **Type:** Text
- **Allowed Values:** beginner, intermediate, advanced
- **Usage:** Filters content by user level

### Content Type

- **Type:** Text
- **Allowed Values:** vocabulary, grammar, listening, reading, writing, speaking
- **Usage:** Routes content to appropriate handlers

### Exercise Status

- **Type:** Text
- **Allowed Values:** not_started, in_progress, completed
- **Usage:** Tracks user progress through exercises

## Audit Data

### Action Type

- **Type:** Text
- **Common Values:**
  - auth.login, auth.logout, auth.signup
  - billing.subscribe, billing.cancel
  - content.create, content.update, content.delete
  - team.create, team.join, team.leave
- **Usage:** Categorizes audit log entries

### Resource Type

- **Type:** Text
- **Common Values:** user, team, organization, content, billing
- **Usage:** Identifies what was affected

### Metadata

- **Type:** JSONB
- **Structure:** Flexible key-value pairs
- **Example:** `{"ip": "192.168.1.1", "userAgent": "Mozilla/5.0"}`

## Timestamps

### created_at

- **Type:** timestamptz
- **Default:** now()
- **Usage:** Record creation time

### updated_at

- **Type:** timestamptz
- **Default:** now()
- **Usage:** Last modification time

### reviewed_at

- **Type:** timestamptz
- **Usage:** Learning review timestamp
- **Index:** Used for spaced repetition scheduling
