# ADR-001: Use Supabase as Primary Backend

## Status

Accepted

## Context

EngineerOS needs a backend-as-a-service for authentication, database, and real-time features.

## Decision

Use Supabase as the primary backend platform, providing:

- PostgreSQL database
- Authentication (email, OAuth)
- Row Level Security (RLS)
- Real-time subscriptions
- Storage (for future use)

## Consequences

### Positive

- Rapid development with built-in auth
- RLS for data security without custom middleware
- PostgreSQL power with SQL access
- Managed infrastructure (no DevOps for DB)

### Negative

- Vendor lock-in to Supabase
- Limited customization of auth flow
- Costs scale with usage
- Dependency on Supabase uptime

## Alternatives Considered

1. **Firebase:** Rejected due to NoSQL limitations
2. **Custom PostgreSQL:** Rejected due to higher maintenance burden
3. **AWS Amplify:** Rejected due to complexity

## References

- Supabase Documentation
- PostgreSQL Documentation
