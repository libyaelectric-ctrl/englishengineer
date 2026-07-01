# EngineerOS Closed Beta Analytics Plan

## Principle

Collect only anonymous product metrics needed to validate the closed beta. Do not collect unnecessary personal information.

## Implemented Local Metrics

- Daily Active Users signal
- Weekly Active Users signal
- Mission completion rate signal
- Writing completion rate signal
- Listening completion rate signal
- Speaking completion rate signal
- Vocabulary completion rate signal
- Average session duration signal
- Average missions per session signal
- Drop-off screens
- Most used features
- Least used features
- Retention indicators

## Implementation

The local beta analytics layer is implemented in:

```text
src/features/beta/
  beta.types.ts
  beta.helpers.ts
  beta.service.ts
  beta.store.ts
  BetaAnalyticsTracker.tsx
```

Events are local-only and stored through the existing storage wrapper.

## Future Backend Analytics

Production analytics should add:

- Consent controls
- Server-side aggregation
- User deletion support
- Export support
- Event schema versioning
- Environment separation
- PII filtering

## Limitations

Local analytics cannot prove true multi-device retention, cohort retention or DAU/WAU across users. Closed beta coordinators should combine app signals with interviews and survey data.
