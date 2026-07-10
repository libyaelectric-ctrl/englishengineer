import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth';
import { VocabularyMenuService } from '@/features/vocabulary/vocabulary.menu';
import { GrammarProgressService } from '@/features/grammar';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing';
import { useListeningStore } from '@/features/listening';
import { useSpeakingStore } from '@/features/speaking';
import { SkillEntryBrief } from '@/features/learning-orchestrator';

const log = (_page: string, _action: string, _details: string) => {};

function Section({
  title,
  children,
  open = true,
}: {
  title: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  const [expanded, setExpanded] = useState(open);
  return (
    <div className="border-b border-border-soft">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-surface-hover/50 transition-colors"
      >
        <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-copy">
          {title}
        </h3>
        <svg
          className={cn(
            'h-3 w-3 text-muted-copy transition-transform',
            expanded && 'rotate-180'
          )}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && <div className="px-4 pb-3">{children}</div>}
    </div>
  );
}

function Item({
  label,
  active,
  onClick,
  badge,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
  badge?: string | number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-xs transition-all duration-150 cursor-pointer',
        active
          ? 'bg-foreground text-background font-medium'
          : 'text-muted-copy hover:bg-surface-hover hover:text-foreground hover:translate-x-0.5'
      )}
    >
      <span>{label}</span>
      {badge !== undefined && (
        <span
          className={cn(
            'text-[10px] font-semibold px-1.5 py-0.5 rounded',
            active ? 'bg-white/20' : 'bg-surface-hover'
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[11px] text-muted-copy">{label}</span>
      <span
        className={cn('text-[11px] font-semibold', color || 'text-foreground')}
      >
        {value}
      </span>
    </div>
  );
}

function Progress({
  value,
  max,
  color = '#22c55e',
}: {
  value: number;
  max: number;
  color?: string;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-1.5 rounded-full bg-surface-hover overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${pct}%`, background: color }}
      ></div>
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  variant = 'default',
}: {
  icon: string;
  label: string;
  onClick: () => void;
  variant?: string;
}) {
  const v = {
    default:
      'border-border-soft hover:border-border-hover hover:bg-surface-hover',
    primary: 'border-primary/20 hover:bg-primary/5 text-primary',
    warning: 'border-amber-500/20 hover:bg-amber-500/5 text-amber-600',
  };
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 w-full rounded-lg border px-3 py-2 text-xs transition-all duration-150 cursor-pointer',
        v[variant as keyof typeof v] || v.default
      )}
    >
      <span>{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <svg
        className="h-3 w-3 opacity-40"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
}

export const RightSidebar: React.FC = () => {
  const location = useLocation();
  const content = getContent(location.pathname);
  return (
    <aside
      className={cn(
        'hidden h-screen w-64 shrink-0 flex-col border-l border-border-hover bg-surface overflow-y-auto custom-scrollbar',
        content ? 'lg:flex' : 'lg:hidden'
      )}
    >
      {content}
    </aside>
  );
};

function getContent(path: string): React.ReactNode {
  if (path === '/dashboard' || path === '/') return <Dashboard />;
  if (path.startsWith('/vocabulary')) return <Vocab />;
  if (path.startsWith('/grammar')) return <Grammar />;
  if (path.startsWith('/reading')) return <Reading />;
  if (path.startsWith('/writing')) return <Writing />;
  if (path.startsWith('/listening')) return <Listening />;
  if (path.startsWith('/speaking')) return <Speaking />;
  if (path.startsWith('/curriculum')) return <Curriculum />;
  if (path.startsWith('/tools')) return <Tools />;
  if (path.startsWith('/profile')) return <Profile />;
  return null;
}

function Dashboard() {
  const navigate = useNavigate();
  const v = VocabularyMenuService.getSummary();
  const g = GrammarProgressService.getSummary(360);
  return (
    <>
      <Section title="Quick Actions">
        <div className="space-y-1.5">
          <Action
            icon="📚"
            label="Start Vocabulary"
            onClick={() => navigate('/vocabulary')}
            variant="primary"
          />
          <Action
            icon="✍️"
            label="Practice Writing"
            onClick={() => navigate('/writing')}
          />
          <Action
            icon="📖"
            label="Continue Reading"
            onClick={() => navigate('/reading')}
          />
          <Action
            icon="🎧"
            label="Listening Task"
            onClick={() => navigate('/listening')}
          />
          <Action
            icon="🗣️"
            label="Speaking Practice"
            onClick={() => navigate('/speaking')}
          />
        </div>
      </Section>
      <Section title="Skills">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Vocabulary</span>
              <span>
                {v.mastered}/{v.total}
              </span>
            </div>
            <Progress value={v.mastered} max={v.total} />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Grammar</span>
              <span>{g.strong}/360</span>
            </div>
            <Progress value={g.strong} max={360} color="#8b5cf6" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Reading</span>
              <span>0/10</span>
            </div>
            <Progress value={0} max={10} color="#22c55e" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Writing</span>
              <span>0/10</span>
            </div>
            <Progress value={0} max={10} color="#f59e0b" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Listening</span>
              <span>0/5</span>
            </div>
            <Progress value={0} max={5} color="#ec4899" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Speaking</span>
              <span>0/5</span>
            </div>
            <Progress value={0} max={5} color="#ef4444" />
          </div>
        </div>
      </Section>
      <Section title="Streak">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-hover">
          <span className="text-lg">🔥</span>
          <div>
            <div className="text-sm font-semibold text-foreground">1 day</div>
            <div className="text-[10px] text-muted-copy">Keep going!</div>
          </div>
        </div>
      </Section>
    </>
  );
}

function Vocab() {
  const v = VocabularyMenuService.getSummary();
  const [level, setLevel] = useState('A1');
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="vocabulary" compact={true} />
      </div>
      <Section title="Level">
        <div className="space-y-0.5">
          {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
            <Item
              key={l}
              label={l}
              active={l === level}
              onClick={() => {
                setLevel(l);
                log('/vocabulary', 'level', l);
              }}
              badge={l === level ? '✓' : undefined}
            />
          ))}
        </div>
      </Section>
      <Section title="Word Status">
        <Stat label="New" value={v.newWords} color="text-blue-500" />
        <Stat label="Learning" value={v.learning} color="text-amber-500" />
        <Stat label="Mastered" value={v.mastered} color="text-green-500" />
        <Stat label="Weak" value={v.weak} color="text-red-500" />
        <Stat label="Forgotten" value={v.forgotten} color="text-orange-500" />
        <Stat label="Due Today" value={v.dueToday} color="text-purple-500" />
      </Section>
      <Section title="Progress">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Mastery</span>
              <span>
                {v.mastered}/{v.total}
              </span>
            </div>
            <Progress value={v.mastered} max={v.total} />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Learning</span>
              <span>
                {v.learning}/{v.total}
              </span>
            </div>
            <Progress value={v.learning} max={v.total} color="#f59e0b" />
          </div>
        </div>
      </Section>
      <Section title="Quick Actions">
        <div className="space-y-1.5">
          <Action
            icon="⏰"
            label={`Review ${v.dueToday} due words`}
            onClick={() => log('/vocabulary', 'review', `${v.dueToday} due`)}
            variant="warning"
          />
          <Action
            icon="➕"
            label="Add custom word"
            onClick={() =>
              document
                .querySelector('[aria-label="Search vocabulary"]')
                ?.scrollIntoView({ behavior: 'smooth' })
            }
          />
          <Action
            icon="📤"
            label="Export vocabulary"
            onClick={() => alert('Export coming soon!')}
          />
        </div>
      </Section>
    </>
  );
}

function Grammar() {
  const g = GrammarProgressService.getSummary(360);
  const [tab, setTab] = useState('New');
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="grammar" compact={true} />
      </div>
      <Section title="Status">
        <div className="space-y-0.5">
          {(['New', 'Learning', 'Due', 'Strong'] as const).map((t) => (
            <Item
              key={t}
              label={t}
              active={t === tab}
              onClick={() => {
                setTab(t);
                log('/grammar', 'tab', t);
              }}
              badge={
                t === 'New'
                  ? g.newRules
                  : t === 'Learning'
                    ? g.learning
                    : t === 'Due'
                      ? g.due
                      : g.strong
              }
            />
          ))}
        </div>
      </Section>
      <Section title="Progress">
        <div className="space-y-2">
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Strong</span>
              <span>{g.strong}/360</span>
            </div>
            <Progress value={g.strong} max={360} />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-muted-copy mb-1">
              <span>Due</span>
              <span>{g.due}/360</span>
            </div>
            <Progress value={g.due} max={360} color="#f59e0b" />
          </div>
        </div>
        <Stat label="Tracked" value={g.tracked} />
        <Stat label="New" value={g.newRules} color="text-blue-500" />
      </Section>
      <Section title="Actions">
        <div className="space-y-1.5">
          <Action
            icon="📝"
            label={`Practice ${g.due} due rules`}
            onClick={() => log('/grammar', 'practice', `${g.due} due`)}
            variant="warning"
          />
          <Action
            icon="🔄"
            label="Review strong"
            onClick={() => log('/grammar', 'review', 'strong')}
          />
        </div>
      </Section>
    </>
  );
}

function Reading() {
  const { missions, completedMissions } = useReadingStore();
  const done = Object.keys(completedMissions).length;
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="reading" compact={true} />
      </div>
      <Section title="Missions">
        <div className="space-y-0.5 max-h-48 overflow-y-auto">
          {missions.slice(0, 10).map((m) => (
            <Item
              key={m.id}
              label={m.title}
              active={m.id === missions[0]?.id}
              badge={m.cefrLevel}
              onClick={() => log('/reading', 'select', m.title)}
            />
          ))}
        </div>
      </Section>
      <Section title="Progress">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Completed</span>
            <span>
              {done}/{missions.length}
            </span>
          </div>
          <Progress value={done} max={missions.length} />
        </div>
      </Section>
      <Section title="Actions">
        <Action
          icon="📖"
          label="Start next mission"
          onClick={() => log('/reading', 'start', 'next')}
          variant="primary"
        />
      </Section>
    </>
  );
}

function Writing() {
  const { missions, completedMissions } = useWritingStore();
  const done = Object.keys(completedMissions).length;
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="writing" compact={true} />
      </div>
      <Section title="Templates">
        <div className="space-y-0.5">
          {[
            'RFI Response',
            'Email Draft',
            'NCR Report',
            'Site Update',
            'Technical Memo',
          ].map((t) => (
            <Item
              key={t}
              label={t}
              onClick={() => log('/writing', 'template', t)}
            />
          ))}
        </div>
      </Section>
      <Section title="Missions">
        <div className="space-y-0.5">
          {missions.slice(0, 5).map((m) => (
            <Item
              key={m.id}
              label={m.title}
              active={m.id === missions[0]?.id}
              badge={m.cefrLevel}
              onClick={() => log('/writing', 'select', m.title)}
            />
          ))}
        </div>
      </Section>
      <Section title="Progress">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Completed</span>
            <span>
              {done}/{missions.length}
            </span>
          </div>
          <Progress value={done} max={missions.length} />
        </div>
      </Section>
    </>
  );
}

function Listening() {
  const { missions } = useListeningStore();
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="listening" compact={true} />
      </div>
      <Section title="Tasks">
        <div className="space-y-0.5">
          {missions.slice(0, 5).map((m) => (
            <Item
              key={m.id}
              label={m.title}
              active={m.id === missions[0]?.id}
              badge={m.cefrLevel}
              onClick={() => log('/listening', 'select', m.title)}
            />
          ))}
        </div>
      </Section>
      <Section title="Categories">
        <div className="space-y-0.5">
          {[
            'Site Meetings',
            'Technical Briefings',
            'Safety Protocols',
            'Commissioning',
          ].map((c) => (
            <Item
              key={c}
              label={c}
              onClick={() => log('/listening', 'category', c)}
            />
          ))}
        </div>
      </Section>
    </>
  );
}

function Speaking() {
  const { missions } = useSpeakingStore();
  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="speaking" compact={true} />
      </div>
      <Section title="Scenarios">
        <div className="space-y-0.5">
          {missions.slice(0, 6).map((m) => (
            <Item
              key={m.id}
              label={m.title}
              active={m.id === missions[0]?.id}
              badge={m.cefrLevel}
              onClick={() => log('/speaking', 'select', m.title)}
            />
          ))}
        </div>
      </Section>
      <Section title="Scores">
        <Stat label="Average" value="—" />
        <Stat label="Best" value="—" />
        <Stat label="Practice" value="0 min" />
      </Section>
    </>
  );
}

function Curriculum() {
  return (
    <>
      <Section title="Path">
        <div className="space-y-0.5">
          <Item label="Today's Tasks" active />
          <Item label="This Week" />
          <Item label="Full Curriculum" />
          <Item label="Review Queue" badge="0" />
        </div>
      </Section>
      <Section title="Stats">
        <Stat label="Streak" value="0 days" color="text-green-500" />
        <Stat label="XP" value="0" />
      </Section>
    </>
  );
}

function Tools() {
  return (
    <Section title="Tools">
      <div className="space-y-0.5">
        {['Work Tools', 'Quick Tools', 'AI Copilot'].map((t) => (
          <Item key={t} label={t} />
        ))}
      </div>
    </Section>
  );
}

function Profile() {
  const { currentUser } = useAuthStore();
  return (
    <>
      <Section title="Account">
        <Stat label="Name" value={currentUser?.displayName || 'User'} />
        <Stat label="Plan" value="Free" color="text-amber-500" />
      </Section>
      <Section title="Links">
        <div className="space-y-0.5">
          {['Edit Profile', 'Preferences', 'Billing', 'Security'].map((s) => (
            <Item key={s} label={s} />
          ))}
        </div>
      </Section>
    </>
  );
}
