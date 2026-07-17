import { electricalCategories } from './electrical';
import { mechanicalCategories } from './mechanical';
import { civilCategories } from './civil';
import { hseCategories } from './hse';
import { projectManagementCategories } from './project-management';
import { specializedCategories } from './specialized';
import { ExpansionCategory } from '../vocabulary.expansion-categories';

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
