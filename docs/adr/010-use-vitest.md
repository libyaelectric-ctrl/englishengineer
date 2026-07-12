# ADR-010: Use Vitest for Testing

## Status

Accepted

## Context

EngineerOS needs a fast, modern testing framework.

## Decision

Use Vitest as the testing framework, providing:
- Fast test execution
- Vite integration
- TypeScript support
- Jest-compatible API

## Consequences

### Positive
- Excellent Vite integration
- Fast test execution
- TypeScript support out of the box
- Jest-compatible (easy migration)

### Negative
- Newer than Jest (less mature)
- Smaller ecosystem
- Potential compatibility issues

## Alternatives Considered

1. **Jest:** Rejected due to slower execution
2. **Mocha:** Rejected due to less modern features
3. **AVA:** Rejected due to smaller ecosystem

## References

- Vitest Documentation
