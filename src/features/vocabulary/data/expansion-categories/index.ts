import type { ExpansionCategory } from './types';

import { civilCategories } from './civil';
import { electricalCategories } from './electrical';
import { hseCategories } from './hse';
import { mechanicalCategories } from './mechanical';
import { projectManagementCategories } from './project-management';
import { specializedCategories } from './specialized';

export const expansionCategories: ExpansionCategory[] = [
  ...electricalCategories,
  ...mechanicalCategories,
  ...civilCategories,
  ...hseCategories,
  ...projectManagementCategories,
  ...specializedCategories,
];

export { electricalCategories } from './electrical';
export { mechanicalCategories } from './mechanical';
export { civilCategories } from './civil';
export { hseCategories } from './hse';
export { projectManagementCategories } from './project-management';
export { specializedCategories } from './specialized';

export type { ExpansionCategory } from './types';
