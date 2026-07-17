import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Features/Vocabulary/VocabSidebar',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

export default meta;

const VOCAB_LEVELS = [
  { id: 'A1', max: 500 },
  { id: 'A2', max: 1200 },
  { id: 'B1', max: 2500 },
  { id: 'B2', max: 4000 },
  { id: 'C1', max: 6000 },
  { id: 'C2', max: 8000 },
];

function getVocabLevel(mastered: number): string {
  for (const lvl of VOCAB_LEVELS) {
    if (mastered <= lvl.max) return lvl.id;
  }
  return 'C2';
}

const VocabLevelGrid = ({ mastered }: { mastered: number }) => {
  const currentLevel = getVocabLevel(mastered);
  return (
    <div className="grid grid-cols-3 gap-2">
      {VOCAB_LEVELS.map((lvl, index) => {
        const isActive = lvl.id === currentLevel;
        const isCompleted = mastered >= lvl.max;
        const prevMax = index === 0 ? 0 : VOCAB_LEVELS[index - 1].max;
        const bracketTotal = lvl.max - prevMax;
        const bracketProgress = Math.max(0, Math.min(bracketTotal, mastered - prevMax));
        const percent = (bracketProgress / bracketTotal) * 100;
        return (
          <div
            key={lvl.id}
            className={`flex flex-col p-2 rounded-lg border transition-all ${
              isActive
                ? 'border-primary bg-primary/5 shadow-sm'
                : isCompleted
                  ? 'border-success/30 bg-success/5'
                  : 'border-border-soft bg-surface-hover/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-xs font-bold ${
                  isActive ? 'text-primary' : isCompleted ? 'text-success' : 'text-foreground'
                }`}
              >
                {lvl.id}
              </span>
              <span className="text-[10px] text-muted-copy font-medium">{lvl.max}</span>
            </div>
            <div className="h-1.5 w-full bg-border-soft rounded-full overflow-hidden relative">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ${
                  isActive ? 'bg-primary' : isCompleted ? 'bg-success' : 'bg-foreground/30'
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const VocabSidebarDemo = ({ mastered }: { mastered: number }) => {
  const newWords = 45;
  const learning = 23;
  const weak = 8;
  const forgotten = 3;
  const dueToday = 12;
  const total = mastered + learning + newWords;

  return (
    <div className="w-72 space-y-4 rounded-xl border border-border-soft bg-surface p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Vocabulary</h3>
        <p className="mt-1 text-xs text-muted-copy">
          Vocabulary · N:{newWords} L:{learning} M:{mastered} W:{weak}
        </p>
      </div>

      <div className="space-y-2">
        {[
          { label: 'New', value: newWords, color: 'text-blue-500' },
          { label: 'Learning', value: learning, color: 'text-amber-500' },
          { label: 'Mastered', value: mastered, color: 'text-green-500' },
          { label: 'Weak', value: weak, color: 'text-red-500' },
          { label: 'Forgotten', value: forgotten, color: 'text-orange-500' },
          { label: 'Due Today', value: dueToday, color: 'text-purple-500' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center justify-between">
            <span className="text-xs text-muted-copy">{stat.label}</span>
            <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs text-muted-copy">
            <span>Total Mastery</span>
            <span>{mastered}/{total}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-border-soft">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${(mastered / total) * 100}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between text-xs text-muted-copy">
            <span>Learning</span>
            <span>{learning}/{total}</span>
          </div>
          <div className="mt-1 h-2 w-full rounded-full bg-border-soft">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{ width: `${(learning / total) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          className="w-full rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-700 transition-colors hover:bg-amber-100"
        >
          ⏰ Review {dueToday} due words
        </button>
        <button
          type="button"
          className="w-full rounded-lg border border-border-soft bg-surface-hover px-3 py-2 text-left text-xs font-medium text-muted-copy transition-colors hover:text-foreground"
        >
          ➕ Add custom word
        </button>
      </div>

      <div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-wide text-muted-copy">
          Level Progress
        </p>
        <VocabLevelGrid mastered={mastered} />
      </div>
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <VocabSidebarDemo mastered={320} />,
};

export const AdvancedLevel: Story = {
  render: () => <VocabSidebarDemo mastered={4200} />,
};
