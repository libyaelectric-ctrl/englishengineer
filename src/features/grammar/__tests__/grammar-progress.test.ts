import { describe, expect, it } from 'vitest';

import { QuizGrammarProgressService } from '../services/grammar.progress';

describe('QuizGrammarProgressService', () => {
  it('New → Learning (otomatik看到)', () => {
    const rule = QuizGrammarProgressService.addRule('past-simple');
    const result = QuizGrammarProgressService.onView(rule);
    expect(result.status).toBe('learning');
  });

  it('Learning → Learned (1 doğru)', () => {
    let rule = QuizGrammarProgressService.addRule('past-simple');
    rule = QuizGrammarProgressService.onView(rule);
    const result = QuizGrammarProgressService.onQuizCorrect(rule);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('Learned → Mastered (3 doğru)', () => {
    let rule = QuizGrammarProgressService.addRule('past-simple');
    rule = QuizGrammarProgressService.onView(rule);
    for (let i = 0; i < 3; i++) rule = QuizGrammarProgressService.onQuizCorrect(rule);
    expect(rule.status).toBe('mastered');
    expect(rule.masteredAt).toBeTruthy();
  });

  it('Mastered → Learned (yanlış cevap)', () => {
    let rule = QuizGrammarProgressService.addRule('past-simple');
    rule = QuizGrammarProgressService.onView(rule);
    for (let i = 0; i < 3; i++) rule = QuizGrammarProgressService.onQuizCorrect(rule);
    expect(rule.status).toBe('mastered');
    const result = QuizGrammarProgressService.onQuizIncorrect(rule);
    expect(result.status).toBe('learned');
  });

  it('Struggling → Learning (doğru cevap)', () => {
    let rule = QuizGrammarProgressService.addRule('past-simple');
    rule = QuizGrammarProgressService.onView(rule);
    for (let i = 0; i < 5; i++) rule = QuizGrammarProgressService.onQuizIncorrect(rule);
    expect(rule.status).toBe('struggling');
    const result = QuizGrammarProgressService.onStrugglingQuizCorrect(rule);
    expect(result.status).toBe('learning');
  });
});
