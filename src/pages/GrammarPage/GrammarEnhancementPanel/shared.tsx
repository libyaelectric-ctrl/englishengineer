import { Layers3 } from 'lucide-react';

import { type ReactNode } from 'react';

import { SectionHeading } from '../GrammarPageComponents';

export const PanelShell = ({
  title,
  subtitle,
  icon: Icon,
  children,
}: {
  title: string;
  subtitle?: string;
  icon: typeof Layers3;
  children: ReactNode;
}) => (
  <div className="rounded-[4px] border border-border-soft bg-surface p-4 shadow-sm">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-primary" />
      <SectionHeading title={title} subtitle={subtitle} />
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

export const MiniMetric = ({ label, value }: { label: string; value: string | number }) => (
  <div className="rounded-[4px] border border-border-soft bg-background px-3 py-2">
    <p className="text-base font-black text-foreground">{value}</p>
    <p className="text-[10px] font-bold uppercase tracking-wide text-muted-copy">{label}</p>
  </div>
);
