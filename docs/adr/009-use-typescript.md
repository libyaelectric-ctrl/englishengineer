# ADR-009: Use TypeScript for Type Safety

## Status

Accepted

## Context

EngineerOS needs type safety for better developer experience and code quality.

## Decision

Use TypeScript for both frontend and backend, providing:
- Static type checking
- Better IDE support
- Refactoring safety
- Documentation through types

## Consequences

### Positive
- Catch errors at compile time
- Better code documentation
- Improved refactoring
- Enhanced IDE support

### Negative
- Learning curve
- Additional build step
- Slower compilation
- Potential type complexity

## Alternatives Considered

1. **JavaScript + JSDoc:** Rejected due to less type safety
2. **Flow:** Rejected due to declining adoption
3. **Reason:** Rejected due to smaller ecosystem

## References

- TypeScript Documentation
