export interface MeetingPhrase {
  id: string;
  category: string;
  phrase: string;
  turkishMeaning: string;
  whenToUse: string;
  example: string;
  tone: string;
  tags: string[];
}

export interface SiteDictionaryTerm {
  id: string;
  term: string;
  turkishMeaning: string;
  technicalExplanation: string;
  siteExample: string;
  commonWrongUsage: string;
  relatedTerms: string[];
  category: string;
  tags: string[];
}

export interface QuickAIAction {
  id: string;
  label: string;
  instruction: string;
  systemInstruction: string;
  expectedOutputStyle: string;
  exampleInput: string;
  exampleOutput: string;
}

import {
  EXPANDED_MEETING_PHRASES,
  EXPANDED_SITE_DICTIONARY,
} from './quick-tools.expanded.data';

type BaseMeetingPhrase = Omit<MeetingPhrase, 'tone' | 'tags'>;
type BaseSiteDictionaryTerm = Omit<SiteDictionaryTerm, 'tags'>;
type BaseQuickAIAction = Omit<
  QuickAIAction,
  'systemInstruction' | 'expectedOutputStyle' | 'exampleInput' | 'exampleOutput'
>;

const BASE_MEETING_PHRASES: BaseMeetingPhrase[] = [
  {
    id: 'meeting-interrupt',
    category: 'Interrupt',
    phrase: 'May I add one technical point before we move on?',
    turkishMeaning: 'Devam etmeden once bir teknik nokta ekleyebilir miyim?',
    whenToUse: 'Interrupting without sounding abrupt',
    example:
      'May I add one technical point before we move on? The shutdown window has not been confirmed.',
  },
  {
    id: 'meeting-agree',
    category: 'Agree',
    phrase: 'That approach is workable from the commissioning side.',
    turkishMeaning: 'Bu yaklasim devreye alma acisindan uygulanabilir.',
    whenToUse: 'Confirming support with a technical boundary',
    example:
      'That approach is workable from the commissioning side, provided the pre-test records are complete.',
  },
  {
    id: 'meeting-disagree',
    category: 'Disagree',
    phrase:
      'I understand the proposal, but the current sequence creates an interface risk.',
    turkishMeaning:
      'Teklifi anliyorum ancak mevcut siralama bir arayuz riski olusturuyor.',
    whenToUse: 'Disagreeing professionally',
    example:
      'I understand the proposal, but the current sequence creates an interface risk between power and controls.',
  },
  {
    id: 'meeting-clarify',
    category: 'Clarify',
    phrase:
      'Could you clarify whether this date is confirmed or still indicative?',
    turkishMeaning:
      'Bu tarihin kesin mi yoksa hala tahmini mi oldugunu netlestirebilir misiniz?',
    whenToUse: 'Testing whether a commitment is firm',
    example:
      'Could you clarify whether the panel delivery date is confirmed or still indicative?',
  },
  {
    id: 'meeting-summarize',
    category: 'Summarize',
    phrase: 'To summarize, two actions remain open before energization.',
    turkishMeaning:
      'Ozetlemek gerekirse enerjilendirme oncesinde iki aksiyon acik kalmistir.',
    whenToUse: 'Closing a discussion clearly',
    example:
      'To summarize, two actions remain open before energization: protection settings and final labelling.',
  },
  {
    id: 'meeting-confirm',
    category: 'Ask for confirmation',
    phrase: 'Can we record this as the agreed action and completion date?',
    turkishMeaning:
      'Bunu mutabik kalinan aksiyon ve bitis tarihi olarak kaydedebilir miyiz?',
    whenToUse: 'Turning discussion into a commitment',
    example: 'Can we record Thursday as the agreed action and completion date?',
  },
  {
    id: 'meeting-pushback',
    category: 'Push back politely',
    phrase:
      'We can support the request, but not within the proposed timeframe without affecting safety checks.',
    turkishMeaning:
      'Talebi destekleyebiliriz ancak guvenlik kontrollerini etkilemeden onerilen surede yapamayiz.',
    whenToUse: 'Setting a reasonable limit',
    example:
      'We can support the request, but not within the proposed timeframe without affecting safety checks.',
  },
  {
    id: 'meeting-delay',
    category: 'Explain delay',
    phrase:
      'The delay is caused by an unresolved approval, not by site productivity.',
    turkishMeaning:
      'Gecikme saha verimliliginden degil, cozulmemis bir onaydan kaynaklanmaktadir.',
    whenToUse: 'Separating root cause from performance',
    example:
      'The delay is caused by an unresolved material approval, not by site productivity.',
  },
  {
    id: 'meeting-progress',
    category: 'Report progress',
    phrase:
      'Installation is 80 percent complete, with testing planned to start on Monday.',
    turkishMeaning:
      'Montaj yuzde 80 tamamlandi, testlerin pazartesi baslamasi planlaniyor.',
    whenToUse: 'Giving measurable progress',
    example:
      'Installation is 80 percent complete, with point-to-point testing planned to start on Monday.',
  },
  {
    id: 'meeting-close',
    category: 'Close action item',
    phrase: 'The evidence has been accepted, so this action can be closed.',
    turkishMeaning: 'Kanıt kabul edildi, bu nedenle aksiyon kapatilabilir.',
    whenToUse: 'Closing an action against evidence',
    example:
      'The revised test record has been accepted, so this action can be closed.',
  },
  {
    id: 'meeting-escalate',
    category: 'Escalate issue politely',
    phrase:
      'As the issue now affects the milestone, management support is required today.',
    turkishMeaning:
      'Konu artik kilometre tasini etkiledigi icin bugun yonetim destegi gereklidir.',
    whenToUse: 'Escalating without blame',
    example:
      'As the unresolved access issue now affects the milestone, management support is required today.',
  },
];

