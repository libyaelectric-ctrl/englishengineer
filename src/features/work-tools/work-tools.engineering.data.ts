import { EngineeringTemplate } from './work-tools.types';
import { SITE_SEEDS } from './work-tools.engineering.site-seeds';
import { MEP_SEEDS } from './work-tools.engineering.mep-seeds';
import { MANAGEMENT_SEEDS } from './work-tools.engineering.management-seeds';

const ENGINEERING_SEEDS = [...SITE_SEEDS, ...MEP_SEEDS, ...MANAGEMENT_SEEDS];

export const EXPANDED_ENGINEERING_TEMPLATES: EngineeringTemplate[] =
  ENGINEERING_SEEDS.map(
    ([id, title, category, useCase, sampleInput, requiredAction]) => ({
      id: `expanded-${id}`,
      title,
      category,
      useCase,
      context: `${useCase} in a controlled ${category} workflow with a clear owner, date and evidence requirement.`,
      sampleInput,
      professionalOutput: `${sampleInput} Please ${requiredAction}. Include the relevant drawing, inspection or programme reference and confirm the accountable owner and completion date.`,
      turkishExplanation: `Bu şablon, ${title.toLocaleLowerCase('tr-TR')} için durumu, gerekli aksiyonu, sorumluyu ve kapanış kanıtını açık biçimde kaydeder.`,
      tone: 'Professional and accountable',
      tags: [category.toLowerCase(), 'site communication', 'action tracking'],
    })
  );
