import { describe, expect, it } from 'vitest';
import { GrammarProgressService } from '../services/grammar.progress';

describe('GrammarProgressService', () => {
  it('New → Learning (otomatik看到)', () => {
    const rule = GrammarProgressService.addRule('past-simple');
    const result = GrammarProgressService.onView(rule);
    expect(result.status).toBe('learning');
  });

  it('Learning → Learned (1 doğru)', () => {
    let rule = GrammarProgressService.addRule('past-simple');
    rule = GrammarProgressService.onView(rule);
    const result = GrammarProgressService.onQuizCorrect(rule);
    expect(result.status).toBe('learned');
    expect(result.correctCount).toBe(1);
  });

  it('Learned → Mastered (3 doğru)', () => {
    let rule = GrammarProgressService.addRule('past-simple');
    rule = GrammarProgressService.onView(rule);
    for (let i = 0; i < 3; i++) rule = GrammarProgressService.onQuizCorrect(rule);
    expect(rule.status).toBe('mastered');
    expect(rule.masteredAt).toBeTruthy();
  });

  it('Mastered → Learned (yanlış cevap)', () => {
    let rule = GrammarProgressService.addRule('past-simple');
    rule = GrammarProgressService.onView(rule);
    for (let i = 0; i < 3; i++) rule = GrammarProgressService.onQuizCorrect(rule);
    expect(rule.status).toBe('mastered');
    const result = GrammarProgressService.onQuizIncorrect(rule);
    expect(result.status).toBe('learned');
  });

  it('Struggling → Learning (doğru cevap)', () => {
    let rule = GrammarProgressService.addRule('past-simple');
    rule = GrammarProgressService.onView(rule);
    for (let i = 0; i < 5; i++) rule = GrammarProgressService.onQuizIncorrect(rule);
    expect(rule.status).toBe('struggling');
    const result = GrammarProgressService.onStrugglingQuizCorrect(rule);
    expect(result.status).toBe('learning');
  });
});
