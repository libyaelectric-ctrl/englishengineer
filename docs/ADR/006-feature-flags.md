# ADR-006: Config-Based Feature Flag System

## Status
Accepted

## Context
EngineerOS needs a mechanism to safely roll out new features, run A/B tests, and control feature availability by environment without code deployments.

## Decision
Implement a simple config-based feature flag system in `src/shared/feature-flags/`.

## Rationale

| Approach | Pros | Cons | Decision |
|----------|------|------|----------|
| Config-based (chosen) | Simple, no external deps, fast | Manual updates | ✅ |
| LaunchDarkly | Advanced targeting, analytics | Cost, vendor lock-in | ❌ |
| Unleash | Open source, self-hosted | Ops overhead | ❌ |
| Environment variables | Simple | No runtime override | ❌ |

## Consequences

### Positive
- Zero external dependencies
- Deterministic user bucketing for A/B tests
- Environment-aware flag evaluation
- Rollout percentage support

### Negative
- Requires code change to update flags
- No advanced targeting (geo, device, etc.)
- No built-in analytics

## Implementation

```typescript
// src/shared/feature-flags/featureFlags.ts
export function isFeatureEnabled(flag: FeatureFlag): boolean {
  // Environment + rollout percentage logic
}
```

## Future Considerations

- Migrate to LaunchDarkly or Unleash when team grows
- Add analytics tracking for flag usage
- Implement user segment targeting

## References
- [Feature Flags Module](../../src/shared/feature-flags/)
- [TD-014: Implement Feature Flags](../TECH_DEBT.md)

## Date
2026-07-27
