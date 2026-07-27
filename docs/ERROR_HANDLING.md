# Error Handling Migration Guide

## Overview

EngineerOS is migrating to a standardized error handling system using `AppError` class and centralized error codes.

## Current Status

| Component | Status | Migration Date |
|-----------|--------|----------------|
| `src/shared/errors/` | ✅ Complete | 2026-07-27 |
| `AppError` class | ✅ Complete | 2026-07-27 |
| Error codes registry | ✅ Complete | 2026-07-27 |
| Auth errors | 🟡 In Progress | TBD |
| API errors | 🟡 In Progress | TBD |
| AI errors | 🟡 In Progress | TBD |
| Billing errors | 🟡 In Progress | TBD |

## Migration Pattern

### Before (Legacy)
```typescript
throw new Error('User not authenticated');
// or
return { error: 'Unauthorized' };
```

### After (Standardized)
```typescript
import { AppError, ErrorCodes } from '@/shared/errors';

throw new AppError({
  code: ErrorCodes.AUTH_UNAUTHORIZED,
  message: 'User is not authenticated',
  statusCode: 401,
  context: { path: '/api/protected' },
});
```

## Error Code Categories

| Prefix | Range | Domain |
|--------|-------|--------|
| AUTH | 1xx | Authentication |
| API | 2xx | General API |
| AI | 3xx | AI Providers |
| BILLING | 4xx | Payments |
| DATA | 5xx | Data Layer |
| STORAGE | 6xx | Storage |
| NETWORK | 7xx | Network |

## Frontend Error Handling

```typescript
import { AppError } from '@/shared/errors';

try {
  await api.call();
} catch (error) {
  if (error instanceof AppError) {
    // Handle known error
    showToast(error.message);
    logError(error.toJSON());
  } else {
    // Handle unknown error
    showToast('An unexpected error occurred');
    logError({ code: 'UNKNOWN_ERROR', message: String(error) });
  }
}
```

## Backend Error Handling

```typescript
import { AppError } from '@/shared/errors';

app.use((err, req, res, next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
  } else {
    res.status(500).json({
      code: 'UNKNOWN_ERROR',
      message: 'Internal server error',
      statusCode: 500,
    });
  }
});
```

## Testing

```typescript
import { AppError, ErrorCodes } from '@/shared/errors';

it('should throw AppError on auth failure', () => {
  expect(() => auth.login('invalid')).toThrow(AppError);
  expect(() => auth.login('invalid')).toThrow('AUTH_UNAUTHORIZED');
});
```

## Checklist

- [x] Create `AppError` class
- [x] Create error code registry
- [x] Add barrel exports
- [x] Write unit tests
- [ ] Migrate auth errors
- [ ] Migrate API errors
- [ ] Migrate AI errors
- [ ] Migrate billing errors
- [ ] Add error boundary integration
- [ ] Add Sentry error grouping by code

## Last Updated
- **Date:** 2026-07-27
