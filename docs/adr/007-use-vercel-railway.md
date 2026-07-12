# ADR-007: Use Vercel + Railway for Deployment

## Status

Accepted

## Context

EngineerOS needs a deployment platform for frontend and backend.

## Decision

Use Vercel for frontend and Railway for backend, providing:

- Automatic deployments
- Preview environments
- Custom domains
- SSL certificates

## Consequences

### Positive

- Zero-config deployments
- Automatic scaling
- Preview environments for PRs
- Built-in SSL

### Negative

- Vendor lock-in
- Costs scale with usage
- Limited control over infrastructure
- Potential cold start issues

## Alternatives Considered

1. **AWS:** Rejected due to complexity
2. **Heroku:** Rejected due to pricing changes
3. **DigitalOcean:** Rejected due to limited features

## References

- Vercel Documentation
- Railway Documentation
