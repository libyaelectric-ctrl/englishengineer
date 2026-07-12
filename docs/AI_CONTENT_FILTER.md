# AI Content Filter

## Overview

EngineerOS implements content filtering for AI-generated responses to ensure educational quality and safety.

## Filter Types

### 1. Language Filter

Ensures responses are in the correct language (English for English learning).

```javascript
const languageFilter = (response, expectedLanguage = 'en') => {
  // Check if response is primarily in expected language
  const languageScore = detectLanguage(response);
  return languageScore > 0.8;
};
```

### 2. Length Filter

Ensures responses are within acceptable length bounds.

```javascript
const lengthFilter = (response, min = 10, max = 2000) => {
  const length = response.length;
  return length >= min && length <= max;
};
```

### 3. Content Safety Filter

Removes or flags potentially harmful content.

```javascript
const safetyFilter = (response) => {
  // Check for:
  // - Offensive language
  // - Personal information requests
  // - Harmful instructions
  // - Adult content
  return !containsHarmfulContent(response);
};
```

### 4. Educational Quality Filter

Ensures responses meet educational standards.

```javascript
const qualityFilter = (response) => {
  // Check for:
  // - Appropriate complexity
  // - Clear explanations
  // - Examples included
  // - Correct grammar
  return meetsQualityStandards(response);
};
```

## Implementation

### Backend Filter Chain

```javascript
// backend/src/ai-content-filter.js
export const filterAIResponse = (response, context) => {
  const filters = [
    { name: 'language', fn: languageFilter, required: true },
    { name: 'length', fn: lengthFilter, required: true },
    { name: 'safety', fn: safetyFilter, required: true },
    { name: 'quality', fn: qualityFilter, required: false },
  ];

  const results = [];
  
  for (const filter of filters) {
    const passed = filter.fn(response, context);
    results.push({ filter: filter.name, passed });
    
    if (!passed && filter.required) {
      throw new Error(`Content filter failed: ${filter.name}`);
    }
  }

  return { response, results };
};
```

### Frontend Display

```tsx
// Filter response before display
const filteredResponse = filterAIResponse(rawResponse, {
  level: userLevel,
  topic: currentTopic,
});

if (filteredResponse.safe) {
  displayResponse(filteredResponse.text);
} else {
  displayFallbackMessage();
}
```

## Filter Rules

### Language Rules

| Rule | Description |
|------|-------------|
| Primary language | Must be English |
| Mixed language | Allow up to 10% non-English |
| Code blocks | Allow any language |

### Safety Rules

| Rule | Action |
|------|--------|
| Offensive words | Block + log |
| Personal info request | Block + warn |
| Harmful instructions | Block + report |
| Adult content | Block + ban |

### Quality Rules

| Rule | Threshold |
|------|-----------|
| Min length | 10 characters |
| Max length | 2000 characters |
| Min words | 5 words |
| Max words | 500 words |

## Logging

All filtered responses are logged for review:

```javascript
{
  timestamp: '2026-07-12T10:00:00Z',
  userId: 'user-123',
  input: 'user message',
  output: 'ai response',
  filters: [
    { name: 'language', passed: true },
    { name: 'safety', passed: false, reason: 'offensive_language' }
  ],
  action: 'blocked'
}
```

## Monitoring

- Dashboard: AI Content Filter Stats
- Alerts: High block rate, safety violations
- Weekly review: Blocked content samples

## Last Updated

- **Date:** 2026-07-12
- **Version:** 1.0
