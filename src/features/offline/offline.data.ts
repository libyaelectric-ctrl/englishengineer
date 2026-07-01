import { OfflineCapability } from './offline.types';

export const OFFLINE_CAPABILITIES: OfflineCapability[] = [
  {
    id: 'vocabulary',
    name: 'Vocabulary',
    description: 'Bundled vocabulary and locally saved review state.',
    status: 'available',
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Bundled reading missions and local results.',
    status: 'available',
  },
  {
    id: 'phrases',
    name: 'Phrase Library',
    description: 'Bundled phrases, favorites and recent items.',
    status: 'available',
  },
  {
    id: 'templates',
    name: 'Engineering Templates',
    description: 'Bundled engineering workflows and local recent-item history.',
    status: 'available',
  },
  {
    id: 'email-templates',
    name: 'Email Templates',
    description: 'Bundled professional email variants and Turkish guidance.',
    status: 'available',
  },
  {
    id: 'dictionary',
    name: 'Site Dictionary',
    description: 'Bundled searchable site terminology.',
    status: 'available',
  },
  {
    id: 'ai-history',
    name: 'Saved AI Outputs',
    description: 'Previously saved local session history only.',
    status: 'limited',
  },
  {
    id: 'daily-history',
    name: 'Daily Task History',
    description: 'Task completion and mistake log saved on this device.',
    status: 'available',
  },
  {
    id: 'audio',
    name: 'Listening Audio',
    description:
      'Available offline only after the browser has cached the audio asset.',
    status: 'limited',
  },
  {
    id: 'ai-rewrite',
    name: 'AI Rewriting',
    description: 'Requires the configured backend and an internet connection.',
    status: 'internet-required',
  },
  {
    id: 'ai-coach',
    name: 'AI Coach',
    description: 'Real AI requires the configured backend and internet.',
    status: 'internet-required',
  },
  {
    id: 'cloud',
    name: 'Cloud Sync',
    description: 'Requires Supabase configuration and internet.',
    status: 'internet-required',
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Requires the billing backend and internet.',
    status: 'internet-required',
  },
  {
    id: 'updates',
    name: 'Fresh Content Updates',
    description: 'Requires a new deployment or connected content service.',
    status: 'internet-required',
  },
];
