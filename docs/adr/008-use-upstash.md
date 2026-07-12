# ADR-008: Use Upstash for Rate Limiting

## Status

Accepted

## Context

EngineerOS needs a distributed rate limiting solution for API protection.

## Decision

Use Upstash Redis for rate limiting, providing:
- Serverless Redis
- Global distribution
- Pay-per-request pricing
- REST API

## Consequences

### Positive
- Serverless-friendly
- Global distribution
- Cost-effective for low traffic
- Easy integration

### Negative
- Vendor lock-in
- Latency for global users
- Limited Redis features
- Potential cold starts

## Alternatives Considered

1. **Redis Cloud:** Rejected due to pricing
2. **Memcached:** Rejected due to limited features
3. **In-memory:** Rejected due to scaling issues

## References

- Upstash Documentation
- Redis Rate Limiting Patterns
