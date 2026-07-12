# ADR-003: Use Stripe for Billing

## Status

Accepted

## Context

EngineerOS needs a payment processing system for subscriptions and one-time purchases.

## Decision

Use Stripe as the payment processor, providing:

- Subscription management
- Checkout sessions
- Webhook handling
- Customer portal

## Consequences

### Positive

- Industry-standard payment processing
- Excellent developer experience
- Built-in subscription management
- Strong security and compliance

### Negative

- Transaction fees (2.9% + $0.30)
- Vendor lock-in
- Complex webhook handling
- International tax compliance burden

## Alternatives Considered

1. **Paddle:** Rejected due to higher fees
2. **Lemon Squeezy:** Rejected due to limited features
3. **Custom payment:** Rejected due to PCI compliance burden

## References

- Stripe Documentation
- Stripe Billing Guide
