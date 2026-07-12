# AI Eval Set

## Overview

This document defines the evaluation set for EngineerOS AI Coach. The eval set contains test cases with expected outputs to measure AI quality and consistency.

## Eval Set Structure

Each test case contains:
- **id**: Unique identifier
- **input**: User message/prompt
- **expected**: Expected response characteristics
- **category**: Test category
- **difficulty**: Easy, medium, hard

## Test Cases

### 1. Grammar Explanation

```json
{
  "id": "grammar-001",
  "input": "What is the difference between 'will' and 'going to'?",
  "expected": {
    "contains": ["future", "plan", "decision", "spontaneous"],
    "min_length": 100,
    "max_length": 500,
    "tone": "educational",
    "language": "en"
  },
  "category": "grammar",
  "difficulty": "easy"
}
```

### 2. Vocabulary Teaching

```json
{
  "id": "vocab-001",
  "input": "Teach me the word 'ubiquitous'",
  "expected": {
    "contains": ["everywhere", "omnipresent", "common", "example"],
    "min_length": 80,
    "max_length": 300,
    "tone": "friendly",
    "includes_example": true
  },
  "category": "vocabulary",
  "difficulty": "easy"
}
```

### 3. Writing Correction

```json
{
  "id": "writing-001",
  "input": "Correct this sentence: 'He don't like apples.'",
  "expected": {
    "corrected": "He doesn't like apples.",
    "explanation": "third person singular",
    "min_length": 50,
    "max_length": 200,
    "tone": "helpful"
  },
  "category": "writing",
  "difficulty": "easy"
}
```

### 4. Conversation Practice

```json
{
  "id": "conversation-001",
  "input": "Let's practice ordering food at a restaurant.",
  "expected": {
    "role": "waiter",
    "greeting": true,
    "asks_for_order": true,
    "min_length": 30,
    "max_length": 150,
    "tone": "natural"
  },
  "category": "conversation",
  "difficulty": "medium"
}
```

### 5. Complex Grammar

```json
{
  "id": "grammar-002",
  "input": "Explain the subjunctive mood with examples.",
  "expected": {
    "contains": ["if", "wish", "hypothetical", "were", "would"],
    "min_length": 200,
    "max_length": 600,
    "includes_examples": true,
    "tone": "academic"
  },
  "category": "grammar",
  "difficulty": "hard"
}
```

### 6. Pronunciation Guide

```json
{
  "id": "pronunciation-001",
  "input": "How do you pronounce 'colonel'?",
  "expected": {
    "phonetic": "/ˈkɜːrnəl/",
    "comparison": "kernel",
    "min_length": 30,
    "max_length": 100,
    "tone": "helpful"
  },
  "category": "pronunciation",
  "difficulty": "medium"
}
```

### 7. Idiom Explanation

```json
{
  "id": "idiom-001",
  "input": "What does 'break a leg' mean?",
  "expected": {
    "meaning": "good luck",
    "origin": true,
    "usage_example": true,
    "min_length": 50,
    "max_length": 200,
    "tone": "friendly"
  },
  "category": "idioms",
  "difficulty": "easy"
}
```

### 8. Business English

```json
{
  "id": "business-001",
  "input": "How do I write a professional email requesting a meeting?",
  "expected": {
    "structure": ["greeting", "purpose", "availability", "closing"],
    "min_length": 150,
    "max_length": 400,
    "tone": "professional",
    "includes_template": true
  },
  "category": "business",
  "difficulty": "medium"
}
```

### 9. Error Correction

```json
{
  "id": "error-001",
  "input": "Find errors: 'Their going to the store yesterday.'",
  "expected": {
    "errors": [
      {"original": "Their", "correct": "They're", "reason": "contraction"}
    ],
    "min_length": 50,
    "max_length": 200,
    "tone": "helpful"
  },
  "category": "error_correction",
  "difficulty": "easy"
}
```

### 10. Cultural Context

```json
{
  "id": "culture-001",
  "input": "What are common American table manners?",
  "expected": {
    "contains": ["napkin", "elbows", "chew", "thank"],
    "min_length": 100,
    "max_length": 400,
    "cultural_sensitive": true,
    "tone": "informative"
  },
  "category": "culture",
  "difficulty": "medium"
}
```

## Evaluation Criteria

### Automatic Scoring

| Criterion | Weight | Method |
|-----------|--------|--------|
| Length | 10% | Character count within bounds |
| Keywords | 30% | Required keywords present |
| Tone | 20% | Sentiment analysis |
| Structure | 20% | Required sections present |
| Language | 20% | English-only, no errors |

### Manual Review

- Response relevance
- Educational value
- Natural conversation flow
- Cultural sensitivity

## Running Evaluation

### Script

```bash
npm run eval:ai
```

### Output

```json
{
  "total": 10,
  "passed": 8,
  "failed": 2,
  "score": 0.83,
  "details": [...]
}
```

## Frequency

- **Daily**: Run on staging after deploy
- **Weekly**: Full eval set on production
- **Monthly**: Manual review of edge cases

## Last Updated

- **Date:** 2026-07-12
- **Test Cases:** 10
- **Categories:** 8
