import type { GrammarRule } from './grammar.types';
import { addToVocabularyPool } from '@/core/learning/learning.pool';

export interface BridgeResult {
  ruleId: string;
  vocabularyTags: string[];
  linkedTerms: string[];
  poolAdded: number;
}

export const GrammarVocabularyBridge = {
  extractVocabularyFromRule(rule: GrammarRule): string[] {
    const tags = new Set<string>();

    rule.linkedVocabularyTags.forEach((tag) => tags.add(tag));
    rule.grammarFits.forEach((fit) => tags.add(fit));
    rule.domainFit.forEach((domain) => tags.add(domain));

    rule.examples.forEach((ex) => {
      const words = ex.english.split(/\s+/).filter((w) => w.length > 3);
      words.forEach((w) => tags.add(w.toLowerCase()));
    });

    return [...tags];
  },

  syncRuleVocabularyToPool(rule: GrammarRule): BridgeResult {
    const vocabularyTags = this.extractVocabularyFromRule(rule);
    let poolAdded = 0;

    vocabularyTags.forEach((tag) => {
      try {
        addToVocabularyPool(tag);
        poolAdded++;
      } catch {
        // Pool add failed silently
      }
    });

    return {
      ruleId: rule.id,
      vocabularyTags,
      linkedTerms: rule.linkedVocabularyTags,
      poolAdded,
    };
  },

  getGrammarRulesForVocabulary(
    vocabularyTags: string[],
    allRules: GrammarRule[]
  ): GrammarRule[] {
    const normalizedTags = vocabularyTags.map((t) => t.toLowerCase());
    return allRules.filter((rule) =>
      rule.linkedVocabularyTags.some((tag) =>
        normalizedTags.includes(tag.toLowerCase())
      ) ||
      rule.grammarFits.some((fit) =>
        normalizedTags.includes(fit.toLowerCase())
      )
    );
  },

  getVocabularyForGrammarRule(
    rule: GrammarRule,
    allVocabulary: Array<{ id: string; term: string; tags: string[] }>
  ): Array<{ id: string; term: string; relevance: number }> {
    const ruleTags = new Set([
      ...rule.linkedVocabularyTags.map((t) => t.toLowerCase()),
      ...rule.grammarFits.map((t) => t.toLowerCase()),
    ]);

    return allVocabulary
      .map((v) => ({
        ...v,
        relevance: v.tags.filter((t) => ruleTags.has(t.toLowerCase())).length,
      }))
      .filter((v) => v.relevance > 0)
      .sort((a, b) => b.relevance - a.relevance);
  },
};
