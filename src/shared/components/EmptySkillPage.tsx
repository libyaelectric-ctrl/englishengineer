import { ArrowRight, BookOpen, Compass, Sparkles } from 'lucide-react';

import type { Dispatch, SetStateAction } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@/shared/components/Button';
import { PageHeader } from '@/shared/components/PageHeader';

import {
  type CefrLevel,
  type ContentLevelFilter,
  LevelContentFilter,
} from '@/features/level-system';

const SKILL_SUGGESTIONS: Record<string, Array<{ label: string; to: string }>> = {
  reading: [
    { label: 'Try Reading Missions', to: '/reading' },
    { label: 'Browse Vocabulary', to: '/vocabulary' },
  ],
  writing: [
    { label: 'Start Writing Mission', to: '/writing' },
    { label: 'Practice Grammar', to: '/grammar' },
  ],
  listening: [
    { label: 'Listen to Transcripts', to: '/listening' },
    { label: 'Improve Vocabulary', to: '/vocabulary' },
  ],
  speaking: [
    { label: 'Voice Practice', to: '/speaking' },
    { label: 'Listen First', to: '/listening' },
  ],
  vocabulary: [
    { label: 'Start Learning', to: '/vocabulary' },
    { label: 'Take Placement Test', to: '/placement' },
  ],
  grammar: [
    { label: 'Grammar Lessons', to: '/grammar' },
    { label: 'Practice Writing', to: '/writing' },
  ],
};

export function EmptySkillPage({
  skill,
  title,
  description,
  levelFilter,
  currentLevel,
  setLevelFilter,
}: {
  skill: string;
  title: string;
  description?: string;
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: Dispatch<SetStateAction<ContentLevelFilter>> | ((v: ContentLevelFilter) => void);
}) {
  const suggestions = SKILL_SUGGESTIONS[skill] ?? [{ label: 'Go to Dashboard', to: '/dashboard' }];

  return (
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-6">
      <PageHeader title={title} description={description} />
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />

      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Compass className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-bold text-foreground">No {title} content yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-copy leading-relaxed">
          This skill area is being prepared for your level. Check back soon or explore other skills
          to keep learning.
        </p>

        <div className="mt-8 flex flex-col items-center gap-3">
          {suggestions.map((s) => (
            <Link key={s.to} to={s.to} className="w-full max-w-xs">
              <Button variant="outline" className="w-full gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                {s.label}
                <ArrowRight className="h-3.5 w-3.5 ml-auto" />
              </Button>
            </Link>
          ))}
        </div>

        <Link
          to="/curriculum"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <BookOpen className="h-3.5 w-3.5" />
          Back to Learning Hub
        </Link>
      </div>
    </div>
  );
}