const BASE_SITE_DICTIONARY: BaseSiteDictionaryTerm[] = [
  {
    id: 'site-busbar',
    term: 'busbar',
    turkishMeaning: 'bara',
    technicalExplanation:
      'A rigid conductor used to distribute high current within switchgear or distribution equipment.',
    siteExample:
      'Confirm the busbar torque values before closing the LV panel.',
    commonWrongUsage:
      'Do not use cable when referring to the internal rigid conductor.',
    relatedTerms: ['switchgear', 'torque', 'feeder'],
    category: 'Electrical',
  },
  {
    id: 'site-balancing',
    term: 'hydronic balancing',
    turkishMeaning: 'hidronik dengeleme',
    technicalExplanation:
      'Adjustment of water flow through HVAC branches so each circuit receives its design flow.',
    siteExample:
      'Hydronic balancing will begin after all control valves are commissioned.',
    commonWrongUsage: 'Balancing is not the same as flushing the pipework.',
    relatedTerms: ['design flow', 'control valve', 'commissioning'],
    category: 'Mechanical',
  },
  {
    id: 'site-cover',
    term: 'concrete cover',
    turkishMeaning: 'beton ortusu',
    technicalExplanation:
      'The distance between reinforcement steel and the nearest concrete surface.',
    siteExample:
      'The spacer blocks must maintain the specified concrete cover.',
    commonWrongUsage: 'Do not call it concrete thickness.',
    relatedTerms: ['reinforcement', 'spacer', 'formwork'],
    category: 'Civil',
  },
  {
    id: 'site-hold-point',
    term: 'hold point',
    turkishMeaning: 'bekletme noktasi',
    technicalExplanation:
      'A mandatory inspection stage beyond which work cannot proceed without formal release.',
    siteExample: 'Cable energization is a hold point in the approved ITP.',
    commonWrongUsage:
      'A hold point is stronger than an optional witness point.',
    relatedTerms: ['ITP', 'witness point', 'release'],
    category: 'QA/QC',
  },
  {
    id: 'site-loto',
    term: 'lockout/tagout',
    turkishMeaning: 'kilitleme ve etiketleme',
    technicalExplanation:
      'A controlled isolation process that prevents hazardous energy from being restored during work.',
    siteExample: 'Apply lockout/tagout before opening the starter panel.',
    commonWrongUsage:
      'Switching equipment off alone is not a complete LOTO process.',
    relatedTerms: ['isolation', 'permit to work', 'zero energy'],
    category: 'HSE',
  },
  {
    id: 'site-cause-effect',
    term: 'cause-and-effect test',
    turkishMeaning: 'sebep-sonuc testi',
    technicalExplanation:
      'An integrated test confirming that an initiating event produces every required system response.',
    siteExample:
      'The fire alarm cause-and-effect test requires the BMS and smoke-control teams.',
    commonWrongUsage: 'It is not only an alarm-device functional test.',
    relatedTerms: ['interface', 'integrated test', 'matrix'],
    category: 'Commissioning',
  },
  {
    id: 'site-lead-time',
    term: 'lead time',
    turkishMeaning: 'tedarik suresi',
    technicalExplanation:
      'The elapsed time from confirmed order or release to availability for delivery.',
    siteExample:
      'The transformer lead time exceeds the current procurement allowance.',
    commonWrongUsage: 'Lead time is not the same as shipping duration.',
    relatedTerms: ['ex-works', 'required-on-site', 'expediting'],
    category: 'Procurement',
  },
  {
    id: 'site-lookahead',
    term: 'look-ahead programme',
    turkishMeaning: 'kisa vadeli is programi',
    technicalExplanation:
      'A detailed short-term plan, commonly covering two to six weeks, derived from the master programme.',
    siteExample:
      'Add the inspection dates to the three-week look-ahead programme.',
    commonWrongUsage: 'It should not replace the approved baseline programme.',
    relatedTerms: ['baseline', 'milestone', 'constraint'],
    category: 'Site Management',
  },
];

