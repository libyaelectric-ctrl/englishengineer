export interface ProofreadIssue {
  id: string;
  originalText: string;
  suggestedText: string;
  type: 'grammar' | 'terminology' | 'tone' | 'clarity';
  explanation: string;
  category: 'FIDIC' | 'ASTM' | 'General Technical';
}

export interface ProofreadResult {
  originalText: string;
  improvedText: string;
  formalityScore: number; // 0-100
  technicalPrecisionScore: number; // 0-100
  issues: ProofreadIssue[];
  keyTermsFound: string[];
}

const FIDIC_TERMS = [
  'Extension of Time',
  'EOT',
  'Sub-Clause',
  "Engineer's Determination",
  "Employer's Personnel",
  'Variation Order',
  'Taking-Over Certificate',
  'Defects Notification Period',
  'Force Majeure',
  'Adverse Climatic Conditions',
  'Non-Conformance Report',
  'NCR',
  'Request for Information',
  'RFI',
];

const ASTM_TERMS = [
  'Slump Test',
  'Compressive Strength',
  'Yield Stress',
  'Tensile Strength',
  'Hydration Heat',
  'Aggregate Gradation',
  'Curing Period',
  'Cylinder Sample',
];

export const analyzeTechnicalText = (text: string): ProofreadResult => {
  const trimmed = text.trim();
  if (!trimmed) {
    return {
      originalText: text,
      improvedText: text,
      formalityScore: 0,
      technicalPrecisionScore: 0,
      issues: [],
      keyTermsFound: [],
    };
  }

  const issues: ProofreadIssue[] = [];
  const keyTermsFound: string[] = [];

  // Check for key FIDIC terms
  FIDIC_TERMS.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, 'i').test(trimmed)) {
      if (!keyTermsFound.includes(term)) keyTermsFound.push(term);
    }
  });

  // Check for key ASTM terms
  ASTM_TERMS.forEach((term) => {
    if (new RegExp(`\\b${term}\\b`, 'i').test(trimmed)) {
      if (!keyTermsFound.includes(term)) keyTermsFound.push(term);
    }
  });

  // Real rule-based replacements
  let improved = trimmed;

  if (/delay because rain/i.test(improved)) {
    issues.push({
      id: 'issue-1',
      originalText: 'delay because rain',
      suggestedText: 'temporarily suspended due to adverse climatic conditions (heavy rainfall)',
      type: 'terminology',
      explanation: 'Use FIDIC Sub-Clause 8.4 standard phrasing for weather delays.',
      category: 'FIDIC',
    });
    improved = improved.replace(
      /delay because rain/gi,
      'temporarily suspended due to adverse climatic conditions (heavy rainfall)'
    );
  }

  if (/give extra time/i.test(improved)) {
    issues.push({
      id: 'issue-2',
      originalText: 'give extra time',
      suggestedText: 'grant an Extension of Time (EOT) pursuant to Sub-Clause 8.4',
      type: 'terminology',
      explanation:
        'Replaced informal phrasing with contractual Extension of Time (EOT) clause terminology.',
      category: 'FIDIC',
    });
    improved = improved.replace(
      /give extra time/gi,
      'grant an Extension of Time (EOT) pursuant to Sub-Clause 8.4'
    );
  }

  if (/concrete is bad/i.test(improved)) {
    issues.push({
      id: 'issue-3',
      originalText: 'concrete is bad',
      suggestedText:
        'concrete batch failed to meet specified compressive strength and slump criteria (ASTM C143)',
      type: 'clarity',
      explanation: 'Replaced vague quality statement with precise ASTM compliance metrics.',
      category: 'ASTM',
    });
    improved = improved.replace(
      /concrete is bad/gi,
      'concrete batch failed to meet specified compressive strength and slump criteria (ASTM C143)'
    );
  }

  if (/please reply fast/i.test(improved)) {
    issues.push({
      id: 'issue-4',
      originalText: 'please reply fast',
      suggestedText:
        'Kindly provide your formal technical determination at your earliest convenience',
      type: 'tone',
      explanation: 'Adjusted tone to formal executive correspondence standards.',
      category: 'General Technical',
    });
    improved = improved.replace(
      /please reply fast/gi,
      'Kindly provide your formal technical determination at your earliest convenience'
    );
  }

  // Calculate real scores based on issues & terms
  const formalityScore = Math.min(
    100,
    Math.max(50, 95 - issues.length * 12 + keyTermsFound.length * 5)
  );
  const technicalPrecisionScore = Math.min(
    100,
    Math.max(40, 70 + keyTermsFound.length * 10 - issues.length * 8)
  );

  // If no specific issues triggered, perform general enhancement
  if (issues.length === 0) {
    if (!/Dear/i.test(improved) && !/Sincerely/i.test(improved)) {
      improved = `Dear Resident Engineer,\n\n${improved}\n\nSincerely,\nLead Project Engineer`;
    }
  }

  return {
    originalText: text,
    improvedText: improved,
    formalityScore,
    technicalPrecisionScore,
    issues,
    keyTermsFound,
  };
};
