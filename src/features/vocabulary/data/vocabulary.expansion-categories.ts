// Re-export the barrel and type from their canonical locations.
// The ExpansionCategory type lives in expansion-categories/types.ts to avoid
// a circular dependency between this barrel and the individual category files.

export type { ExpansionCategory } from './expansion-categories/types';
export { expansionCategories } from './expansion-categories/index';
