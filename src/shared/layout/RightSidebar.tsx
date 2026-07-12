import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/utils/cn';
import { useAuthStore } from '@/features/auth';
import { VocabularyMenuService } from '@/features/vocabulary/vocabulary.menu';
import { GrammarProgressService, useGrammarStore } from '@/features/grammar';
import { useReadingStore } from '@/features/reading';
import { useWritingStore } from '@/features/writing';
import { useListeningStore } from '@/features/listening';
import { useSpeakingStore } from '@/features/speaking';
import { useLearningStore } from '@/core/learning';
import { SkillEntryBrief } from '@/features/learning-orchestrator';

const log = (_page: string, _action: string, _details: string) => {
  // Sidebar interaction tracking placeholder — connect to analytics when needed
};

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
      <span className="text-xs text-muted-copy">{label}</span>
      <span className={cn('text-xs font-semibold', color || 'text-foreground')}>
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
  if (path.startsWith('/admin')) return <Dashboard />;
  if (path.startsWith('/gamification')) return <Curriculum />;
  return <Dashboard />;
}

function Dashboard() {
  const navigate = useNavigate();
  return (
    <>
      <Section title="AI Usage (Team)">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Tokens Used</span>
            <span className="font-bold text-amber-500">85% (850k/1M)</span>
          </div>
          <Progress value={85} max={100} color="#f59e0b" />
          <button className="mt-3 w-full rounded-md bg-amber-500/10 py-1.5 text-[10px] font-bold text-amber-500 hover:bg-amber-500/20 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </Section>

      <Section title="Active Members">
        <div className="flex items-center gap-2 py-1">
          <div className="relative">
            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
              ÖE
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500"></div>
          </div>
          <div className="relative -ml-3">
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-surface">
              AI
            </div>
            <div className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-surface bg-green-500 pulse-dot"></div>
          </div>
          <div className="ml-2 text-xs font-medium text-muted-copy">
            2 Online
          </div>
        </div>
      </Section>

      <Section title="Quick Actions">
        <div className="space-y-1.5">
          <Action
            icon="⚡"
            label="Command Palette (Cmd+K)"
            onClick={() => {
              const e = new KeyboardEvent('keydown', {
                key: 'k',
                metaKey: true,
              });
              window.dispatchEvent(e);
            }}
            variant="primary"
          />
          <Action
            icon="🤖"
            label="New AI Tool"
            onClick={() => navigate('/tools')}
          />
          <Action
            icon="👥"
            label="Invite Team"
            onClick={() => navigate('/team')}
          />
        </div>
      </Section>
    </>
  );
}

const VOCAB_LEVELS = [
  { id: 'A1', max: 500 },
  { id: 'A2', max: 1200 },
  { id: 'B1', max: 2500 },
  { id: 'B2', max: 4000 },
  { id: 'C1', max: 6000 },
  { id: 'C2', max: 8000 },
];

