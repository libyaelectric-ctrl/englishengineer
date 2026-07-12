# Data Flow Diagram

## Overview

This document shows how data flows through EngineerOS for key user journeys.

## User Registration Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Supabase
    participant Stripe as Stripe

    U->>F: Sign up with email
    F->>S: createUser(email, password)
    S-->>F: User created
    F->>B: POST /api/billing/create-checkout-session
    B->>Stripe: Create checkout session
    Stripe-->>B: Session URL
    B-->>F: { url: session.url }
    F->>U: Redirect to Stripe
    U->>Stripe: Complete payment
    Stripe->>B: webhook: checkout.session.completed
    B->>S: upsertSubscriptionStatus()
    B-->>Stripe: 200 OK
```

## AI Coaching Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant R as Upstash
    participant A as Anthropic
    participant S as Supabase

    U->>F: Send message
    F->>B: POST /api/ai/coach
    B->>R: Check rate limit
    R-->>B: Allowed
    B->>S: Get subscription status
    S-->>B: { planId: 'pro', aiUsed: 5 }
    B->>B: Check AI quota
    B->>A: Send prompt
    A-->>B: AI response
    B->>S: Increment AI usage
    B-->>F: { response: '...' }
    F-->>U: Display response
```

## Vocabulary Practice Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Supabase

    U->>F: Practice vocabulary
    F->>B: POST /api/vocabulary/lookup
    B->>R: Check rate limit
    R-->>B: Allowed
    B->>S: Get vocabulary data
    S-->>B: { word: '...', definition: '...' }
    B-->>F: { word, definition, examples }
    F-->>U: Display vocabulary

    U->>F: Mark as known/unknown
    F->>S: Update vocabulary_progress
    S-->>F: Updated
```

## Subscription Management Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant S as Supabase
    participant Stripe as Stripe

    U->>F: View subscription
    F->>B: GET /api/billing/subscription-status
    B->>S: getSubscriptionStatus(userId)
    S-->>B: { planId, status, ... }
    B-->>F: { subscription }
    F-->>U: Display subscription

    U->>F: Upgrade plan
    F->>B: POST /api/billing/create-checkout-session
    B->>Stripe: Create checkout session
    Stripe-->>B: Session URL
    B-->>F: { url }
    F->>U: Redirect to Stripe
    U->>Stripe: Complete payment
    Stripe->>B: webhook: customer.subscription.updated
    B->>S: upsertSubscriptionStatus()
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant Sentry as Sentry

    U->>F: Trigger error
    F->>B: API call fails
    B->>B: Catch error
    B->>Sentry: captureException(error)
    B-->>F: { error: { code, message } }
    F-->>U: Display error message
    F->>F: Log to console
```

## Data Storage Patterns

| Data Type | Storage | Backup | Retention |
|-----------|---------|--------|-----------|
| User profiles | Supabase | Daily | Account lifetime |
| Subscriptions | Supabase | Daily | 7 years (billing) |
| Vocabulary progress | Supabase | Daily | Account lifetime |
| AI conversations | Supabase | Daily | 90 days |
| Audit logs | Supabase | Daily | 1 year |
| Rate limit counters | Upstash | None | 24 hours |
