import { generateAIResponse } from '../backend/src/ai-core/ai.js'; // Adjust path if needed
import fs from 'node:fs';

const EVAL_CASES = [
  {
    input: "Explain the difference between 'make' and 'do'.",
    expectedKeywords: ['make', 'do', 'action', 'create'],
    minWords: 30,
  },
  {
    input: 'Give me an example of Present Perfect Continuous.',
    expectedKeywords: ['have', 'has', 'been', 'ing'],
    minWords: 15,
  },
];

async function runEvaluation() {
  console.log('--- Starting AI Evaluation Suite ---');
  let passed = 0;

  for (const [index, testCase] of EVAL_CASES.entries()) {
    console.log(`\nEvaluating Case ${index + 1}: "${testCase.input}"`);
    try {
      const response = await generateAIResponse(
        testCase.input,
        'gpt-4.1-mini',
        'openai'
      );
      console.log(`Response length: ${response.split(' ').length} words.`);

      const missingKeywords = testCase.expectedKeywords.filter(
        (kw) => !response.toLowerCase().includes(kw)
      );

      if (missingKeywords.length > 0) {
        console.warn(`[FAIL] Missing keywords: ${missingKeywords.join(', ')}`);
      } else if (response.split(' ').length < testCase.minWords) {
        console.warn(
          `[FAIL] Response too short. Expected > ${testCase.minWords} words.`
        );
      } else {
        console.log('[PASS] Output meets quality criteria.');
        passed++;
      }
    } catch (e) {
      console.error(`[ERROR] AI Generation failed:`, e.message);
    }
  }

  console.log(
    `\n--- Evaluation Complete: ${passed}/${EVAL_CASES.length} Passed ---`
  );

  fs.writeFileSync(
    'docs/AI_EVALUATION_REPORT.md',
    `# AI Evaluation Report\n- Passed: ${passed}\n- Total: ${EVAL_CASES.length}\n- Pass Rate: ${((passed / EVAL_CASES.length) * 100).toFixed(2)}%\n`
  );
}

runEvaluation().catch(console.error);
