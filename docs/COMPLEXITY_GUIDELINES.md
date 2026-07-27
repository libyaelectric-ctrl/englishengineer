# Cyclomatic Complexity Guidelines

## Overview

EngineerOS enforces a maximum cyclomatic complexity of **10** for all functions.
This is configured in `eslint.config.js`.

## Current Configuration

```javascript
complexity: ['warn', { max: 10 }],
```

## What is Cyclomatic Complexity?

Number of independent paths through a function:
- **1-5**: Simple, easy to test
- **6-10**: Moderate, acceptable
- **11-20**: Complex, should refactor
- **21+**: Very complex, high bug risk

## Refactoring Targets

| Function | File | Current | Target | Strategy |
|----------|------|---------|--------|----------|
| *(Audit in progress)* | | | | |

## Best Practices

1. **Extract functions**: Break large functions into smaller ones
2. **Early returns**: Reduce nesting with guard clauses
3. **Strategy pattern**: Replace switch statements with object maps
4. **Pure functions**: Separate logic from side effects

## Enforcement

- **Warning** at complexity > 10
- **Future**: Error at complexity > 15
- **CI**: Complexity report in PR checks

## Tools

```bash
# Generate complexity report
npx complexity-report src/**/*.ts

# Check specific file
npx eslint --rule 'complexity: [error, 10]' src/features/vocabulary/store/vocabulary.store.ts
```

## Last Updated
- **Date:** 2026-07-27
