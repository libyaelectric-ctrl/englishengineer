import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Shared/CommandPalette',
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
};

export default meta;

const CommandPaletteDemo = ({ searchQuery }: { searchQuery?: string }) => {
  const COMMANDS = [
    { id: 'dashboard', label: 'Dashboard', category: 'Navigate' },
    { id: 'vocabulary', label: 'Vocabulary', category: 'Skills' },
    { id: 'grammar', label: 'Grammar', category: 'Skills' },
    { id: 'reading', label: 'Reading', category: 'Skills' },
    { id: 'writing', label: 'Writing', category: 'Skills' },
    { id: 'listening', label: 'Listening', category: 'Skills' },
    { id: 'speaking', label: 'Speaking', category: 'Skills' },
    { id: 'curriculum-today', label: "Today's Curriculum", category: 'Learning Hub' },
    { id: 'progress-overview', label: 'Progress Overview', category: 'Progress' },
    { id: 'tools-work', label: 'Work Tools', category: 'Tools' },
  ];

  const filtered = searchQuery
    ? COMMANDS.filter((c) => c.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : COMMANDS;

  const grouped = filtered.reduce(
    (acc, cmd) => {
      (acc[cmd.category] = acc[cmd.category] || []).push(cmd);
      return acc;
    },
    {} as Record<string, typeof COMMANDS>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl overflow-hidden rounded-xl border border-border-soft bg-surface shadow-2xl">
        <div className="flex items-center border-b border-border-soft px-4">
          <svg className="h-5 w-5 shrink-0 text-muted-copy" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            className="flex-1 bg-transparent px-4 py-4 text-sm font-medium outline-none placeholder:text-muted-copy"
            placeholder="Search pages, navigate, or run actions..."
            defaultValue={searchQuery}
            readOnly
          />
          <kbd className="ml-1 rounded border border-border-soft px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-copy">
            ESC
          </kbd>
        </div>
        <div className="max-h-[360px] overflow-y-auto p-2">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="mb-1 mt-3 px-3 text-[10px] font-bold uppercase tracking-wider text-muted-copy/60 first:mt-1">
                {category}
              </div>
              {items.map((cmd) => (
                <button
                  key={cmd.id}
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-muted-copy transition-colors hover:bg-surface-hover/50 hover:text-foreground"
                >
                  <span className="flex-1 truncate">{cmd.label}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-border-soft px-4 py-2 text-[10px] text-muted-copy/60">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="text-xs">⌘</span>K
            </span>
            <span>to toggle</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
          </div>
        </div>
      </div>
    </div>
  );
};

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <CommandPaletteDemo />,
};

export const WithSearchQuery: Story = {
  render: () => <CommandPaletteDemo searchQuery="vocab" />,
};
