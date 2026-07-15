import {
  EmailTemplate,
  EngineeringTemplate,
  PhraseEntry,
} from './work-tools.types';
import {
  EXPANDED_EMAIL_TEMPLATES,
  EXPANDED_ENGINEERING_TEMPLATES,
  EXPANDED_PHRASE_LIBRARY,
} from './work-tools.expanded.data';
import { restoreTurkish } from './work-tools.utils';
import { BASE_ENGINEERING_TEMPLATES } from './work-tools.base-engineering.data';
import { BASE_EMAIL_TEMPLATES } from './work-tools.base-email.data';
import { BASE_PHRASE_LIBRARY } from './work-tools.base-phrase.data';

export const ENGINEERING_TEMPLATES: EngineeringTemplate[] = [
  ...BASE_ENGINEERING_TEMPLATES.map((template) => ({
    ...template,
    turkishExplanation: restoreTurkish(template.turkishExplanation),
    category: 'Core Workflow',
    useCase: template.context,
    tone: 'Professional and accountable',
    tags: ['engineering', 'site communication', 'core workflow'],
  })),
  ...EXPANDED_ENGINEERING_TEMPLATES,
];

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  ...BASE_EMAIL_TEMPLATES.map((template) => ({
    ...template,
    turkishExplanation: restoreTurkish(template.turkishExplanation),
    category: 'Core Email',
    subject: template.shortVersion.split('\n')[0].replace('Subject: ', ''),
    tags: ['engineering email', 'professional communication'],
  })),
  ...EXPANDED_EMAIL_TEMPLATES,
];

export const PHRASE_LIBRARY: PhraseEntry[] = [
  ...BASE_PHRASE_LIBRARY.map((entry) => ({
    ...entry,
    turkishMeaning: restoreTurkish(entry.turkishMeaning),
    tone: 'Professional and clear',
    tags: [entry.category.toLowerCase(), 'engineering communication'],
  })),
  ...EXPANDED_PHRASE_LIBRARY,
];
