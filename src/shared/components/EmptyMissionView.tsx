import type { Dispatch, SetStateAction } from 'react';

import { Link } from 'react-router-dom';

import { PageHeader } from '@/shared/components/PageHeader';

import {
  type CefrLevel,
  type ContentLevelFilter,
  EmptyLevelState,
  LevelContentFilter,
} from '@/features/level-system';

export function EmptyMissionView({
  title,
  description,
  skill,
  levelFilter,
  currentLevel,
  setLevelFilter,
}: {
  title: string;
  description?: string;
  skill: string;
  levelFilter: ContentLevelFilter;
  currentLevel: CefrLevel;
  setLevelFilter: Dispatch<SetStateAction<ContentLevelFilter>> | ((v: ContentLevelFilter) => void);
}) {
  return (
    <div className="min-h-screen bg-background pb-16 text-foreground space-y-4">
      <PageHeader title={title} description={description} />
      <LevelContentFilter
        value={levelFilter}
        currentLevel={currentLevel}
        onChange={setLevelFilter}
      />
      <EmptyLevelState skill={skill} />
      <Link to="/curriculum" className="inline-flex text-sm font-bold text-primary hover:underline">
        Back to Learning Hub
      </Link>
    </div>
  );
}
