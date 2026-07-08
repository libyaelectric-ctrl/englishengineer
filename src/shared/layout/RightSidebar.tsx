import React from 'react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';

interface Nav2SectionProps {
  title: string;
  children: React.ReactNode;
}

function Nav2Section({ title, children }: Nav2SectionProps) {
  return (
    <div className="p-4">
      <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-copy">
        {title}
      </h3>
      {children}
    </div>
  );
}

interface Nav2ItemProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function Nav2Item({ label, active, onClick }: Nav2ItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center rounded-lg px-3 py-2 text-xs font-medium transition-colors',
        active
          ? 'bg-foreground text-background'
          : 'text-muted-copy hover:bg-surface-hover hover:text-foreground'
      )}
    >
      {label}
    </button>
  );
}

export const RightSidebar: React.FC = () => {
  const location = useLocation();
  const path = location.pathname;

  const nav2Content = getNav2Content(path);

  return (
    <aside
      className={cn(
        'hidden h-screen w-64 shrink-0 flex-col border-l border-border-soft bg-surface overflow-y-auto custom-scrollbar',
        nav2Content ? 'lg:flex' : 'lg:hidden'
      )}
    >
      {nav2Content}
    </aside>
  );
};

function getNav2Content(path: string): React.ReactNode {
  if (path === '/dashboard' || path === '/') return <DashboardNav2 />;
  if (path.startsWith('/vocabulary')) return <VocabularyNav2 />;
  if (path.startsWith('/grammar')) return <GrammarNav2 />;
  if (path.startsWith('/reading')) return <ReadingNav2 />;
  if (path.startsWith('/writing')) return <WritingNav2 />;
  if (path.startsWith('/listening')) return <ListeningNav2 />;
  if (path.startsWith('/speaking')) return <SpeakingNav2 />;
  if (path.startsWith('/curriculum')) return <CurriculumNav2 />;
  if (path.startsWith('/tools')) return <ToolsNav2 />;
  if (path.startsWith('/profile')) return <ProfileNav2 />;
  return null;
}

function DashboardNav2() {
  return (
    <>
      <Nav2Section title="Quick Actions">
        <div className="space-y-1">
          <Nav2Item label="Start Vocabulary Lesson" />
          <Nav2Item label="Practice Writing" />
          <Nav2Item label="Continue Reading" />
        </div>
      </Nav2Section>
      <Nav2Section title="Reminders">
        <p className="text-[10px] leading-4 text-muted-copy">
          Complete at least one lesson today to maintain your streak.
        </p>
      </Nav2Section>
    </>
  );
}

function VocabularyNav2() {
  return (
    <>
      <Nav2Section title="Level">
        <div className="space-y-1">
          {['A1','A2','B1','B2','C1','C2'].map((level) => (
            <Nav2Item key={level} label={level} active={level === 'A1'} />
          ))}
        </div>
      </Nav2Section>
      <Nav2Section title="Word Status">
        <div className="space-y-2">
          <div className="flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2">
            <span className="text-xs text-muted-copy">New</span>
            <span className="text-xs font-semibold text-foreground">5000</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2">
            <span className="text-xs text-muted-copy">Learning</span>
            <span className="text-xs font-semibold text-primary">0</span>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-surface-hover px-3 py-2">
            <span className="text-xs text-muted-copy">Mastered</span>
            <span className="text-xs font-semibold text-success">0</span>
          </div>
        </div>
      </Nav2Section>
    </>
  );
}

function GrammarNav2() {
  return (
    <Nav2Section title="Grammar Categories">
      <div className="space-y-1">
        {['Tenses','Conditionals','Passive Voice','Relative Clauses','Articles','Prepositions'].map((cat) => (
          <Nav2Item key={cat} label={cat} />
        ))}
      </div>
    </Nav2Section>
  );
}

function ReadingNav2() {
  return (
    <Nav2Section title="Document Types">
      <div className="space-y-1">
        {['Technical Reports','Specifications','Safety Documents','Meeting Minutes'].map((t) => (
          <Nav2Item key={t} label={t} />
        ))}
      </div>
    </Nav2Section>
  );
}

function WritingNav2() {
  return (
    <Nav2Section title="Writing Templates">
      <div className="space-y-1">
        {['RFI Templates','Email Templates','Report Templates','NCR Templates'].map((t) => (
          <Nav2Item key={t} label={t} />
        ))}
      </div>
    </Nav2Section>
  );
}

function ListeningNav2() {
  return (
    <Nav2Section title="Audio Categories">
      <div className="space-y-1">
        {['Site Meetings','Technical Briefings','Safety Protocols','Commissioning'].map((t) => (
          <Nav2Item key={t} label={t} />
        ))}
      </div>
    </Nav2Section>
  );
}

function SpeakingNav2() {
  return (
    <Nav2Section title="Scenarios">
      <div className="space-y-1">
        {['Site Introduction','Progress Update','Safety Briefing','Client Meeting'].map((t) => (
          <Nav2Item key={t} label={t} />
        ))}
      </div>
    </Nav2Section>
  );
}

function CurriculumNav2() {
  return (
    <Nav2Section title="Learning Path">
      <div className="space-y-1">
        <Nav2Item label="Today's Tasks" active />
        <Nav2Item label="This Week" />
        <Nav2Item label="Full Curriculum" />
      </div>
    </Nav2Section>
  );
}

function ToolsNav2() {
  return (
    <Nav2Section title="Tool Categories">
      <div className="space-y-1">
        {['Work Tools','Quick Tools','AI Copilot'].map((t) => (
          <Nav2Item key={t} label={t} />
        ))}
      </div>
    </Nav2Section>
  );
}

function ProfileNav2() {
  return (
    <Nav2Section title="Profile Sections">
      <div className="space-y-1">
        {['Overview','Skills & Progress','Preferences','Billing','Security & Data'].map((s) => (
          <Nav2Item key={s} label={s} />
        ))}
      </div>
    </Nav2Section>
  );
}
