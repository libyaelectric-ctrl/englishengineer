# Engineering Standards

## Overview

This document defines the engineering standards for EngineerOS development.

## Code Standards

### TypeScript

```typescript
// ✅ Good
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

const getUser = async (id: string): Promise<User | null> => {
  // implementation
};

// ❌ Bad
const getUser = (id) => {
  // implementation
};
```

### React Components

```tsx
// ✅ Good
interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export const Button = ({
  children,
  variant = 'primary',
  onClick,
}: ButtonProps) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  );
};

// ❌ Bad
export const Button = (props) => {
  return <button>{props.children}</button>;
};
```

### Naming Conventions

| Type       | Convention  | Example            |
| ---------- | ----------- | ------------------ |
| Variables  | camelCase   | `userName`         |
| Functions  | camelCase   | `getUser()`        |
| Components | PascalCase  | `UserProfile`      |
| Files      | kebab-case  | `user-profile.tsx` |
| Constants  | UPPER_SNAKE | `MAX_RETRIES`      |
| Types      | PascalCase  | `UserType`         |

## Testing Standards

### Unit Tests

```typescript
// ✅ Good
describe('UserService', () => {
  it('should create a new user', async () => {
    const user = await createUser({ email: 'test@example.com' });
    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});

// ❌ Bad
it('works', () => {
  // no assertions
});
```

### Test Coverage

| Metric            | Target |
| ----------------- | ------ |
| Line coverage     | > 80%  |
| Branch coverage   | > 75%  |
| Function coverage | > 85%  |

## Documentation Standards

### Code Comments

```typescript
// ✅ Good - Explains WHY, not WHAT
// Rate limiting prevents abuse and ensures fair usage
const rateLimit = createRateLimiter({ max: 100 });

// ❌ Bad - Explains WHAT (obvious)
// Create rate limiter
const rateLimit = createRateLimiter({ max: 100 });
```

### API Documentation

```typescript
/**
 * Creates a new user account
 * @param email - User's email address
 * @param password - User's password (min 8 chars)
 * @returns Created user object
 * @throws {ValidationError} If email is invalid
 */
const createUser = async (email: string, password: string) => {
  // implementation
};
```

## Git Standards

### Commit Messages

```
type(scope): description

feat(auth): add OAuth login
fix(billing): resolve checkout error
docs(readme): update installation guide
refactor(api): simplify endpoint handlers
test(user): add unit tests for UserService
```

### Branch Naming

```
feature/user-profile
bugfix/checkout-error
hotfix/security-patch
release/v1.2.0
```

## PR Standards

### Title

```
feat(auth): implement OAuth login (#123)
```

### Description

```markdown
## Summary

- Added OAuth login with Google and GitHub
- Updated auth middleware

## Changes

- Added OAuthProvider component
- Updated auth routes
- Added tests

## Testing

- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots

(If applicable)
```

## Performance Standards

### Frontend

| Metric                   | Target  |
| ------------------------ | ------- |
| First Contentful Paint   | < 1.5s  |
| Largest Contentful Paint | < 2.5s  |
| Time to Interactive      | < 3.5s  |
| Bundle Size              | < 200KB |

### Backend

| Metric        | Target       |
| ------------- | ------------ |
| Response Time | < 100ms      |
| Throughput    | > 1000 req/s |
| Error Rate    | < 0.1%       |
| Uptime        | > 99.9%      |

## Security Standards

### Input Validation

```typescript
// ✅ Good - Validate all input
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validateInput = (data: unknown) => {
  return schema.parse(data);
};

// ❌ Bad - No validation
const processInput = (data: any) => {
  // no validation
};
```

### Authentication

- JWT tokens with short expiry
- Refresh token rotation
- Secure password hashing (bcrypt)
- Rate limiting on auth endpoints

## Last Updated

- **Date:** 2026-07-12
- **Version:** 1.0
