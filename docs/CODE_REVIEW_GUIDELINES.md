# Code Review Guidelines

## Overview

These guidelines ensure consistent, high-quality code reviews across EngineerOS.

## Review Checklist

### Functionality

- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled
- [ ] Error handling is appropriate
- [ ] No regressions introduced

### Code Quality

- [ ] Code is readable and maintainable
- [ ] Functions are small and focused
- [ ] Variables and functions are well-named
- [ ] No code duplication

### Testing

- [ ] Unit tests added/updated
- [ ] Tests cover edge cases
- [ ] All tests pass
- [ ] Coverage requirements met

### Security

- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] SQL injection prevented
- [ ] XSS prevention implemented

### Performance

- [ ] No unnecessary re-renders
- [ ] Database queries optimized
- [ ] Caching implemented where needed
- [ ] Bundle size considered

## Review Process

1. **Author:** Self-review before submitting
2. **Reviewer:** Review within 24 hours
3. **Feedback:** Constructive, specific comments
4. **Resolution:** Address all comments
5. **Approval:** Minimum 1 approval required

## Comment Guidelines

### Be Specific

```
// Bad
"This needs fixing"

// Good
"This function could throw an error if the API returns null. Consider adding a null check."
```

### Be Constructive

```
// Bad
"This is wrong"

// Good
"Consider using Array.map() here for better readability"
```

### Reference Documentation

```
// Good
"According to our style guide (docs/DESIGN_SYSTEM.md), buttons should use the 'btn-primary' class"
```

## Common Issues

### TypeScript

- Use proper types, avoid `any`
- Prefer interfaces over type aliases
- Export types for external use

### React

- Use functional components
- Avoid inline functions in JSX
- Use proper key props

### Testing

- Test behavior, not implementation
- Use descriptive test names
- Mock external dependencies

## Approval Criteria

- All checklist items addressed
- No unresolved comments
- Tests passing
- Documentation updated (if needed)