function Vocab() {
  const [v, setV] = useState(() => VocabularyMenuService.getSummary());

  useEffect(() => {
    const interval = setInterval(() => {
      setV(VocabularyMenuService.getSummary());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  let currentLevel = 'A1';
  for (const lvl of VOCAB_LEVELS) {
    if (v.mastered <= lvl.max) {
      currentLevel = lvl.id;
      break;
    }
  }
  if (v.mastered > 8000) currentLevel = 'C2';

  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="vocabulary" compact={true} />
      </div>
      <Section title={`Vocabulary (${v.mastered + v.learning + v.newWords} words)`}>
        <div className="grid grid-cols-3 gap-2">
          {VOCAB_LEVELS.map((lvl, index) => {
            const isActive = lvl.id === currentLevel;
            const isCompleted = v.mastered >= lvl.max;
            const prevMax = index === 0 ? 0 : VOCAB_LEVELS[index - 1].max;

            const bracketTotal = lvl.max - prevMax;
            const bracketProgress = Math.max(
              0,
              Math.min(bracketTotal, v.mastered - prevMax)
            );
            const percent = (bracketProgress / bracketTotal) * 100;

            return (
              <div
                key={lvl.id}
                className={cn(
                  'flex flex-col p-2 rounded-lg border transition-all',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : isCompleted
                      ? 'border-success/30 bg-success/5'
                      : 'border-border-soft bg-surface-hover/50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={cn(
                      'text-xs font-bold',
                      isActive
                        ? 'text-primary'
                        : isCompleted
                          ? 'text-success'
                          : 'text-foreground'
                    )}
                  >
                    {lvl.id}
                  </span>
                  <span className="text-[10px] text-muted-copy font-medium">
                    {lvl.max}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-border-soft rounded-full overflow-hidden relative">
                  <div
                    className={cn(
                      'absolute top-0 left-0 h-full rounded-full transition-all duration-500',
                      isActive
                        ? 'bg-primary'
                        : isCompleted
                          ? 'bg-success'
                          : 'bg-foreground/30'
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
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
            <div className="flex justify-between text-xs text-muted-copy mb-1">
              <span>Total Mastery</span>
              <span>{v.mastered}/{v.total}</span>
            </div>
            <Progress value={v.mastered} max={v.total} color="#3b82f6" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-copy mb-1">
              <span>Learning</span>
              <span>{v.learning}/{v.total}</span>
            </div>
            <Progress value={v.learning} max={v.total} color="#06b6d4" />
          </div>
        </div>
      </Section>
      <Section title="Quick Actions">
        <div className="space-y-1.5">
          <Action
            icon="⏰"
            label={`Review ${v.dueToday} due words`}
            onClick={() => {
              log('/vocabulary', 'review', `${v.dueToday} due`);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            variant="warning"
          />
          <Action
            icon="➕"
            label="Add custom word"
            onClick={() => {
              const input = document.querySelector('input');
              if (input) {
                input.scrollIntoView({ behavior: 'smooth' });
                input.focus();
              }
            }}
          />
        </div>
      </Section>
    </>
  );
}

function Grammar() {
  useLearningStore((state) => state.studySessions.length);
  const g = GrammarProgressService.getSummary(360);
  const { tab, setTab, rules, selectedId } = useGrammarStore();

  const selectedRule = rules.find((rule) => rule.id === selectedId) ?? rules[0];
  const selectedRuleIndex = selectedRule
    ? rules.findIndex((rule) => rule.id === selectedRule.id)
    : -1;

  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="grammar" compact={true} />
      </div>

      <Section title="Your grammar path">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
              {selectedRule ? selectedRule.cefrLevel : 'Loading'} PATH ·{' '}
              {rules.length} NAMED TOPICS
            </p>
            <p className="text-xs text-muted-copy leading-5">
              Move through named topics in order; practice feeds Learning Memory
            </p>
          </div>

          {selectedRule && (
            <div className="rounded-lg bg-surface-hover p-3 border border-border-soft">
              <p className="text-[10px] font-bold text-primary mb-1">
                LESSON {selectedRuleIndex + 1} OF {rules.length}
              </p>
              <p className="text-sm font-bold text-foreground">
                {selectedRule.title}
              </p>
              <p className="text-[10px] text-muted-copy mt-1 truncate">
                {selectedRule.grammarCategory}
              </p>
            </div>
          )}
        </div>
      </Section>

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
            <div className="flex justify-between text-xs text-muted-copy mb-1">
              <span>Strong</span>
              <span>{g.strong}/360 ({Math.round((g.strong / 360) * 100)}%)</span>
            </div>
            <Progress value={g.strong} max={360} color="#8b5cf6" />
          </div>
          <div>
            <div className="flex justify-between text-xs text-muted-copy mb-1">
              <span>Due</span>
              <span>{g.due}/360</span>
            </div>
            <Progress value={g.due} max={360} color="#e879f9" />
          </div>
        </div>
        <Stat label="Tracked" value={g.tracked} />
        <Stat label="New" value={g.newRules} color="text-violet-500" />
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
  const { missions, completedMissions, selectedMissionId } = useReadingStore();
  const done = Object.keys(completedMissions).length;

  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ?? missions[0];
  const selectedMissionIndex = selectedMission
    ? missions.findIndex((m) => m.id === selectedMission.id)
    : -1;

  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="reading" compact={true} />
      </div>

      <Section title="Your reading path">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
              {selectedMission ? selectedMission.cefrLevel : 'Loading'} PATH ·{' '}
              {missions.length} SCENARIOS
            </p>
            <p className="text-xs text-muted-copy leading-5">
              Read professional documentation and answer comprehension
              questions.
            </p>
          </div>

          {selectedMission && (
            <div className="rounded-lg bg-surface-hover p-3 border border-border-soft">
              <p className="text-[10px] font-bold text-primary mb-1">
                SCENARIO {selectedMissionIndex + 1} OF {missions.length}
              </p>
              <p className="text-sm font-bold text-foreground">
                {selectedMission.title}
              </p>
              <p className="text-[10px] text-muted-copy mt-1 truncate">
                {selectedMission.discipline}
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Progress">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Completed</span>
            <span>{done}/{missions.length}</span>
          </div>
          <Progress value={done} max={missions.length} color="#10b981" />
        </div>
      </Section>
    </>
  );
}

function Writing() {
  const { missions, completedMissions, selectedMissionId } = useWritingStore();
  const done = Object.keys(completedMissions).length;

  const selectedMission =
    missions.find((m) => m.id === selectedMissionId) ?? missions[0];
  const selectedMissionIndex = selectedMission
    ? missions.findIndex((m) => m.id === selectedMission.id)
    : -1;

  return (
    <>
      <div className="px-4 pt-4">
        <SkillEntryBrief skill="writing" compact={true} />
      </div>

      <Section title="Your writing path">
        <div className="space-y-3">
          <div>
            <p className="text-[10px] font-bold text-primary tracking-wider uppercase mb-1">
              {selectedMission ? selectedMission.cefrLevel : 'Loading'} PATH ·{' '}
              {missions.length} SCENARIOS
            </p>
            <p className="text-xs text-muted-copy leading-5">
              Draft professional responses and master technical writing.
            </p>
          </div>

          {selectedMission && (
            <div className="rounded-lg bg-surface-hover p-3 border border-border-soft">
              <p className="text-[10px] font-bold text-primary mb-1">
                SCENARIO {selectedMissionIndex + 1} OF {missions.length}
              </p>
              <p className="text-sm font-bold text-foreground">
                {selectedMission.title}
              </p>
              <p className="text-[10px] text-muted-copy mt-1 truncate">
                {selectedMission.discipline}
              </p>
            </div>
          )}
        </div>
      </Section>

      <Section title="Progress">
        <div>
          <div className="flex justify-between text-[10px] text-muted-copy mb-1">
            <span>Completed</span>
            <span>{done}/{missions.length}</span>
          </div>
          <Progress value={done} max={missions.length} color="#f97316" />
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
      <Section title="Analytics">
        <Stat label="Weekly Goal" value="85%" color="text-green-500" />
        <Stat label="Readiness" value="High" />
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
      <Section title="Competency Index">
        <div className="text-center py-4">
          <div className="text-xl font-black text-primary mb-1">
            Senior Engineer
          </div>
          <div className="text-[10px] font-bold tracking-widest uppercase text-muted-copy mb-4">
            Role & Readiness
          </div>
          <Progress value={85} max={100} color="#3b82f6" />
          <div className="mt-2 text-[10px] font-medium text-muted-copy">
            Score: 85/100 (High Readiness)
          </div>
        </div>
      </Section>
      <Section title="Security Logs">
        <div className="space-y-3 pt-1">
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-foreground">
                MacBook Pro - Istanbul
              </span>
              <span className="text-[9px] text-green-500">Current Session</span>
            </div>
            <span className="text-[10px] text-muted-copy">Now</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium text-muted-copy">
                iPhone 14 - Ankara
              </span>
            </div>
            <span className="text-[10px] text-muted-copy">2h ago</span>
          </div>
        </div>
      </Section>
      <Section title="Account">
        <Stat label="Name" value={currentUser?.displayName || 'User'} />
        <Stat label="Plan" value="Pro" color="text-amber-500" />
      </Section>
    </>
  );
}