const BASE_QUICK_AI_ACTIONS: BaseQuickAIAction[] = [
  {
    id: 'shorter',
    label: 'Make shorter',
    instruction:
      'Rewrite this more concisely without losing technical meaning.',
  },
  {
    id: 'professional',
    label: 'More professional',
    instruction: 'Rewrite this in professional engineering English.',
  },
  {
    id: 'polite',
    label: 'More polite',
    instruction: 'Rewrite this with a polite but clear professional tone.',
  },
  {
    id: 'technical',
    label: 'More technical',
    instruction: 'Improve the technical precision and terminology.',
  },
  {
    id: 'mistakes',
    label: 'Explain mistakes',
    instruction:
      'Explain grammar, word choice and tone mistakes, then provide a corrected version.',
  },
  {
    id: 'translate',
    label: 'Translate',
    instruction:
      'Translate this between Turkish and English while preserving engineering terminology.',
  },
  {
    id: 'b1',
    label: 'Simplify to B1',
    instruction: 'Rewrite this at clear B1 English level.',
  },
  {
    id: 'b2c1',
    label: 'Upgrade to B2/C1',
    instruction: 'Rewrite this at strong B2 to C1 professional level.',
  },
  {
    id: 'consultant',
    label: 'For consultant',
    instruction: 'Rewrite this as a formal response suitable for a consultant.',
  },
  {
    id: 'contractor',
    label: 'For contractor',
    instruction:
      'Rewrite this as a clear site instruction suitable for a contractor.',
  },
  {
    id: 'email',
    label: 'Turn into email',
    instruction:
      'Convert this into a complete professional email with a subject.',
  },
  {
    id: 'report',
    label: 'Turn into report',
    instruction: 'Convert this into a concise engineering report entry.',
  },
  {
    id: 'meeting',
    label: 'Meeting response',
    instruction: 'Convert this into a natural professional meeting response.',
  },
];

export const MEETING_PHRASES: MeetingPhrase[] = [
  ...BASE_MEETING_PHRASES.map((entry) => ({
    ...entry,
    tone: 'Professional and clear',
    tags: [entry.category.toLowerCase(), 'meeting', 'site communication'],
  })),
  ...EXPANDED_MEETING_PHRASES,
];

export const SITE_DICTIONARY: SiteDictionaryTerm[] = [
  ...BASE_SITE_DICTIONARY.map((entry) => ({
    ...entry,
    tags: [entry.category.toLowerCase(), 'site dictionary'],
  })),
  ...EXPANDED_SITE_DICTIONARY,
];

export const QUICK_AI_ACTIONS: QuickAIAction[] = BASE_QUICK_AI_ACTIONS.map(
  (action) => ({
    ...action,
    systemInstruction: `${action.instruction} Preserve facts, dates, standards, responsibilities and technical terminology. Never invent project evidence.`,
    expectedOutputStyle:
      'One polished engineering version followed by a short note describing the main improvement.',
    exampleInput:
      'Cable tray delayed because access not ready. We finish maybe Thursday.',
    exampleOutput: `${action.label}: Cable-tray installation is delayed because the work area has not been released. Subject to access confirmation today, completion is forecast for Thursday.`,
  })
);
