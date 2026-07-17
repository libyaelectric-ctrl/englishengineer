export const collocationExtras: Record<string, string[]> = {
  'Electrical Engineering': ['{term} test', '{term} setting', '{term} report'],
  'Mechanical Engineering': [
    '{term} inspection',
    '{term} alignment',
    '{term} performance',
  ],
  'Civil Engineering': [
    '{term} specification',
    '{term} tolerance',
    '{term} compliance',
  ],
  Architecture: ['{term} design', '{term} approval', '{term} detail'],
  Construction: ['{term} schedule', '{term} completion', '{term} sign-off'],
  Commissioning: [
    '{term} checklist',
    '{term} verification',
    '{term} certificate',
  ],
  'QA/QC': ['{term} record', '{term} audit', '{term} certification'],
  HSE: ['{term} briefing', '{term} compliance', '{term} procedure'],
  'Project Management': ['{term} tracking', '{term} forecast', '{term} review'],
};

export function resolveCollocations(
  base: string[],
  term: string,
  discipline: string
): string[] {
  const extras = collocationExtras[discipline] || [];
  return [...base, ...extras.map((t) => t.replace(/\{term\}/g, term))];
}
