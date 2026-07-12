#!/usr/bin/env node

/**
 * AI Evaluation Script
 * Tests AI responses against expected outputs
 *
 * Usage: node scripts/ai-eval.js
 */

const EVAL_SET = [
  {
    id: 'grammar-001',
    input: 'What is the difference between will and going to?',
    expected: {
      contains: ['future', 'plan', 'decision'],
      minLength: 100,
      maxLength: 500,
      category: 'grammar',
    },
  },
  {
    id: 'vocab-001',
    input: 'Teach me the word ubiquitous',
    expected: {
      contains: ['everywhere', 'omnipresent', 'common'],
      minLength: 80,
      maxLength: 300,
      category: 'vocabulary',
    },
  },
  {
    id: 'writing-001',
    input: 'Correct this sentence: He dont like apples.',
    expected: {
      contains: ['does', "doesn't", 'third person'],
      minLength: 50,
      maxLength: 200,
      category: 'writing',
    },
  },
  {
    id: 'conversation-001',
    input: 'Let us practice ordering food at a restaurant.',
    expected: {
      contains: ['menu', 'order', 'waiter'],
      minLength: 30,
      maxLength: 150,
      category: 'conversation',
    },
  },
  {
    id: 'grammar-002',
    input: 'Explain the subjunctive mood with examples.',
    expected: {
      contains: ['if', 'wish', 'hypothetical', 'were'],
      minLength: 200,
      maxLength: 600,
      category: 'grammar',
    },
  },
  {
    id: 'pronunciation-001',
    input: 'How do you pronounce colonel?',
    expected: {
      contains: ['kernel', 'pronunciation'],
      minLength: 30,
      maxLength: 100,
      category: 'pronunciation',
    },
  },
  {
    id: 'idiom-001',
    input: 'What does break a leg mean?',
    expected: {
      contains: ['good luck', 'theater', 'expression'],
      minLength: 50,
      maxLength: 200,
      category: 'idioms',
    },
  },
  {
    id: 'business-001',
    input: 'How do I write a professional email requesting a meeting?',
    expected: {
      contains: ['subject', 'purpose', 'availability', 'regards'],
      minLength: 150,
      maxLength: 400,
      category: 'business',
    },
  },
  {
    id: 'error-001',
    input: 'Find errors: Their going to the store yesterday.',
    expected: {
      contains: ["they're", 'contraction', 'grammar'],
      minLength: 50,
      maxLength: 200,
      category: 'error_correction',
    },
  },
  {
    id: 'culture-001',
    input: 'What are common American table manners?',
    expected: {
      contains: ['napkin', 'elbows', 'chew', 'please'],
      minLength: 100,
      maxLength: 400,
      category: 'culture',
    },
  },
];

const scoreResponse = (response, expected) => {
  let score = 0;
  const details = [];

  // Length check
  if (
    response.length >= expected.minLength &&
    response.length <= expected.maxLength
  ) {
    score += 25;
    details.push('Length: PASS');
  } else {
    details.push(
      `Length: FAIL (${response.length} not in ${expected.minLength}-${expected.maxLength})`
    );
  }

  // Keyword check
  const lowerResponse = response.toLowerCase();
  const keywordsFound = expected.contains.filter((kw) =>
    lowerResponse.includes(kw.toLowerCase())
  );
  const keywordScore = (keywordsFound.length / expected.contains.length) * 50;
  score += keywordScore;
  details.push(`Keywords: ${keywordsFound.length}/${expected.contains.length}`);

  // Language check (basic English detection)
  const englishWords = [
    'the',
    'is',
    'are',
    'was',
    'were',
    'have',
    'has',
    'can',
    'will',
    'would',
  ];
  const hasEnglish = englishWords.some((w) => lowerResponse.includes(w));
  if (hasEnglish) {
    score += 25;
    details.push('Language: PASS');
  } else {
    details.push('Language: FAIL');
  }

  return { score: Math.round(score), details };
};

const runEval = async () => {
  console.log('=== AI Evaluation Set ===\n');
  console.log(`Total test cases: ${EVAL_SET.length}\n`);

  let totalScore = 0;
  let passed = 0;
  let failed = 0;

  for (const testCase of EVAL_SET) {
    // Simulate AI response (in real use, call actual AI)
    const simulatedResponse = `[Simulated response for: ${testCase.input}]\n\nThis is a placeholder response that would normally come from the AI. It contains ${testCase.expected.contains.slice(0, 2).join(' and ')} in a comprehensive explanation.\n\nThe response would be educational and helpful for English learners.`;

    const result = scoreResponse(simulatedResponse, testCase.expected);
    totalScore += result.score;

    if (result.score >= 70) {
      passed++;
      console.log(
        `✅ ${testCase.id}: ${result.score}% - ${result.details.join(', ')}`
      );
    } else {
      failed++;
      console.log(
        `❌ ${testCase.id}: ${result.score}% - ${result.details.join(', ')}`
      );
    }
  }

  const avgScore = Math.round(totalScore / EVAL_SET.length);
  console.log(`\n=== Results ===`);
  console.log(`Passed: ${passed}/${EVAL_SET.length}`);
  console.log(`Failed: ${failed}/${EVAL_SET.length}`);
  console.log(`Average Score: ${avgScore}%`);

  return { passed, failed, avgScore };
};

runEval()
  .then((result) => {
    process.exit(result.failed > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error('Eval failed:', err);
    process.exit(1);
  });
