import { type ComponentType } from 'react';
import {
  type LessonStatus,
  getStatusLabel,
  STATUS_STYLES,
} from './GrammarPageHelpers';

export const SectionHeading = ({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) => (
  <div>
    <h2 className="text-xs font-black uppercase tracking-wide">{title}</h2>
    <p className="mt-0.5 text-[11px] leading-4 text-muted-copy">{subtitle}</p>
  </div>
);

export const StatusPill = ({
  status,
  compact: isCompact = false,
}: {
  status: LessonStatus;
  compact?: boolean;
}) => (
  <span
    className={`shrink-0 whitespace-nowrap rounded-full border font-bold ${isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'} ${STATUS_STYLES[status]}`}
  >
    {getStatusLabel(status, isCompact)}
  </span>
);

export const LessonBlock = ({
  icon: Icon,
  title,
  body,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) => (
  <div className="min-w-0 rounded-lg border border-border-soft bg-surface p-4">
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-primary" />
      <h2 className="text-xs font-black uppercase tracking-wide">{title}</h2>
    </div>
    <p className="mt-2 break-words text-xs leading-5 text-muted-copy">{body}</p>
  </div>
);

export const MasteryPill = ({
  label,
  value,
  complete,
}: {
  label: string;
  value: string;
  complete: boolean;
}) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold ${complete ? 'border-success/30 bg-success/5 text-success' : 'border-border-soft bg-background text-muted-copy'}`}
  >
    {label}
    <span className="font-black">{value}</span>
  </span>
);
