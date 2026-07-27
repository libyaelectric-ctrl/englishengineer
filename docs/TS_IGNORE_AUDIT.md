# @ts-ignore Audit & Migration Guide

## Overview

This document tracks all `@ts-ignore` and `@ts-expect-error` usages in the codebase.
The goal is to achieve **zero `@ts-ignore`** by Q4 2026.

## Current Status

| File | Line | Reason | Owner | Target Fix Date |
|------|------|--------|-------|-----------------|
| *(Audit in progress)* | | | | |

## Rules

1. **Never add new `@ts-ignore`** without ADR approval
2. **Prefer `@ts-expect-error`** with descriptive comment
3. **All existing `@ts-ignore`** must have linked GitHub issue
4. **Quarterly audit**: Review and remove resolved ignores

## Migration Strategy

### Phase 1: Document (Current)
- [ ] Run `grep -rn "@ts-ignore\|@ts-expect-error" src/ backend/`
- [ ] Create table above with file/line/reason
- [ ] Link each to GitHub issue

### Phase 2: Fix (Q3 2026)
- [ ] Fix type definitions for external libraries
- [ ] Add missing type declarations
- [ ] Refactor any-typed code

### Phase 3: Enforce (Q4 2026)
- [ ] ESLint rule: `@typescript-eslint/ban-ts-comment`
- [ ] CI failure on any `@ts-ignore`

## ESLint Configuration (Future)

```javascript
'@typescript-eslint/ban-ts-comment': [
  'error',
  {
    'ts-expect-error': 'allow-with-description',
    'ts-ignore': true, // Forbidden
    'ts-nocheck': true, // Forbidden
    'ts-check': false,
    minimumDescriptionLength: 10,
  },
],
```

## Last Updated
- **Date:** 2026-07-27
- **Status:** Phase 1 — Documentation
