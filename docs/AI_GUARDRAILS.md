# AI Guardrails

## Overview

This document defines content safety guardrails for AI-generated responses in EngineerOS.

## Guardrail Types

### 1. Input Validation

| Rule | Action | Example |
|------|--------|---------|
| Max input length | Truncate to 2000 chars | Long messages |
| Blocked topics | Reject + fallback | Harmful content |
| Language check | Reject non-English | Foreign languages |

### 2. Output Filtering

| Rule | Action | Example |
|------|--------|---------|
| Max output length | Truncate to 4000 chars | Long responses |
| Profanity filter | Remove + replace | Offensive words |
| PII detection | Redact + warn | Email, phone numbers |
| Code block limit | Max 5 blocks | Too many code examples |

### 3. Rate Limiting

| User Type | Limit | Window |
|-----------|-------|--------|
| Free | 3 requests | Per day |
| Pro | 300 requests | Per month |
| Team | 300 requests | Per month |

### 4. Content Categories

| Category | Allowed | Restricted |
|----------|---------|------------|
| Grammar | Yes | - |
| Vocabulary | Yes | - |
| Writing | Yes | - |
| Culture | Yes | Political topics |
| Business | Yes | Financial advice |
| Personal | No | Life advice |

## Implementation

### Backend Filter Chain

```javascript
// backend/src/ai-guardrails.js
export const filterInput = (input) => {
  // Max length
  if (input.length > 2000) {
    input = input.slice(0, 2000);
  }
  
  // Blocked topics
  const blocked = ['hack', 'exploit', 'bypass'];
  if (blocked.some(word => input.toLowerCase().includes(word))) {
    throw new Error('blocked_topic');
  }
  
  return input;
};

export const filterOutput = (output) => {
  // Max length
  if (output.length > 4000) {
    output = output.slice(0, 4000) + '\n\n[Response truncated]';
  }
  
  // PII redaction
  output = output.replace(/\b[\w.-]+@[\w.-]+\.\w+\b/g, '[EMAIL REDACTED]');
  output = output.replace(/\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/g, '[PHONE REDACTED]');
  
  return output;
};
```

### Frontend Display

```tsx
// Filter response before display
const safeResponse = filterOutput(aiResponse);
if (safeResponse.blocked) {
  showFallbackMessage();
} else {
  displayResponse(safeResponse.text);
}
```

## Monitoring

| Metric | Threshold | Alert |
|--------|-----------|-------|
| Blocked inputs | > 10/day | High |
| PII detections | > 5/day | Medium |
| Rate limit hits | > 50/day | Low |
| Filter errors | > 0 | Critical |

## Incident Response

1. **Detection:** Log all blocked content
2. **Review:** Manual review within 24 hours
3. **Action:** Update filters if needed
4. **Document:** Add to guardrails if new pattern

## Last Updated

- **Date:** 2026-07-12
- **Version:** 1.0
